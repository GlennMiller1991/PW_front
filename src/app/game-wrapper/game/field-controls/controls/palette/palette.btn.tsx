import {FC, useState} from "react";
import paletteStyles from './palette.module.css';
import {IoColorPaletteSharp} from "react-icons/io5";
import {IFieldControlBaseProps} from "@src/app/game-wrapper/game/field-controls/contracts";
import {StatingButton} from "@src/app/_components/buttons/stating/stating.button";
import {blend, clamp, Color, COLORS, IPoint2, LinearGradient, normalize} from "@fbltd/math";
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

    const {color, tendency: {stopColor, point: [x, y]}} = controller.currentColor.value;


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

                        function eProcess(e: IPoint2) {
                            e[0] = clamp(normalize(e[0], rect.right, rect.left));
                            e[1] = clamp(normalize(e[1], rect.bottom, rect.top));

                            const v = gameController.currentColor.value;
                            const color = blend(v.tendency.stopColor, controller.wtt.getColorAtPercentage(e[0])!, controller.ttb.getColorAtPercentage(e[1])!);

                            gameController.currentColor.value = {
                                color,
                                tendency: {
                                    stopColor: v.tendency.stopColor,
                                    point: e,
                                }
                            };
                        }

                        autorun(() => {
                            const e = dragger.proceed?.data?.currentPoint;
                            if (e) eProcess(e);
                        });

                        autorun(() => {
                            const e = dragger.start?.data?.startPoint;
                            if (e) eProcess(e);
                        });
                    }}
                    style={{
                        width: 100, height: 100,
                        position: 'relative',
                        background: `${controller.ttb.toCSS()}, ${controller.wtt.toCSS('to right')}, ${stopColor}`,
                    }}>
                    <div style={{
                        position: 'absolute',
                        left: `${x * 100}%`,
                        top: `${y * 100}%`,
                        background: color.toString(),
                        transform: 'translate(-50%, -50%)',
                        width: 12,
                        height: 12,
                        outline: '2px solid white',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                    }}/>
                </div>


                <div
                    ref={(node) => {
                        if (!node) return;
                        if (isRendered2) return;
                        isRendered2 = true;
                        const dragger = new DragMouseController(node, {withDraggingOnItself: false});
                        const rect = node.getBoundingClientRect();

                        function eProcess(e: IPoint2) {
                            const x = clamp(normalize(e[0], rect.right, rect.left), 0, 0.99);

                            const c = controller.main.getColorAtPercentage(x);
                            if (!c) return;

                            const v = gameController.currentColor.value;
                            const point = v.tendency.point;
                            const color = blend(c, controller.wtt.getColorAtPercentage(point[0])!, controller.ttb.getColorAtPercentage(point[1])!);
                            gameController.currentColor.value = {
                                color,
                                tendency: {
                                    stopColor: c,
                                    point: v.tendency.point,
                                }
                            };
                        }

                        autorun(() => {
                            const e = dragger.proceed?.data?.currentPoint;
                            if (e) eProcess(e);
                        });

                        autorun(() => {
                            const e = dragger.start?.data?.startPoint;
                            if (e) eProcess(e);
                        })
                    }}
                    style={{
                        width: 100,
                        height: 7,
                        position: 'relative',
                        background: controller.main.toCSS('to right'),
                    }}>
                    <div style={{
                        position: 'absolute',
                        left: `${mainX * 100}%`,
                        top: '50%',
                        background: stopColor.toString(),
                        transform: 'translate(-50%, -50%)',
                        width: 10,
                        height: 16,
                        outline: '2px solid white',
                        borderRadius: 5,
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
        {percentage: 1 / 6, color: new Color(255, 255, 0, 1)},
        {percentage: 2 / 6, color: new Color(0, 255, 0, 1)},
        {percentage: 3 / 6, color: new Color(0, 255, 255, 1)},
        {percentage: 4 / 6, color: new Color(0, 0, 255, 1)},
        {percentage: 5 / 6, color: new Color(255, 0, 255, 1)},
        {percentage: 6 / 6, color: new Color(255, 0, 0, 1)},
    );

    constructor(private readonly gameController: GameController) {
    }

    get currentColor() {
        return this.gameController.currentColor;
    }


}

let isRendered = false;
let isRendered2 = false;
