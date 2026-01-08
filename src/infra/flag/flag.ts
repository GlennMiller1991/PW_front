import {Dependency} from "@fbltd/async";

export class Flag {
    private readonly _initial: boolean;
    private readonly _state: Dependency<boolean>;

    constructor(_state: boolean = false) {
        this._initial = _state;
        this._state = new Dependency(_state);
    }

    get stateDep() {
        return this._state;
    }

    get state() {
        return this._state.value;
    }


    drop = () => {
        this._state.value = this._initial;
    }

    on = () => {
        this._state.value = true;
    }

    off = () => {
        this._state.value = false;
    }

    invert = () => {
        this._state.value = !this._state.value;
    }

}

