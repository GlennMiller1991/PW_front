import {FC, JSX, memo, PropsWithChildren} from "react";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";
import {IoColorPaletteSharp} from "react-icons/io5";
import {ColorInput} from "@src/app/game-wrapper/game/field-controls/controls/palette/color-input";

export const PaletteBtn: FC<IFieldControlBaseProps> = memo(({
                                                                gameController,
                                                                ...props
                                                            }) => {

    return (
        <StatingButton
            enabledContent={() => <ColorInput initialValue={gameController.currentColor}
                                              onChange={(c) => gameController.currentColor = c}/>}
            {...props}>
            <IoColorPaletteSharp/>
        </StatingButton>
    )
});

type IPopoverProps = PropsWithChildren<{
    content: JSX.Element;
}>
export const Popover: FC<IPopoverProps> = ({
                                               content,
                                               children,
                                           }) => {

    return (
        children
    )
}
