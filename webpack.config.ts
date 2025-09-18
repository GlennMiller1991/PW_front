import {DevelopmentConfig} from './webpack/dev.webpack.config';
import {ProductionConfig} from "./webpack/prod.webpack.config";
import type {Configuration} from "webpack";

const mode = process.env.NODE_ENV;
if (mode !== 'production' && mode !== 'development') {
    throw new Error("Build mode should be provided");
}
let config: Configuration;
switch(mode) {
    case 'production':
        config = ProductionConfig;
        break;
    case 'development':
        config = DevelopmentConfig;
        break;
}
export default config;