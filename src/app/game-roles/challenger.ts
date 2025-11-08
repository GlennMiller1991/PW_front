import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";
import {BaseRole} from "@src/app/game-roles/base.role";
import {processPixelSettingMessage} from "@src/app/game-roles/utils";

export class Challenger extends BaseRole {
    declare _stream: DependencyStream<IUnhandledMessages>;
    private _stableVersion: number;

    constructor(gameController: GameController) {
        super(gameController);
        this._stream = new DependencyStream(this.gameController.wsConnection.message);
        this._stableVersion = -1;
    }

    async do() {
        await this.gameController.wsConnection.init();
        await this.updateBitmap();

        const _ = this.onMessage();

        return super.do();
    }

    async updateBitmap() {
        const buffer = (await this.gameController.httpPixelSource.forceGet())!;
        this._stableVersion = new Int32Array(buffer.slice(0, 4))[0];
        this.gameController.changeBitmap(buffer.slice(4));
        this.gameController.planDraw();

        return this._stableVersion;
    }

    async onMessage() {
        outer:
            for await (let {unhandledMessages} of this._stream) {
                for (let msg of unhandledMessages) {
                    if (MessageParser.isPixelSettingMessage(msg)) {

                        if (msg.data.data.version > this._stableVersion) {
                            await this.updateBitmap();
                            if (msg.data.data.version > this._stableVersion) {
                                this._completion.reject(null as any);
                                break outer;
                            }
                        }

                        processPixelSettingMessage(this.gameController.canvas.ctx, msg);

                        this.gameController.planDraw();
                        continue;
                    }
                    if (MessageParser.isStatusChangeMessage(msg)) {
                        this._completion.resolve();
                    }
                }
            }


        if (this._completion.isPending) {
            this._completion.reject(null as any);
        }


    }

}

