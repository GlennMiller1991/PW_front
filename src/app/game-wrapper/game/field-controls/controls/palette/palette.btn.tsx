import {FC, memo} from "react";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";
import {IoColorPaletteSharp} from "react-icons/io5";
import {ColorInput} from "@src/app/game-wrapper/game/field-controls/controls/palette/color-input";
import {Popover} from "@src/app/game-wrapper/game/field-controls/controls/palette/popover";

export const PaletteBtn: FC<IFieldControlBaseProps> = memo(({
                                                                gameController,
                                                                ...props
                                                            }) => {

    return (
        <Popover position={'leftTop'}>
            <StatingButton {...props}>
                <IoColorPaletteSharp/>
            </StatingButton>

            <ColorInput initialValue={gameController.currentColor}
                        onChange={(c) => gameController.currentColor = c}/>
        </Popover>
    )
});


