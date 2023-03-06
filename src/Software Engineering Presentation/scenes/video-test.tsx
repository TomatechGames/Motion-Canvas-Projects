import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { waitFor } from '@motion-canvas/core/lib/flow';
import { createRef } from '@motion-canvas/core/lib/utils';
import { Video } from '@motion-canvas/2d/lib/components';

import miniIntro from '../videos/miniIntro.webm';

export default makeScene2D(function* (view) {
  // Create your animations here

  const introRef = createRef<Video>();
  view.add(
    <>
      <Video ref={introRef} src={miniIntro} scale={0.25}/>
    </>
  );
  introRef().play();
  yield* waitFor(1.5);
  yield* introRef().scale(0,0.5);
  yield* waitFor(1.5);
});