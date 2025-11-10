import {ResponseError} from "@src/request/response.error";
import {MIME_TYPE} from "@src/request/constants";

export async function processResponse(response: Response) {
    if (response.ok) {
        try {
            const contentType = response.headers.get("content-type");
            switch(contentType) {
                case null:
                    return null;
                case MIME_TYPE.rawBinary:
                case MIME_TYPE.jpeg:
                    const blob = await response.blob();
                    return await blob.arrayBuffer();

                case MIME_TYPE.json:
                default:
                    return await response.json();
            }
        } catch (err) {
            throw new ResponseError(500);
        }
    } else throw new ResponseError(response.status);
}