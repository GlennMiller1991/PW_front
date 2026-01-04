import {GET} from "@src/request/request";
import {IFieldSizesResponse} from "@src/request/impl/contracts";
import {ENDPOINTS} from "@src/request/constants";
import {AnimationQueue} from "@src/app/game/animation-queue";
import {WebglProgram} from "@src/app/game/webgl-program";
import vertex from "@src/app/game/vertex.glsl";
import fragment from "@src/app/game/fragment.glsl";
import {GlobalResizeObserver, IResizeCallback} from "@src/app/game/resize.handler";
import {CanvasDomControllerGl} from "@src/app/game/dom/canvas.dom-controller";
import {identityMatrix2d, IMatrix2d, IPoint, IPoint2, Matrix2d, Point} from "@fbltd/math";
import {DragMouseController} from "@src/app/game/events/drag/dragMouseController";
import {autorun, makeObservable} from "mobx";
import {ILinearSizes} from "@src/app/game/common-types";
import {WsConnection} from "@src/app/game/ws/ws.controller";
import {Clicker} from "@src/app/game/clicker";
import {floorPoint, updateOrCreateTexture, withGlContext} from "@src/app/game/utils";
import {HttpPixelSource} from "@src/app/game/httpPixelSource";
import {DragStyler} from "@src/app/game/drag-styler/drag-styler";
import {ScaleMouseController} from "@src/app/game/events/scale/scaleMouseController";
import {Quad} from "@src/app/game/quad";
import {getScaleToPointMatrix} from "@src/app/game/getScaleToPointMatrix";
import {GameStatusChanging} from "@src/app/game/gameStatusChanging";
import {TouchTransformController} from "@src/app/game/events/touch/touch-transform.controller";
import { NavigateFunction } from "react-router";

export const Matrix = Matrix2d;
export type IMatrix = IMatrix2d;

export class GameController {
    disposer = createFnStorage();
    navigate: NavigateFunction;

    node: HTMLDivElement;
    canvas: CanvasDomControllerGl;
    clicker: Clicker;
    currentColor: number = 255;

    httpPixelSource = new HttpPixelSource();

    queue = new AnimationQueue();
    program: WebglProgram;
    planeContext: WebGLVertexArrayObject;
    events: {
        toucher: TouchTransformController,
        dragger: DragMouseController,
        scaler: ScaleMouseController,
    };
    field: ILinearSizes;

    gameStatusChanging: GameStatusChanging;

    /**
     * Матрица из пиксельных координат в неокруглённые координаты поля
     */
    pixelToField = identityMatrix2d;

    get pixelToFieldTransformed() {
        return Matrix.multiply(this.pixelToField, this.transformMatrix);
    }

    pixelToFieldConverter = (p: IPoint2) => {
        p = Matrix.apply(this.pixelToFieldTransformed, p);
        p = floorPoint(p);
        if (p[0] < 0 || p[1] < 0 || p[0] >= this.field.width || p[1] >= this.field.height) return;
        return p;
    }

    texture: WebGLTexture;
    wsConnection = new WsConnection();

    /**
     * Матрица из нормализованных координат в пиксельные
     */
    spaceToPixel = identityMatrix2d;


    transformMatrix = identityMatrix2d;

    constructor() {
        makeObservable(this, {
            currentColor: true,
            gameStatusChanging: true,
        })
    }

    get domWasMounted() {
        return !!this.gameStatusChanging;
    }

    changeBitmap(bitmap: ArrayBuffer) {
        this.texture = updateOrCreateTexture(this.canvas._ctx, bitmap, this.field, this.texture);
        this.planDraw();
    }

    changeBitmapPart(pixels: Array<[number, number, number, number, number]>) {
        const gl = this.canvas._ctx;

        for (let [x, y, r, g, b] of pixels) {
            const data = new Uint8Array([r, g, b]);
            gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                x,
                y,
                1,
                1,
                gl.RGB,
                gl.UNSIGNED_BYTE,
                data
            );
        }

        this.planDraw();
    }


    async onDomMounted(canvas: HTMLCanvasElement, navigate: NavigateFunction) {
        let {data} = await GET<IFieldSizesResponse>(ENDPOINTS.sizes);
        if (!data) return;

        this.navigate = navigate;

        let bitmapResponse = await GET<ArrayBuffer>(ENDPOINTS.gameBitmap);
        if (!bitmapResponse.data) return;

        this.field = data;

        this.canvas = new CanvasDomControllerGl(canvas);
        this.canvas.init();

        this.node = canvas.parentElement as HTMLDivElement;
        if (!this.canvas.isReady) return;

        const parent = canvas.parentElement as HTMLDivElement;
        const toucher = new TouchTransformController(parent);
        const scaler = new ScaleMouseController(parent);
        const dragger = new DragMouseController(parent);
        const styler = new DragStyler(dragger, {withSheet: true}, parent);

        this.events = {
            toucher, scaler, dragger
        }

        this.clicker = new Clicker(this);

        this.disposer.push(
            autorun(() => {
                const dragEvent = toucher.proceed?.data;
                if (!dragEvent) return;

                this.applyTransform(
                    Matrix.multiply(
                        getScaleToPointMatrix(dragEvent.relStartPoint, 1 + (1 - dragEvent.scale)),
                        [1, 0, 0, 1, ...Point.scale(dragEvent.eventOffset, -1)]
                    )
                )
            }),
            autorun(() => {
                const dragEvent = dragger.proceed?.data;
                if (!dragEvent) return;

                this.applyTransform(
                    [1, 0, 0, 1, ...Point.scale(dragEvent.currentOffset, -1)]
                )
            }),
            autorun(() => {
                const scaleEvent = scaler.proceed?.data;
                if (!scaleEvent) return;

                const m = getScaleToPointMatrix(scaleEvent.relPoint, 1 + 0.1 * scaleEvent.direction);
                this.applyTransform(m);
            }),
            toucher.dispose.bind(toucher),
            scaler.dispose.bind(scaler),
            dragger.dispose.bind(dragger),
            styler.dispose.bind(styler),
        );


        const gl = this.canvas.ctx;
        const program = this.program = new WebglProgram(gl);
        program.buildInShader(vertex, gl.VERTEX_SHADER);
        program.buildInShader(fragment, gl.FRAGMENT_SHADER);
        program.build();

        this.planeContext = withGlContext(gl, () => {
            program.allocateVertexes('a_texCoord', [0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0], 2);
        }, this.planeContext);

        GlobalResizeObserver.observe(this.node, this.onResize);

        this.gameStatusChanging = new GameStatusChanging(this);
    }

    applyTransform(m: IMatrix2d) {
        this.transformMatrix =
            Matrix.multiply(
                this.transformMatrix,
                m,
            );

        this.planDraw();
    }

    onResize: IResizeCallback = (entry) => {
        this.queue.dispose();
        this.queue.push(this.draw);

        const sizes = this.canvas.sizes = entry.contentRect;

        this.spaceToPixel = [sizes.width, 0, 0, sizes.height, 0, 0];

        const fieldSize = this.field.width;


        // Квад под поле без трансформации должен соприкасаться со стенками
        // контейнера как минимум по одной стороне
        // Здесь исхожу из того, что поле всё таки квадратное пока
        // Очевидно, что сторона квада в пикселях равна минимальной стороне контейнера
        // А значит для нахождения первой точки квада
        // достаточно из центра контейнера отнять половину минимальной стороны
        // И дальше уже от неё обойти все вершины квада
        let min = Math.min(sizes.width, sizes.height);

        // Центр контейнера
        let center: IPoint = [sizes.width / 2, sizes.height / 2];

        // От центра в любое из направлений
        const coords = Quad.ofCenter(center, min);

        const resolution = fieldSize / min;

        const halfWidthDif = (sizes.width - min) / 2;
        const halfHeightDif = (sizes.height - min) / 2;


        this.pixelToField = Matrix.translate([resolution, 0, 0, resolution, 0, 0], -halfWidthDif, -halfHeightDif);
        this.transformMatrix = identityMatrix2d;

        this.planeContext = withGlContext(this.canvas.ctx, () => {
            this.program.allocateVertexes('a_position', coords, 2);
        }, this.planeContext);

    }

    planDraw = () => {
        this.queue.dispose();
        this.queue.push(this.draw);
    }

    draw = () => {

        const resultMatrix = Matrix.multiply(
            spaceToCNDC,
            Matrix.invert(
                Matrix.multiply(
                    this.transformMatrix,
                    this.spaceToPixel,
                )
            ),
        )

        const gl = this.canvas.ctx;
        this.program.allocateTransform(resultMatrix, 'u_transform');

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        withGlContext(gl, () => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const location = gl.getUniformLocation(this.program.program!, 'u_texture');
            gl.uniform1i(location, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

        }, this.planeContext);
    }

    goHome = () => {
        this.transformMatrix = identityMatrix2d;
        this.planDraw();
    }

    dispose() {
        GlobalResizeObserver.unobserve(this.node);
        this.disposer.run();
        this.gameStatusChanging.dispose();
    }
}

let spaceToCNDC: IMatrix = [2, 0, 0, -2, -1, 1];

export function createFnStorage() {
    let arr: Array<Function> = [];
    return {
        push: arr.push,
        run() {
            arr.forEach(f => f());
            arr.length = 0;
        }
    }
}