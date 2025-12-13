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
import {DragController} from "@src/app/game/events/drag/drag.controller";
import {autorun, makeAutoObservable} from "mobx";
import {ILinearSizes} from "@src/app/game/common-types";
import {WsConnection} from "@src/app/game/ws/ws.controller";
import {Clicker} from "@src/app/game/clicker";
import {floorPoint, updateOrCreateTexture, withGlContext} from "@src/app/game/utils";
import {HttpPixelSource} from "@src/app/game/httpPixelSource";
import {Spectator} from "@src/app/game-roles/spectator";
import {Challenger} from "@src/app/game-roles/challenger";
import {Player} from "@src/app/game-roles/player";
import {DragStyler} from "@src/app/game/drag-styler/drag-styler";

export const Matrix = Matrix2d;
export type IMatrix = IMatrix2d;

export class GameController {
    node: HTMLDivElement;
    canvas: CanvasDomControllerGl;
    clicker: Clicker;

    httpPixelSource = new HttpPixelSource();

    queue = new AnimationQueue();
    program: WebglProgram;
    planeContext: WebGLVertexArrayObject;
    events: DragController;
    field: ILinearSizes;

    /**
     * Матрица из пиксельных координат в неокруглённые координаты поля
     */
    pixelToField = identityMatrix2d;

    get fieldToPixel() {
        return Matrix.invert(this.pixelToField);
    }

    get pixelToCNDCTransformed() {
        return Matrix.multiply(
            spaceToCNDC,
            this.pixelToSpaceTransformed,
        )
    }

    get spaceToPixelTransformed() {
        return Matrix.multiply(
            this.transformMatrix,
            this.spaceToPixel
        );
    }

    get pixelToSpaceTransformed() {
        return Matrix.invert(this.spaceToPixelTransformed);
    }

    get pixelToFieldTransformed() {
        return Matrix.multiply(this.pixelToField, this.transformMatrix);
    }

    get fieldToPixelTransformed() {
        return Matrix.invert(this.pixelToFieldTransformed)
    }

    pixelToFieldConverter = (p: IPoint2) => {
        p = Matrix.apply(this.pixelToFieldTransformed, p);
        p = floorPoint(p);
        if (p[0] < 0 || p[1] < 0 || p[0] >= this.field.width || p[1] >= this.field.height) return;
        return p;
    }

    normalized: IMatrix;
    texture: WebGLTexture;
    wsConnection = new WsConnection();

    /**
     * Матрица из нормализованных координат в пиксельные
     */
    spaceToPixel = identityMatrix2d;

    /**
     * Матрица из пиксельных координат в нормализованные
     */
    get pixelToSpace() {
        return Matrix.invert(this.spaceToPixel);
    }

    transformMatrix = identityMatrix2d;

    constructor() {
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


    async onDomMounted(canvas: HTMLCanvasElement) {
        let {data} = await GET<IFieldSizesResponse>(ENDPOINTS.sizes);
        if (!data) return;

        let bitmapResponse = await GET<ArrayBuffer>(ENDPOINTS.gameBitmap);
        if (!bitmapResponse.data) return;

        this.field = data;

        this.canvas = new CanvasDomControllerGl(canvas);
        this.canvas.init();

        this.node = canvas.parentElement as HTMLDivElement;
        if (!this.canvas.isReady) return;

        const parent = canvas.parentElement as HTMLDivElement;
        const events = this.events = new DragController(parent);
        const styler = new DragStyler(events, {withSheet: true}, parent);


        this.clicker = new Clicker(this);

        autorun(() => {
            const dragEvent = events.proceed?.data;
            if (!dragEvent) return;

            this.transformMatrix =
                Matrix.multiply(
                    [1, 0, 0, 1, -dragEvent.currentOffset[0], -dragEvent.currentOffset[1]],
                    this.transformMatrix
                );

            this.queue.dispose();
            this.queue.push(this.draw);
        });

        const gl = this.canvas.ctx;
        const program = this.program = new WebglProgram(gl);
        program.buildInShader(vertex, gl.VERTEX_SHADER);
        program.buildInShader(fragment, gl.FRAGMENT_SHADER);
        program.build();
        this.texture = updateOrCreateTexture(this.canvas.ctx, bitmapResponse.data, this.field);

        this.planeContext = withGlContext(gl, () => {
            program.allocateVertexes('a_texCoord', [0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0], 2);
        }, this.planeContext);

        GlobalResizeObserver.observe(this.node, this.onResize);
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

        gl.clearColor(1, 1, 0, .5);
        gl.clear(gl.COLOR_BUFFER_BIT);
        withGlContext(gl, () => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            const location = gl.getUniformLocation(this.program.program!, 'u_texture');
            gl.uniform1i(location, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

        }, this.planeContext);
    }


    dispose() {
        GlobalResizeObserver.unobserve(this.node);
        this.events?.dispose();
    }
}

let spaceToCNDC: IMatrix = [2, 0, 0, -2, -1, 1];

export class GameStatusChanging {
    status: Spectator | Challenger | Player;

    constructor(private gameController: GameController) {
        makeAutoObservable(this, {
            status: true,
        });

        this.startIteration();
    }

    get isSpectator() {
        return this.status instanceof Spectator;
    }

    get isChallenger() {
        return this.status instanceof Challenger;
    }

    get isPlayer() {
        return this.status instanceof Player;
    }

    async startIteration(): Promise<any> {
        do {
            let nextRole!: Spectator | Challenger | Player;
            if (this.isSpectator) nextRole = new Challenger(this.gameController);
            else if (this.isChallenger) nextRole = new Player(this.gameController);
            else nextRole = new Spectator(this.gameController);

            this.status?.dispose();
            this.status = nextRole;

            try {
                await this.status.do();
            } catch (err) {
                console.log(err);
                this.status.dispose();
                this.status = null as any;
            }

        } while (true);

    }
}

export abstract class Quad {
    static ofCenter(center: IPoint2, width: number, height = width) {
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let p1: IPoint2 = Point.dif(center, [halfWidth, halfHeight]);
        let p2 = Point.sum(p1, [width, 0]);
        let p3 = Point.sum(p1, [0, height]);
        let p4 = Point.sum(p1, [width, height]);
        let p5 = Point.dif(p4, [width, 0]);
        let p6 = Point.dif(p4, [0, height])
        return [
            ...p1, ...p2, ...p3,
            ...p4, ...p5, ...p6
        ];
    }
}