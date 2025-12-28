import preloaded from "@pic/war.jpg";
import {FontCSSLoader} from "@src/app/opening/font-css-loader";
import {delay} from "@fbltd/async";

export class OpeningViewController {
    exit = false;

    constructor(private bgText: string) {
    }

    async onDomMounted(domCanvas: HTMLCanvasElement) {
        const img = document.createElement('img');
        img.style.visibility = 'hidden';
        img.onload = async () => {
            {
                // const canvas = document.createElement('canvas');
                // let ctx = canvas.getContext('2d')!;
                // domCanvas.width = canvas.width = img.width;
                // domCanvas.height = canvas.height = img.height;
                // const s1 = domCanvas.style;
                // const s2 = canvas.style;
                // s1.width = s2.width = `${img.width}px`;
                // s1.height = s2.height = `${img.height}px`;
                //
                // ctx.drawImage(img, 0, 0);
                // const bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
                // ctx = domCanvas.getContext('2d')!;
                //
                // const isExit = () => this.exit;
                //
                // const set = new Set<string>();
                //
                // function* rasterize() {
                //     while (!isExit()) {
                //         if (set.size === img.width * img.height) break;
                //
                //         const x = Math.floor(Math.random() * canvas.width);
                //         const y = Math.floor(Math.random() * canvas.height);
                //         const key = `${x} ${y}`;
                //         if (set.has(key)) continue;
                //         set.add(key);
                //
                //         const a = bitmap.data[(y * bitmap.width + x) * 4 + 3];
                //         if (!a) continue;
                //
                //         ctx.putImageData(bitmap, 0, 0, x, y, 1, 1);
                //         yield;
                //     }
                //
                //     return;
                // }
                //
                // const task = new ScheduledTask<void>(rasterize, {chunkExecutionTime: 1, chunkPlanningTime: 6});
                //
                // await task.run();
            }

            const ctx = domCanvas.getContext('2d');
            if (!ctx) return;

            domCanvas.width = img.width;
            domCanvas.height = img.height;
            const s1 = domCanvas.style;
            s1.width = `${img.width}px`;
            s1.height = `${img.height}px`;

            ctx.drawImage(img, 0, 0);

            const family = 'Pixelify Sans';
            const href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"

            try {
                await fontLoader.load(family, href);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.font = 'bold 500px "Pixelify Sans"';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText('LOADING', img.width / 2, img.height / 2);
            } catch (err) {
                return;
            }

        }
        img.src = preloaded;
    }

    dispose() {
        this.exit = true;
    }
}

export const fontLoader = new FontCSSLoader();

export class ImagePreparer {
    protected readonly fontLoader = new FontCSSLoader();

    constructor() {
        this.init();
    }

    init() {

        const img = document.createElement('img');
        img.style.visibility = 'hidden';
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;
            const s1 = canvas.style;
            s1.width = `${img.width}px`;
            s1.height = `${img.height}px`;

            ctx.drawImage(img, 0, 0);
            await delay();

            const family = 'Pixelify Sans';
            const href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"

            try {
                await fontLoader.load(family, href);
                ctx.globalCompositeOperation = 'destination-in';
                ctx.font = `bold 500px "${family}"`;
                ctx.textAlign = 'center';
                ctx.fillText('LOADING', img.width / 2, img.height / 2);
                await delay();
                const bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);


                ctx.
            } catch (err) {
                return;
            }
        }

    }

}