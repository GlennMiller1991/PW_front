import {FC, memo, useEffect, useRef, useState} from 'react';
import styles from './game.module.css';
import {GameController} from "@src/app/game/game.controller";

type IGameView = {
    controller: GameController,
}
export const GameView: FC<IGameView> = memo(({controller}) => {
    const [cont] = useState(() => controller);
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        cont.onDomMounted(ref.current!);
    }, [])
    return (
        <div className={styles.container}>
            <canvas width={0} height={0} ref={ref}/>

        </div>
    )
})