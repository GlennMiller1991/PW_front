import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import {getPaths} from "../utils";

const {pub} = getPaths();

export const CopyPlugin = new CopyWebpackPlugin({
    patterns: [
        {
            from: path.join(pub, 'manifest.json'),
            to: 'manifest.json'
        }
    ]
})