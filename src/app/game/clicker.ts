import {makeObservable} from "mobx";
import {IPoint2} from "@fbltd/math";
import {POST} from "@src/request/request";
import {ENDPOINTS} from "@src/request/constants";
import {GameController} from "@src/app/game/game.controller";

export class Clicker {
    _isLoading = false;
    abortController?: AbortController;

    constructor(private gameController: GameController) {
        makeObservable(this, {
            _isLoading: true,
        })
    }

    get node() {
        return this.gameController.canvas.node as unknown as HTMLDivElement;
    }

    init() {
        this.node.addEventListener('click', this.onClick)
    }

    onClick = async (event: PointerEvent) => {
        if (this._isLoading) return;
        if (event.target !== event.currentTarget) return;

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this._isLoading = true;
        let p: IPoint2 = [event.offsetX, event.offsetY];

        const converter = this.gameController.pixelToFieldConverter;

        p = converter(p) as IPoint2;
        if (!p) return;

        await POST(ENDPOINTS.gameSet, {
            point: p,
            color: this.gameController.currentColor,
        }, {signal});

        this.abortController = undefined;
        this._isLoading = false;
    }

    dispose() {
        this.abortController?.abort();
        this.node?.removeEventListener('click', this.onClick);
    }
}