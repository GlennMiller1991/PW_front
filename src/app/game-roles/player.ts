import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {DependencyStream} from "@fbltd/async";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";
import {IMessage} from "@src/app/game/ws/contracts";

export class Player {
    stream: DependencyStream<IUnhandledMessages>;

    constructor(private gameController: GameController) {
        this.stream = new DependencyStream(this.gameController.wsConnection.message);
    }

    async do() {
        this.gameController.clicker.init();
        return this.onMessage();
    }

    get gl() {
        return this.gameController.canvas.ctx;
    }

    async onMessage() {
        for await (let {unhandledMessages} of this.stream) {
            for (let raw of unhandledMessages) {
                let msg: IMessage<any, any>;
                try {
                    msg = MessageParser.parse(raw);
                } catch (err) {
                    console.log('msg parse error');
                    continue;
                }

                if (MessageParser.isPixelSettingMessage(msg)) {
                    for (let [version, x, y, r, g, b] of msg.data.data) {
                        const data = new Uint8Array([r, g, b]);
                        this.gl.texSubImage2D(
                            this.gl.TEXTURE_2D,
                            0,
                            x,
                            y,
                            1,
                            1,
                            this.gl.RGB,
                            this.gl.UNSIGNED_BYTE,
                            data
                        );
                    }

                    this.gameController.planDraw();
                }

            }
        }
    }

    dispose() {
        this.gameController.clicker.dispose();
        this.gameController.wsConnection.dispose();
        this.stream.dispose();
    }
}