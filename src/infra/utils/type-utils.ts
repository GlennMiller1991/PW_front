import {DetailedHTMLProps, HTMLAttributes} from "react";

export type IExclusiveUnion<TFirst extends {}, TSecond extends {}> = ({
    [Key in keyof TFirst]?: never
} & TSecond) | ({
    [Key in keyof TSecond]?: never
} & TFirst);

export type IDivDetailedProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type IButtonDetailedProps = DetailedHTMLProps<HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
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