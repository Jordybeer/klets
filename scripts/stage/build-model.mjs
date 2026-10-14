import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { bodyGeometry, addMorphs, handGeometry, cuffGeometry, contactPoint, contactNormal } from './model-shapes.mjs';

// GLTFExporter only needs this authoring-side Blob bridge in Node.
if (!globalThis.FileReader) {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
    readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
  };
}
const root = new THREE.Group(); root.name = 'KletsStage';
const body = new THREE.Group(); body.name = 'BodyRoot'; root.add(body);
const handRoot = new THREE.Group(); handRoot.name = 'HandRoot'; root.add(handRoot);
const skinMat = new THREE.MeshStandardMaterial({ color: '#d6926f', roughness: .57, metalness: 0 }); skinMat.name = 'WarmPeachSkin';
const clothMat = new THREE.MeshStandardMaterial({ color: '#ffffff', vertexColors: true, roughness: .88, metalness: 0 }); clothMat.name = 'PlumCotton';
const cuffMat = new THREE.MeshStandardMaterial({ color: '#f4e8dc', roughness: .85 }); cuffMat.name = 'IvoryCotton';
const skin = new THREE.Mesh(addMorphs(bodyGeometry(true)), skinMat); skin.name = 'Skin'; body.add(skin);
const garment = new THREE.Mesh(addMorphs(bodyGeometry(false)), clothMat); garment.name = 'Garment'; body.add(garment);
const hand = new THREE.Mesh(handGeometry(), skinMat); hand.name = 'Hand'; hand.userData.fingerCount = 5; hand.userData.pose = 'prepared relaxed open palm'; handRoot.add(hand);
const cuff = new THREE.Mesh(cuffGeometry(), cuffMat); cuff.name = 'Cuff'; handRoot.add(cuff);
const target = new THREE.Object3D(); target.name = 'ContactTarget'; target.position.fromArray(contactPoint); body.add(target);
const palm = new THREE.Object3D(); palm.name = 'PalmAnchor'; palm.position.set(.015, .025, -.143); handRoot.add(palm);

// Palm faces local -Z. Match it to the outward surface normal at contact.
const normal = new THREE.Vector3().fromArray(contactNormal);
const contactQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
contactQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -.62));
const contactPosition = target.position.clone().sub(palm.position.clone().applyQuaternion(contactQ));
const restQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.10, -.48, -.55));
const restPosition = new THREE.Vector3(1.48, -.19, 1.13);
handRoot.position.copy(restPosition); handRoot.quaternion.copy(restQ);
root.updateMatrixWorld(true);
// Export precision is below a screen pixel and keeps the inline preview compact.
const exportPrecision = { positionDecimals: 4, morphPositionDecimals: 4, normalDecimals: 3, normalUnitCorrectionDecimals: 4, morphNormalDecimals: 3 };
const roundAttribute = (attribute, decimals) => {
  const factor = 10 ** decimals;
  for (let i = 0; i < attribute.array.length; i++) attribute.array[i] = Math.round(attribute.array[i] * factor) / factor;
};
root.traverse(o => {
  if (!o.isMesh) return;
  roundAttribute(o.geometry.attributes.position, exportPrecision.positionDecimals);
  const normal = o.geometry.attributes.normal;
  if (normal) {
    roundAttribute(normal, exportPrecision.normalDecimals);
    // Retain glTF's unit-length tolerance without exporter renormalization.
    for (let i = 0; i < normal.array.length; i += 3) {
      let largest = 0;
      for (let j = 1; j < 3; j++) if (Math.abs(normal.array[i + j]) > Math.abs(normal.array[i + largest])) largest = j;
      const others = [0, 1, 2].filter(j => j !== largest);
      const magnitude = Math.sqrt(Math.max(0, 1 - others.reduce((sum, j) => sum + normal.array[i + j] ** 2, 0)));
      const factor = 10 ** exportPrecision.normalUnitCorrectionDecimals;
      normal.array[i + largest] = Math.sign(normal.array[i + largest]) * Math.round(magnitude * factor) / factor;
    }
  }
  for (const attribute of o.geometry.morphAttributes.position ?? []) roundAttribute(attribute, exportPrecision.morphPositionDecimals);
  // NORMAL targets are relative deltas, so they must never be unit-normalized.
  for (const attribute of o.geometry.morphAttributes.normal ?? []) roundAttribute(attribute, exportPrecision.morphNormalDecimals);
  // Decimal rounding can collapse or flip a subpixel tetrahedron sliver.
  const geometry = o.geometry, indices = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < geometry.index.count; i += 3) {
    const ids = [geometry.index.getX(i), geometry.index.getX(i + 1), geometry.index.getX(i + 2)];
    a.fromBufferAttribute(geometry.attributes.position, ids[0]); b.fromBufferAttribute(geometry.attributes.position, ids[1]); c.fromBufferAttribute(geometry.attributes.position, ids[2]);
    b.sub(a).cross(c.sub(a));
    if (b.lengthSq() <= 1e-20) continue;
    n.set(0, 0, 0);
    for (const id of ids) n.add(c.fromBufferAttribute(normal, id));
    indices.push(ids[0], ...(b.dot(n) < 0 ? [ids[2], ids[1]] : [ids[1], ids[2]]));
  }
  geometry.setIndex(indices);
});
let triangles = 0, vertices = 0, drawCalls = 0;
root.traverse(o => { if (o.isMesh) { triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; vertices += o.geometry.attributes.position.count; drawCalls++; } });
const bounds = new THREE.Box3().setFromObject(root);
const buffer = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
const gzipBytes = gzipSync(Buffer.from(buffer)).byteLength;
if (triangles > 45_000 || buffer.byteLength > 3_000_000 || gzipBytes > 480_000) throw new Error('Stage export exceeds triangle, GLB or inline-preview budget');
const folder = fileURLToPath(new URL('../../public/assets/', import.meta.url)); await mkdir(folder, { recursive: true });
await writeFile(`${folder}/klets-stage-v2.glb`, Buffer.from(buffer));
const manifest = {
  name: 'Klets stage v2', generator: 'scripts/stage/build-model.mjs', generatorVersion: '2.0.3',
  source: 'Original deterministic contour modeling authored for Klets; no downloaded meshes, photos, textures or external assets.',
  units: 'stylized stage units; full body crop approximately 2.96 units high', axes: { up: '+Y', rear: '+Z', camera: '+Z with slight +X' },
  nodes: ['KletsStage', 'BodyRoot', 'HandRoot', 'Skin', 'Garment', 'Hand', 'Cuff', 'ContactTarget', 'PalmAnchor'],
  morphs: { Garment: ['press', 'rebound'], Skin: ['press', 'rebound'], indices: { press: 0, rebound: 1 }, attributes: ['POSITION', 'NORMAL'], relative: true, maxPressDepth: .064, response: 'Localized indentation and shallow inner-palm cloth bend; matching deformed normal deltas on both meshes.' },
  bytes: buffer.byteLength, gzipBytes, vertices, triangles, drawCalls, textures: 0, exportPrecision,
  boundingBox: { min: bounds.min.toArray(), max: bounds.max.toArray() },
  handMotion: {
    rest: { position: restPosition.toArray(), quaternion: restQ.toArray() },
    contact: { position: contactPosition.toArray(), quaternion: contactQ.toArray() },
    palmAnchor: palm.position.toArray(), contactTarget: target.position.toArray(), contactNormal: normal.toArray(),
    pressFollow: [0, 0, -.064],
    notes: 'Interpolate HandRoot in root-local coordinates. During press move hand by pressFollow * pressWeight to follow local cloth indentation. BodyRoot remains at origin. Palm faces -Z locally; fingers point +Y. Press/rebound must be applied to Skin and Garment at the same weights. Camera framing should include all rest/contact/intermediate hand bounds.'
  },
  materials: ['WarmPeachSkin', 'PlumCotton', 'IvoryCotton'],
};
await writeFile(`${folder}/klets-stage-v2.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ bytes: manifest.bytes, gzipBytes: manifest.gzipBytes, triangles, vertices, bounds: manifest.boundingBox, handMotion: manifest.handMotion }, null, 2));
