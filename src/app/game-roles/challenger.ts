import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";
import {BaseRole} from "@src/app/game-roles/base.role";
import {processPixelSettingMessage} from "@src/app/game-roles/utils";

export class Challenger extends BaseRole {
    declare _stream: DependencyStream<IUnhandledMessages>;
    private _clientBitmapVersion: number;

    constructor(gameController: GameController) {
        super(gameController);
        this._clientBitmapVersion = -1;
    }

    async do() {
        await this.gameController.wsConnection.init();
        this._stream = new DependencyStream(this.gameController.wsConnection.message);
        const _ = this.onMessage();

        await this.updateBitmap();
        return super.do();
    }

    async updateBitmap() {
        const buffer = (await this.gameController.httpPixelSource.forceGet())!;
        this._clientBitmapVersion = new Int32Array(buffer.slice(0, 4))[0];
        this.gameController.changeBitmap(buffer.slice(4));
        this.gameController.planDraw();
    }

    async onMessage() {
        outer:
            for await (let {unhandledMessages} of this._stream) {
                for (let msg of unhandledMessages) {
                    if (MessageParser.isPixelSettingMessage(msg)) {
                        // cant apply changes because client version is more correct
                        if (msg.data.data.version <= this._clientBitmapVersion) continue;

                        let versionDif = msg.data.data.pixels[0][0] - this._clientBitmapVersion;

                        if (versionDif > 1) {
                            // force update bitmap if messages version greater thant bitmap cause
                            // there is absent some changes on the client
                            await this.updateBitmap();
                            continue;
                        }

                        // actualize client version with server version
                        this._clientBitmapVersion = msg.data.data.version;

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

