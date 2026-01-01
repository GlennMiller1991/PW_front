import {GameController} from "@src/app/game/game.controller";
import {DependencyStream} from "@fbltd/async";
import {BaseRole} from "@src/app/game-roles/base.role";
import {MessageParser} from "@src/app/game/ws/message-parser";

export class Spectator extends BaseRole {
    declare _stream: DependencyStream<ArrayBuffer>;

    constructor(gameController: GameController) {
        super(gameController);
    }

    async do() {
        this.gameController.httpPixelSource.init();

        this._stream = new DependencyStream(this.gameController.httpPixelSource.buffer);

        const _ = this.onBufferChange();

        return super.do();
    }

    async onBufferChange() {
        for await (let raw of this._stream) {
            const msg = MessageParser.parse(raw);
            if (!MessageParser.isBitmapSettingMessage(msg)) continue;

            this.gameController.changeBitmap(msg.data.data.bitmap);

            this.gameController.planDraw();
        }
    }

    dispose() {
        this._stream?.dispose();
        this.gameController.httpPixelSource.dispose();
        super.dispose();
    }

    complete() {
        this._completion.resolve();
    }
}