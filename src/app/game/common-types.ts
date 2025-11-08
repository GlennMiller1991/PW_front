export type INullable = undefined | null;
export type IFalsifiable = INullable | false;
export type IFailure = IFalsifiable;
export type ISuccess = true;
export type IResult = IFailure | ISuccess;
export const FAILURE = false;
export const SUCCESS = true;
export type ILinearSizes = {
    width: number;
    height: number;
};

export type IElement = HTMLElement | SVGElement;