import {Dependency} from "@fbltd/async";
import {GET} from "@src/request/request";
import {ENDPOINTS} from "@src/request/constants";

export class HttpPixelSource {
    intervalId: number;
    abortController?: AbortController;
    buffer = new Dependency<ArrayBuffer>(null as any);

    constructor() {
    }

    init() {
        this.intervalId = setInterval(this.onCooldown, 5000) as any;
    }

    onCooldown = async () => {
        const maybeBitmap = await this.forceGet();
        if (maybeBitmap) this.buffer.value = maybeBitmap;
    }

    forceGet = async () => {
        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        let bitmapResponse = await GET<ArrayBuffer>(ENDPOINTS.gameBitmap, {signal});
        this.abortController = undefined;

        if (!bitmapResponse.data) return;
        return bitmapResponse.data;
    }


    dispose() {
        clearInterval(this.intervalId);
        this.abortController?.abort();
        this.buffer.dispose();
    }
}