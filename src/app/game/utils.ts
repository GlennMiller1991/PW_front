import {ILinearSizes} from "@src/app/game/common-types";
import {IPoint} from "@fbltd/math";

export function updateOrCreateTexture(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer, {
    width,
    height
}: ILinearSizes, texture?: WebGLTexture) {
    if (!texture) {
        texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.pixelStorei(gl.UNPACK_ROW_LENGTH, width);


    }
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const data = new Uint8Array(arrayBuffer);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        width,
        height,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        data
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return texture;
}

export function getRandom(max = 1, min = 0) {
    return Math.random() * (max - min) + min;
}

export function getRandomColor() {
    return Math.floor(getRandom(2 ** 24));
}

export function floorPoint<T extends IPoint>(p: T) {
    return p.map((c) => Math.floor(c)) as T
}

export function withGlContext(gl: WebGL2RenderingContext, f: { (): void }, vao?: WebGLVertexArrayObject) {
    vao = vao ?? gl.createVertexArray();
    gl.bindVertexArray(vao);
    f();
    gl.bindVertexArray(null);
    return vao;
}