import {ENDPOINTS} from "@src/request/constants";
import {app} from "@src/app/app.controller";
import {IAuthResponse} from "@src/request/impl/contracts";

export async function refreshRequest() {
    const resp = await fetch(ENDPOINTS.refresh);
    const jwt = app.jwt;
    try {
        const body = (await resp.json()) as IAuthResponse;
        jwt.token = body.accessToken;
    } catch (err) {
        jwt.token = undefined;
    }

    return jwt.isAuthorized;
}