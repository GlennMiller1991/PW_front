import type {Configuration as DevServerConfiguration} from "webpack-dev-server";
import {getPaths} from "../utils";

const {pub} = getPaths();
export const devServer: DevServerConfiguration = {
    static: {
        directory: pub,
    },
    proxy: [
        {
            context: ['/api/v1'],
            target: 'http://localhost:5000',
            secure: false,
        }
    ],
    port: 5001,
};