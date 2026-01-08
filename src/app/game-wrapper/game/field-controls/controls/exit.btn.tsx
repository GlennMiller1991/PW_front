import {FC} from "react";
import {observer} from "mobx-react-lite";
import {BaseButton} from "@src/app/_components/buttons/base/base.button";
import {app} from "@src/app/app.controller";
import {cls} from "@src/app/app.view";
import styles from "@src/app/game-wrapper/game/field-controls/field-control.module.css";
import {ImExit} from "react-icons/im";

import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";

export const ExitBtn: FC<IFieldControlBaseProps> = observer(({
                                                      active,
                                                      className,
                                                      gameController,
                                                      ...props
                                                  }) => {

    return (
        <BaseButton
            onClick={() => {
                gameController.dispose();
                app.logout();
            }}
            className={cls(active && styles.activeToolBtn, className)}
            {...props}>
            <ImExit/>
        </BaseButton>
    )
});