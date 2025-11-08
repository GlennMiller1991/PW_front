import {GameController} from "@src/app/game/game.controller";
import {DependencyStream} from "@fbltd/async";
import {BaseRole} from "@src/app/game-roles/base.role";

export class Spectator extends BaseRole {
    declare _stream: DependencyStream<ArrayBuffer>;

    constructor(gameController: GameController) {
        super(gameController);
        this._stream = new DependencyStream(gameController.httpPixelSource.buffer);
    }

    async do() {
        this.gameController.httpPixelSource.init();
        const _ = this.onBufferChange();

        return super.do();
    }

    async onBufferChange() {
        for await (let buffer of this._stream) {
            this.gameController.changeBitmap(buffer.slice(4));

            this.gameController.planDraw();
        }
    }

    dispose() {
        this.gameController.httpPixelSource.dispose();

        super.dispose();
    }

    complete() {
        this._completion.resolve();
    }
}