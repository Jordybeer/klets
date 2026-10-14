import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
// Node I/O remains confined to the contract test; the browser app has no Node types.
const fileSystemModule = 'node:fs';
const { readFileSync }: { readFileSync(path: string): Uint8Array } = await import(fileSystemModule);
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { disposeStageAsset, StageAssetLoadError, validateStageAsset } from './asset';

function fixture() {
  const root = new THREE.Group(); root.name = 'KletsStage';
  const body = new THREE.Group(); body.name = 'BodyRoot'; root.add(body);
  const hand = new THREE.Group(); hand.name = 'HandRoot'; root.add(hand);
  const geometry = new THREE.BoxGeometry();
  geometry.morphAttributes.position = [geometry.attributes.position.clone(), geometry.attributes.position.clone()];
  const material = new THREE.MeshStandardMaterial();
  for (const name of ['Skin', 'Garment', 'Hand', 'Cuff']) {
    const mesh = new THREE.Mesh(geometry, material); mesh.name = name;
    mesh.morphTargetDictionary = { press: 0, rebound: 1 };
    (['Skin', 'Garment'].includes(name) ? body : hand).add(mesh);
  }
  const contact = new THREE.Object3D(); contact.name = 'ContactTarget'; body.add(contact);
  const palm = new THREE.Object3D(); palm.name = 'PalmAnchor'; hand.add(palm);
  return root;
}

describe('stage asset contract', () => {
  it('returns the named animation objects and shared morph indices', () => {
    const root = fixture(); const asset = validateStageAsset(root);
    expect(asset.root).toBe(root);
    expect(asset.garment.name).toBe('Garment'); expect(asset.skin.name).toBe('Skin');
    expect(asset.palmAnchor.parent).toBe(asset.handRoot);
    expect(asset.contactTarget.parent).toBe(asset.bodyRoot);
    expect([asset.pressIndex, asset.reboundIndex]).toEqual([0, 1]);
  });
  it.each(['Garment', 'ContactTarget', 'Hand', 'Cuff'])('rejects missing %s with a typed failure', (name) => {
    const root = fixture(); root.getObjectByName(name)!.removeFromParent();
    expect(() => validateStageAsset(root)).toThrow(StageAssetLoadError);
  });
  it('rejects missing press and mismatched skin morph indices before animation', () => {
    const root = fixture(); const garment = root.getObjectByName('Garment') as THREE.Mesh;
    delete garment.morphTargetDictionary!.press;
    expect(() => validateStageAsset(root)).toThrow(StageAssetLoadError);
    garment.morphTargetDictionary!.press = 0;
    (root.getObjectByName('Skin') as THREE.Mesh).morphTargetDictionary = { press: 1, rebound: 0 };
    expect(() => validateStageAsset(root)).toThrow(StageAssetLoadError);
  });
  it('disposes shared geometry, material and texture exactly once across repeated cleanup', () => {
    const root = fixture(); const mesh = root.getObjectByName('Garment') as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    const texture = new THREE.Texture(); mesh.material.map = texture; mesh.material.roughnessMap = texture;
    const counts = { geometry: 0, material: 0, texture: 0 };
    mesh.geometry.addEventListener('dispose', () => counts.geometry++);
    mesh.material.addEventListener('dispose', () => counts.material++);
    texture.addEventListener('dispose', () => counts.texture++);
    const asset = validateStageAsset(root); disposeStageAsset(asset); disposeStageAsset(asset);
    expect(counts).toEqual({ geometry: 1, material: 1, texture: 1 });
  });
  it('loads the authored GLB with useful local deformation and a five-finger hand', async () => {
    const bytes = readFileSync('public/assets/klets-stage-v2.glb');
    const buffer = new Uint8Array(bytes).buffer;
    const gltf = await new GLTFLoader().parseAsync(buffer, '');
    const asset = validateStageAsset(gltf.scene.getObjectByName('KletsStage')!);
    expect(bytes.byteLength).toBeLessThan(3_000_000);
    expect(asset.garment.geometry.getAttribute('position').count).toBeGreaterThan(1000);
    expect(asset.handRoot.getObjectByName('Hand')!.userData.fingerCount).toBe(5);
    const delta = asset.garment.geometry.morphAttributes.position![asset.pressIndex];
    let moved = 0; for (let i = 0; i < delta.count; i++) if (Math.abs(delta.getZ(i)) > .001) moved++;
    expect(moved).toBeGreaterThan(10); expect(moved).toBeLessThan(delta.count * .6);
    disposeStageAsset(asset);
  });
  it('exports localized relative normal morphs matching the deformed cloth and skin', async () => {
    const bytes = readFileSync('public/assets/klets-stage-v2.glb');
    const gltf = await new GLTFLoader().parseAsync(new Uint8Array(bytes).buffer, '');
    const asset = validateStageAsset(gltf.scene.getObjectByName('KletsStage')!);
    for (const mesh of [asset.garment, asset.skin]) {
      const geometry = mesh.geometry, position = geometry.getAttribute('position'), normal = geometry.getAttribute('normal');
      expect(mesh.morphTargetInfluences).toEqual([0, 0]);
      expect(geometry.morphTargetsRelative).toBe(true);
      expect(geometry.morphAttributes.normal).toHaveLength(2);
      for (const index of [asset.pressIndex, asset.reboundIndex]) {
        const delta = geometry.morphAttributes.normal![index], move = geometry.morphAttributes.position![index];
        expect(delta.count).toBe(normal.count);
        expect(Array.from(delta.array).every(Number.isFinite)).toBe(true);
        const deformed = geometry.clone(), deformedPosition = position.clone();
        for (let i = 0; i < position.count; i++) deformedPosition.setXYZ(i, position.getX(i) + move.getX(i), position.getY(i) + move.getY(i), position.getZ(i) + move.getZ(i));
        deformed.setAttribute('position', deformedPosition); deformed.computeVertexNormals();
        const expectedNormal = deformed.getAttribute('normal');
        let changed = 0, checked = 0;
        for (let i = 0; i < delta.count; i++) {
          const magnitude = Math.hypot(delta.getX(i), delta.getY(i), delta.getZ(i));
          if (magnitude > .001) changed++;
          if (position.getX(i) < 0) expect(magnitude).toBe(0);
          if (Math.abs(move.getZ(i)) > .005 && position.getY(i) < .45 && position.getZ(i) > .3) {
            const authored = new THREE.Vector3(normal.getX(i) + delta.getX(i), normal.getY(i) + delta.getY(i), normal.getZ(i) + delta.getZ(i)).normalize();
            expect(authored.dot(new THREE.Vector3().fromBufferAttribute(expectedNormal, i))).toBeGreaterThan(.995);
            checked++;
          }
        }
        expect(changed).toBeGreaterThan(10); expect(changed).toBeLessThan(delta.count * .6);
        expect(checked).toBeGreaterThan(10);
        deformed.dispose();
      }
    }
    disposeStageAsset(asset);
  });
});
