import {Configuration} from "webpack";
import {getPaths} from "./utils";
import {tsPathsConfiguration} from "./plugins/ts-paths.plugin";
import path from "path";

const {appIndex, root} = getPaths();

export const baseWebpackConfig: Configuration = {
    entry: appIndex,
    cache: false,
    output: {
        filename: "main.js",
        clean: true,
        path: path.resolve(root, "build"),
    },
    resolve: {
        plugins: [tsPathsConfiguration,],
        extensions: [".js", ".ts", ".tsx"],
    },
}