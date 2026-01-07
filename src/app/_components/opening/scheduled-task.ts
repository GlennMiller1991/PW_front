import {PromiseConfiguration} from "@fbltd/async";

export type IChunkGeneratorProvider<TReturn = void> = () => Generator<any, TReturn>;

type ITaskSchedulerConfig = {
    chunkExecutionTime?: number;
    chunkPlanningTime?: number;
}

enum TaskResultStatus {
    Completed = 1,
    Errored = 2,
    Aborted = 3,
}

type ITaskResultCompleted<T = void> = {
    status: TaskResultStatus.Completed,
    result: T,
}

type ITaskResultErrored = {
    status: TaskResultStatus.Errored,
    error: Error,
}

type ITaskResultAborted = {
    status: TaskResultStatus.Aborted,
}

type ITaskResult<T> = ITaskResultCompleted<T> | ITaskResultErrored | ITaskResultAborted;

export class ScheduledTask<T> {
    private generator: ReturnType<typeof this.fn>;

    private isExecuting = false;
    private timeoutId?: number;
    private config: Required<ITaskSchedulerConfig>;
    private resolver: undefined | ((res: ITaskResult<T>) => void);


    constructor(private fn: IChunkGeneratorProvider<T>, config: ITaskSchedulerConfig = {}) {
        this.config = {
            chunkExecutionTime: config.chunkExecutionTime ?? 6,
            chunkPlanningTime: config.chunkPlanningTime ?? 0,
        }
    }

    run() {
        this.cancel();

        this.generator = this.fn();
        const metaPromise = new PromiseConfiguration<ITaskResult<T>>();
        this.resolver = metaPromise.resolve;

        const onComplete = (result: T) => {
            this.resolver?.({
                status: TaskResultStatus.Completed,
                result
            });
        };

        const onError = (error: Error) => {
            this.resolver?.({
                status: TaskResultStatus.Errored,
                error,
            })
        }

        this.doWork(this.generator, onComplete, onError);

        return metaPromise.promise;
    }

    cancel() {
        if (this.isExecuting) throw new TaskRecursionError();

        this.resolver?.({status: TaskResultStatus.Aborted})
        this.clear();
    }

    private clear() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        this.generator = null as any;
        this.resolver = null as any;
    }

    private doWork(
        generator: typeof this.generator,
        onComplete: (res: T) => void,
        onError: (error: Error) => void
    ) {
        try {
            this.isExecuting = true;
            this.timeoutId = undefined;
            if (generator !== this.generator) return;

            this.timeoutId = setTimeout(this.doWork.bind(this), this.config.chunkPlanningTime, generator, onComplete) as unknown as number;
            let start = Date.now();
            let now = start;
            let result: IteratorResult<any, T>;

            do {

                try {
                    result = generator.next();
                } catch (e) {
                    onError(e);
                    return this.clear();

                }

                if (result.done) {
                    onComplete(result.value);
                    return this.clear();
                }

                now = Date.now();


            } while (now - start < this.config.chunkExecutionTime);
        } finally {
            this.isExecuting = false;
        }

    }

    dispose() {
        this.cancel();
    }
}

export class TaskRecursionError extends Error {

}