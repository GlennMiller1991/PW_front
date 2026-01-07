import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {MessageParser} from "@src/infra/ws/message-parser";
import {delay, Dependency, DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/infra/ws/ws.controller";
import {app} from "@src/app/app.controller";

export enum GameRole {
    Challenger = 1,
    Player = 2,
}

export class GameLogic {
    private _stream: DependencyStream<IUnhandledMessages>;
    private _clientBitmapVersion: number;
    private _role = new Dependency(GameRole.Challenger);

    constructor(protected gameController: GameController) {
        this._clientBitmapVersion = -1;
    }

    get role() {
        return this._role;
    }

    init() {
        this._stream = new DependencyStream(this.gameController.wsConnection.message, {withReactionOnSubscribe: true});

        this.onMessage();
        this.updateBitmap();

        return
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

                if (MessageParser.isLogoutMessage(msg)) {
                    app.logout();
                }

                if (MessageParser.isStatusChangeMessage(msg)) {
                    this._role.value = GameRole.Player;
                    this.gameController.clicker.init();
                }

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
                }
            }
        }
    }

    dispose() {
        this._stream?.dispose();
    }
}

