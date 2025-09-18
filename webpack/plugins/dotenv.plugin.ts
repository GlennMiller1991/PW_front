import Dotenv from 'dotenv-webpack';
import {IWebpackBuildMode} from "../contracts";

export function getDotenvPlugin(mode: IWebpackBuildMode) {
    return new Dotenv({
        path: '.env' + (mode === 'production' ? '.production' : '.development'),
        safe: true,
        defaults: false,
    });
}