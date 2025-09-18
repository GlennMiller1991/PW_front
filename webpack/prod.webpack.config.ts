import type {Configuration} from "webpack";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {getPaths} from "./utils";
import {HtmlPlugin} from "./plugins/html.plugin";
import {baseWebpackConfig} from "./base.webpack.config";
import {getCssLoader} from "./loaders/css.loader";
import {getDotenvPlugin} from "./plugins/dotenv.plugin";
import {getNodeModuleReplacementPlugin} from "./plugins/module-replacement.plugin";

const {modules} = getPaths();

export const ProductionConfig: Configuration = {
    ...baseWebpackConfig,
    mode: 'production',
    stats: 'detailed',
    devtool: undefined,
    plugins: [
        new MiniCssExtractPlugin(),
        HtmlPlugin,
        getDotenvPlugin('production'),
        getNodeModuleReplacementPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                exclude: modules,
            },
            {
                test: /\.(s)?css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    getCssLoader(true),
                    'sass-loader'
                ],
            },
            {
                test: /\.(png|webp|ico)/,
                type: 'asset/resource'
            },
        ]
    },
};