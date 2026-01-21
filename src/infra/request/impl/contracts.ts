export type IAuthResponse = {
    accessToken: string,
}

export type IFieldSizesResponse = {
    width: number,
    height: number,
}

export enum LogLevel {
    Error = 0,
    Warning = 1,
    Info = 2,
}