import {Color, COLORS, IPoint2, LinearGradient, normalizeShade} from "@fbltd/math";

export function getColorTendency(c: Color) {
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

    return {stopColor, point: [1 - x, 1 - y] as IPoint2};
}