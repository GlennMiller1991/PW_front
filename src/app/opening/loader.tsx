import styles from './opening.module.scss';
import {FC, useEffect, useRef, useState} from "react";
import preloaded from '@pic/preloader.webp';
import {ScheduledTask} from "@src/app/opening/scheduled-task";

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
            <svg ref={svgRef} style={{position: 'fixed', opacity: 0}} width={300} height={80}>
                <text style={{transform: 'translateY(50%)'}}
                      dominantBaseline={'middle'}
                      textAnchor={'start'}
                      fontWeight={1000}
                      fill={'#dddcdc'}>
                    {backgroundText}
                </text>
            </svg>
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
                    ctx.putImageData(bitmap, 0, 0, x, y, 1, 1);
                    yield;
                }

                return;
            }

            const task = new ScheduledTask<void>(rasterize, {chunkExecutionTime: 1, chunkPlanningTime: 6});


            const node = svgElement.firstChild! as SVGTextElement;
            const box = node.getBBox();
            svgElement.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
            svgElement.setAttribute('width', `${img.width}px`);
            svgElement.setAttribute('height', `150`);
            svgElement.style.opacity = '1';

            await task.run();
        }
        img.src = preloaded;
    }

    dispose() {
        this.exit = true;
    }
}

