import preloaded from "@pic/war.jpg";
import {delay, PromiseConfiguration} from "@fbltd/async";
import {IPoint2} from "@fbltd/math";
import {getTextMetrics} from "@src/app/opening/canvas-utils";
import {app} from "@src/app/app.controller";

export class ImagePreparer {
    protected readonly cache: Map<string, {bitmap?: ImageBitmap, promise?: PromiseConfiguration<ImageBitmap>}> = new Map();

    async getImage(text: string) {
        const w = window.visualViewport!.width;
        const h = window.visualViewport!.height;

        const key = `${w} ${h} ${text}`;
        if (this.cache.has(key)) {
            const entry = this.cache.get(key)!;
            if (entry.promise) {
                return await entry.promise.promise;
            }
            return entry.bitmap!
        }
        const metaPromise = new PromiseConfiguration<ImageBitmap>();

        const entry = {promise: metaPromise,} as {bitmap?: ImageBitmap, promise?: PromiseConfiguration<ImageBitmap>};
        this.cache.set(key, entry);

        const img = document.createElement('img');
        img.style.visibility = 'hidden';
        img.src = preloaded;
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = w;
            canvas.height = h;

            const s1 = canvas.style;
            s1.width = `${w}px`;
            s1.height = `${h}px`;


            const wAr = img.width / w;
            const hAr = img.height / h;
            const maxAr = Math.max(wAr, hAr);
            const resultW = img.width / maxAr;
            const resultH = img.height / maxAr;

            const center = [w / 2, h / 2] as IPoint2;
            if (maxAr > 1) {
                let isSideTouched = wAr > hAr;

                if (isSideTouched) {
                    ctx.drawImage(img, 0, center[1] - resultH / 2, resultW, resultH);
                } else {
                    ctx.drawImage(img, center[0] - (img.width / maxAr) / 2, 0, resultW, resultH)
                }
            } else if (maxAr < 1) {
                ctx.drawImage(img, 0, 0);
            } else {
                ctx.drawImage(img, 0, 0);
            }


            await delay();

            const family = 'Pixelify Sans';
            const href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"

            try {
                await app.fontLoader.load(family, href);

                ctx.globalCompositeOperation = 'destination-in';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const s = text;

                let fontSize = Math.min(img.width, img.height);
                while (true) {
                    ctx.font = `bold ${fontSize}px "Pixelify Sans"`;
                    const {width, height} = getTextMetrics(ctx, s);
                    if (width < img.width / maxAr && height < img.height / maxAr) break;
                    fontSize /= 2;
                    fontSize = Math.floor(fontSize);
                }


                const {center} = getTextMetrics(ctx, s);

                ctx.translate(center[0], center[1]);
                ctx.fillText(s, w / 2, h / 2);

                const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
                const minX = Math.floor((w - resultW) / 2);
                const minY = Math.floor((h - resultH) / 2);

                entry.bitmap = await createImageBitmap(imgData, minX, minY, resultW, resultH);
                metaPromise.resolve(entry.bitmap);
                entry.promise = undefined;
            } catch (err) {
                metaPromise.reject(err);
                this.cache.delete(key);
                return;
            }

        }
        return metaPromise.promise;
    }

    dispose() {
        this.cache.clear();
    }
}

export const imagePreparer = new ImagePreparer();