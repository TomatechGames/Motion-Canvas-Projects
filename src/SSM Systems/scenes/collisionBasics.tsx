import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { waitFor } from '@motion-canvas/core/lib/flow';
import { fadeTransition } from '@motion-canvas/core/lib/transitions';

export default makeScene2D(function* (view) {
  // Create your animations here
  yield* fadeTransition(0.2);
  yield* waitFor(5);
});