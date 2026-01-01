import {DetailedHTMLProps, FC, HTMLAttributes, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {app} from "@src/app/app.controller";
import styles from './spectator.module.scss';
import {FaPlay} from "react-icons/fa";
import {IoColorPaletteSharp} from "react-icons/io5";
import {RiHome3Line} from "react-icons/ri";

import {cls} from "@src/app/app.view";
import {GameController} from "@src/app/game/game.controller";
import {isNonNegativeInteger} from "@fbltd/math";

type ISpectatorTopMenu = {
    onProceed: () => void;
}
export const SpectatorView: FC<ISpectatorTopMenu> = observer(({
                                                                  onProceed,
                                                              }) => {

    if (!app.isAuthorized) return;

    return (
        <div className={styles.fieldSheet}>
            <button onClick={onProceed} className={styles.test}>
                <FaPlay/>
            </button>
        </div>
    )
});


export const FieldControls: FC<{ gameController: GameController }> = observer(({
                                                                                gameController,
                                                                            }) => {
    const [active, setActive] = useState<number | undefined>(undefined);

    return (
        <div className={cls(styles.fieldSheet, styles.noEvents)}>
            <div className={styles.topPanel} onClick={(e) => {
                const index = parseFloat((e.target as HTMLButtonElement).getAttribute('data-index') ?? '');
                if (isNaN(index))
                    return setActive(undefined);

                if (!isNonNegativeInteger(index))
                    return setActive(undefined);

                if (index === active)
                    return setActive(undefined);

                return setActive(index);
            }}>
                <PaletteBtn active={active === 0} data-index={0} gameController={gameController}/>
                <FitInBtn active={active === 1} data-index={1} gameController={gameController}/>
            </div>
        </div>
    )
});

type IDivDetailedProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
type IButtonDetailedProps = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

type IPaletteBtn = {
    active?: boolean,
    gameController: GameController,
} & IButtonDetailedProps;
export const PaletteBtn: FC<IPaletteBtn> = observer(({
                                                         className,
                                                         active,
                                                         gameController,
                                                         ...props
                                                     }) => {
    const color = numberToColor(gameController.currentColor);
    return (
        <>
            <button className={cls(active && styles.activeToolBtn, className)}
                    {...props}>
                <IoColorPaletteSharp/>
            </button>

            {
                active &&
                <div className={styles.activePalette}
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

export const FitInBtn: FC<IPaletteBtn> = observer(({
                                                       active,
                                                       className,
                                                       gameController,
                                                       ...props
                                                   }) => {

    useEffect(() => {
        gameController.goHome()
    }, [active]);

    return (
        <>
            <button className={cls(active && styles.activeToolBtn, className)}
                    {...props}>
                <RiHome3Line/>
            </button>
        </>
    )
})

function numberToColor(n: number): string {
    return '#' + n
        .toString(16)
        .slice(-6)
        .padStart(6, '0');
}

function isValidHexColor(c: string) {
    const regexps = [
        new RegExp(/^#[0-9a-f]{3}$/),
        new RegExp(/^#[0-9a-f]{6}$/),
    ]
    return regexps.some(regexp => regexp.test(c));
}

function hexColorToNumber(c: string) {
    if (!isValidHexColor(c)) return;

    c = c.replace('#', '0x');
    return Number(c);
}

function isNotNullish<T>(arg: T): arg is NonNullable<T> {
    return arg != null;
}