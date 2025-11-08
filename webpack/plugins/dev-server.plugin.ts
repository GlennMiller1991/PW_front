import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {getPaths} from "../utils";

const {pub} = getPaths();
export const devServer: DevServerConfiguration = {
    static: {
        directory: pub,
    },
    proxy: [
        {
            context: ['/api/ws/upgrade'],
            target: 'ws://localhost:8080',
            secure: false,
            ws: true,
        },
        {
            context: ['/api'],
            target: 'http://localhost:8080',
            secure: false,
        }
    ],
    client: {
        reconnect: false,
    },
    allowedHosts: ["xn--b1add.xn----7sbanedmtdn2babzy.xn--p1ai"],
    port: 5000,
};