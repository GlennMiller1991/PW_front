import {UiEventController} from "@src/infra/events/base/ui-event.controller";
import {makeObservable} from "mobx";
import {
    ITouchEventProceed,
    ITouchEventStart,
    ITouchEventStop,
    TouchEventProceed, TouchEventStart
} from "@src/infra/events/touch/contracts";
import {isNotNullish} from "@src/infra/utils/type-guards";
import {isNatural} from "@fbltd/math";

export type ITouchTransformConfig = {
    touchesQty: number
}

export class TouchTransformController extends UiEventController<Required<ITouchEventStart>, Required<ITouchEventProceed>, ITouchEventStop> {
    private _prevProceed: TouchEventProceed | undefined;
    private config: ITouchTransformConfig;

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

    constructor(node: EventTarget, config: Partial<ITouchTransformConfig> = {}) {
        super(node);

        this.config = {
            touchesQty: (config.touchesQty && isNatural(config.touchesQty)) ? config.touchesQty : Infinity,
        }

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
        if (event.targetTouches.length <= 0) return false;
        if (event.targetTouches.length >= this.config.touchesQty) return false;

        return true;
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

        if ((offset[0]) || offset[1]) {
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