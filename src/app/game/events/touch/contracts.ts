import {IUiEventProceed, IUiEventStart, IUiEventStop} from "@src/app/game/events/base/contracts";
import {centroid, IPoint2, Point} from "@fbltd/math";

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

    get touchPoints(): IPoint2[] {
        return Array
            .from(this.targetTouches)
            .map(t => [t.clientX, t.clientY])
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
            this.length = Point.distance(centroid(...this.touchPoints.slice(0, -1)), this.touchPoints.at(-1)!)
        } else if (this.targetTouches.length > 1) {
            this.length = Point.distance(this.touchPoints[0], this.touchPoints[1]);
        }
    }

    get scale() {
        return this.length / this.prev.length;
    }

    get eventOffset() {
        return Point.sub(this.startPoint, this.prev.startPoint);
    }

    get processOffset() {
        return Point.sub(this.startPoint, this.start.startPoint);
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
        return Point.sub(this.startPoint, [rect.left, rect.top]);
    }
}

export type ITouchEventProceed = IUiEventProceed<TouchEvent, {
    virtual: TouchEventProceed,
}>;
export type ITouchEventStop = IUiEventStop<TouchEvent>;
