import {ENDPOINTS} from "@src/infra/request/constants";
import {Dependency, PromiseConfiguration} from "@fbltd/async";
import {MessageParser} from "@src/infra/ws/message-parser";
import {IMessage} from "@src/infra/ws/contracts";
import {Queue} from "@src/infra/ws/queue";

export interface IUnhandledMessages {
    unhandledMessages: Queue<IMessage<any, any>>,
}

export class WsConnection {
    private connection: WebSocket;
    private unhandledMessages: Queue<IMessage<any, any>>;

    message : Dependency<IUnhandledMessages>;

    init(): Promise<void> {
        const promiseConf = new PromiseConfiguration<void>();
        this.onOpen.resolve = promiseConf.resolve;
        this.onOpen.reject = promiseConf.reject;

        try {
            this.connection = new WebSocket(ENDPOINTS.wsUpgrade);
        } catch(error) {
            this.onClose();
            return promiseConf.promise;
        }
        this.unhandledMessages = new Queue();
        this.message = new Dependency({unhandledMessages: this.unhandledMessages});
        this.connection.addEventListener('open', this.onOpen);
        this.connection.addEventListener('error', this.onError);

        return promiseConf.promise;
    }

    onOpen = (_ => {
        this.connection.addEventListener('message', this.onMessage);
        this.connection.addEventListener('close', this.onClose);

        this.connection.removeEventListener('open', this.onOpen);
        this.onOpen.resolve?.();
        this.clearOnOpen();
    }) as { (event: MessageEvent): void; resolve: Function, reject: Function }

    private clearOnOpen = () => {
        this.onOpen.resolve = this.onOpen.reject = null as any;
    }

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
        this.connection?.removeEventListener('message', this.onMessage);
        this.connection?.removeEventListener('close', this.onClose);
        this.connection?.removeEventListener('open', this.onOpen);
        this.connection?.removeEventListener('error', this.onError);
        this.message?.dispose();
        this.connection = null as any;
        this.unhandledMessages?.dispose();
        this.unhandledMessages = null as any;
        this.clearOnOpen();
    }

    onError = () => {
        this.onOpen.reject?.();
        this.onClose();
    }

    dispose() {
        this.connection.close();
        this.onClose();
    }
}