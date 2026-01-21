import {FC} from "react";
import {observer} from "mobx-react-lite";
import {BaseButton} from "@src/app/_components/buttons/base/base.button";
import {app} from "@src/app/app.controller";
import {ImExit} from "react-icons/im";

import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/tools/contracts";

export const ExitBtn: FC<IFieldControlBaseProps> = observer(({
                                                                 gameController,
                                                                 ...props
                                                             }) => {

    return (
        <BaseButton
            onClick={() => {
                gameController.dispose();
                app.logout();
            }}
            {...props}>
            <ImExit/>
        </BaseButton>
    )
});