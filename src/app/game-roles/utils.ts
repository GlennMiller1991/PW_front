import {IPixelSettingMessage} from "@src/app/game/ws/contracts";

export function processPixelSettingMessage(gl: WebGL2RenderingContext, {data}: IPixelSettingMessage) {
    for (let [_, x, y, r, g, b] of data.data.pixels) {
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