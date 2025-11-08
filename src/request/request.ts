import {refreshRequest} from "@src/request/impl/refresh.request";
import {app} from "@src/app/app.controller";
import {IRequestConfig, IRequestResponse} from "@src/request/contracts";
import {processResponse} from "@src/request/process-response";
import {ResponseError} from "@src/request/response.error";

export async function request<T extends {}>(url: string, body?: {}, options?: Partial<IRequestConfig>, asIs?: boolean): Promise<IRequestResponse<T>> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (app.jwt.token) {
        headers['Authorization'] = `Bearer ${app.jwt.token}`;
    }
    const response = await fetch(url, {
        method: options?.method ?? 'GET',
        body: body && JSON.stringify(body),
        headers,
        signal: options?.signal,
    });

    let data: T;
    let error: ResponseError;
    try {
        data = await processResponse(response);
    } catch(e: unknown) {
        error = e as ResponseError;
        switch(error.status) {
            case 401:
                if (asIs || !await refreshRequest()) return {status: error.status, isOk: false};
                return request(url, body, options, true);
            default:
                return {
                    status: error.status,
                    isOk: false,
                }
        }
    }
    return {data, isOk: true}
}

export function GET<T extends {}>(url: string, options?: Partial<IRequestConfig>, asIs?: boolean) {
    return request<T>(url, undefined, options, asIs);
}

export function POST<T extends {}>(url: string, body: {}, options?: Partial<IRequestConfig>, asIs?: boolean) {
    options = options ?? {};
    options.method = 'POST';
    return request<T>(url, body, options, asIs);
}