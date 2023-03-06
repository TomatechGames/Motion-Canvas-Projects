import { Layout, LayoutProps, Line, Rect, Txt } from "@motion-canvas/2d/lib/components";
import { initial, signal, vector2Signal } from "@motion-canvas/2d/lib/decorators";
import { all } from "@motion-canvas/core/lib/flow";
import { SignalValue, SimpleSignal, createSignal } from "@motion-canvas/core/lib/signals";
import { ThreadGenerator } from "@motion-canvas/core/lib/threading";
import { TimingFunction, easeInOutCubic } from "@motion-canvas/core/lib/tweening";
import { PossibleVector2, Vector2Signal } from "@motion-canvas/core/lib/types";
import { createRef, makeRef } from "@motion-canvas/core/lib/utils";


export interface SequenceDiagramProps extends LayoutProps {
    columns?:SignalValue<string>[];
    headerSize?:SignalValue<PossibleVector2>;
}

export class SequenceDiagram extends Layout {

    @initial([300,75])
    @vector2Signal('headerSize')
    public declare readonly headerSize: Vector2Signal<this>;

    @initial(["One", "Two", "Three"])
    @signal()
    public declare readonly columns: SimpleSignal<string, this>[];

    private columnLayouts : Layout[];
    private readonly columnContainer = createRef<Layout>();
    private readonly rowContainer = createRef<Layout>();

    constructor(props?:SequenceDiagramProps) {
        super({
            ...props
        });


        this.columns=[];
        for (let i = 0; i < props.columns.length; i++) {
            this.columns[i]=createSignal(props.columns[i]);
        }

        this.add(
            <>
                <Layout ref={this.columnContainer} layout={true} height={this.size.y} gap={10}/>
                <Layout ref={this.rowContainer} layout={true} width={this.columnContainer().size.x} offsetY={-1} y={()=>this.size.y()*-0.5} direction={"column"} gap={5}>
                <Rect height={this.headerSize.y} width={'100%'} opacity={0}/>
                </Layout>
            </>
        );

        this.columnLayouts = [];
        for (let i = 0; i < this.columns.length; i++) {
            this.columnContainer().add(
                <Layout direction={'column'} alignItems={'center'} ref={makeRef(this.columnLayouts, i)}>
                    <Rect width={this.headerSize.x} height={this.headerSize.y} fill={'#ccc'} radius={20}>
                        <Txt text={()=>this.columns[i]()} fill={'#111'} grow={1} justifyContent={'center'} alignItems={'center'}/>
                    </Rect>
                    <Rect width={10} grow={1} fill={'#777'} radius={[0,0,5,5]}/>
                </Layout>
            );
        }
    }

    public addArrow(fromCol:number, toCol:number):{arrowRef:Line, textRef:Txt, showArrow:(duration?:number, timing?:TimingFunction)=>ThreadGenerator} {
        if(fromCol<0||fromCol>=this.columns.length || toCol<0||toCol>=this.columns.length)
            return;
        let refs = {} as {arrowRef:Line, textRef:Txt, showArrow:(duration:number, timing:TimingFunction)=>ThreadGenerator};

        const arrowPaddingScale = toCol<fromCol ? -1:1;
        const arrowPadding = 5*arrowPaddingScale;

        let arrowPoints:SignalValue<SignalValue<PossibleVector2>[]>;
        let arrowSize = 0;

        if (fromCol==toCol) {
            arrowSize=50;
            arrowPoints=[
                ()=>[arrowPadding+this.columnLayouts[fromCol].position().x,0],
                ()=>[arrowPadding+this.columnLayouts[fromCol].position().x+(arrowSize),0],
                ()=>[arrowPadding+this.columnLayouts[toCol].position().x+(arrowSize),arrowSize],
                ()=>[arrowPadding+this.columnLayouts[toCol].position().x,arrowSize]
            ];
        }
        else {
            arrowPoints=[
                ()=>[this.columnLayouts[fromCol].position().x+arrowPadding,0],
                ()=>[this.columnLayouts[toCol].position().x-arrowPadding,0]
            ];
        }

        this.rowContainer().add(
            <Layout direction={'column'}>
                <Layout height={20}/>
                <Layout paddingTop={4} paddingBottom={4}>
                    <Line layout={false} stroke={'#eee'} ref={makeRef(refs, 'arrowRef')} endArrow={true} end={0} arrowSize={12} lineWidth={8} points={arrowPoints}/>
                </Layout>
                <Layout height={arrowSize}/>
            </Layout>
        );

        refs.showArrow = function*(duration:number=1, timing:TimingFunction=easeInOutCubic){
            yield* all(
                refs.arrowRef.end(1,duration,timing)
            );
        }

        return refs;
    }
}