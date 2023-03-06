import {makeProject} from '@motion-canvas/core';

import sequenceDiagram from './scenes/sequence-diagram-scene?scene';
import videoTest from './scenes/video-test?scene';

export default makeProject({
  scenes: [sequenceDiagram]
});
