import {computed, makeObservable} from "mobx";
import {FAILURE, ILinearSizes, IResult} from "@src/app/game/common-types";

export abstract class DomController<TElement extends HTMLElement | SVGElement = HTMLElement | SVGElement> {
    _isInited = false;
    _width = 0;
    _height = 0;

    constructor(public _node: TElement) {
        makeObservable(this, {
            _isInited: true,
            _node: true,
            _width: true,
            _height: true,
            isReady: computed,
        });
    }

    init(): IResult {
        if (this._isInited) return FAILURE;
        this.initImpl();
        return this._isInited = !!this.initImpl();
    };

    abstract initImpl(): IResult;

    get node(): typeof this._node {
        return this._node;
    }

    get isReady() {
        return !!this.node;
    }

    get style() {
        return this._node.style;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    set sizes(value: ILinearSizes) {
        if (!this.node) return;
        this.style.width = `${this._width = value.width}px`;
        this.style.height = `${this._height = value.height}px`;
    }

    dispose() {
        this._isInited = false;
    }
}

