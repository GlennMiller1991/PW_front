export function numberToColor(n: number): string {
    return '#' + n
        .toString(16)
        .slice(-6)
        .padStart(6, '0');
}



export function isValidHexColor(c: string) {
    const regexps = [
        new RegExp(/^#[0-9a-f]{3}$/),
        new RegExp(/^#[0-9a-f]{6}$/),
    ]
    return regexps.some(regexp => regexp.test(c));
}

export function hexColorToNumber(c: string) {
    if (!isValidHexColor(c)) return;

    c = c.replace('#', '0x');
    return Number(c);
}