import {IUiEventProceed, IUiEventStart, IUiEventStop} from "@src/app/game/events/base/contracts";
import {IPoint2} from "@fbltd/math";

export type IScaleEventStart = IUiEventStart<WheelEvent>;
export type IScaleEventStop = IUiEventStop<never>;
export type IScaleEventProceed = IUiEventProceed<WheelEvent, {
    absPoint: IPoint2,
    relPoint: IPoint2,
    direction: -1 | 1,
}>