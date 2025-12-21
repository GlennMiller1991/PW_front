import {Dependency} from "@fbltd/async";
import {GET} from "@src/request/request";
import {ENDPOINTS} from "@src/request/constants";

export class HttpPixelSource {
    intervalId: number;
    abortController?: AbortController;
    buffer = new Dependency<ArrayBuffer>(null as any);

    init() {
        this.onCooldown();
    }

    onCooldown = async () => {
        const maybeBitmap = await this.forceGet();
        if (maybeBitmap) this.buffer.value = maybeBitmap;

        this.intervalId = setTimeout(this.onCooldown, 5000) as unknown as number;
    }

    forceGet = async () => {
        this.abortController?.abort();

        this.abortController = new AbortController();
        const signal = this.abortController.signal;
        let bitmapResponse = await GET<ArrayBuffer>(ENDPOINTS.gameBitmap, {signal});

        this.abortController = undefined;

        return bitmapResponse.data;
    }


    dispose() {
        clearInterval(this.intervalId);
        this.abortController?.abort();
        this.buffer.dispose();
    }
}

