export class ResponseError extends Error {
    constructor(public readonly status: number) {
        super(String(status));
    }
}