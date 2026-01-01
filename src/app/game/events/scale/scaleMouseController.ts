import {UiEventController} from "@src/app/game/events/base/ui-event.controller";
import {makeObservable} from "mobx";
import {debounce} from "@fbltd/async";
import {IScaleEventProceed, IScaleEventStart, IScaleEventStop} from "@src/app/game/events/scale/contracts";
import {IPoint2, Point} from "@fbltd/math";

export class ScaleMouseController extends UiEventController<IScaleEventStart, IScaleEventProceed, IScaleEventStop> {
    debouncedStop: ReturnType<typeof debounce> = debounce(() => this.onStop(), 10);

    _start: IScaleEventStart;
    _proceed: IScaleEventProceed;
    _stop: IScaleEventStop;

    get start() {
        return this._start;
    }

    get proceed() {
        return this._proceed;
    }

    get stop() {
        return this._stop;
    }

    constructor(node: EventTarget) {
        super(node);

        this.init();

        makeObservable(this, {
            _start: true,
            _proceed: true,
            _stop: true,
        });
    }

    startEvent = 'wheel';
    proceedEvent = 'wheel';
    stopEvents = [];

    init() {
        super.init();
    }

    onStartImpl(native: IScaleEventStart["native"]) {
        this._start = {native};
        this.debouncedStop();
    }

    onStopImpl(native: IScaleEventStop["native"]) {
        this._stop = {
            native,
            data: undefined,
        }
    }

    get rect() {
        if ((this.node as Element).getBoundingClientRect) {
            return (this.node as Element).getBoundingClientRect();
        }

        return document.body.getBoundingClientRect();
    }

    onProceedImpl(native: IScaleEventProceed["native"]) {
        const absPoint: IPoint2 = [native.clientX, native.clientY];

        const rect = this.rect;
        const relPoint = Point.sub(absPoint, [rect.left, rect.top]);

        this._proceed = {
            native,
            data: {
                absPoint,
                relPoint,
                direction: Math.sign(native.deltaY) as -1 | 1,
            }
        }
    }

    dispose() {
        this.debouncedStop.dispose();
        super.dispose();
    }
}