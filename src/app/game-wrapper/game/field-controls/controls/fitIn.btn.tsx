import {FC} from "react";
import {observer} from "mobx-react-lite";
import {BaseButton} from "@src/app/_components/buttons/base/base.button";
import {cls} from "@src/app/app.view";
import styles from "@src/app/game-wrapper/game/field-controls/field-control.module.css";
import {RiHome3Line} from "react-icons/ri";

import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";

export const FitInBtn: FC<IFieldControlBaseProps> = observer(({
                                                       active,
                                                       className,
                                                       gameController,
                                                       ...props
                                                   }) => {

    return (
        <BaseButton
            onClick={() => gameController.goHome()}
            className={cls(active && styles.activeToolBtn, className)}
            {...props}>
            <RiHome3Line/>
        </BaseButton>
    )
});