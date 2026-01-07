import {ENDPOINTS} from "@src/infra/request/constants";

export async function accessibilityRequest() {
    const response = await fetch(ENDPOINTS.accessibility);
    return response.ok;
}