import type { BufferGeometry, Material, Mesh, Object3D } from 'three';

export interface StageAsset {
  root: Object3D;
  bodyRoot: Object3D;
  handRoot: Object3D;
  garment: Mesh<BufferGeometry, Material | Material[]>;
  skin: Mesh<BufferGeometry, Material | Material[]>;
  palmAnchor: Object3D;
  contactTarget: Object3D;
  pressIndex: number;
  reboundIndex: number;
}
