import {makeObservable} from "mobx";
import {ILinearSizes} from "@src/app/game/common-types";
import {DomController} from "@src/app/game/dom/dom-controller";

export class CanvasDomController extends DomController<HTMLCanvasElement> {
    _ctx: WebGL2RenderingContext;

    constructor(node: HTMLCanvasElement) {
        super(node);

        makeObservable(this, {
            _ctx: true,
        })
    }

    get ctx() {
        return this._ctx;
    }

    initImpl() {
        this._ctx = this._node.getContext('webgl2')!;
        return !!this._ctx
    }

    get isReady() {
        return super.isReady && !!this._ctx;
    }

    set sizes(value: ILinearSizes) {
        value = {width: Math.round(value.width), height: Math.round(value.height)};
        if (!this._isInited) return;
        super.sizes = value;
        this.node.width = value.width * 2;
        this.node.height = value.height * 2;
        this.ctx.viewport(0, 0, value.width * 2, value.height * 2);
    }
}