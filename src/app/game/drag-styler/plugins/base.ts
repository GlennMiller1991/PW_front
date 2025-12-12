import {IStylerPlugin} from "@src/app/game/drag-styler/contracts";

export abstract class BaseStylerPlugin implements IStylerPlugin {
    protected isInited = false;

    protected constructor(protected node: Element) {

    }

    init = () => {
        if (this.isInited) return false;

        return this.isInited = this.initImpl();
    }

    abstract initImpl(): boolean;

    onStart() {

    }

    onStop() {

    }

    onDrag() {

    }

    onFirstDrag() {

    }

    dispose() {
        if (!this.isInited) throw new Error();
        this.disposeImpl();
        this.isInited = false;
    }

    abstract disposeImpl(): void;


}