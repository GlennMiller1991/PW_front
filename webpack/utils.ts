import path from "path";

export function getPaths() {
    const root = path.join(__dirname, '..');
    const src = path.join(root, 'src');
    const pub = path.join(root, 'public');
    const modules = path.join(root, 'node_modules');
    const index = path.join(pub, 'index.html');
    const appTS = path.join(src, 'tsconfig.json');
    const appIndex = path.join(src, 'index.tsx');
    return {
        root,
        src,
        pub,
        modules,
        index,
        appTS,
        appIndex,
    }
}
