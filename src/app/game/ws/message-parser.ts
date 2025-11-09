import {
    GameMessageType, IBitmapSettingMessage,
    IMessage,
    IPixelSettingMessage,
    IStatusChangeMessage,
    MessageRoom
} from "@src/app/game/ws/contracts";

export class MessageParser {
    private static _unrecognized = new Error("Unrecognized message");

    static parse(raw: ArrayBuffer): IMessage<any, any> {
        let buffer: ArrayBuffer;
        let int: number;
        let version: number;

        // message type
        buffer = raw.slice(0, 1);
        let uint8 = new Uint8Array(buffer);
        int = uint8[0];

        try {
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
                            version = 0;
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

                            return msg;
                        case GameMessageType.BitmapSetting:
                            version = new Int32Array(raw.slice(0, 4))[0];
                            buffer = raw.slice(4);
                            (msg as IBitmapSettingMessage).data.data = {
                                version,
                                bitmap: buffer,
                            };
                            return msg;
                    }

                    return msg;
            }
            throw this._unrecognized;
        } catch (err) {
            throw this._unrecognized;
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

    static isBitmapSettingMessage(msg: IMessage<any, any>): msg is IBitmapSettingMessage {
        return this.isGameMessage(msg) && msg.data?.type === GameMessageType.BitmapSetting;
    }
}