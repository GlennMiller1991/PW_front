import {makeObservable} from "mobx";
import {ILinearSizes} from "@src/app/game/common-types";
import {DomController} from "@src/app/game/dom/dom-controller";

export type IWebglCtx = WebGL2RenderingContext;
export type I2dCtx = CanvasRenderingContext2D;

export abstract class CanvasDomController<TCtx extends IWebglCtx | I2dCtx> extends DomController<HTMLCanvasElement> {
    _ctx: TCtx;

    constructor(node: HTMLCanvasElement) {
        super(node);

        makeObservable(this, {
            _ctx: true,
        })
    }

    get ctx() {
        return this._ctx;
    }

    abstract initImpl(): boolean;

    get isReady() {
        return super.isReady && !!this._ctx;
    }

    set sizes(value: ILinearSizes) {
        value = {width: Math.round(value.width), height: Math.round(value.height)};
        if (!this._isInited) return;
        super.sizes = value;
        this.node.width = value.width * 2;
        this.node.height = value.height * 2;
    }
}

export class CanvasDomControllerGl extends CanvasDomController<IWebglCtx> {
    initImpl() {
        this._ctx = this._node.getContext('webgl2')!;
        return !!this._ctx
    }

    set sizes(value: ILinearSizes) {
        if (!this._isInited) return;
        super.sizes = value;
        this.ctx.viewport(0, 0, value.width * 2, value.height * 2);
    }

}

export class CanvasDomController2d extends CanvasDomController<I2dCtx> {
    initImpl() {
        this._ctx = this._node.getContext('2d')!;
        return !!this._ctx;
    }
}