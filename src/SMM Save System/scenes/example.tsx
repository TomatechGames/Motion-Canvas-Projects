import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { Circle, ComponentChildren, Image, Layout, Line, Rect } from '@motion-canvas/2d/lib/components';
import { CodeBlock, edit, insert, lines } from '@motion-canvas/2d/lib/components/CodeBlock';
import { createRef, makeRef, makeRefs } from '@motion-canvas/core/lib/utils';
import { SignalValue, createSignal } from '@motion-canvas/core/lib/signals';
import { Direction, PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';
import { TimingFunction, easeInOutCubic, easeOutBack, easeOutCubic } from '@motion-canvas/core/lib/tweening';
import { slideTransition } from "@motion-canvas/core/lib/transitions";
import { join } from '@motion-canvas/core/lib/threading';
import { language } from 'code-fns';
const json = language.json;

import smbBgImg from '../images/smbBgImg.png';
import smbTerrainImg from '../images/smbTerrain.png';
import smbBrickImg from '../images/smbBrick.png';

export default makeScene2D(function* (view) {
  // Create your animations here
  yield* slideTransition(Direction.Left);

  const panelWidth = createSignal(1536);
  const panelHeight = createSignal(864);
  const lineWidth = createSignal(4);
  const lineColour = createSignal('#C0C0C07F');

  const bgImage = createRef<Image>();
  const lineParent = createRef<Layout>();
  const imagesParent = createRef<Layout>();

  view.add(<Image
    src={smbBgImg}
    ref={bgImage}
    width={panelWidth()}
    height={panelHeight()}
    smoothing={false}
    radius={16}
    shadowOffset={10}
    shadowColor={'#050505'}
    scale={0.7}
    opacity={0}
    clip
    >
      <Layout ref={lineParent}/>
      <Layout ref={imagesParent}/>
    </Image>
  );

  const gridX: Line[] = [];
  lineParent().add(<Line points={[new Vector2(0, (-panelHeight()+lineWidth())/2), new Vector2(0, (panelHeight()-lineWidth())/2)]} ref={makeRef(gridX, 0)} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
  for (let x = 1; x < 12; x++) {
    lineParent().add(<Line points={[new Vector2(x*64, (-panelHeight()+lineWidth())/2), new Vector2(x*64, (panelHeight()-lineWidth())/2)]} ref={makeRef(gridX, (x*2)-1)} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
    lineParent().add(<Line points={[new Vector2(-x*64, (-panelHeight()+lineWidth())/2), new Vector2(-x*64, (panelHeight()-lineWidth())/2)]} ref={makeRef(gridX, (x*2))} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
  }

  const gridY: Line[] = [];
  lineParent().add(<Line points={[new Vector2((-panelWidth()+lineWidth())/2, -16), new Vector2((panelWidth()-lineWidth())/2, -16)]} ref={makeRef(gridY, 0)} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
  for (let x = 1; x < 7; x++) {
    lineParent().add(<Line points={[new Vector2((-panelWidth()+lineWidth())/2, (x*64)-16), new Vector2((panelWidth()-lineWidth())/2, (x*64)-16)]} ref={makeRef(gridY, (x*2)-1)} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
    lineParent().add(<Line points={[new Vector2((-panelWidth()+lineWidth())/2, (-x*64)-16), new Vector2((panelWidth()-lineWidth())/2, (-x*64)-16)]} ref={makeRef(gridY, (x*2))} lineWidth={lineWidth()} stroke={lineColour} start={0.5} end={0.5}/>);
  }

  yield bgImage().scale(1, 0.4, easeOutBack);
  yield bgImage().opacity(1, 0.4, easeOutBack);
  yield* waitFor(0.1);

  yield* all(
    growLines(gridX, 0.5, easeOutCubic, 0.05),
    growLines(gridY, 0.5, easeOutCubic, 0.1)
  );

  const gridStart = createSignal(()=>new Vector2(-(panelWidth()-64)/2, (panelHeight()-64)/2));

  const levelTiles: Image[][] = [];
  for (let y = 0; y < 3; y++) {
    levelTiles[y] = [];
    for (let x = 0; x < 24; x++) {
      if(y==2 && x>6 && x<17)
        continue;
      imagesParent().add(
        <Image src={smbTerrainImg} width={64} height={64} ref={makeRef(levelTiles[y],x)} position={gridStart().add(new Vector2(x,-y).scale(64))} smoothing={false} scale={0}/>
      );
    }
  }
  levelTiles[6] = [];
  for (let i = 2; i < 5; i++) {
    imagesParent().add(
      <Image src={smbBrickImg} width={64} height={64} ref={makeRef(levelTiles[6],i)} position={gridStart().add(new Vector2(i,-6).scale(64))} smoothing={false} scale={0}/>
    );
  }

  yield* waitUntil("tilesStart");
  //yield bgImage().position.y(-96, 3, easeInOutCubic);
  
  const imagesGrowTime = 0.3;
  const imagesInterval = 0.02;
  const rowInterval = 0.05;
  let lastGenerator;
  for (const levelTilesRow of levelTiles) {
    if(levelTilesRow!=null)
      lastGenerator = yield growImages(levelTilesRow, imagesGrowTime, easeOutCubic, imagesInterval);
    yield* waitFor(rowInterval);
  }
  yield* join(lastGenerator);


  let tileInfoBubble = makeRefs<typeof TileInfoBubble>();
  const targetPosSignal = Vector2.createSignal([-9,4]);
  //const textObject = createRef<Text>();
  //const textFillColor = '#358cd8'
  //const textSig = createSignal('"4_3":<br/>{<br/>  id:0<br/>}');

  
  const codeRef = createRef<CodeBlock>();
  const start =
`"4_3": {
  "id":0
}`;

  yield bgImage().add(
    <TileInfoBubble targetPos={targetPosSignal} boxPos={[0,-16+(64*1)]} refs={tileInfoBubble}>
      <CodeBlock ref={codeRef} language='json' code={start}/>
    </TileInfoBubble>
  );
  yield* waitUntil("createTileInfo");
  
  yield  tileInfoBubble.circleRef.size(30, 0.3, easeOutBack);
  yield* tileInfoBubble.lineRef.end(1, 0.5, easeInOutCubic);
  yield  tileInfoBubble.rectRef.scale(1, 0.5,easeOutBack);
  yield* tileInfoBubble.rectRef.opacity(1, 0.5,easeOutBack);

  
  yield* waitUntil("moveTileInfo");

  yield targetPosSignal([-8,0], 0.5, easeInOutCubic, Vector2.arcLerp);
  
  yield* codeRef().edit(1,false)
`${edit('"4_3"','"5_7"')}: {
  "id":${edit("0","1")}
}`

  yield* waitUntil("data");
  yield* codeRef().edit(1)
`"5_7": {
  "id":1${insert(`,
  "data": {
    "wings":false
  }`)}
}`
  yield* waitUntil("dataDeselect");
  yield* codeRef().selection(lines(0,9999), 0.5)

  
  yield* waitFor(1);
});




function TileInfoBubble({targetPos, boxPos=new Vector2(0,0), children, refs}:{targetPos:SignalValue<PossibleVector2>, boxPos?:SignalValue<PossibleVector2>, children?:ComponentChildren, refs:{lineRef:Line, circleRef:Circle, rectRef:Rect}}) {

  const targetPosSignal = Vector2.createSignal(targetPos);

  const targetPosWorld = Vector2.createSignal(()=>targetPosSignal().scale(64).add(new Vector2(32,16)));

  const lineAttachPos = Vector2.createSignal(()=>{
    return refs.rectRef.position().sub(refs.rectRef.size().mul(new Vector2(0,0))).add(new Vector2(16,4))
  });

  const boxPosSignal = Vector2.createSignal(boxPos);
  const lineMidPos = Vector2.createSignal(()=>{
    const diff = lineAttachPos().sub(targetPosWorld());
    const minMag = Math.min(Math.abs(diff.x), Math.abs(diff.y));
    return targetPosWorld().add(new Vector2(minMag*Math.sign(diff.x), minMag*Math.sign(diff.y)))
  });
  

  const result = (
    <Layout>
      <Line points={[targetPosWorld,lineMidPos,lineAttachPos]} lineDash={[20,5]} stroke={'#fff'} lineWidth={8} end={0} ref={makeRef(refs, 'lineRef')}/>
      <Circle fill={'#fff'} size={0} position={targetPosWorld} ref={makeRef(refs, 'circleRef')}/>
      <Rect radius={12} fill={'#111'} stroke={'#fff'} lineWidth={8} layout={true} offset={[-1,-1]} position={()=>boxPosSignal().sub(refs.rectRef.size().mul(new Vector2(0.5,0.5)))} scale={0.8} opacity={0} ref={makeRef(refs, 'rectRef')}>
        <Layout direction='row' padding={16} gap={16}>
          {children}
        </Layout>
      </Rect>
    </Layout>
  );

  return result;
}


function* growImages(gridImages:Image[], growTime:number, growFunc:TimingFunction, growInterval:number)
{
  for (const levelImage of gridImages) {
    if(levelImage!=null)
      yield levelImage.scale(1, growTime, easeOutCubic);

    yield* waitFor(growInterval);
  }
  yield* waitFor(growTime-growInterval);
}

function* growLines(gridLines:Line[], growTime:number, growFunc:TimingFunction, growInterval:number)
{
  gridLines[0].lineCap('round');
  yield gridLines[0].start(0,growTime, growFunc);
  yield gridLines[0].end(1,growTime, growFunc);

  yield* waitFor(growInterval);

  for (let i = 1; i <gridLines.length; i+=2) {
    gridLines[i].lineCap('round');
    yield gridLines[i].start(0,growTime, growFunc);
    yield gridLines[i].end(1,growTime, growFunc);

    gridLines[i+1].lineCap('round');
    yield gridLines[i+1].start(0,growTime, growFunc);
    yield gridLines[i+1].end(1,growTime, growFunc);

    yield* waitFor(growInterval);
  }
  yield* waitFor(growTime-growInterval);
}
