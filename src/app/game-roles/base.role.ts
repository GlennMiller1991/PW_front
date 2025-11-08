import {DependencyStream, PromiseConfiguration} from "@fbltd/async";
import {GameController} from "@src/app/game/game.controller";

export abstract class BaseRole {
    protected _completion: PromiseConfiguration;
    protected abstract _stream: DependencyStream;

    protected constructor(protected gameController: GameController) {
        this._completion = new PromiseConfiguration();
    }

    async do() {

        return this._completion.promise;
    }

    dispose() {
        this._completion.reject(null as any);

        this._stream.dispose();
    }


}