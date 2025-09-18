import {IWebpackModuleRule} from "../contracts";

export function getCssLoader(isProd?: boolean): IWebpackModuleRule {
    const localIdentName = isProd ? '[hash:base64:5]' : '[path][name]__[local]--[hash:base64:5]';
    return {
        loader: 'css-loader',
        options: {
            sourceMap: !isProd,
            modules: {
                auto: /\.module\.s?css$/,
                namedExport: false,
                mode: 'local',
                localIdentName,
            }
        }
    };
}
