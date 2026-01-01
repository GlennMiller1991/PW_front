import {UiEventController} from "@src/app/game/events/base/ui-event.controller";
import {makeObservable} from "mobx";
import {
    ITouchEventProceed,
    ITouchEventStart,
    ITouchEventStop,
    TouchEventProceed, TouchEventStart
} from "@src/app/game/events/touch/contracts";

export class TouchTransformController extends UiEventController<Required<ITouchEventStart>, Required<ITouchEventProceed>, ITouchEventStop> {
    private _prevProceed: TouchEventProceed | undefined;

    /**
     * @private
     */
    _start: Required<ITouchEventStart>;

    /**
     * @private
     */
    _proceed: Required<ITouchEventProceed>;

    /**
     * @private
     */
    _stop: ITouchEventStop;

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

    startEvent = ['touchstart', 'touchend'];
    proceedEvent = 'touchmove';
    stopEvents = ['touchstart', 'touchend', 'touchcancel',];

    isProcessCanBeStarted(event: Required<ITouchEventStart>["native"]) {
        return event.targetTouches.length > 0;
    }

    onStartImpl(native: ITouchEventProceed["native"]) {
        this._start = {
            native,
            data: {
                virtual: new TouchEventStart(native),
            }
        }
    }

    onProceedImpl(native: ITouchEventProceed["native"]) {
        const virtual = new TouchEventProceed(native, new TouchEventStart(this._start!.native), this._prevProceed);
        const offset = virtual.eventOffset;

        if (offset[0] || offset[1]) {
            native.preventDefault();

            this._proceed = {
                native,
                data: virtual,
            }
        }

        this._prevProceed = virtual;
    }

    onStopImpl(native: ITouchEventStop["native"]) {
        this._prevProceed = undefined;

        this._stop = {
            native,
            data: undefined,
        }
    }
}