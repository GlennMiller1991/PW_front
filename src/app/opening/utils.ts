export function toCeiledModule(n: number) {
    return Math.ceil(Math.abs(n)) * Math.sign(n);
}