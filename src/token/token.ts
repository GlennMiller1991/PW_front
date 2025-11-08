import {makeAutoObservable} from "mobx";

import {ITokenPayload} from "@src/token/contracts";
import {convertUnixTimestampToTimestamp, parseJwt} from "@src/token/utils";

interface IExistedJwtToken {
    token: string,
    _payload: ITokenPayload,
}

export class Token {
    private _token?: string;
    protected _payload?: ITokenPayload;

    constructor() {
        makeAutoObservable(this);
    }

    set token(token: typeof this._token) {
        this._token = token;
        this._payload = token ? parseJwt(token) : undefined;
    }

    get token() {
        return this._token;
    }

    get payload() {
        return this._payload;
    }

    get isAuthorized() {
        return !!this._payload;
    }

    getIsAuthorized(): this is IExistedJwtToken {
        return this.isAuthorized;
    }

    get exp() {
        if (!this.getIsAuthorized()) return undefined;
        return convertUnixTimestampToTimestamp(this._payload.exp);
    }
}