import {TsconfigPathsPlugin} from "tsconfig-paths-webpack-plugin";
import {getPaths} from "../utils";

const {appTS} = getPaths();
export const tsPathsConfiguration = new TsconfigPathsPlugin({
    configFile: appTS,
});