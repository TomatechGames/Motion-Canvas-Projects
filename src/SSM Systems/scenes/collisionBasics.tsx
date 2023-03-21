import smbMarioImg from '../images/smb1Mario.png';
import smbTerrainImg from '../images/smbTerrain.png';
import smbSlopeImg from '../images/smbSlopeUp.png';

import { Grid, Img, Layout, Line, Polygon, Rect, ShapeProps } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, loop, run, sequence, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { fadeTransition } from '@motion-canvas/core/lib/transitions';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { createRef, makeRef, useDuration, useLogger, useTime } from '@motion-canvas/core/lib/utils';
import { easeInBack, easeInCirc, easeOutCirc, map } from '@motion-canvas/core/lib/tweening';
import { PossibleVector2, Vector2 } from '@motion-canvas/core/lib/types';
import { IntroComponent } from '../../shared/components/IntroComponent';


export default makeScene2D(function* (view) {
  // Create your animations here

  const colliderDist = 4.75;
  const colliderEdgeDist = 4;

  const slopeOffset =createSignal(0);
  const dashOffset =createSignal(0);

  yield loop(Infinity,i=>dashOffset(0,0,(v,f,t)=>v).to(1,1,(v,f,t)=>v));

  const introRef = createRef<IntroComponent>();
  const scaledLayout = createRef<Layout>();
  const blockParent = createRef<Layout>();
  const marioImg = createRef<Img>();
  const hitboxRect = createRef<Rect>();
  const colliderLines:Line[] = [];
  const castLines:Line[] = [];

  yield view.add(
    <>
      <Layout scale={16} ref={scaledLayout}>
        <Layout ref={blockParent}/>
        <Img src={smbMarioImg} size={10} smoothing={false} scale={0} ref={marioImg}>
          <Rect size={colliderDist*2} stroke={'#fff'} ref={hitboxRect} lineWidth={0.5} scale={0} lineDash={[1.5,0.5]} lineDashOffset={()=>0.75+dashOffset()*2}/>

          <Line points={[()=>[colliderEdgeDist, colliderDist-slopeOffset()-0.01], [0, colliderDist], ()=>[-4, colliderDist-slopeOffset()-0.01]]} stroke={'#0f0'} lineWidth={0.5} start={0.5} end={0.5} ref={makeRef(colliderLines, 0)}/>
          <Line points={[[-colliderEdgeDist,-colliderDist], [colliderEdgeDist,-colliderDist]]} stroke={'#0f0'} lineWidth={0.5} start={0.5} end={0.5} ref={makeRef(colliderLines, 1)}/>
          <Line points={[[-colliderDist,-colliderEdgeDist], [-colliderDist,colliderEdgeDist]]} stroke={'#0f0'} lineWidth={0.5} start={0.5} end={0.5} ref={makeRef(colliderLines, 2)}/>
          <Line points={[[colliderDist,-colliderEdgeDist],  [colliderDist,colliderEdgeDist] ]} stroke={'#0f0'} lineWidth={0.5} start={0.5} end={0.5} ref={makeRef(colliderLines, 3)}/>

          <Line points={[[4, -5],  ()=>[5,  5-slopeOffset()]]} stroke={'#777'} end={0} lineWidth={0.5} ref={makeRef(castLines, 0)}/>
          <Line points={[[0, -5],  ()=>[0,  5-slopeOffset()]]} stroke={'#777'} end={0} lineWidth={0.5} ref={makeRef(castLines, 1)}/>
          <Line points={[[-4, -5], ()=>[-5, 5-slopeOffset()]]} stroke={'#777'} end={0} lineWidth={0.5} ref={makeRef(castLines, 2)}/>

        </Img>
      </Layout>
      <IntroComponent ref={introRef}/>
    </>
  );
  
  yield* introRef().begin();
  yield* marioImg().scale(1,1);

  yield* waitUntil("showHitbox");
  yield* hitboxRect().scale(1,1);

  yield* waitUntil("replaceHitbox");
  yield* hitboxRect().opacity(0,1);
  yield* sequence(
    0.2,
    ...colliderLines.map(thisLine=>all(
      thisLine.start(0,0.5),
      thisLine.end(1,0.5)
    ))
  );
  const test = [...Array(5).keys()].map(i=>[...Array(5).keys()].map(j=>new Vector2(i,j)));

  
  yield* waitUntil("showTerrain1");
  const firstTerrainChunk:Img[] = [];
  const firstTerrainPositions = vectorRange([-3,-1],[2,-1]).concat(vectorRange([-4,-1],[-4,1])).sort((a,b)=>a.x==b.x ? a.y-b.y : a.x-b.x);
  for (let i = 0; i < firstTerrainPositions.length; i++) {
    const pos = firstTerrainPositions[i];
    blockParent().add(
      <Img src={smbTerrainImg} position={pos.mul([10,-10])} size={10} scale={0} smoothing={false} ref={makeRef(firstTerrainChunk, i)}/>
    );
  }
  yield* sequence(
    0.05,
    ...firstTerrainChunk.map(thisImg=>thisImg.scale(1,0.4))
  );

  yield* waitUntil("moveMario1");
  yield* marioImg().position.x(-30,0.75, easeInBack)
  yield* marioImg().position.x(-15,0.75, easeOutCirc)

  yield* waitUntil("moveMario2");
  yield* marioImg().position.x(27,2)


  yield* waitUntil("hideHitbox");
  yield sequence(
    0.2,
    ...colliderLines.slice(1).map(thisLine=>all(
      thisLine.start(0.5,0.5),
      thisLine.end(0.5,0.5)
    ))
  );
  yield* marioImg().position.x(-10,2)

  yield* waitUntil("showSlope");
  const slopeRef = createRef<Img>();
  blockParent().add(
    <Img src={smbSlopeImg} position={[15,0]} size={[20,10]} scale={0} smoothing={false} ref={slopeRef}/>
  );
  firstTerrainChunk[firstTerrainChunk.length] = slopeRef();
  yield* slopeRef().scale(1,0.5)

  yield* waitUntil("terrainColliders");
  const terrainLine = createRef<Line>();
  scaledLayout().add(
    <Line points={[[-35,5],[5,5],[25,-5]]} stroke={'#f00'} end={0} lineWidth={0.25} ref={terrainLine}/>
  );
  yield* blockParent().opacity(0.1,0.5)
  yield* terrainLine().end(1,1)
  
  yield* waitUntil("moveMario3");
  yield* marioImg().position.x(1,1)
  yield* marioImg().position([21,-10],1)

  yield* waitUntil("moveMario4");
  yield* marioImg().position([-10,0],0.5)
  yield* terrainLine().position.x(5,1)

  yield* waitUntil("moveMario5");
  yield* blockParent().opacity(1,0.5)
  yield* marioImg().position.x(6,1)
  yield* marioImg().position([26,-10],1)

  yield* waitUntil("moveMario6");
  yield sequence(
    0.05,
    ...firstTerrainChunk.map(thisImg=>thisImg.scale(0,0.4))
  );
  yield terrainLine().end(0,1)
  yield* marioImg().position([0,0],0.5)
  
  yield* waitUntil("demoAngles");
  yield* waitFor(0.2);
  yield* slopeOffset(2.5,1);
  yield* waitFor(0.2);
  yield* slopeOffset(5,1);
  yield* waitFor(0.2);
  yield* slopeOffset(1.25,1);
  yield* waitFor(0.2);
  yield* slopeOffset(3.75,1);
  yield* waitFor(0.2);
  yield* slopeOffset(0,1);

  yield* waitUntil("moveMario7");
  terrainLine().position(0);
  blockParent().opacity(0.1)
  yield sequence(
    0.05,
    ...firstTerrainChunk.map(thisImg=>thisImg.scale(1,0.4))
  );
  yield terrainLine().end(1,1)
  yield* marioImg().position([-10,0],0.5)

  yield* waitUntil("moveMario8");
  yield* marioImg().position([-20,0],0.5)
  yield* marioImg().position([0,0],1)
  yield* marioImg().position([-10,0],0.5)

  yield* waitUntil("moveMario9");
  yield* marioImg().position.x(5,1)
  yield* waitFor(0.5);
  yield* slopeOffset(2,1);
  yield* waitFor(0.5);
  yield* marioImg().position([25,-10],1)

  yield* waitUntil("end");
  yield* view.opacity(0,0.5)
  yield* waitFor(0.1);
});



function vectorRange(start:PossibleVector2, end:PossibleVector2):Vector2[]{
  const startV = new Vector2(start);
  const endV = new Vector2(end);
  let result:Vector2[] = [];
  for (let y = startV.y; y < endV.y+1; y++) {
    for (let x = startV.x; x < endV.x+1; x++) {
      result[(y-startV.y)*(endV.x+1-startV.x)+(x-startV.x)] = new Vector2(x,y);
    }
  }
  return result;
}