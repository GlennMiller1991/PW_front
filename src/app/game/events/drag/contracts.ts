import {IUiEventProceed, IUiEventStart, IUiEventStop} from "@src/app/game/events/base/contracts";
import {IPoint2} from "@fbltd/math";

export type IDragEventStart = IUiEventStart<MouseEvent, {
    startPoint: IPoint2,
}>;

export type IDragEventProceed = IUiEventProceed<MouseEvent, {
    startPoint: IPoint2,
    currentPoint: IPoint2,
    totalOffset: IPoint2,
    currentOffset: IPoint2,
}>;


export type IDragEventStop = IUiEventStop<MouseEvent>;

