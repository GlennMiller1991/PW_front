import {GameController} from "@src/app/game/game.controller";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {DependencyStream} from "@fbltd/async";
import {IMessage, IPixelSettingMessage} from "@src/app/game/ws/contracts";
import {IUnhandledMessages} from "@src/app/game/ws/ws.controller";

export class Challenger {
    stream: DependencyStream<IUnhandledMessages>;

    constructor(private gameController: GameController) {
        this.stream = new DependencyStream(this.gameController.wsConnection.message);
    }

    async do() {
        await this.gameController.wsConnection.init();
        const completion = this.onMessage();
        // const maybeBitmap = (await this.gameController.httpPixelSource.forceGet())!;
        return completion;
    }

    get gl() {
        return this.gameController.canvas.ctx;
    }

    async onMessage() {
        outer:
        for await (let {unhandledMessages} of this.stream) {
            for (let raw of unhandledMessages) {
                let msg: IMessage<any, any>;
                try {
                    msg = MessageParser.parse(raw);
                } catch(err) {
                    console.warn("Message parse error");
                    continue;
                }

                if (MessageParser.isPixelSettingMessage(msg)) {
                    processPixelSettingMessage(this.gl, msg);

                    this.gameController.planDraw();
                    continue;
                }
                if (MessageParser.isStatusChangeMessage(msg)) {
                    break outer;
                }
            }
        }
    }

    dispose() {
        this.stream.dispose();
    }


}

function processPixelSettingMessage(gl: WebGL2RenderingContext, newMsg: IPixelSettingMessage) {
    for (let [version, x, y, r, g, b] of newMsg.data.data) {
        const data = new Uint8Array([r, g, b]);
        gl.texSubImage2D(
            gl.TEXTURE_2D,
            0,
            x,
            y,
            1,
            1,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            data
        );
    }
}