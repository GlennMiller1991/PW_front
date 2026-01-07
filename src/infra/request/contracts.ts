import {IExclusiveUnion} from "@src/infra/utils/type-utils";

export type IRequestConfig = {
    method: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH',
    signal?: AbortSignal,
}
export type IServerErrorResponse = {
    status?: number,
}
export type IAppErrorResponse = {
    message: string,
}
export type IErrorResponse = IExclusiveUnion<IServerErrorResponse, IAppErrorResponse>;
export type ISuccessResponse<T extends {}> = {
    data: T
}
export type IRequestResponse<T extends {}> = {isOk: boolean} &
    IExclusiveUnion<IErrorResponse, ISuccessResponse<T>>;