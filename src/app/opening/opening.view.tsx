import styles from './opening.module.scss';
import {useEffect, useRef, useState} from "react";
import preloaded from '@pic/preloader.webp';
import {delay} from "@fbltd/async";

export function OpeningView() {

    const ref = useRef<HTMLCanvasElement>(null);
    const [controller] = useState(() => new OpeningViewController());


    useEffect(() => {
        controller.onDomMounted(ref.current!);

        return () => controller.dispose();
    }, [])
    return (
        <div className={styles.container}>
            <div>
                <canvas ref={ref} width={0} height={0}/>
            </div>
        </div>
    )
}

export class OpeningViewController {

    constructor() {
    }

    async onDomMounted(domCanvas: HTMLCanvasElement) {
        const img = document.createElement('img');
        img.style.visibility = 'hidden';
        img.onload = async () => {
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


            // ctx.moveTo(0, 0);
            // ctx.lineTo(canvas.width, canvas.height);
            // ctx.strokeStyle = 'red';
            // ctx.stroke();
            //
            // ctx.drawImage(canvas, 0, 0);
            let start = Date.now();
            let now: number;
            while(true) {
                const x = Math.floor(Math.random() * canvas.width);
                const y = Math.floor(Math.random() * canvas.height);
                ctx.putImageData(bitmap, 0, 0, x, y, 1, 1);
                now = Date.now();
                if (now - start > 6) {
                    await delay(0);
                    start = Date.now();
                }
            }
        }
        img.src = preloaded;

    }

    dispose() {

    }
}

