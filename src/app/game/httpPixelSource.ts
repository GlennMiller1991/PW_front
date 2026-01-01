import {Dependency} from "@fbltd/async";
import {GET} from "@src/request/request";
import {ENDPOINTS} from "@src/request/constants";

export class HttpPixelSource {
    timeoutId: number;
    abortController?: AbortController;
    buffer: Dependency<ArrayBuffer> = new Dependency<ArrayBuffer>(null as any);

    init() {
        this.onCooldown();
    }

    onCooldown = async () => {
        const maybeBitmap = await this.forceGet();
        if (maybeBitmap) this.buffer.value = maybeBitmap;


        this.timeoutId = setTimeout(this.onCooldown, 5000) as any;
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
        clearInterval(this.timeoutId);
        this.abortController?.abort();
        this.buffer.dispose();
    }
}

