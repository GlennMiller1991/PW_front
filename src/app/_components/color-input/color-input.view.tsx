import {FC, memo, useEffect, useRef, useState} from "react";
import {useRaceStream} from "@fbltd/async";
import paletteStyles from "@src/app/_components/color-input/color-input.module.css";
import {Color} from "@fbltd/math";
import {
    ColorInputController
} from "@src/app/_components/color-input/color-input.controller";
import {cls} from "@src/app/app.view";

type IColorInput = {
    value?: Color;
    initialValue: Color;
    onChange: (color: Color) => void;
    className?: string;
}

export const ColorInputView: FC<IColorInput> = memo(({
                                                         value,
                                                         initialValue,
                                                         onChange,
                                                         className,
                                                     }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [controller] = useState(() => new ColorInputController(onChange, initialValue));

    const {
        value: {
            colorDep: {
                color,
                tendency: {stopColor, point: [x, y]}
            }
        }
    } = useRaceStream({colorDep: controller.currentColor});

    const stopPercentage = controller.main.getPercentageByColor(stopColor) ?? 0;


    useEffect(() => {
        controller.setOnChange(undefined);
        value && controller.setColor(value);
        controller.setOnChange(onChange);
    }, [onChange, value]);

    useEffect(() => {
        if (ref.current) {
            controller.onContainerMount(ref.current);
        }

        return () => controller.dispose();
    }, []);
    return (
        <div className={cls(paletteStyles.palette, className)}
             ref={ref}>
            <div style={{
                height: 80,
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


            <div style={{
                position: 'relative',
                background: controller.main.toCSS('to right'),
            }}>
                <div style={{
                    position: 'absolute',
                    left: `${stopPercentage * 100}%`,
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
    )
}, (prev, next) => {
    if (!prev.value && !next.value) return true;
    if (!prev.value || !next.value) return false;
    return prev.value.isEqual(next.value);
});