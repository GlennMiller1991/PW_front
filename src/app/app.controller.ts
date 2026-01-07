import {makeAutoObservable} from 'mobx';
import GoogleAuth from "@fbltd/google-auth";
import {refreshRequest} from "@src/infra/request/impl/refresh.request";
import {Token} from "@src/infra/token/token";
import {accessibilityRequest} from "@src/infra/request/impl/accessibility.request";
import {delay} from "@fbltd/async";
import {FontCSSLoader} from "@src/app/_components/opening/font-css-loader";
import {GET} from "@src/infra/request/request";
import {ENDPOINTS} from "@src/infra/request/constants";
import {router} from "@src/infra/router";

export const fonts = {
    pixel: {
        family: 'Pixelify Sans',
        src: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400..700&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap'
    }
}

export let app: AppController;

export class AppController {
    private _jwt = new Token();

    private _google: Awaited<ReturnType<typeof GoogleAuth.import>>;
    private _isServerAccessible = false;
    private _isInitWas = false;
    private _fatalError = false;
    public readonly fontLoader = new FontCSSLoader();

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
        let time = Date.now();
        this.isServerAccessible = await accessibilityRequest();
        if (this._isServerAccessible) {
            const auth = refreshRequest;
            const loadLib = async () => {
                this.google = await GoogleAuth.import();
            }
            const loadFonts = async () => {
                const ps = Object
                    .values(fonts)
                    .map((f) => this.fontLoader.load(f.family, f.src))
                return Promise.all(ps);
            }

            await Promise.all([
                auth(),
                loadLib(),
                loadFonts(),
            ])
        }

        time = Date.now() - time;
        time = 2000 - time;
        if (time > 0) {
            await delay(time);
        }

        this.isInitWas = true;
    }

    async logout() {
        GET(ENDPOINTS.logout);

        this.jwt.token = undefined;
        router.goto('/');
    }
}

