import {Configuration} from "webpack";

export type IWebpackModuleRule = Configuration['module']['rules'][0];
export type IWebpackBuildMode = 'production' | 'development';