import {makeObservable} from "mobx";

enum MouseEventButton {
    Left = 0,
}

export class MouseDragProcessReducer {
    private stopDragController?: AbortController;

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

    constructor(private node: EventTarget) {
        this.init();

        makeObservable(this, {
            _start: true,
            _drag: true,
            _stop: true,
        })
    }

    init() {
        this.node.addEventListener(this.startEvent, this.eventsHandler);
    }

    startEvent = 'mousedown';
    moveEvent = 'mousemove';
    stopEvents = ['mouseleave', 'mouseout', 'mouseup'];

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
        document.addEventListener(this.moveEvent, this.eventsHandler, {signal: ac.signal });
        for (let event of this.stopEvents) {
            document.addEventListener(event, this.eventsHandler, {signal: ac.signal});
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