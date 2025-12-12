export interface IStylerPlugin {
    init(): boolean;

    onStart(): void;

    onStop(): void;

    onDrag(): void;

    onFirstDrag(): void;

    dispose(): void;
}

