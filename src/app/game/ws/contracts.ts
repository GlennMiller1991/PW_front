export enum MessageRoom {
    Game = 1,
}

export enum GameMessageType {
    StatusChange = 1,
    PixelSetting  = 2,
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

export type IPixelSettingMessage = IMessage<
    MessageRoom.Game,
    IGameMessage<
        GameMessageType.PixelSetting,
        // version, x, y, r, g, b
        Array<[number, number, number, number, number, number]>
    >
>