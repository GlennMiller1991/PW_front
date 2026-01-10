import {FC} from "react";
import {observer} from "mobx-react-lite";
import paletteStyles from './palette.module.css';
import {IoColorPaletteSharp} from "react-icons/io5";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";
import {Color, COLORS, LinearGradient} from "@fbltd/math";
import {useRaceStream} from "@fbltd/async";

export const PaletteBtn: FC<IFieldControlBaseProps> = observer(({
                                                                    className,
                                                                    gameController,
                                                                    ...props
                                                                }) => {

    const {value: {color}} = useRaceStream({color: gameController.currentColor});

    const c = Color.ofNumber(color);

    const ttb = new LinearGradient(
        {percentage: 0, color: COLORS.TRANSPARENT},
        {percentage: 1, color: COLORS.BLACK},
    );

    const wtt = new LinearGradient(
        {percentage: 0, color: COLORS.TRANSPARENT},
        {percentage: 1, color: COLORS.WHITE},
    );

    const main = new LinearGradient(
        {percentage: 0, color: COLORS.TRANSPARENT},
        {percentage: 1, color: c},
    );

    const popoverContent = (
        <div className={paletteStyles.popover}>

            <div className={paletteStyles.palette}>
                <div style={{
                    width: 100, height: 100,
                    position: 'relative',
                    background: `${ttb.toCSS()}, ${wtt.toCSS('to left')}, ${c}`,
                }}>
                    <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: 0,
                        background: c.toString(),
                        transform: 'translate(-50%, -50%)',
                        width: 20,
                        height: 20,
                        outline: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                    }}/>
                </div>


                <div style={{
                    width: 100,
                    height: 7,
                    background: 'linear-gradient(90deg,red,#ff0 17%,#0f0 33%,#0ff 50%,#00f 66%,#f0f 83%,red)'
                }}/>
            </div>
        </div>
    )

    return (
        <>
            <StatingButton
                enabledContent={popoverContent}
                {...props}>
                <IoColorPaletteSharp/>
            </StatingButton>
        </>
    )
});
