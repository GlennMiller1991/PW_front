import {IPoint2} from "@fbltd/math";
import {Matrix} from "@src/app/game-wrapper/game/controller/game.controller";

export function getScaleToPointMatrix(point: IPoint2, factor: number) {
    return Matrix.multiply(
        [1, 0, 0, 1, point[0], point[1]],
        [factor, 0, 0, factor, 0, 0],
        [1, 0, 0, 1, -point[0], -point[1]]
    )
}