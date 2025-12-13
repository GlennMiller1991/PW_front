export type IUiEventStart<TEvent extends UIEvent, TData extends any = never> = {
    native: TEvent,
    data: TData
}
export type IUiEventStop<TEvent extends UIEvent, TData extends any = undefined> = {
    native?: TEvent,
    data: TData
}
export type IUiEventProceed<TEvent extends UIEvent, TData extends any = never> = {
    native: TEvent,
    data: TData
}