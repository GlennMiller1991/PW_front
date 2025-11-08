import {GET} from "@src/request/request";
import {IFieldSizesResponse} from "@src/request/impl/contracts";
import {ENDPOINTS} from "@src/request/constants";
import {AnimationQueue} from "@src/app/game/animation-queue";
import {WebglProgram} from "@src/app/game/webgl-program";
import vertex from "@src/app/game/vertex.glsl";
import fragment from "@src/app/game/fragment.glsl";
import {GlobalResizeObserver, IResizeCallback} from "@src/app/game/resize.handler";
import {CanvasDomController} from "@src/app/game/dom/canvas.dom-controller";
import {identityMatrix2d, IMatrix2d, IPoint2, Matrix2d, Point} from "@fbltd/math";
import {MouseDragProcessReducer} from "@src/app/game/mouse-drag-process.reducer";
import {autorun, makeAutoObservable} from "mobx";
import {ILinearSizes} from "@src/app/game/common-types";
import {WsConnection} from "@src/app/game/ws/ws.controller";
import {Clicker} from "@src/app/game/clicker";
import {updateOrCreateTexture, withGlContext} from "@src/app/game/utils";
import {HttpPixelSource} from "@src/app/game/httpPixelSource";
import {Spectator} from "@src/app/game-roles/spectator";
import {Challenger} from "@src/app/game-roles/challenger";
import {Player} from "@src/app/game-roles/player";

export const Matrix = Matrix2d;
export type IMatrix = IMatrix2d;

export class GameController {
    node: HTMLDivElement;
    canvas: CanvasDomController;
    clicker: Clicker;

    httpPixelSource = new HttpPixelSource();

    queue = new AnimationQueue();
    program: WebglProgram;
    planeContext: WebGLVertexArrayObject;
    events: MouseDragProcessReducer;
    field: ILinearSizes;
    toField: IMatrix;
    texture: WebGLTexture;
    wsConnection = new WsConnection();

    toPixelSpace = identityMatrix2d;

    transformMatrix = identityMatrix2d;

    constructor() {
    }

    changeBitmap(bitmap: ArrayBuffer) {
        this.texture = updateOrCreateTexture(this.canvas._ctx, bitmap, this.field, this.texture);
    }

    async onDomMounted(canvas: HTMLCanvasElement) {
        let {data} = await GET<IFieldSizesResponse>(ENDPOINTS.sizes);
        if (!data) return;

        let bitmapResponse = await GET<ArrayBuffer>(ENDPOINTS.gameBitmap);
        if (!bitmapResponse.data) return;

        this.field = data;

        this.canvas = new CanvasDomController(canvas);
        this.canvas.init();

        this.node = canvas.parentElement as HTMLDivElement;
        if (!this.canvas.isReady) return;

        const events = this.events = new MouseDragProcessReducer(this.canvas.node);
        this.clicker = new Clicker(this);

        autorun(() => {
            const dragEvent = events.drag;
            if (!dragEvent) return;

            this.transformMatrix =
                Matrix.multiply(
                    [1, 0, 0, 1, -dragEvent.movementX, -dragEvent.movementY],
                    this.transformMatrix
                );

            this.queue.clear();
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
        this.queue.clear();
        this.queue.push(this.draw);

        const sizes = this.canvas.sizes = entry.contentRect;

        this.toPixelSpace = [sizes.width, 0, 0, sizes.height, 0, 0];

        const fieldSize = this.field.width;
        let min = Math.min(sizes.width, sizes.height);
        let max = Math.max(sizes.width, sizes.height);
        let sideDif = (max - min) / 2;
        let p1: IPoint2 = [sideDif, 0];
        let p2 = Point.sum(p1, [min, 0]);
        let p3 = Point.sum(p1, [0, min]);
        let p4 = Point.sum(p1, [min, min]);
        let p5 = Point.dif(p4, [min, 0]);
        let p6 = Point.dif(p4, [0, min])
        const coords = [
            ...p1, ...p2, ...p3,
            ...p4, ...p5, ...p6
        ];

        const scale = fieldSize / min;
        this.toField = [scale, 0, 0, scale, -sideDif * scale, 0];

        this.planeContext = withGlContext(this.canvas.ctx, () => {
            this.program.allocateVertexes('a_position', coords, 2);
        }, this.planeContext);

    }

    planDraw = () => {
        this.queue.clear();
        this.queue.push(this.draw);
    }

    draw = () => {
        const resultMatrix = Matrix.multiply(
            toCNDC,
            Matrix.invert(
                Matrix.multiply(
                    this.transformMatrix,
                    this.toPixelSpace,
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

let toCNDC: IMatrix = [2, 0, 0, -2, -1, 1];

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
            } catch {
                this.status.dispose();
                this.status = null as any;
            }

        } while (true);

    }
}



