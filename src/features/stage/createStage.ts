import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { StagePose } from './timeline';

/** A small authored sculpture. The still fallback is captured from this same scene. */
export function createStage(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3, 3, 2, -2, .1, 50);
  camera.position.set(0, 2.05, 9);
  camera.lookAt(0, .02, 0);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .045);
  scene.environment = environment.texture;
  scene.environmentIntensity = .65;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff5ea, 0x8e76b0, 1.1));
  const key = new THREE.DirectionalLight(0xffede0, 2.5); key.position.set(-3, 5, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xe8dcff, 1.8); rim.position.set(4, 2, -2); scene.add(rim);
  const peach = new THREE.MeshStandardMaterial({ color: '#ed9b7d', roughness: .32, metalness: .02 });
  const lavender = new THREE.MeshStandardMaterial({ color: '#9873d2', roughness: .29, metalness: .04 });
  const trim = new THREE.MeshStandardMaterial({ color: '#ad91e4', roughness: .36 });
  const stitch = new THREE.MeshStandardMaterial({ color: '#d5c0f4', roughness: .5 });
  const seam = new THREE.MeshStandardMaterial({ color: '#8763bf', roughness: .4 });
  const body = new THREE.Group(); scene.add(body); body.position.set(-.30, .03, 0); body.rotation.y = -.13;
  const sculpt = new THREE.Group(); body.add(sculpt);
  const ellipsoid = (parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[]) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material);
    mesh.position.set(position[0], position[1], position[2]); mesh.scale.set(scale[0], scale[1], scale[2]); parent.add(mesh); return mesh;
  };
  // Rounded peach upper edge and short leg ends are deliberately toy-like.
  ellipsoid(sculpt, peach, [0, .83, -.03], [.70, .40, .39]);
  ellipsoid(sculpt, peach, [-.48, -.67, -.04], [.37, .49, .35]);
  ellipsoid(sculpt, peach, [.48, -.67, -.04], [.37, .49, .35]);
  const shortsGeometry = new THREE.SphereGeometry(1, 96, 64);
  const positions = shortsGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const sx = positions.getX(i), sy = positions.getY(i), sz = positions.getZ(i);
    const x = sx * 1.01 * (1 - .13 * Math.max(0, sy));
    let y = sy * .76;
    // A shallow crotch arch and a softly divided, connected back surface.
    if (y < 0) y += .14 * Math.exp(-x * x / .065) * (-sy);
    let z = sz * .51;
    if (sz > 0) {
      z += .15 * (Math.exp(-((x - .46) ** 2) / .13) + Math.exp(-((x + .46) ** 2) / .13)) * Math.exp(-((y + .10) ** 2) / .35) * sz;
      z -= .047 * Math.exp(-x * x / .006) * Math.exp(-y * y / .45) * sz;
    }
    positions.setXYZ(i, x, y, z);
  }
  shortsGeometry.computeVertexNormals();
  sculpt.add(new THREE.Mesh(shortsGeometry, lavender));
  const tube = (points: number[][], radius: number, material: THREE.Material, parent: THREE.Object3D = sculpt) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2])));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, radius, 8, false), material); parent.add(mesh); return mesh;
  };
  const band = new THREE.Mesh(new THREE.TorusGeometry(.67, .075, 12, 72), trim);
  band.rotation.x = Math.PI / 2; band.scale.y = .56; band.position.y = .65; sculpt.add(band);
  tube([[0,.53,.48],[0,.24,.552],[0,-.06,.554],[0,-.36,.476],[0,-.59,.235]], .012, seam);
  // Two sewn back pockets give the object an unmistakable shorts silhouette.
  for (const sign of [-1, 1]) {
    tube([[sign*.24,.27,.60],[sign*.28,.03,.656],[sign*.43,-.09,.681],[sign*.65,.015,.624],[sign*.70,.22,.545]], .011, stitch);
    tube([[sign*.24,.27,.60],[sign*.45,.285,.615],[sign*.70,.22,.545]], .010, seam);
    tube([[sign*.12,-.48,.443],[sign*.37,-.59,.483],[sign*.62,-.57,.432],[sign*.82,-.42,.329]], .023, trim);
  }
  // A single soft mitten, with three shallow finger scallops, never a realistic hand.
  const hand = new THREE.Group(); scene.add(hand);
  const outline = new THREE.Shape();
  outline.moveTo(-.24,-.47);
  outline.bezierCurveTo(-.30,-.24,-.35,-.05,-.43,.11);
  outline.bezierCurveTo(-.55,.34,-.42,.47,-.30,.36);
  outline.lineTo(-.21,.20);
  outline.lineTo(-.21,.70);
  outline.bezierCurveTo(-.21,.87,-.03,.88,-.015,.70);
  outline.lineTo(.0,.82); outline.bezierCurveTo(.02,.98,.19,.98,.20,.80);
  outline.lineTo(.22,.73); outline.bezierCurveTo(.27,.88,.43,.82,.40,.63);
  outline.lineTo(.41,.22); outline.bezierCurveTo(.45,-.08,.28,-.28,.25,-.47);
  outline.closePath();
  const handMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: .12, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: .09, bevelThickness: .12, curveSegments: 14 }), peach);
  hand.add(handMesh);
  const cuff = new THREE.Mesh(new THREE.CapsuleGeometry(.13, .34, 6, 16), new THREE.MeshStandardMaterial({color:'#fff2df',roughness:.36}));
  cuff.rotation.z = Math.PI/2; cuff.position.set(0,-.47,.05); hand.add(cuff);
  tube([[.04,-.08,.259],[.11,.035,.27],[.10,.15,.255]], .010, new THREE.MeshStandardMaterial({color:'#d99079',roughness:.5}), hand);
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 128; shadowCanvas.height = 128;
  const context = shadowCanvas.getContext('2d');
  if (context) {
    const grad = context.createRadialGradient(64,64,5,64,64,64);
    grad.addColorStop(0,'rgba(91,47,72,0.22)'); grad.addColorStop(.5,'rgba(91,47,72,0.10)'); grad.addColorStop(1,'rgba(91,47,72,0)');
    context.fillStyle=grad; context.fillRect(0,0,128,128);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowMaterial = new THREE.MeshBasicMaterial({map:shadowTexture, transparent:true,depthWrite:false});
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.0,1.45),shadowMaterial);
  shadow.rotation.x=-Math.PI/2; shadow.position.set(-.25,-1.18,.1); scene.add(shadow);
  let disposed = false;
  return {
    render(pose: StagePose) {
      if (disposed) return;
      sculpt.scale.set(pose.bodyScaleX,pose.bodyScaleY,1);
      body.rotation.z=pose.bodyRotation;
      hand.position.set(1.63-pose.handProgress*.45,-.38+pose.handProgress*.43,.72);
      hand.rotation.set(-.12,.1,.20+pose.handProgress*1.00);
      hand.scale.setScalar(.69);
      shadow.scale.x=1+(1-pose.bodyScaleX)*.4;
      renderer.render(scene,camera);
    },
    resize(width: number,height: number) {
      if (disposed || width < 1 || height < 1) return;
      renderer.setSize(width,height,false);
      const aspect=width/height;
      const viewHeight=Math.max(3.15,4.15/aspect);
      camera.left=-viewHeight*aspect/2; camera.right=viewHeight*aspect/2;
      camera.top=viewHeight/2; camera.bottom=-viewHeight/2; camera.updateProjectionMatrix();
    },
    dispose() {
      if (disposed) return; disposed=true;
      const materials = new Set<THREE.Material>();
      scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const material of Array.isArray(object.material)?object.material:[object.material]) materials.add(material); } });
      materials.forEach(material=>material.dispose()); shadowTexture.dispose(); environment.dispose(); renderer.dispose();
    },
  };
}
