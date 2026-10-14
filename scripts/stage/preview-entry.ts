import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { validateStageAsset, disposeStageAsset } from '../../src/features/stage/asset';

type Transform = { position: number[]; quaternion: number[] };
type Manifest = { handMotion: { rest: Transform; contact: Transform; pressFollow: number[] } };

export async function mount(root: HTMLElement, bytes: ArrayBuffer, manifest: Manifest) {
  const canvas=root.querySelector<HTMLCanvasElement>('canvas')!;
  const button=root.querySelector<HTMLButtonElement>('[data-action="tap"]')!;
  const text=root.querySelector<HTMLElement>('[data-result]')!;
  const status=root.querySelector<HTMLElement>('[data-status]')!;
  const paused=root.querySelector<HTMLInputElement>('[data-motion]')!;
  let renderer: THREE.WebGLRenderer;
  try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'}); }
  catch { status.textContent='De tik blijft werken met het stille beeld.'; bindFallback(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.01,100);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.04);
  room.dispose(); pmrem.dispose(); scene.environment=environment.texture; scene.environmentIntensity=.85;
  scene.add(new THREE.AmbientLight('#dcc6bf',.10));
  const key=new THREE.DirectionalLight('#ffe5ce',2.6); key.position.set(-3,4,3);scene.add(key);
  const fill=new THREE.DirectionalLight('#d1d4df',.40);fill.position.set(3,1,3);scene.add(fill);
  const rim=new THREE.DirectionalLight('#c54340',2.2);rim.position.set(2,2,-2);scene.add(rim);
  const gltf=await new GLTFLoader().parseAsync(bytes,'');
  const asset=validateStageAsset(gltf.scene);
  scene.add(asset.root);
  const rest=manifest.handMotion.rest;
  const restPosition=new THREE.Vector3().fromArray(rest.position);
  const restQuaternion=new THREE.Quaternion().fromArray(rest.quaternion);
  asset.handRoot.position.copy(restPosition);asset.handRoot.quaternion.copy(restQuaternion);
  asset.handRoot.visible=false;
  asset.root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(asset.bodyRoot);
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const bodyBox=new THREE.Box3().setFromObject(asset.bodyRoot);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d')!;
  const shade=ctx.createRadialGradient(64,64,5,64,64,63);shade.addColorStop(0,'rgba(0,0,0,.38)');shade.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});
  const shadowGeometry=new THREE.PlaneGeometry(bodyBox.max.x-bodyBox.min.x+1.2,1.3);
  const shadow=new THREE.Mesh(shadowGeometry,shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.set(0,bodyBox.min.y-.06,.1);scene.add(shadow);
  let actionStart: number|null=null,idleUntil=0,raf=0,disposed=false;
  let resultIndex=0,published=false;
  const messages=['Kom hier. Ik wil je aandacht.','Kijk me aan. Wacht op mijn teken.','Die uitdagende blik heb ik gezien.'];
  const query=matchMedia('(prefers-reduced-motion: reduce)');
  const reduced=()=>paused.checked||query.matches;
  function publish(){if(published)return;published=true;text.textContent=messages[resultIndex++%messages.length];}
  function pose(t:number,idle=0){
    // A single bounded lighting cue confirms the draw without physical contact.
    const cue=t>0&&t<600?Math.sin(t/600*Math.PI):0;
    key.intensity=2.6+cue*.45;
    rim.intensity=2.2+cue*.70;
    asset.bodyRoot.rotation.y=idle;
  }
  function render(){renderer.render(scene,camera);}
  function resize(){
    const rect=button.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);
    const aspect=rect.width/rect.height,h=Math.max(size.y*1.17,size.x*1.20/aspect);
    camera.left=-h*aspect/2;camera.right=h*aspect/2;camera.top=h/2;camera.bottom=-h/2;
    camera.position.set(center.x+.75,center.y+.22,center.z+7);camera.lookAt(center.x,center.y,center.z);camera.updateProjectionMatrix();render();
  }
  function frame(time:number){
    raf=0;if(disposed||document.hidden)return;
    if(actionStart!==null){const t=time-actionStart;pose(Math.min(t,600));if(t>=150)publish();if(t>=600){actionStart=null;button.setAttribute('aria-disabled','false');pose(0);idleUntil=0;}render();if(actionStart!==null)raf=requestAnimationFrame(frame);}
    else if(time<idleUntil&&!reduced()){pose(0,Math.sin(time/6000*Math.PI*2)*.018);render();raf=requestAnimationFrame(frame);}
    else {pose(0);render();}
  }
  function settle(){if(actionStart!==null)publish();actionStart=null;button.setAttribute('aria-disabled','false');cancelAnimationFrame(raf);raf=0;pose(0);render();}
  function activate(){if(actionStart!==null)return;published=false;status.textContent='';if(reduced()){publish();pose(0);render();return;}actionStart=performance.now();button.setAttribute('aria-disabled','true');cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);}
  function motionChange(){settle();}
  function visibility(){if(document.hidden)settle();}
  function contextLost(event:Event){event.preventDefault();settle();root.dataset.ready='fallback';status.textContent='De tik blijft werken met het stille beeld.';button.removeEventListener('click',activate);bindFallback();}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();query.removeEventListener('change',motionChange);paused.removeEventListener('change',motionChange);document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('webglcontextlost',contextLost);button.removeEventListener('click',activate);disposeStageAsset(asset);shadowGeometry.dispose();shadowMaterial.dispose();shadowTexture.dispose();environment.dispose();renderer.dispose();}
  const observer=new ResizeObserver(resize);observer.observe(button);resize();pose(0);render();
  root.dataset.ready='true';button.addEventListener('click',activate);paused.addEventListener('change',motionChange);query.addEventListener('change',motionChange);document.addEventListener('visibilitychange',visibility);canvas.addEventListener('webglcontextlost',contextLost);
  // Preview keeps the figure still until the tap; production's bounded idle is a later integration task.
  window.addEventListener('pagehide',dispose,{once:true});
  (root as any).__stagePreview={pose(t:number){cancelAnimationFrame(raf);actionStart=null;pose(t);render();},dispose,renderer,asset};
  function bindFallback(){let i=0;button.setAttribute('aria-disabled','false');button.addEventListener('click',()=>{text.textContent=['Kom hier. Ik wil je aandacht.','Kijk me aan. Wacht op mijn teken.'][i++%2];});}
}
