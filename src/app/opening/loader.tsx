import styles from './opening.module.scss';
import {FC, useEffect, useRef, useState} from "react";
import {LoaderController} from "@src/app/opening/controller";

type ILoader = {
    text: string;
}
export const Loader: FC<ILoader> = ({
                                        text,
                                    }) => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [controller] = useState(() => new LoaderController(text));

    useEffect(() => {
        controller.onDomMounted(canvasRef.current!);

        return () => controller.dispose();
    }, [])
    return (
        <div className={styles.container}>
            <canvas ref={canvasRef} width={0} height={0}/>
        </div>
    )
}
