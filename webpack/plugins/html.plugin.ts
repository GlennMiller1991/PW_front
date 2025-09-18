import HtmlWebpackPlugin from "html-webpack-plugin";
import {getPaths} from "../utils";
import path from "path";

const {index, pub} = getPaths();
export const HtmlPlugin = new HtmlWebpackPlugin({
    template: index,
    favicon: path.join(pub, 'favicon.ico'),
});