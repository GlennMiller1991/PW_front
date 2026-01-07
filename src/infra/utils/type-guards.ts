export function isNotNullish<T>(arg: T): arg is NonNullable<T> {
    return arg != null;
}