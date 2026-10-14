import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
const base=process.cwd();
const read=relative=>fs.readFileSync(path.join(base,relative));
const pack=relative=>gzipSync(read(relative),{level:9,mtime:0}).toString('base64');
const font=(name,relative)=>`@font-face{font-family:${name};font-style:normal;font-weight:${name==='KletsDisplay'?500:400};font-display:swap;src:url(data:font/woff2;base64,${read(relative).toString('base64')}) format('woff2')}`;
let html=read('scripts/stage/preview-template.html').toString();
const values={
  FONT_FACES:[font('KletsDisplay','node_modules/@fontsource/fraunces/files/fraunces-latin-500-normal.woff2'),font('KletsBody','node_modules/@fontsource/nunito-sans/files/nunito-sans-latin-400-normal.woff2')].join('\n'),
  FALLBACK:'data:image/webp;base64,'+read('public/assets/klets-stage-v2.webp').toString('base64'),
  ENGINE:pack('.impeccable/review/stage-v2/bundle/stage-preview.js'),
  MODEL:pack('public/assets/klets-stage-v2.glb'),
  MANIFEST:read('public/assets/klets-stage-v2.manifest.json').toString().trim(),
};
for(const [key,value] of Object.entries(values))html=html.replaceAll('@'+key+'@',value);
if(/@(FONT_FACES|FALLBACK|ENGINE|MODEL|MANIFEST)@/.test(html))throw Error('Unresolved preview placeholder');
if(Buffer.byteLength(html)>=1_000_000)throw Error('Inline preview exceeds 1 MB');
const destination=process.argv[2]||'/workspace/klets-stage-v2.html';
fs.writeFileSync(destination,html);console.log(JSON.stringify({destination,bytes:Buffer.byteLength(html)}));
