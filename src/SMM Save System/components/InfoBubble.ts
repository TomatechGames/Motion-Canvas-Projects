import { Shape, ShapeProps } from "@motion-canvas/2d/src/components";
import { initial, signal } from "@motion-canvas/2d/src/decorators";
import { spacingSignal } from "@motion-canvas/2d/src/decorators/spacingSignal";
import { SignalValue, SimpleSignal } from "@motion-canvas/core/lib/signals";
import { PossibleSpacing, PossibleVector2, SpacingSignal } from "@motion-canvas/core/lib/types";


export interface InfoBubbleProps extends ShapeProps{
    radius?: SignalValue<PossibleSpacing>;
    curveRadius?: SignalValue<number>;
    markerSize?: SignalValue<number>;
    start?: SignalValue<number>;
    startOffset?: SignalValue<number>;
    end?: SignalValue<number>;
    endOffset?: SignalValue<number>;
    markerPoints?: SignalValue<SignalValue<PossibleVector2>[]>;
}

export class InfoBubble extends Shape{
    @spacingSignal('radius')
    public declare readonly radius: SpacingSignal<this>;

    @initial(0)
    @signal()
    public declare readonly markerSize: SimpleSignal<number, this>;

    @initial(0)
    @signal()
    public declare readonly curveRadius: SimpleSignal<number, this>;

    @initial(0)
    @signal()
    public declare readonly start: SimpleSignal<number, this>;
  
    @initial(0)
    @signal()
    public declare readonly startOffset: SimpleSignal<number, this>;
  
    @initial(1)
    @signal()
    public declare readonly end: SimpleSignal<number, this>;
  
    @initial(1)
    @signal()
    public declare readonly endOffset: SimpleSignal<number, this>;

    @initial(null)
    @signal()
    public declare readonly points: SimpleSignal<
        SignalValue<PossibleVector2>[] | null,
        this
    >;
}