import {ENDPOINTS} from "@src/request/constants";
import {Dependency, PromiseConfiguration} from "@fbltd/async";

export interface IUnhandledMessages {
    unhandledMessages: Queue<ArrayBuffer>,
}

type IQueueEntry<T> = {
    next?: IQueueEntry<T>;
    item: T;
} | undefined;

export class Queue<T> {
    first: IQueueEntry<T>;
    last: IQueueEntry<T>;

    dequeue(): T | undefined {
        const ret = this.first;
        if (!ret) return undefined;

        this.first = ret.next;
        if (!this.first) {
            this.last = undefined;
        }
        return ret.item ;
    }

    enqueue(item: T) {
        const e: NonNullable<typeof this.first> = {item};
        if (this.last) {
            this.last.next = e;
        } else {
            this.first = e;
        }
        this.last = e;
    }

    [Symbol.iterator]() {
        return {
            next: (): {done: true} | {done: false, value: T} => {
                const n = this.dequeue();
                if (!n) return {done: true};

                return {done: false, value: n};
            }
        }
    }



}

export class WsConnection {
    private connection: WebSocket;
    private unhandledMessages: Queue<ArrayBuffer> = new Queue();

    message = new Dependency<IUnhandledMessages>(null as any);

    init() {
        this.connection = new WebSocket(ENDPOINTS.wsUpgrade);

        const promiseConf = new PromiseConfiguration<void>();
        this.onOpen.resolve = promiseConf.resolve;
        this.connection.addEventListener('open', this.onOpen);
        return promiseConf.promise;
    }

    onOpen = (_ => {
        this.connection.addEventListener('message', this.onMessage);
        this.connection.addEventListener('close', this.onClose);
        this.onOpen.resolve?.();
    }) as { (event: MessageEvent): void; resolve: Function }

    onMessage = async (message: MessageEvent) => {
        const data = message.data as Blob;
        this.unhandledMessages.enqueue(await data.arrayBuffer());

        this.message.value = {
            unhandledMessages: this.unhandledMessages,
        };

    }

    onClose = (event: MessageEvent) => {
        this.connection.removeEventListener('message', this.onMessage);
        this.connection.removeEventListener('close', this.onClose);
        this.message.dispose();
    }

    dispose() {
        this.connection.close();
        // this.onClose();
    }
}