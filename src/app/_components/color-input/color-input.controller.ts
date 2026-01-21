import {createFnStorage} from "@src/app/game-wrapper/game/controller/game.controller";
import {TouchTransformController} from "@src/infra/events/touch/touch-transform.controller";
import {DragMouseController} from "@src/infra/events/drag/dragMouseController";
import {blend, clamp, Color, COLORS, IPoint2, LinearGradient, normalize} from "@fbltd/math";
import {Dependency} from "@fbltd/async";
import {getColorTendency} from "@src/app/_components/color-input/get-color-tendency";
import {autorun} from "mobx";

export class ColorInputController {
    private disposer = createFnStorage();
    private node: HTMLDivElement;
    private shadeEvents: {
        toucher: TouchTransformController,
        dragger: DragMouseController,
    }
    private stopEvents: {
        toucher: TouchTransformController,
        dragger: DragMouseController,
    }
    private userReaction?: (c: Color) => void;

    private _currentColor: Dependency<{ color: Color, tendency: ReturnType<typeof getColorTendency> }>;

    get currentColor() {
        return this._currentColor;
    }

    readonly ttb = new LinearGradient(
        {percentage: 0, color: COLORS.TRANSPARENT},
        {percentage: 1, color: COLORS.BLACK},
    );

    readonly wtt = new LinearGradient(
        {percentage: 0, color: COLORS.WHITE},
        {percentage: 1, color: COLORS.TRANSPARENT},
    );

    readonly main = new LinearGradient(
        {percentage: 0, color: new Color(255, 0, 0, 1)},
        {percentage: 1 / 6, color: new Color(255, 255, 0, 1)},
        {percentage: 2 / 6, color: new Color(0, 255, 0, 1)},
        {percentage: 3 / 6, color: new Color(0, 255, 255, 1)},
        {percentage: 4 / 6, color: new Color(0, 0, 255, 1)},
        {percentage: 5 / 6, color: new Color(255, 0, 255, 1)},
        {percentage: 6 / 6, color: new Color(255, 0, 0, 1)},
    );

    constructor(onChange: typeof this.userReaction, color: Color = Color.ofNumber(0xffff00)) {
        this.setColor(color);
        this.setOnChange(onChange);
    }

    setColor(color: Color, tendency?: ReturnType<typeof getColorTendency>) {
        if (!this._currentColor)
            this._currentColor = new Dependency(null as any);

        this._currentColor.value = {
            color: color,
            tendency: tendency ?? getColorTendency(color)
        }

        this.userReaction?.(color);
    }

    setOnChange(onChange: typeof this.userReaction) {
        this.userReaction = onChange;
    }

    onContainerMount(node: HTMLDivElement) {
        if (this.node) return;

        this.node = node;

        const shadeCont = node.firstElementChild as HTMLDivElement;
        if (!shadeCont) return;

        const stopCont = node.lastElementChild as HTMLDivElement;
        if (!stopCont) return;

        if (stopCont === shadeCont) return;

        this.shadeEvents = {
            toucher: new TouchTransformController(shadeCont, {touchesQty: 1}),
            dragger: new DragMouseController(shadeCont, {withDraggingOnItself: false}),
        }

        this.stopEvents = {
            toucher: new TouchTransformController(stopCont, {touchesQty: 1}),
            dragger: new DragMouseController(stopCont, {withDraggingOnItself: false}),
        }

        const eProcess = (e: IPoint2) => {
            const rect = shadeCont.getBoundingClientRect();
            e[0] = clamp(normalize(e[0], rect.right, rect.left));
            e[1] = clamp(normalize(e[1], rect.bottom, rect.top));

            const v = this.currentColor.value;
            const color = blend(v.tendency.stopColor, this.wtt.getColorAtPercentage(e[0])!, this.ttb.getColorAtPercentage(e[1])!);

            this.setColor(color, {stopColor: v.tendency.stopColor, point: e});

        }

        const eProcess2 = (e: IPoint2) => {
            const rect = stopCont.getBoundingClientRect();
            const x = clamp(normalize(e[0], rect.right, rect.left), 0, 0.99);

            const c = this.main.getColorAtPercentage(x);
            if (!c) return;

            const v = this.currentColor.value;
            const point = v.tendency.point;
            const color = blend(c, this.wtt.getColorAtPercentage(point[0])!, this.ttb.getColorAtPercentage(point[1])!);

            this.setColor(color, {stopColor: c, point: v.tendency.point});

        }


        this.disposer.push(
            autorun(() => {
                const e =
                    this.shadeEvents.toucher.start?.data.virtual.centroid ||
                    this.shadeEvents.dragger.start?.data?.startPoint;

                if (e) eProcess(e);
            }),
            autorun(() => {
                const e =
                    this.shadeEvents.toucher.proceed?.data.centroid ||
                    this.shadeEvents.dragger.proceed?.data?.currentPoint;

                if (e) eProcess(e);
            }),
            autorun(() => {
                const e =
                    this.stopEvents.toucher.start?.data.virtual.centroid ||
                    this.stopEvents.dragger.start?.data?.startPoint;

                if (e) eProcess2(e);
            }),
            autorun(() => {
                const e =
                    this.stopEvents.toucher.proceed?.data.centroid ||
                    this.stopEvents.dragger.proceed?.data?.currentPoint;

                if (e) eProcess2(e);
            })
        )

    }

    dispose() {
        this.disposer.run();
        this.shadeEvents?.toucher?.dispose();
        this.shadeEvents?.dragger?.dispose();
        this.stopEvents?.dragger?.dispose();
        this.stopEvents?.dragger?.dispose();
        this.stopEvents =
            this.shadeEvents =
                this.node =
                    null as any;

    }


}