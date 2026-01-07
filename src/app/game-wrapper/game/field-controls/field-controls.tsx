import {FC, useState} from "react";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {observer} from "mobx-react-lite";
import {useRaceStream} from "@fbltd/async";
import {cls} from "@src/app/app.view";
import {isNonNegativeInteger} from "@fbltd/math";
import {GameRole} from "@src/app/game-wrapper/game/controller/game-logic";
import commonStyles from './field-controler.module.css';
import {ExitBtn} from "@src/app/game-wrapper/game/field-controls/controls/exit.btn";
import {FitInBtn} from "@src/app/game-wrapper/game/field-controls/controls/fitIn.btn";
import {PaletteBtn} from "@src/app/game-wrapper/game/field-controls/controls/palette/palette.btn";

export const FieldControls: FC<{ gameController: GameController }> = observer(({
                                                                                   gameController,
                                                                               }) => {
    const {value: {role}} = useRaceStream({role: gameController.logic.role});
    const [active, setActive] = useState<number | undefined>(undefined);

    return (
        <div className={cls(commonStyles.fieldSheet, 'unobservable')}>
            <div className={commonStyles.topPanel} onClick={(e) => {
                const index = parseFloat((e.target as HTMLButtonElement).getAttribute('data-index') ?? '');
                if (isNaN(index))
                    return setActive(undefined);

                if (!isNonNegativeInteger(index))
                    return setActive(undefined);

                if (index === active)
                    return setActive(undefined);

                return setActive(index);
            }}>
                {
                    role === GameRole.Player &&
                    <PaletteBtn active={active === 0} data-index={0} gameController={gameController}/>
                }

                <FitInBtn active={active === 1} data-index={1} gameController={gameController}/>
                <ExitBtn active={active === 2} data-index={2} gameController={gameController}/>
            </div>
        </div>
    )
});