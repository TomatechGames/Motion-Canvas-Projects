import smbMarioImg from '../images/smb1Mario.png';
import smbTerrainImg from '../images/smbTerrain.png';
import smbSlopeImg from '../images/smbSlopeUp.png';

import { Circle, Img, Layout, Line, Rect, Shape } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { sequence, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { easeInCirc, easeOutCirc, easeOutElastic, remap } from '@motion-canvas/core/lib/tweening';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef, makeRef } from '@motion-canvas/core/lib/utils';
import { IntroComponent } from '../../shared/components/IntroComponent';
import { SimpleSignal, createSignal } from '@motion-canvas/core/lib/signals';

export default makeScene2D(function* (view) {
  // Create your animations here

  const castTargetPos= new Vector2(80,0);
  const normalArrowDist = 10;

  const rayCastEnd = Vector2.createSignal([-50,-20])
  const boxCastOrigin = Vector2.createSignal([-50,5])
  const boxCastEnd = Vector2.createSignal([0,0])
  const boxCastNormalStart = Vector2.createSignal([1,-0.5]);
  const boxCastNormalDir = Vector2.createSignal([-1,0]);

  const introRef = createRef<IntroComponent>();

  const castExamplesRef = createRef<Layout>();
  const castTargetRef = createRef<Shape>();
  const rayCastRef = createRef<Line>();
  const rayCastNormalRef = createRef<Line>();
  const boxCastLineRef = createRef<Line>();
  const boxCastRef = createRef<Rect>();
  const boxCastNormalRef = createRef<Line>();

  const collisionCastsRef = createRef<Layout>();
  const hitboxRect = createRef<Rect>();
  const floorRect = createRef<Rect>();
  const marioImg = createRef<Img>();
  const castLimits:SimpleSignal<number, null>[] = [createSignal(10),createSignal(10),createSignal(10)];
  const castLengths:SimpleSignal<number, null>[] = [createSignal(0),createSignal(0),createSignal(0)];
  const colliderRays:Line[]=[]

  yield view.add(
    <>
    <Layout scale={10}>


      <Layout ref={castExamplesRef}>
        <Rect position={castTargetPos} size={70} rotation={45} fill={'#333'} stroke={'#fff'} lineDash={[3.5,3.5]} lineDashOffset={1.75} lineWidth={1} scale={0} ref={castTargetRef}/>

        <Line points={[rayCastEnd(), rayCastEnd]} lineWidth={1} stroke={'#fff'} lineCap={'round'} ref={rayCastRef}/>
        <Line points={[rayCastEnd, ()=>rayCastEnd().add(Vector2.one.mul([-1,-1]).normalized.mul(normalArrowDist))]} lineWidth={0} stroke={'#0f0'} lineCap={'round'} arrowSize={2} endArrow end={0} ref={rayCastNormalRef}/>

        <Layout position={boxCastOrigin}>
          <Line points={[boxCastEnd(), boxCastEnd]} lineWidth={1} stroke={'#777'} lineCap={'round'} ref={boxCastLineRef}/>
          <Rect position={boxCastEnd} size={20} lineWidth={0.5} stroke={'#fff'} scale={0} ref={boxCastRef}/>
          <Line points={[()=>boxCastEnd().add(boxCastNormalStart()), ()=>boxCastEnd().add(boxCastNormalStart()).add(Vector2.one.mul(boxCastNormalDir()).normalized.mul(normalArrowDist))]} lineWidth={0} stroke={'#0f0'} lineCap={'round'} arrowSize={2} endArrow end={0} ref={boxCastNormalRef}/>
        </Layout>
      </Layout>


      <Layout position={[-view.width()*0.1,0]} ref={collisionCastsRef}>
        <Img src={smbMarioImg} size={20} opacity={0.5} smoothing={false} scale={0} ref={marioImg}/>
        <Rect size={20} stroke={'#777'} lineWidth={1} lineDash={[3,1]} lineDashOffset={1.5} scale={0} ref={hitboxRect}/>

        <Line points={[[10,0],  ()=>[10,  castLengths[0]()] ]} lineWidth={1} stroke={'#f00'} lineCap={'round'} ref={makeRef(colliderRays, 0)}/>
        <Line points={[[10,0],  ()=>[10,  Math.min(castLengths[0](), castLimits[0]())] ]} lineWidth={1} stroke={'#fff'} lineCap={'round'} ref={makeRef(colliderRays, 1)}/>

        <Line points={[[0,0],   ()=>[0,   castLengths[1]()] ]} lineWidth={1} stroke={'#f00'} lineCap={'round'} ref={makeRef(colliderRays, 2)}/>
        <Line points={[[0,0],   ()=>[0,   Math.min(castLengths[1](), castLimits[1]())] ]} lineWidth={1} stroke={'#fff'} lineCap={'round'} ref={makeRef(colliderRays, 3)}/>

        <Line points={[[-10,0], ()=>[-10, castLengths[2]()] ]} lineWidth={1} stroke={'#f00'} lineCap={'round'} ref={makeRef(colliderRays, 4)}/>
        <Line points={[[-10,0], ()=>[-10, Math.min(castLengths[2](), castLimits[2]())] ]} lineWidth={1} stroke={'#fff'} lineCap={'round'} ref={makeRef(colliderRays, 5)}/>

        <Rect position={[0,10]} size={[40,5]} offsetY={-1} fill={'#070'} scale={1} ref={floorRect}/>

      </Layout>


    </Layout>

    <IntroComponent ref={introRef}/>
    </>
  );

  yield* introRef().begin();

  boxCastNormalStart(()=>[10,Math.min(-5, Math.max(-10, -boxCastOrigin().y))])
  boxCastNormalDir(()=>boxCastNormalStart().y==-10?[-1,1]:[-1,0])

  yield* waitUntil("showTarget");
  yield* castTargetRef().scale(1,1);

  yield* waitUntil("castLine");
  yield* rayCastEnd([50,-20], 0.5, easeInCirc);
  yield  rayCastNormalRef().lineWidth(1,0.1);
  yield* rayCastNormalRef().end(1,1,easeOutElastic);
  
  yield* waitUntil("castBox");
  yield  boxCastRef().scale(1,0.25,easeOutCirc)
  yield* boxCastEnd(()=>
    new Vector2(70,0).add([Math.max(0,remap(10,100,0,90,boxCastOrigin().y)),0])
  ,0.5,easeInCirc)
  yield  boxCastNormalRef().lineWidth(1,0.1);
  yield* boxCastNormalRef().end(1,1,easeOutElastic);
  
  yield* waitUntil("moveOrigin");
  yield* boxCastOrigin.y(30,2);

  yield* waitUntil("removeExamples");
  yield castExamplesRef().position.x(view.width()/10, 1);
  yield* collisionCastsRef().position.x(0, 1);

  yield* waitUntil("returnMario");
  yield* sequence(
    0.2,
    hitboxRect().scale(1,0.5),
    marioImg().scale(1,0.5),
    ...castLengths.map(l=>l(10,0.5))
  )
  yield hitboxRect().scale(1,0.5);
  yield* waitFor(0.2);
  yield* marioImg().scale(1,0.5);

  
  yield* waitUntil("end");
  yield* view.opacity(0,0.5)
  yield* waitFor(0.1);
});