import {makeProject} from '@motion-canvas/core';

import savesystem from './scenes/saveSystem?scene';
import collisionBasics from './scenes/collisionBasics?scene';
import collisionDetails from './scenes/collisionDetails?scene';

export default makeProject({
  scenes: [savesystem, collisionBasics, collisionDetails]
});
