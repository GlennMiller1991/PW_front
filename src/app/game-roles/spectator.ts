import {GameController} from "@src/app/game/game.controller";
import {updateOrCreateTexture} from "@src/app/game/utils";

export class Spectator {

    constructor(private gameController: GameController) {
    }

    get gl() {
        return this.gameController.canvas.ctx;
    }

    do() {
        this.gameController.httpPixelSource.init();

        return this.onBufferChange();
    }

    async onBufferChange() {
        for await (let buffer of this.gameController.httpPixelSource.buffer) {
            const version = new Int32Array(buffer.slice(0, 4))[0];
            console.log('version', version);
            buffer = buffer.slice(4);
            this.gameController.texture = updateOrCreateTexture(this.gl, buffer, this.gameController.field, this.gameController.texture);

            this.gameController.planDraw();
        }
    }

    dispose() {
        this.gameController.httpPixelSource.dispose();
    }
}

