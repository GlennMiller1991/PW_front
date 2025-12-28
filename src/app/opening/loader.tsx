import styles from './opening.module.scss';
import {FC, useEffect, useRef, useState} from "react";
import preloaded from '@pic/war.png';
import {ScheduledTask} from "@src/app/opening/scheduled-task";
import {delay} from "@fbltd/async";

type ILoader = {
    backgroundText: string;
}
export const Loader: FC<ILoader> = ({
                                        backgroundText,
                                    }) => {

    const svgRef = useRef<SVGSVGElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [controller] = useState(() => new OpeningViewController());


    useEffect(() => {
        controller.onDomMounted(canvasRef.current!, svgRef.current!);

        return () => controller.dispose();
    }, [])
    return (
        <div className={styles.container}>
            <div>
                <canvas ref={canvasRef} width={0} height={0}/>
            </div>
            {/*<svg ref={svgRef} style={{position: 'fixed', opacity: 0}} width={300} height={80}>*/}
            {/*    /!*<text style={{transform: 'translateY(50%)'}}*!/*/}
            {/*    /!*      dominantBaseline={'middle'}*!/*/}
            {/*    /!*      textAnchor={'start'}*!/*/}
            {/*    /!*      fontWeight={1000}*!/*/}
            {/*    /!*      fill={'#dddcdc'}>*!/*/}
            {/*    /!*    {backgroundText}*!/*/}
            {/*    /!*</text>*!/*/}
            {/*</svg>*/}
        </div>
    )
}

export class OpeningViewController {
    exit = false;

    constructor() {
    }

    async onDomMounted(domCanvas: HTMLCanvasElement, svgElement: SVGSVGElement) {
        const img = document.createElement('img');
        img.style.visibility = 'hidden';
        img.onload = async () => {
            {
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

                function* rasterize() {
                    while (!isExit()) {
                        const x = Math.floor(Math.random() * canvas.width);
                        const y = Math.floor(Math.random() * canvas.height);

                        const a = bitmap.data[(y * bitmap.width + x) * 4 + 3];

                        if (!a) continue;
                        ctx.putImageData(bitmap, 0, 0, x, y, 1, 1);
                        yield;
                    }

                    return;
                }

                const task = new ScheduledTask<void>(rasterize, {chunkExecutionTime: 1, chunkPlanningTime: 6});

                // const text = svgElement.lastElementChild! as SVGTextElement;
                // const box = text.getBBox();
                // svgElement.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
                // svgElement.setAttribute('width', `${img.width}px`);
                // svgElement.setAttribute('height', `150`);
                // svgElement.style.opacity = '1';

                await task.run();
            }

            // const ctx = domCanvas.getContext('2d');
            // if (!ctx) return;
            //
            // domCanvas.width = img.width;
            // domCanvas.height = img.height;
            // const s1 = domCanvas.style;
            // s1.width = `${img.width}px`;
            // s1.height = `${img.height}px`;
            //
            // ctx.drawImage(img, 0, 0);
            //
            //
            // const link = document.createElement('link');
            // link.rel = 'stylesheet';
            // const href = "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
            // link.href = href;
            // link.onload = async () => {
            //     document.fonts.ready.then((fonts) => {
            //         const f = Array
            //             .from(fonts)
            //             .filter(f => f.family === 'Pixelify Sans')
            //
            //         f.forEach(f => f.load());
            //
            //         Promise
            //             .all(f.map(f => f.loaded))
            //             .then(() => {
            //                 console.log('loaded')
            //                 ctx.globalCompositeOperation = 'destination-in';
            //                 ctx.font = 'bold 500px "Pixelify Sans"';
            //                 ctx.fillStyle = 'black';
            //                 ctx.textAlign = 'center';
            //                 ctx.fillText('LOADING', img.width / 2, img.height / 2);
            //             })
            //     })
            //
            // };

            // link.onerror = () => console.log('error');
            // document.head.appendChild(link);

        }
        img.src = preloaded;
    }

    dispose() {
        this.exit = true;
    }
}

