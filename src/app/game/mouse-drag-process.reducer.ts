import {makeObservable} from "mobx";

enum MouseEventButton {
    Left = 0,
}

type IDragConfig = {
    withDraggingOnItself: boolean,
}

export class MouseDragProcessReducer {
    private stopDragController?: AbortController;
    private config: IDragConfig;

    _start?: MouseEvent;
    _drag?: MouseEvent;
    _stop?: MouseEvent;

    get start() {
        return this._start;
    }

    get drag() {
        return this._drag;
    }

    get stop() {
        return this._stop;
    }

    constructor(private node: EventTarget, config?: Partial<IDragConfig>) {
        this.config = {
            withDraggingOnItself: config?.withDraggingOnItself ?? true,
        }

        this.init();

        makeObservable(this, {
            _start: true,
            _drag: true,
            _stop: true,
        });
    }

    init() {
        this.node.addEventListener(this.startEvent, this.eventsHandler);
    }

    get proceedTarget() {
        return this.config.withDraggingOnItself ? this.node : document;
    }

    startEvent = 'mousedown';
    moveEvent = 'mousemove';
    stopEvents = ['mouseleave', 'mouseup'];

    eventsHandler = (event: MouseEvent) => {
        if (this.startEvent === event.type) {
            this.onDragStart(event);
        }

        if (this.moveEvent === event.type) {
            this.onDrag(event);
        }

        if (this.stopEvents.includes(event.type)) {
            this.onDragStop(event);
        }
    }

    onDragStart(event: MouseEvent) {

        if (event.button !== MouseEventButton.Left) {
            this.onDragStop();
            return;
        }

        if (event.defaultPrevented) {
            this.onDragStop();
            return;
        }

        this.stopDragController?.abort();
        const ac = this.stopDragController = new AbortController();

        for (let event of [this.moveEvent, ...this.stopEvents]) {
            this.proceedTarget.addEventListener(event, this.eventsHandler, {signal: ac.signal});
        }

        this._start = event;
    }

    onDrag(event: MouseEvent) {
        if (event.defaultPrevented) {
            this.onDragStop();
            return;
        }

        this._drag = event;
    }

    onDragStop(event?: MouseEvent) {
        this.stopDragController?.abort();
        this.stopDragController = undefined;

        this._stop = event;
    }


    dispose() {
        this.onDragStop();
        this.node.removeEventListener(this.startEvent, this.eventsHandler);
    }
}

