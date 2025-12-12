import {makeAutoObservable} from 'mobx';
import GoogleAuth from "@fbltd/google-auth";
import {refreshRequest} from "@src/request/impl/refresh.request";
import {Token} from "@src/token/token";
import {accessibilityRequest} from "@src/request/impl/accessibility.request";
import {delay} from "@fbltd/async";

export let app: AppController;
export class AppController {
    private _jwt = new Token();

    private _google: Awaited<ReturnType<typeof GoogleAuth.import>>;
    private _isServerAccessible = false;
    private _isInitWas = false;
    private _fatalError = false;

    set isInitWas(value: boolean) {
        this._isInitWas = value;
    }

    get fatalError() {
        return this._fatalError;
    }

    get isReady() {
        return this._isInitWas;
    }

    get isInitSuccessful() {
        return this._isInitWas && !this.fatalError;
    }

    get isAuthorized() {
        return this.jwt.isAuthorized;
    }

    get google() {
        return this._google;
    }

    get jwt() {
        return this._jwt;
    }

    setErrorIfFalsy(value: any) {
        if (!value) this._fatalError = true;
    }

    set isServerAccessible(value: typeof this._isServerAccessible) {
        this.setErrorIfFalsy(value);
        this._isServerAccessible = value;
    }

    set google(value: typeof this._google) {
        this.setErrorIfFalsy(value);
        this._google = value;
    }

    constructor() {
        app = this;
        makeAutoObservable(this);

        this.init();
    }

    async init() {
        await delay(2000);
        this.isServerAccessible = await accessibilityRequest();
        if (this._isServerAccessible) {
            const isAuthorized = await refreshRequest();
            if (!isAuthorized) {
                this.google = await GoogleAuth.import();
            }
        }

        this.isInitWas = true;
    }
}

