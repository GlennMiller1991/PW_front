import {ScheduledTask} from "@src/app/opening/scheduled-task";
import {imagePreparer} from "@src/app/opening/image-preparer";

export class LoaderController {
    exit = false;

    constructor(private bgText: string) {
    }

    async onDomMounted(domCanvas: HTMLCanvasElement) {
        const img = await imagePreparer.getImage(this.bgText);

        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d')!;
        domCanvas.width = canvas.width = img.width;
        domCanvas.height = canvas.height = img.height;
        const s1 = domCanvas.style;
        const s2 = canvas.style;
        s1.width = s2.width = `${img.width}px`;
        s1.height = s2.height = `${img.height}px`;

        ctx.drawImage(img, 0, 0);
        const bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx = domCanvas.getContext('2d')!;

        const isExit = () => this.exit;

        const set = new Set<string>();

        function* rasterize() {
            while (!isExit()) {
                if (set.size === img.width * img.height) break;

                const x = Math.floor(Math.random() * canvas.width);
                const y = Math.floor(Math.random() * canvas.height);
                const key = `${x} ${y}`;
                if (set.has(key)) continue;
                set.add(key);

                const a = bitmap.data[(y * bitmap.width + x) * 4 + 3];
                if (!a) continue;

                ctx.putImageData(bitmap, 0, 0, x, y, 1, 1);
                yield;
            }

            return;
        }

        const task = new ScheduledTask<void>(rasterize, {chunkExecutionTime: 1, chunkPlanningTime: 6});

        await task.run();
    }

    dispose() {
        this.exit = true;
    }
}

