import {makeAutoObservable} from 'mobx';

export class AppController {

    _isReady = false;

    get isReady() {
        return this._isReady;
    }

    set isReady(value: boolean) {
        this._isReady = value;
    }

    constructor() {
        makeAutoObservable(this);

        this.init();
    }

    init() {

    }
}