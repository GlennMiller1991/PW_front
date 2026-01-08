import {FC} from "react";
import {observer} from "mobx-react-lite";
import paletteStyles from './palette.module.css';
import {IoColorPaletteSharp} from "react-icons/io5";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {hexColorToNumber, numberToColor} from "@src/app/game-wrapper/game/field-controls/controls/palette/utils";
import {isNotNullish} from "@src/infra/utils/type-guards";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";

export const PaletteBtn: FC<IFieldControlBaseProps> = observer(({
                                                                    className,
                                                                    gameController,
                                                                    ...props
                                                                }) => {

    const color = numberToColor(gameController.currentColor);
    return (
        <>
            <StatingButton enabledContent={
                <div className={paletteStyles.activePalette}
                     onFocus={console.log}
                >
                    <input type={'color'}
                           value={color}
                           onChange={(e) => {
                               const colorStr = e.target.value;
                               const colorInt = hexColorToNumber(colorStr);
                               if (isNotNullish(colorInt)) {
                                   gameController.currentColor = colorInt;
                               }
                           }}
                    />
                </div>
            }
                           {...props}>
                <IoColorPaletteSharp/>
            </StatingButton>
        </>
    )
});

