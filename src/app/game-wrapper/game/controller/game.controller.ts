import {GET} from "@src/infra/request/request";
import {IFieldSizesResponse} from "@src/infra/request/impl/contracts";
import {ENDPOINTS} from "@src/infra/request/constants";
import {AnimationQueue} from "@src/infra/animation-queue/animation-queue";
import {WebglProgram} from "@src/infra/webgl-program";
import vertex from "@src/app/game-wrapper/game/controller/shaders/vertex.glsl";
import fragment from "@src/app/game-wrapper/game/controller/shaders/fragment.glsl";
import {GlobalResizeObserver, IResizeCallback} from "@src/infra/resize.handler";
import {CanvasDomControllerGl} from "@src/infra/dom/canvas.dom-controller";
import {Color, identityMatrix2d, IMatrix2d, IPoint, IPoint2, Matrix2d, Point} from "@fbltd/math";
import {DragMouseController} from "@src/infra/events/drag/dragMouseController";
import {autorun, makeObservable} from "mobx";
import {WsConnection} from "@src/infra/ws/ws.controller";
import {Clicker} from "@src/app/game-wrapper/game/controller/clicker";
import {floorPoint, updateOrCreateTexture, withGlContext} from "@src/infra/utils/utils";
import {HttpPixelSource} from "@src/app/game-wrapper/game/controller/http-pixel-source";
import {DragStyler} from "@src/infra/drag-styler/drag-styler";
import {ScaleMouseController} from "@src/infra/events/scale/scaleMouseController";
import {Quad} from "@src/infra/quad";
import {getScaleToPointMatrix} from "@src/infra/utils/get-scale-to-point-matrix";
import {TouchTransformController} from "@src/infra/events/touch/touch-transform.controller";
import {GameLogic} from "@src/app/game-wrapper/game/controller/game-logic";
import {ILinearSizes} from "@src/infra/utils/type-utils";

export const Matrix = Matrix2d;
export type IMatrix = IMatrix2d;

export class GameController {
    disposer = createFnStorage();

    node: HTMLDivElement;
    canvas: CanvasDomControllerGl;
    clicker: Clicker;
    currentColor = Color.ofNumber(0xab9468);

    httpPixelSource = new HttpPixelSource();
    _firstRenderWas = false;

    queue = new AnimationQueue();
    program: WebglProgram;
    planeContext: WebGLVertexArrayObject;
    events: {
        toucher: TouchTransformController,
        dragger: DragMouseController,
        scaler: ScaleMouseController,
    };
    field: ILinearSizes;

    logic: GameLogic;

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
            _firstRenderWas: true,
        })
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

    get afterFirstRender() {
        return this._firstRenderWas;
    }

    async onDomMounted(canvas: HTMLCanvasElement) {
        if (this.node) return;

        const node = canvas.parentElement as HTMLDivElement;
        if (!node) return;

        this.canvas = new CanvasDomControllerGl(canvas);
        this.canvas.init();

        this.node = node;
        if (!this.canvas.isReady) return;

        const toucher = new TouchTransformController(node);
        const scaler = new ScaleMouseController(node);
        const dragger = new DragMouseController(node);
        const styler = new DragStyler(dragger, {withSheet: true}, node);

        this.events = {
            toucher, scaler, dragger
        }

        this.clicker = new Clicker(this);
        this.wsConnection = new WsConnection();
        this.logic = new GameLogic(this);

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
            this.wsConnection.dispose.bind(this.wsConnection),
            this.clicker.dispose.bind(this.clicker),
            this.logic.dispose.bind(this.logic),
        );


        try {
            await this.wsConnection.init();
        } catch (e) {
            return;
        }

        let {data} = await GET<IFieldSizesResponse>(ENDPOINTS.sizes);
        if (!data) return;
        this.field = data;

        const gl = this.canvas.ctx;
        const program = this.program = new WebglProgram(gl);
        program.buildInShader(vertex, gl.VERTEX_SHADER);
        program.buildInShader(fragment, gl.FRAGMENT_SHADER);
        program.build();

        this.planeContext = withGlContext(gl, () => {
            program.allocateVertexes('a_texCoord', [0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0], 2);
        }, this.planeContext);

        GlobalResizeObserver.observe(this.node, this.onResize);

        this.logic.init();

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

        this._firstRenderWas = true;
    }

    goHome = () => {
        this.transformMatrix = identityMatrix2d;
        this.planDraw();
    }

    dispose() {
        GlobalResizeObserver.unobserve(this.node);
        this.disposer.run();
    }
}

let spaceToCNDC: IMatrix = [2, 0, 0, -2, -1, 1];

export function createFnStorage() {
    let arr: Array<Function> = [];

    function run() {
        arr.forEach(f => f());
        arr.length = 0;
    }
    interface IDisposer {
        (): void,
        push(...fn: Function[]): void,
        run(): void
    }
    let disposer = (() => {
        run()
    }) as unknown as IDisposer;

    disposer.run = run;
    disposer.push = (...fn: Function[]) => arr.push(...fn);

    return disposer;
}