import {IPoint2} from "@fbltd/math";

import {toCeiledModule} from "@src/app/opening/utils";

export function getTextMetrics(ctx: CanvasRenderingContext2D, text: string) {
    ctx.save();

    ctx.moveTo(0, 0);

    const metrics = ctx.measureText(text);
    let {
        actualBoundingBoxAscent,
        actualBoundingBoxDescent,
        actualBoundingBoxLeft,
        actualBoundingBoxRight,
    } = metrics;

    actualBoundingBoxAscent = toCeiledModule(actualBoundingBoxAscent);
    actualBoundingBoxDescent = toCeiledModule(actualBoundingBoxDescent);
    actualBoundingBoxLeft = toCeiledModule(actualBoundingBoxLeft);
    actualBoundingBoxRight = toCeiledModule(actualBoundingBoxRight);

    const yOffset = (actualBoundingBoxAscent - actualBoundingBoxDescent) / 2;
    const xOffset = (actualBoundingBoxLeft - actualBoundingBoxRight) / 2

    ctx.restore();
    return {
        center: [xOffset, yOffset] as IPoint2,
        height: actualBoundingBoxAscent + actualBoundingBoxDescent,
        width: actualBoundingBoxLeft + actualBoundingBoxRight,
    };
}