import {Configuration} from "webpack";
import {getPaths} from "./utils";
import {HtmlPlugin} from "./plugins/html.plugin";
import {devServer} from "./plugins/dev-server.plugin";
import {baseWebpackConfig} from "./base.webpack.config";
import {getCssLoader} from "./loaders/css.loader";
import {getDotenvPlugin} from "./plugins/dotenv.plugin";
import {getNodeModuleReplacementPlugin} from "./plugins/module-replacement.plugin";

const {modules} = getPaths();

export const DevelopmentConfig: Configuration = {
    ...baseWebpackConfig,
    mode: 'development',
    stats: 'minimal',
    devtool: "eval-source-map",
    output: {
        filename: "main.js",
    },
    plugins: [
        HtmlPlugin,
        getDotenvPlugin('development'),
        getNodeModuleReplacementPlugin(),
    ],
    infrastructureLogging: {
        debug: [name => name.includes('webpack-dev-server')],
    },
    devServer,
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
                    'style-loader',
                    getCssLoader(false),
                    'sass-loader'
                ],
            },
            {
                test: /\.(png|webp)/,
                type: 'asset/resource'
            },
            {
                test: /\.(glsl)/,
                use: 'raw-loader',
            }
        ]
    }
};