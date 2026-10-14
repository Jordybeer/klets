import { BufferGeometry, Material, Mesh, Object3D, Texture } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { StageAsset } from './sceneTypes';

export class StageAssetLoadError extends Error {
  readonly code = 'STAGE_ASSET_INVALID';
  constructor(message: string, options?: ErrorOptions) {
    super(message, options); this.name = 'StageAssetLoadError';
  }
}

export function validateStageAsset(root: Object3D): StageAsset {
  if (!root) throw new StageAssetLoadError('Missing stage root');
  const node = (name: string) => {
    const matches: Object3D[] = []; root.traverse(object => { if (object.name === name) matches.push(object); });
    if (matches.length !== 1) throw new StageAssetLoadError(`Expected one ${name}`);
    return matches[0];
  };
  const mesh = (name: string) => {
    const object = node(name);
    if (!(object instanceof Mesh) || !(object.geometry instanceof BufferGeometry)) throw new StageAssetLoadError(`Invalid mesh ${name}`);
    return object as Mesh<BufferGeometry, Material | Material[]>;
  };
  const bodyRoot = node('BodyRoot'); const handRoot = node('HandRoot');
  const garment = mesh('Garment'); const skin = mesh('Skin'); mesh('Hand'); mesh('Cuff');
  const palmAnchor = node('PalmAnchor'); const contactTarget = node('ContactTarget');
  const descendant = (child: Object3D, parent: Object3D) => {
    let current: Object3D | null = child.parent;
    while (current) { if (current === parent) return true; current = current.parent; }
    return false;
  };
  if (!descendant(palmAnchor, handRoot) || !descendant(contactTarget, bodyRoot) || !descendant(garment, bodyRoot) || !descendant(skin, bodyRoot)) {
    throw new StageAssetLoadError('Animation objects have invalid parents');
  }
  const indices = ['press', 'rebound'].map(name => {
    const index = garment.morphTargetDictionary?.[name];
    if (index === undefined || skin.morphTargetDictionary?.[name] !== index || !garment.geometry.morphAttributes.position?.[index] || !skin.geometry.morphAttributes.position?.[index]) {
      throw new StageAssetLoadError(`Missing or inconsistent ${name} morph`);
    }
    return index;
  });
  return { root, bodyRoot, handRoot, garment, skin, palmAnchor, contactTarget, pressIndex: indices[0], reboundIndex: indices[1] };
}

const disposed = new WeakSet<object>();
function disposeRoot(root: Object3D): void {
  const once = (resource: { dispose(): void }) => {
    if (!disposed.has(resource)) { disposed.add(resource); resource.dispose(); }
  };
  root.traverse(object => {
    if (object instanceof Mesh) {
      once(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const value of Object.values(material)) if (value instanceof Texture) once(value);
        once(material);
      }
      if ('skeleton' in object && object.skeleton && typeof object.skeleton === 'object' && 'dispose' in object.skeleton) {
        once(object.skeleton as { dispose(): void });
      }
    }
  });
}

export async function loadStageAsset(url: string): Promise<StageAsset> {
  let root: Object3D | undefined;
  try {
    const gltf = await new GLTFLoader().loadAsync(url); root = gltf.scene;
    return validateStageAsset(root);
  } catch (error) {
    if (root) disposeRoot(root);
    if (error instanceof StageAssetLoadError) throw error;
    throw new StageAssetLoadError('Stage asset could not be loaded', { cause: error });
  }
}

export function disposeStageAsset(asset: StageAsset): void { disposeRoot(asset.root); }
