import {ENDPOINTS} from "@src/request/constants";
import {app} from "@src/app/app.controller";
import {IAuthResponse} from "@src/request/impl/contracts";

export async function authRequest(credentials: string) {
    const resp = await fetch(ENDPOINTS.google, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials)
    });
    try {
        const body = (await resp.json()) as IAuthResponse;
        app.jwt.token = body.accessToken;
    } catch (err) {
        app.jwt.token = undefined;
    }

    return app.jwt.isAuthorized;
}