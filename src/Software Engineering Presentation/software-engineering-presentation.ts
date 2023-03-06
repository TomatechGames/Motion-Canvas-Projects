import {makeProject} from '@motion-canvas/core/lib';

import sequenceDiagram from './scenes/sequence-diagram-scene?scene';
import videoTest from './scenes/video-test?scene';

export default makeProject({
  scenes: [sequenceDiagram],
  background: '#141414',
});
