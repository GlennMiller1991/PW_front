import {FAILURE, IResult, SUCCESS} from "@src/app/game/common-types";

export interface IResizeCallback {
    (entry: ResizeObserverEntry): void;
}

export class ResizeHandler {
    ro: ResizeObserver;
    targetObservers = new Map<Element, IResizeCallback>();

    constructor() {
        this.ro = new ResizeObserver(this.onResize);
    }

    onResize: ResizeObserverCallback = (entries) => {
        for (let entry of entries) {
            this.targetObservers.get(entry.target)?.(entry);
        }
    }

    observe(node: Element, cb: IResizeCallback): IResult {
        if (this.targetObservers.get(node)) return FAILURE;
        this.targetObservers.set(node, cb);
        this.ro.observe(node);
        return SUCCESS;
    }

    unobserve(node: Element) {
        this.targetObservers.delete(node);
        this.ro.unobserve(node);
    }

    dispose() {
        this.ro?.disconnect();
        this.targetObservers.clear();
    }
}

export const GlobalResizeObserver = new ResizeHandler();