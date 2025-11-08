import {app} from "@src/app/app.controller";

export const ENDPOINTS = {
    get base() {
        return '/api';
    },

    // region Auth
    get auth() {
        return this.base + '/auth';
    },
    get refresh() {
        return this.auth + '/refresh';
    },
    get google() {
        return this.auth + '/google';
    },
    get accessibility() {
        return this.auth + '/accessibility';
    },
    // endregion Auth

    // region Game
    get game() {
        return this.base + '/game';
    },
    get gameAction() {
        return this.game + '/action';
    },
    get gameSet() {
        return this.game + '/set';
    },

    get sizes() {
        return this.game + '/sizes';
    },

    get gameBitmap() {
        return this.game + '/bitmap';
    },
    // endregion Game

    get ws() {
        return this.base + '/ws';
    },

    get wsUpgrade() {
        return this.ws + '/upgrade';
    },
}

export const MIME_TYPE = {
    rawBinary: "application/octet-stream",
    json: 'application/json',
}