import { defineConfig } from 'vite';
import path from 'node:path';
export default defineConfig({
  publicDir:false,
  build:{outDir:'.impeccable/review/stage-v2/bundle',emptyOutDir:true,lib:{entry:path.resolve('scripts/stage/preview-entry.ts'),name:'KletsStagePreview',formats:['iife'],fileName:()=> 'stage-preview.js'},minify:true},
});
