import {FC} from "react";
import {observer} from "mobx-react-lite";
import {BaseButton} from "@src/app/_components/buttons/base/base.button";
import {RiHome3Line} from "react-icons/ri";

import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/tools/contracts";

export const FitInBtn: FC<IFieldControlBaseProps> = observer(({
                                                                  gameController,
                                                                  ...props
                                                              }) => {

    return (
        <BaseButton onClick={() => gameController.goHome()}
                    {...props}>
            <RiHome3Line/>
        </BaseButton>
    )
});