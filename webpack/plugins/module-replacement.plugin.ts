import { NormalModuleReplacementPlugin } from "webpack";

export function getNodeModuleReplacementPlugin() {
    return new NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
    })
}