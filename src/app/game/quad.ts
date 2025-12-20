import {IPoint2, Point} from "@fbltd/math";

export abstract class Quad {
    static ofCenter(center: IPoint2, width: number, height = width) {
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let p1: IPoint2 = Point.dif(center, [halfWidth, halfHeight]);
        let p2 = Point.sum(p1, [width, 0]);
        let p3 = Point.sum(p1, [0, height]);
        let p4 = Point.sum(p1, [width, height]);
        let p5 = Point.dif(p4, [width, 0]);
        let p6 = Point.dif(p4, [0, height])
        return [
            ...p1, ...p2, ...p3,
            ...p4, ...p5, ...p6
        ];
    }
}