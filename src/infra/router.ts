import {Action, createBrowserHistory, Update} from "history";
import {createFnStorage} from "@src/app/game-wrapper/game/controller/game.controller";
import {Dependency} from "@fbltd/async";

export class Router {
    private disposer = createFnStorage();
    private history = createBrowserHistory();
    private _segments = new Dependency([] as string[]);

    get segments() {
        return this._segments;
    }

    constructor() {
        this.disposer.push(
            this.history.listen(this.onLocationChange.bind(this))
        );

        this.onLocationChange({action: Action.Push, location: this.history.location});
    }

    protected onLocationChange({location}: Update) {
        const loc = {...location};

        let segments = loc
            .pathname
            .split('/')
            .filter(Boolean)
            .map(s => '/' + s);

        if (segments.length === 0) {
            segments.push('/')
        }

        for (let i = 0; i < Math.max(segments.length, this.segments.value.length); i++) {
            if (segments[i] !== this.segments.value[i]) {
                this.segments.value = segments;
                break;
            }
        }


    }

    goto(url: string) {
        this.history.push(url);
    }

    dispose() {
        this.disposer.run();
    }
}

export const router = new Router();

