import {IUiEventProceed, IUiEventStart, IUiEventStop} from "@src/app/game/events/base/contracts";
import {IPoint2, Point} from "@fbltd/math";
import {centroid} from "@src/app/game/events/touch/touch-transform.controller";

export type ITouchEventStart = IUiEventStart<TouchEvent, {
    virtual: TouchEventStart,
}>;

export class TouchEventStart {
    startPoint: IPoint2;

    constructor(public native: TouchEvent) {
        if (native.touches.length === 0)
            throw new Error("Invalid touch event");

        this.startPoint = this.centroid;
    }

    get targetTouches() {
        return this.native.targetTouches;
    }

    get touchPoints() {
        return Array
            .from(this.targetTouches)
            .map(t => [t.clientX, t.clientY] as IPoint2)
    }

    get centroid() {
        return centroid(...this.touchPoints);
    }

}

export class TouchEventProceed extends TouchEventStart {
    private length = 1;
    private prev: TouchEventProceed

    constructor(
        native: TouchEvent,
        private start: TouchEventStart,
        prev?: TouchEventProceed,
    ) {
        super(native);

        this.prev = prev ?? this;

        this.init();
    }

    init() {
        if (this.targetTouches.length > 2) {
            this.length = pointLength(centroid(...this.touchPoints.slice(0, -1)), this.touchPoints.at(-1)!)
        } else if (this.targetTouches.length > 1) {
            this.length = pointLength(this.touchPoints[0], this.touchPoints[1]);
        }
    }

    get scale() {
        return this.length / this.prev.length;
    }

    get eventOffset() {
        return Point.dif(this.startPoint, this.prev.startPoint);
    }

    get processOffset() {
        return Point.dif(this.startPoint, this.start.startPoint);
    }

    get rect() {
        let node = this.native.target;
        if ((node as Element).getBoundingClientRect) {
            return (node as Element).getBoundingClientRect();
        }

        return document.body.getBoundingClientRect();
    }

    get relStartPoint() {
        const rect = this.rect;
        return Point.dif(this.startPoint, [rect.left, rect.top]);
    }
}

export type ITouchEventProceed = IUiEventProceed<TouchEvent, {
    virtual: TouchEventProceed,
}>;
export type ITouchEventStop = IUiEventStop<TouchEvent>;

export function pointLength([x1, y1]: IPoint2, [x2, y2]: IPoint2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
}