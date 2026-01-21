import {POST} from "@src/infra/request/request";
import {ENDPOINTS} from "@src/infra/request/constants";
import {LogLevel} from "@src/infra/request/impl/contracts";

export async function logRequest(msg: string, level = LogLevel.Error) {
    try {
        POST(ENDPOINTS.log, {message: msg, level});
    } catch (error) {

    }

    return;
}