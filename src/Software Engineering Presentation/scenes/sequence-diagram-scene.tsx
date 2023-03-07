import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import { SequenceDiagram } from '../components/SequenceDiagram';
import { createRef } from '@motion-canvas/core/lib/utils';
import { easeInOutQuint } from '@motion-canvas/core/lib/tweening';
import { IntroComponent } from '../../shared/components/IntroComponent';

export default makeScene2D(function* (view) {
  // Create your animations here

  const seqRef = createRef<SequenceDiagram>();
  const introRef = createRef<IntroComponent>();
  yield view.add(
    <>
      <SequenceDiagram height={700} x={-0} ref={seqRef} columns={["Actor", "System", "Dummy", "Fourth"]}/>
      <IntroComponent ref={introRef}/>
    </>
  );
  seqRef().save();
  yield* introRef().begin();
  yield* waitFor(1.5);

  const firstArrow = seqRef().addArrow(1, 1);
  yield* firstArrow.showArrow(0.5);

  const secondArrow = seqRef().addArrow(0, 2);
  yield* secondArrow.showArrow(1, easeInOutQuint);

  const thirdArrow = seqRef().addArrow(3, 0);
  yield* thirdArrow.showArrow();
  

  yield* seqRef().size.y(900,1);
  yield* seqRef().columns[1]("Unity", 1);
  yield* seqRef().headerSize([200,100],1);

  yield* waitFor(1);

  yield* all(
    firstArrow.arrowRef.opacity(0,1),
    secondArrow.arrowRef.opacity(0,1),
    thirdArrow.arrowRef.opacity(0,1),
    seqRef().restore(1)
  );

  yield* waitFor(1);
});