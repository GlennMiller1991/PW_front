import {IMatrix2d, IPoint2, IPoint3} from '@fbltd/math';
import {FAILURE, IFailure, SUCCESS} from "@src/app/game/common-types";
import fragment from './fragment.glsl';
import vertex from './vertext.glsl';

export type IShaderType = WebGL2RenderingContext['VERTEX_SHADER' | 'FRAGMENT_SHADER'];

export class WebglProgram {
    _vertexShader: WebGLShader | undefined
    _fragmentShader: WebGLShader | undefined
    _program: WebGLProgram | undefined

    constructor(public readonly gl: WebGL2RenderingContext) {
    }

    get isShaderOk() {
        return true;
        // return !!(this.vertexShader && this.fragmentShader)
    }

    get isOk() {
        return !!(this.isShaderOk && this.program)
    }

    buildInShader(src: string, type: IShaderType) {
        switch (type) {
            case this.gl.FRAGMENT_SHADER:
                if (this.fragmentShader) return FAILURE
                break;
            case this.gl.VERTEX_SHADER:
                if (this.vertexShader) return FAILURE
                break;
        }

        const shader = WebglProgram.createShader(this.gl, type, src)
        if (!shader) return shader

        switch (type) {
            case this.gl.FRAGMENT_SHADER:
                this.fragmentShader = shader
                break;
            case this.gl.VERTEX_SHADER:
                this.vertexShader = shader
                break;
        }

        return SUCCESS
    }

    build() {
        if (!this.isShaderOk) return FAILURE
        const p = WebglProgram.createProgram(this.gl, [this.fragmentShader!, this.vertexShader!])
        if (!p) return p
        this.program = p
        this.gl.useProgram(p)
        this.applySettings();
        return SUCCESS
    }

    applySettings() {
        this.gl.disable(this.gl.CULL_FACE);
        this.gl.clearColor(0, 0, 0, 0)
    }

    allocateVertexes(name: string, vertexes: Array<number>, size: number) {
        if (!this.isOk) return
        const attrLocation = this.gl.getAttribLocation(this.program!, name)
        const vbo = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexes), this.gl.STATIC_DRAW)
        this.gl.enableVertexAttribArray(attrLocation);
        this.gl.vertexAttribPointer(attrLocation, size, this.gl.FLOAT, false, 0, 0);
    }

    allocateTransform(m: IMatrix2d, name: string) {
        const location = this.gl.getUniformLocation(this.program!, name);
        this.gl.uniformMatrix3fv(location, false, new Float32Array([m[0], m[1], 0, m[2], m[3], 0, m[4], m[5], 1]));
    }

    allocateTexture(texture: WebGLTexture, name: string) {
        const location = this.gl.getUniformLocation(this.program!, name);
        this.gl.uniform1i(location, 0);
    }

    allocateVector(v: IPoint2, name: string) {
        const location = this.gl.getUniformLocation(this.program!, name);
        this.gl.uniform2fv(location, v);
    }

    createVertexArray() {
        return this.gl.createVertexArray();
    }

    get program() {
        return this._program
    }

    set program(p: typeof this._program) {
        if (!p) return
        if (this._program) return
        this._program = p
    }

    get vertexShader() {
        return this._vertexShader
    }

    set vertexShader(shader: typeof this._vertexShader) {
        if (!shader) return
        if (this._vertexShader) return
        this._vertexShader = shader
    }

    get fragmentShader() {
        return this._fragmentShader
    }

    set fragmentShader(shader: typeof this._fragmentShader) {
        if (!shader) return
        if (this._fragmentShader) return
        this._fragmentShader = shader
    }

    static createProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]) {
        const program = gl.createProgram()
        if (!program) return FAILURE

        shaders.forEach((s) => gl.attachShader(program, s))
        gl.linkProgram(program);

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program

        console.warn(WebglProgram.getLog(gl, program));
        gl.deleteProgram(program)

        return FAILURE
    }

    /**
     * Инициализация шейдера
     * @param gl Webgl2контекст
     * @param type Тип шейдера - фрагментный/вершинный (gl.VERTEXT_SHADER | gl.FRAGMENT_SHADER)
     * @param source текст шейдерной программы
     * @param verbose
     */
    static createShader(gl: WebGL2RenderingContext, type: IShaderType, source: string, verbose = true): WebGLShader | IFailure {
        const shader = gl.createShader(type)
        if (!shader) return FAILURE
        gl.shaderSource(shader, source);
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader

        verbose && console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader)

        return FAILURE
    }

    static getLog(gl: WebGL2RenderingContext, program: WebGLProgram) {
        return gl.getProgramInfoLog(program)
    }
}