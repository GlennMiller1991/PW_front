import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";
import {BaseRole} from "@src/app/game-roles/base.role";
import {processPixelSettingMessage} from "@src/app/game-roles/utils";

export class Player extends BaseRole {
    declare _stream: DependencyStream<IUnhandledMessages>;

    constructor(gameController: GameController) {
        super(gameController);
    }

    async do() {
        this.gameController.clicker.init();
        this._stream = new DependencyStream(this.gameController.wsConnection.message);

        const _ = this.onMessage();
        return super.do();
    }

    get gl() {
        return this.gameController.canvas.ctx;
    }

    async onMessage() {
        for await (let {unhandledMessages} of this._stream) {
            for (let msg of unhandledMessages) {
                if (MessageParser.isPixelSettingMessage(msg)) {
                    processPixelSettingMessage(this.gl, msg)

                    this.gameController.planDraw();
                    continue;
                }

            }
        }

        if (this._completion.isPending) {
            this._completion.reject(null as any);
        }
    }

    dispose() {
        this.gameController.clicker.dispose();
        super.dispose();
    }
}