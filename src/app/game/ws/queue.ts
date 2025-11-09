export type IQueueEntry<T> = {
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
        return ret.item;
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
            next: (): { done: true } | { done: false, value: T } => {
                const n = this.dequeue();
                if (!n) return {done: true};

                return {done: false, value: n};
            }
        }
    }

    dispose() {
        this.first = this.last = undefined;
    }


}