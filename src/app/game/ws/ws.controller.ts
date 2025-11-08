import {ENDPOINTS} from "@src/request/constants";
import {Dependency, PromiseConfiguration} from "@fbltd/async";
import {MessageParser} from "@src/app/game/ws/message-parser";
import {IMessage} from "@src/app/game/ws/contracts";
import {Queue} from "@src/app/game/ws/queue";

export interface IUnhandledMessages {
    unhandledMessages: Queue<IMessage<any, any>>,
}

export class WsConnection {
    private connection: WebSocket;
    private unhandledMessages: Queue<IMessage<any, any>> = new Queue();

    message = new Dependency<IUnhandledMessages>(null as any);

    init(): Promise<void> {
        this.connection = new WebSocket(ENDPOINTS.wsUpgrade);

        const promiseConf = new PromiseConfiguration<void>();
        this.onOpen.resolve = promiseConf.resolve;
        this.connection.addEventListener('open', this.onOpen);
        return promiseConf.promise;
    }

    onOpen = (_ => {
        this.connection.addEventListener('message', this.onMessage);
        this.connection.addEventListener('close', this.onClose);

        this.connection.removeEventListener('open', this.onOpen);
        this.onOpen.resolve?.();
    }) as { (event: MessageEvent): void; resolve: Function }

    onMessage = async (message: MessageEvent) => {
        const data = message.data as Blob;
        try {
            const msg = MessageParser.parse(await data.arrayBuffer());
            this.unhandledMessages.enqueue(msg);
            this.message.value = {
                unhandledMessages: this.unhandledMessages,
            };

        } catch {
            console.warn("Message parse error");
        }

    }

    onClose = () => {
        this.connection.removeEventListener('message', this.onMessage);
        this.connection.removeEventListener('close', this.onClose);
        this.connection.removeEventListener('open', this.onOpen);
        this.message.dispose();
    }

    dispose() {
        this.connection.close();
        this.onClose();
    }
}