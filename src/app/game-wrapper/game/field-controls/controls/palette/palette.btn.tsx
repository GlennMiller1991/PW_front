import {FC} from "react";
import {observer} from "mobx-react-lite";
import {cls} from "@src/app/app.view";
import paletteStyles from './palette.module.css';
import controlStyles from "@src/app/game-wrapper/game/field-controls/field-control.module.css";
import {IoColorPaletteSharp} from "react-icons/io5";

import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {hexColorToNumber, numberToColor} from "@src/app/game-wrapper/game/field-controls/controls/palette/utils";
import {isNotNullish} from "@src/infra/utils/type-guards";

export const PaletteBtn: FC<IFieldControlBaseProps> = observer(({
                                                         className,
                                                         active,
                                                         gameController,
                                                         ...props
                                                     }) => {
    const color = numberToColor(gameController.currentColor);
    return (
        <>
            <button className={cls(active && controlStyles.activeToolBtn, className)}
                    {...props}>
                <IoColorPaletteSharp/>
            </button>

            {
                active &&
                <div className={paletteStyles.activePalette}
                     onClick={e => e.stopPropagation()}>
                    <input type={'color'}
                           value={color}
                           onChange={(e) => {
                               //@ts-ignore
                               const colorStr = e.target.value;
                               const colorInt = hexColorToNumber(colorStr);
                               if (isNotNullish(colorInt)) {
                                   gameController.currentColor = colorInt;
                               }
                           }}
                           onInput={(e) => {
                               //@ts-ignore
                               const colorStr = e.target.value;
                               const colorInt = hexColorToNumber(colorStr);
                               if (isNotNullish(colorInt)) {
                                   gameController.currentColor = colorInt;
                               }
                           }}

                    />
                </div>
            }
        </>
    )
});