export type IExclusiveUnion<TFirst extends {}, TSecond extends {}> = ({
    [Key in keyof TFirst]?: never
} & TSecond) | ({
    [Key in keyof TSecond]?: never
} & TFirst);