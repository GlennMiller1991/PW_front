import {reaction as mobxReaction} from "mobx";
import {MouseDragProcessReducer} from "@src/app/game/mouse-drag-process.reducer";
import {AnimationQueue} from "@src/app/game/animation-queue";
import {IStylerPlugin} from "@src/app/game/drag-styler/contracts";
import {DragSheetPlugin} from "@src/app/game/drag-styler/plugins/drag-sheet.plugin";

type IDragStylerConfig = {
    withSheet: boolean;
}

export class DragStyler {
    protected node: Element;
    protected config: IDragStylerConfig;
    private disposeMgr = disposeStorage();
    private animationQueue = new AnimationQueue();
    private plugins: IStylerPlugin[] = [];

    constructor(private dragger: MouseDragProcessReducer, config?: Partial<IDragStylerConfig>, node?: typeof this.node) {
        this.config = {
            withSheet: config?.withSheet ?? false,
        }

        if (node) this.init(node);
    }

    init(node: typeof this.node) {
        if (this.node) return;


        if (this.config.withSheet) {
            this.plugins.push(new DragSheetPlugin(node));
        }

        this.plugins.forEach(p => p.init());

        let isFirstDragWas = false;

        this.disposeMgr(
            mobxReaction(
                () => this.dragger.start,
                () => {
                    isFirstDragWas = false;
                    this.animate(this.onStart.bind(this));
                }, {
                    fireImmediately: false,
                }),
            mobxReaction(
                () => this.dragger.stop,
                () => this.animate(this.onStop.bind(this)), {
                    fireImmediately: false,
                }
            ),
            mobxReaction(
                () => this.dragger.drag,
                () => {
                    if (isFirstDragWas)
                        this.animate(this.onDrag.bind(this));
                    else
                        this.animate(this.onFirstDrag.bind(this));
                    isFirstDragWas = true
                }, {
                    fireImmediately: false,
                }
            )
        )
    }

    animate(fn: () => void) {
        this.animationQueue.push(fn)
    }

    onStart() {
        this.plugins.forEach(p => p.onStart());
    }

    onStop() {
        this.plugins.forEach(p => p.onStop());
    }

    onDrag() {
        this.plugins.forEach(p => p.onDrag());
    }

    onFirstDrag() {
        this.plugins.forEach(p => p.onFirstDrag());
    }

    dispose() {
        this.node = null as any;
        this.disposeMgr.dispose();
        this.animationQueue.dispose();
        this.plugins.forEach(p => p.dispose());
        this.plugins.length = 0;
    }
}

export function disposeStorage() {
    const shouldBeDisposed = [] as Function[];

    interface IReturnedObject {
        (...functions: Function[]): void;

        dispose(): void;
    }

    const fn = ((...args) => {
        shouldBeDisposed.push(...args);
    }) as IReturnedObject;

    fn.dispose = () => {
        shouldBeDisposed.forEach(f => f());
        shouldBeDisposed.length = 0;
    }

    return fn;
}