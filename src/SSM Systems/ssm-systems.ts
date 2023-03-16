import {makeProject} from '@motion-canvas/core';

import savesystem from './scenes/savesystem?scene';
import collisionBasics from './scenes/collisionBasics?scene';

export default makeProject({
  scenes: [savesystem, collisionBasics]
});
