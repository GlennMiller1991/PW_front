import {IUiEventProceed, IUiEventStart, IUiEventStop} from "@src/app/game/events/base/contracts";

export abstract class UiEventController<
    TStart extends IUiEventStart<UIEvent, any> = IUiEventStart<UIEvent>,
    TProceed extends IUiEventProceed<UIEvent, any> = IUiEventProceed<UIEvent>,
    TStop extends IUiEventStop<UIEvent, any> = IUiEventStop<UIEvent>> {
    private listen?: AbortController;


    abstract get start(): TStart;
    abstract get stop(): TStop;
    abstract get proceed(): TProceed;

    protected constructor(protected node: EventTarget) {
    }

    init() {
        for (let e of this.startEvents) {
            this.node.addEventListener(e, this.eventsHandler as EventListener);
        }
    }

    eventsHandler = (event: TStart['native'] | TProceed['native'] | Required<TStop>['native']) => {
        const type = event!.type;

        if (this.stopEvents.includes(type)) {
            this.onStop(event);
        }

        if (this.startEvents.includes(type)) {
            this.onStart(event!);
        }

        if (this.proceedEvent === type) {
            this.onProceed(event!);
        }
    }

    get proceedTarget() {
        return this.node;
    }

    onStart(event: TStart['native']) {
        if (this.listen) {
            this.onStop();
            return;
        }

        if (event.defaultPrevented) {
            return;
        }

        if (!this.isProcessCanBeStarted(event)) return;

        this.listen = new AbortController();

        for (let event of [this.proceedEvent, ...this.stopEvents]) {
            this.proceedTarget.addEventListener(event, this.eventsHandler as EventListener, {signal: this.listen.signal});
        }

        this.onStartImpl(event);
    }

    abstract onStartImpl(event: TStart['native']): void;
    isProcessCanBeStarted(event: TStart['native']) {
        return true
    }

    onStop(event?: TStop['native']) {
        const listen = this.listen;
        this.listen?.abort();
        this.listen = undefined;

        if (listen) {
            this.onStopImpl(event)
        }
    }

    abstract onStopImpl(event: TStop['native']): void;


    onProceed(event: TProceed['native']) {
        if (event.defaultPrevented) {
            this.onStop();
            return;
        }

        this.onProceedImpl(event);
    }

    abstract onProceedImpl(event: TProceed['native']): void;


    abstract startEvent: string | Array<string>;
    abstract proceedEvent: string;
    abstract stopEvents: Array<string>;

    private get startEvents() {
        if (Array.isArray(this.startEvent)) return this.startEvent;
        return [this.startEvent];
    }

    dispose() {
        this.onStop();
        for (let e of this.startEvents) {
            this.node.removeEventListener(e, this.eventsHandler as EventListener);
        }
    }
}