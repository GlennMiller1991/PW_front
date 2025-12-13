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
        this.node.addEventListener(this.startEvent, this.eventsHandler as EventListener);
    }

    eventsHandler = (event: TStart['native'] | TProceed['native'] | Required<TStop>['native']) => {
        const type = event!.type;

        if (this.stopEvents.includes(type)) {
            this.onStop(event);
        }

        if (this.startEvent === type) {
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


    abstract startEvent: string;
    abstract proceedEvent: string;
    abstract stopEvents: Array<string>;

    dispose() {
        this.onStop();
        this.node.removeEventListener(this.startEvent, this.eventsHandler as EventListener);
    }
}