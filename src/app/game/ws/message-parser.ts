import {
    GameMessageType,
    IMessage,
    IPixelSettingMessage,
    IStatusChangeMessage,
    MessageRoom
} from "@src/app/game/ws/contracts";

export class MessageParser {
    static parse(raw: ArrayBuffer): IMessage<any, any> {
        let buffer: ArrayBuffer;
        let int: number;

        // message type
        buffer = raw.slice(0, 1);
        let uint8 = new Uint8Array(buffer);
        int = uint8[0];

        switch (int) {
            case MessageRoom.Game:
                const room = int as MessageRoom;
                buffer = raw.slice(1, 2);
                uint8 = new Uint8Array(buffer);
                const type = uint8[0] as GameMessageType;
                const msg = {
                    room,
                    data: {
                        type
                    }
                };
                switch (type) {
                    case GameMessageType.StatusChange:
                        return msg;
                    case GameMessageType.PixelSetting:
                        const l = raw.byteLength;
                        const arrSize = 6;
                        const intSize = 4;
                        const sep = arrSize * intSize;
                        let intArr: [number, number, number, number, number, number];
                        let pixels: Array<typeof intArr> = [];
                        let version = 0;
                        for (let i = 2; i < l; i += sep) {
                            buffer = raw.slice(i, i + sep);
                            intArr = Array.from(new Int32Array(buffer)) as typeof intArr;
                            version = intArr[0];
                            pixels.push(intArr)
                        }
                        (msg as IPixelSettingMessage).data.data = {
                            version,
                            pixels,
                        };

                        break;

                }

                return msg;
            default:
                throw new Error("Unrecognized message");
        }
    }

    static isGameMessage(msg: IMessage<any, any>): msg is IMessage<MessageRoom.Game, any> {
        return msg.room === MessageRoom.Game;
    }

    static isStatusChangeMessage(msg: IMessage<any, any>): msg is IStatusChangeMessage {
        return this.isGameMessage(msg) && msg.data?.type === GameMessageType.StatusChange;
    }

    static isPixelSettingMessage(msg: IMessage<any, any>): msg is IPixelSettingMessage {
        return this.isGameMessage(msg) && msg.data?.type === GameMessageType.PixelSetting;
    }
}