import {FC} from "react";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {observer} from "mobx-react-lite";
import styles from './field-controler.module.css';
import {ExitBtn} from "@src/app/game-wrapper/game/tools/controls/exit.btn";
import {FitInBtn} from "@src/app/game-wrapper/game/tools/controls/fitIn.btn";
import {ColorInputView} from "@src/app/_components/color-input/color-input.view";
import {cls} from "@src/app/app.view";

export const FieldControls: FC<{ gameController: GameController, className: string }> = observer(({
                                                                                                      className = '',
                                                                                                      gameController,
                                                                                                  }) => {

    return (
        <div className={cls(styles.toolPanel, className)}>
            <div className={styles.btnContainer}>
                <FitInBtn gameController={gameController} className={styles.topPanelBtn}/>
                <ExitBtn gameController={gameController} className={styles.topPanelBtn}/>
            </div>


            <ColorInputView initialValue={gameController.currentColor}
                            onChange={(c) => gameController.currentColor = c}/>
        </div>
    )
});