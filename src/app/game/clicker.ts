import {makeObservable} from "mobx";
import {IPoint2} from "@fbltd/math";
import {POST} from "@src/request/request";
import {ENDPOINTS} from "@src/request/constants";
import {GameController, Matrix} from "@src/app/game/game.controller";
import {floorPoint, getRandomColor} from "@src/app/game/utils";

export class Clicker {
    _isLoading = false;
    abortController?: AbortController;

    constructor(private gameController: GameController) {
        makeObservable(this, {
            _isLoading: true,
        })
    }

    get canvas() {
        return this.gameController.canvas.node;
    }

    init() {
        this.canvas.addEventListener('click', this.onClick)
    }

    onClick = async (event: PointerEvent) => {
        if (this._isLoading) return;

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        this._isLoading = true;
        let p: IPoint2 = [event.offsetX, event.offsetY];
        p = Matrix.apply(this.gameController.toField, p);
        p = floorPoint(p);

        await POST(ENDPOINTS.gameSet, {
            point: p,
            color: getRandomColor(),
        }, {signal});

        this.abortController = undefined;
        this._isLoading = false;
    }

    dispose() {
        this.abortController?.abort();
        this.canvas?.removeEventListener('click', this.onClick);
    }
}