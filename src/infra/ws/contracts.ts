export enum MessageRoom {
    Game = 1,
    App = 2,
}

export enum GameMessageType {
    StatusChange = 1,
    PixelSetting = 2,
    BitmapSetting = 3,
    ClearBitmap = 4,
}

export type IMessage<TRoom extends MessageRoom = MessageRoom, T = never> = {
    room: TRoom,
    data: T
}

export type IGameMessage<TMessageType extends GameMessageType, T = never> = {
    type: TMessageType,
    data: T
}

export type IStatusChangeMessage = IMessage<
    MessageRoom.Game,
    IGameMessage<GameMessageType.StatusChange>
>

export type IClearBitmapMessage = IMessage<MessageRoom.Game, IGameMessage<GameMessageType.ClearBitmap>>;

export type IPixelSettingMessage = IMessage<
    MessageRoom.Game,
    IGameMessage<
        GameMessageType.PixelSetting,
        {
            version: number,
            // version, x, y, r, g, b
            pixels: Array<[number, number, number, number, number, number]>
        }
    >
>

export type IBitmapSettingMessage = IMessage<
    MessageRoom.Game,
    IGameMessage<GameMessageType.BitmapSetting,
        {
            version: number,
            bitmap: ArrayBuffer,
        }>
>

export enum AppMessageType {
    Logout = 1,
}

export type ILogoutMessage = IMessage<
    MessageRoom.App,
    AppMessageType.Logout
>