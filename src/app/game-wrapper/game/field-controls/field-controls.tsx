import {FC} from "react";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {observer} from "mobx-react-lite";
import {cls} from "@src/app/app.view";
import commonStyles from './field-controler.module.css';
import {ExitBtn} from "@src/app/game-wrapper/game/field-controls/controls/exit.btn";
import {FitInBtn} from "@src/app/game-wrapper/game/field-controls/controls/fitIn.btn";
import {PaletteBtn} from "@src/app/game-wrapper/game/field-controls/controls/palette/palette.btn";

export const FieldControls: FC<{ gameController: GameController }> = observer(({
                                                                                   gameController,
                                                                               }) => {

    return (
        <div className={cls(commonStyles.fieldSheet, 'unobservable')}>
            <div className={commonStyles.topPanel}>

                <PaletteBtn gameController={gameController}/>
                <FitInBtn gameController={gameController}/>
                <ExitBtn gameController={gameController}/>

            </div>
        </div>
    )
});