export function convertErrorToString(error: Error) {
    let s = '';

    s += `location: ${location.href}\n`;
    s += `datetime: ${Date.now()}\n`;
    s += `error name: ${error.name}\n`;
    s += `error message: ${error.message}\n`;
    s += `error stack: ${error.stack}\n`;

    return s;
}