import { Circle, Layout, LayoutProps, Txt, Video } from "@motion-canvas/2d/lib/components";
import { delay, noop, waitFor } from "@motion-canvas/core/lib/flow";
import { easeInCubic, easeInOutCubic } from "@motion-canvas/core/lib/tweening";
import { Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";

import miniIntro from './miniIntro.webm';
import '../../fonts.css';


export interface IntroComponentProps extends LayoutProps {
    skipImmediately?:boolean
}

export class IntroComponent extends Layout {

    private readonly circleRef = createRef<Circle>();
    private readonly vidRef = createRef<Video>();
    private readonly textRef = createRef<Txt>();

    constructor(props?:IntroComponentProps) {
        super({
            width:'100%',
            height:'100%',
            layout:false,
            ...props
        });

        this.add(
            <>
                <Circle ref={this.circleRef} size={()=>Math.sqrt((this.size.x()*this.size.x())+(this.size.y()*this.size.y()))+5} fill={'#141414'}/>
                <Video ref={this.vidRef} src={miniIntro} scale={0.25}>
                    <Txt ref={this.textRef} text={'Tomatech'} opacity={0} fontFamily={'Super Mario Maker'} offset={[-1,1]} scale={10} fontSize={96} position={()=>this.vidRef().size().scale(0.5).add(new Vector2(0,80))} fill={'#800'}/>
                </Video>
            </>
        );

        if(props.skipImmediately){
            this.skip();
        }
    }

    public *begin() {
        this.vidRef().play();
        yield* waitFor(this.vidRef().getDuration());
        yield* waitFor(1);
        yield this.circleRef().scale(0,0.5, easeInCubic);
        yield this.vidRef().position(()=>(
            this.size()
                .mul(new Vector2(-0.5,0.5))
                .add(this.vidRef().size()
                    .mul(new Vector2(0.5,-0.5))
                    .scale(0.1)
                )
            ), 0.5, easeInOutCubic, (a,b,t)=>Vector2.arcLerp(a,b,t,true));
        yield delay(0.3,this.textRef().opacity(1,0.3, easeInCubic));
        yield this.vidRef().opacity(0.5,0.5);
        yield* this.vidRef().scale(0.1,0.5, easeInCubic);
        yield* waitFor(0.25);
    }

    public skip()
    {
        this.vidRef().seek(this.vidRef().getDuration());
        this.vidRef().play();
        this.circleRef().scale(0);
        this.vidRef().opacity(0.5);
        this.vidRef().scale(0.1);
        this.textRef().opacity(1);
        this.vidRef().position(()=>(
            this.size()
                .mul(new Vector2(-0.5,0.5))
                .add(this.vidRef().size()
                    .mul(new Vector2(0.5,-0.5))
                    .scale(0.1)
                )
            )
        );
    }

    public *waitForVideoCompletion() {
        while (this.vidRef().completion()<1) {
            yield noop;
        }
    }
}