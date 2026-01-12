import {FC, useEffect, useState} from "react";
import paletteStyles from './palette.module.css';
import {IoColorPaletteSharp} from "react-icons/io5";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";
import {blend, clamp, Color, COLORS, LinearGradient, normalize, normalizeShade} from "@fbltd/math";
import {Reactive} from "@fbltd/async";
import {GameController} from "@src/app/game-wrapper/game/controller/game.controller";
import {DragMouseController} from "@src/infra/events/drag/dragMouseController";
import {autorun} from "mobx";

export const PaletteBtn: FC<IFieldControlBaseProps> = Reactive(({
                                                                    className,
                                                                    gameController,
                                                                    ...props
                                                                }) => {

    const [controller] = useState(() => new PaletteBtnController(gameController));

    const c = Color.ofNumber(controller.currentColor.value);

    const maxShade = Math.max(c.red, c.green, c.blue);
    const minShade = Math.min(c.red, c.green, c.blue);

    const x = normalizeShade(minShade);
    const y = normalizeShade(maxShade);

    const stopColor = new Color(0, 0, 0, 1);
    if (c.red === c.green && c.red === c.blue) {
        stopColor.red = 0xff;
        stopColor.green = stopColor.blue = 0x00;
    } else {
        if (c.red === maxShade) {
            stopColor.red = 0xff;
        }

        if (c.green === maxShade) {
            stopColor.green = 0xff;
        }

        if (c.blue === maxShade) {
            stopColor.blue = 0xff;
        }

        for (let key of ['red', 'green', 'blue'] as const) {
            if (c[key] !== maxShade && c[key] !== minShade) {

                // Восстановленная компонента цвета
                let restoredShade: number;

                // Восстанавливаю серый оттенок на этом y
                restoredShade = LinearGradient.restoreColor(COLORS.WHITE, COLORS.BLACK, 1 - y)[key];

                // экстраполирую до правой границы градиента
                restoredShade = restoredShade + (c[key] - restoredShade) / (1 - x);

                // привожу к формату rgb
                restoredShade = Math.floor(restoredShade);

                // экстраполирую до верхней границы градиента
                restoredShade = Math.floor(restoredShade / y);

                stopColor[key] = restoredShade;
                break;
            }
        }
    }


    let mainX = controller.main.getPercentageByColor(stopColor)!;

    const popoverContent = (
        <div className={paletteStyles.popover}>

            <div className={paletteStyles.palette}>
                <div
                    ref={(node) => {
                        if (!node) return;
                        if (isRendered) return;
                        isRendered = true;

                        const dragger = new DragMouseController(node, {withDraggingOnItself: false});
                        const rect = node.getBoundingClientRect();

                        autorun(() => {
                            const e = dragger.proceed?.data?.currentPoint ?? dragger.start?.data?.startPoint;
                            if (!e) return;

                            e[0] = clamp(normalize(e[0], rect.right, rect.left));
                            e[1] = clamp(normalize(e[1], rect.bottom, rect.top));


                            const c = blend(stopColor, controller.wtt.getColorAtPercentage(e[0])!, controller.ttb.getColorAtPercentage(e[1])!);

                            gameController.currentColor.value = c.toNumber();

                        })
                    }}

                    style={{
                        width: 100, height: 100,
                        position: 'relative',
                        background: `${controller.ttb.toCSS()}, ${controller.wtt.toCSS('to right')}, ${stopColor}`,
                    }}>
                    <div style={{
                        position: 'absolute',
                        right: `${x * 100}%`,
                        bottom: `${y * 100}%`,
                        background: c.toString(),
                        transform: 'translate(-50%, 50%)',
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
                    position: 'relative',
                    background: controller.main.toCSS('to left'),
                }}>
                    <div style={{
                        position: 'absolute',
                        left: `${mainX * 100}%`,
                        top: '50%',
                        background: stopColor.toString(),
                        transform: 'translate(-50%, -50%)',
                        width: 20,
                        height: 20,
                        outline: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                    }}/>
                </div>
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

export class PaletteBtnController {
    readonly ttb = new LinearGradient(
        {percentage: 0, color: COLORS.TRANSPARENT},
        {percentage: 1, color: COLORS.BLACK},
    );

    readonly wtt = new LinearGradient(
        {percentage: 0, color: COLORS.WHITE},
        {percentage: 1, color: COLORS.TRANSPARENT},
    );

    readonly main = new LinearGradient(
        {percentage: 0, color: new Color(255, 0, 0, 1)},
        {percentage: 1 / 7, color: new Color(255, 255, 0, 1)},
        {percentage: 2 / 7, color: new Color(0, 255, 0, 1)},
        {percentage: 3 / 7, color: new Color(0, 255, 0, 1)},
        {percentage: 4 / 7, color: new Color(0, 255, 255, 1)},
        {percentage: 5 / 7, color: new Color(0, 0, 255, 1)},
        {percentage: 6 / 7, color: new Color(255, 0, 255, 1)},
        {percentage: 1, color: new Color(255, 0, 0, 1)},
    );

    constructor(private readonly gameController: GameController) {
    }

    get currentColor() {
        return this.gameController.currentColor;
    }


}

let isRendered = false;