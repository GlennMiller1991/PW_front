import {observer} from "mobx-react-lite";
import {useEffect, useRef, useState} from "react";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import styles from "./game.module.css";
import {FieldControls} from "@src/app/game-wrapper/game/field-controls/field-controls";

export const Game = observer(() => {
    const [controller] = useState(() => new GameController());
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        controller.onDomMounted(ref.current!);

        return () => controller.dispose();
    }, []);


    return (
        <div className={styles.container}>
            <div className={styles.canvasContainer}>
                <canvas width={0} height={0} ref={ref}/>
            </div>

            {
                controller.afterFirstRender &&
                <FieldControls gameController={controller}/>
            }

        </div>
    );
})