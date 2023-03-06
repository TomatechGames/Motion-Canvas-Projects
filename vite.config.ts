import {defineConfig} from 'vite';
import motionCanvas from '@motion-canvas/vite-plugin';

export default defineConfig({
  plugins: [motionCanvas(
    {
      project:[
        `./src/SMM Save System/smm-save-system.ts`,
        `./src/Software Engineering Presentation/software-engineering-presentation.ts`,
      ]
    }
  )],
});
