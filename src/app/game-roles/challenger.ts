import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {delay, DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";
import {BaseRole} from "@src/app/game-roles/base.role";

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
        while (true) {
            const buffer = (await this.gameController.httpPixelSource.forceGet());
            if (!buffer) {
                await delay(1000);
                continue;
            }

            const msg = MessageParser.parse(buffer);
            if (!MessageParser.isBitmapSettingMessage(msg)) {
                await delay(1000);
                continue;
            }

            this._clientBitmapVersion = msg.data.data.version;

            this.gameController.changeBitmap(msg.data.data.bitmap);

            break;
        }
    }

    async onMessage() {
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

                    this.gameController.changeBitmapPart(msg.data.data.pixels.map((pixels) => pixels.slice(1) as any))
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

