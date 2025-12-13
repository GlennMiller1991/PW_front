import {makeObservable} from "mobx";
import {UiEventController} from "@src/app/game/events/base/ui-event.controller";
import {IDragEventProceed, IDragEventStart, IDragEventStop} from "@src/app/game/events/drag/contracts";
import {IPoint2, Point} from "@fbltd/math";

enum MouseEventButton {
    Left = 0,
}

type IDragConfig = {
    withDraggingOnItself: boolean,
}

export class DragController extends UiEventController<IDragEventStart, IDragEventProceed, IDragEventStop> {
    private config: IDragConfig;

    /**
     * @private
     */
    _start: IDragEventStart;

    /**
     * @private
     */
    _proceed: IDragEventProceed;

    /**
     * @private
     */
    _stop: IDragEventStop;

    get start() {
        return this._start;
    }

    get proceed() {
        return this._proceed;
    }

    get stop() {
        return this._stop;
    }

    constructor(node: EventTarget, config?: Partial<IDragConfig>) {
        super(node);

        this.config = {
            withDraggingOnItself: config?.withDraggingOnItself ?? true,
        }

        this.init();

        makeObservable(this, {
            _start: true,
            _proceed: true,
            _stop: true,
        });
    }


    get proceedTarget() {
        return this.config.withDraggingOnItself ? this.node : document;
    }

    startEvent = 'mousedown';
    proceedEvent = 'mousemove';
    stopEvents = ['mouseleave', 'mouseup'];

    isProcessCanBeStarted(event: MouseEvent) {
        if (event.button !== MouseEventButton.Left) return false;

        return true;
    }

    onStartImpl(native: IDragEventStart["native"]) {
        this._start = {
            native,
            data: {
                startPoint: [native.clientX, native.clientY],
            }
        }
    }

    onStopImpl(native: IDragEventStop["native"]) {
        this._stop = {
            native,
            data: undefined,
        }
    }

    onProceedImpl(native: IDragEventProceed["native"]) {
        const startPoint = this.start.data.startPoint;
        const currentPoint: IPoint2 = [native.clientX, native.clientY];

        this._proceed = {
            native,
            data: {
                startPoint,
                currentPoint,
                totalOffset: Point.dif(currentPoint, startPoint),
                currentOffset: [native.movementX, native.movementY],
            }
        }
    }

}

