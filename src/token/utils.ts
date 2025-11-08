/**
 * Число в секундах с 1970 года,
 * спецификационное требование к JWT
 */

export function convertUnixTimestampToTimestamp(ts: number) {
    return ts * 1000;
}

export function parseJwt<T extends {}>(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload) as T;
}