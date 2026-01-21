import {observer} from "mobx-react-lite";
import {useEffect, useRef, useState} from "react";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import styles from "./game.module.css";
import {FieldControls} from "@src/app/game-wrapper/game/tools/field-controls";
import {cls} from "@src/app/app.view";
import {app} from "@src/app/app.controller";

export const Game = observer(() => {
    const [controller] = useState(() => new GameController());
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        controller.onDomMounted(ref.current!);

        return () => controller.dispose();
    }, []);


    return (
        <div className={cls(styles.container, app.device.isMobile && styles.mobileContainer)}>
            {
                controller.afterFirstRender &&
                <FieldControls
                    className={cls(styles.controls, app.device.isMobile ? styles.controlsMobile : styles.controlsDesktop)}
                    gameController={controller}/>
            }

            <div className={styles.canvasContainer}>
                <canvas width={0} height={0} ref={ref}/>
            </div>

        </div>
    );
})