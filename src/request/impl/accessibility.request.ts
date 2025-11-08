import {ENDPOINTS} from "@src/request/constants";

export async function accessibilityRequest() {
    const response = await fetch(ENDPOINTS.accessibility);
    return response.ok;
}