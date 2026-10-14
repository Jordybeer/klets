import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

// All contours are authored in stage units. Rear faces +Z; no sphere primitives.
const TAU = Math.PI * 2;
const lerp = THREE.MathUtils.lerp;
const smooth = t => t * t * (3 - 2 * t);
const N = 64;
// Analytic envelope keeps the derivatives continuous through the waist/hip loft.
function profile(y) {
  let width = .70 + .365 * Math.exp(-(((y - .24) / .68) ** 2));
  let depth = .345 + .435 * Math.exp(-(((y - .18) / .62) ** 2));
  return [Math.max(.0001, width), Math.max(.0001, depth), -.025];
}
export function torsoPoint(theta, y, inset = 0) {
  const [width, depth, centerZ] = profile(y);
  const x = Math.max(.0001, width - inset) * Math.sin(theta), c = Math.cos(theta);
  // Gentle center back seam valley, broad gluteal volume, flatter abdomen.
  const rear = c > 0 ? 1 - .32 * Math.exp(-x * x / .055) * Math.exp(-(((y - .10) / .70) ** 2)) : .78;
  return new THREE.Vector3(x, y, centerZ + Math.max(.0001, depth - inset) * c * rear);
}
function branchPoint(theta, t, side, isSkin) {
  const hemY = -.56;
  const y = lerp(-.18, isSkin ? -1.27 : hemY, t);
  const s = THREE.MathUtils.clamp((-.18 - y) / (-.18 - hemY), 0, 1);
  // C2 blend follows the continuing torso envelope before turning into each thigh.
  const blend = s * s * s * (s * (s * 6 - 15) + 10);
  const angle = Math.sin(theta), cosine = Math.cos(theta);
  const inset = isSkin ? .026 : 0;
  const p = torsoPoint(theta, y, inset);
  p.x = side * Math.max(0, p.x);
  if (angle < 0) p.z = lerp(torsoPoint(Math.PI, y, inset).z, torsoPoint(0, y, inset).z, (cosine + 1) / 2);
  let rx = .415, rz = .43, center = .50;
  if (y < hemY) {
    const down = (hemY - y) / (1.27 + hemY);
    rx = lerp(.415, .365, smooth(down)); rz = lerp(.43, .355, smooth(down));
    center = lerp(.50, .535, smooth(down));

  }
  p.x = lerp(p.x, side * (center + Math.max(.0001, rx - inset) * angle), blend);
  p.z = lerp(p.z, -.025 + Math.max(.0001, rz - inset) * cosine, blend); p.y = y;
  return p;
}
function gridGeometry(rows, columns, sample, wrap = true) {
  const positions = [], indices = [];
  for (let j = 0; j <= rows; j++) for (let i = 0; i <= columns; i++) {
    const point = sample(i / columns, j / rows); positions.push(point.x, point.y, point.z);
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
    const a = j * (columns + 1) + i, b = a + 1, c = a + columns + 1, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); g.setIndex(indices);
  return g;
}
function reverse(g) { const index = g.index.array; for (let i = 0; i < index.length; i += 3) [index[i], index[i + 1]] = [index[i + 1], index[i]]; return g; }
function colored(g, color) {
  const c = new THREE.Color(color); const colors = [];
  for (let i = 0; i < g.attributes.position.count; i++) colors.push(c.r, c.g, c.b);
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); return g;
}
function pipe(points, radius = .008, segments = 64) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 5, false);
}
function clean(g) { g.deleteAttribute('uv'); g.deleteAttribute('normal'); return g; }
// A real crop plane with a narrow round-over, retaining the natural cross-section.
function cropCap(sample, center, direction) {
  const radius = .055;
  const rim = gridGeometry(7, N, (u, v) => {
    const p = sample(u * TAU), offset = radius * (1 - Math.cos(v * Math.PI / 2));
    const radial = new THREE.Vector3(p.x - center.x, 0, p.z - center.z).normalize();
    p.addScaledVector(radial, -offset); p.y += direction * radius * Math.sin(v * Math.PI / 2); return p;
  });
  if (direction > 0) reverse(rim);
  const positions = [center.x, center.y + direction * radius, center.z], indices = [];
  for (let i = 0; i <= N; i++) {
    const p = sample(i / N * TAU), radial = new THREE.Vector3(p.x - center.x, 0, p.z - center.z).normalize();
    p.addScaledVector(radial, -radius); positions.push(p.x, center.y + direction * radius, p.z);
  }
  for (let i = 0; i < N; i++) direction > 0 ? indices.push(0, i + 1, i + 2) : indices.push(0, i + 2, i + 1);
  const plane = new THREE.BufferGeometry(); plane.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); plane.setIndex(indices);
  return [rim, plane];
}
export function bodyGeometry(skin = false) {
  const top = skin ? 1.58 : 1.13;
  const parts = [gridGeometry(skin ? 38 : 28, N, (u, v) => torsoPoint(TAU * u, lerp(top, -.18, v), skin ? .026 : 0))];
  // Trunk rings run down; branch grids use matching winding at their joined seam.
  for (const side of [-1, 1]) {
    const g = gridGeometry(skin ? 22 : 14, N, (u, v) => branchPoint(TAU * u, v, side, skin));
    parts.push(side < 0 ? reverse(g) : g);
  }
  if (skin) {
    parts.push(...cropCap(theta => torsoPoint(theta, top, .026), new THREE.Vector3(0, top, -.025), 1));
    for (const side of [-1, 1]) {
      // Mirrored branch sampling is reversed to give the cap one consistent winding.
      parts.push(...cropCap(theta => branchPoint(side < 0 ? -theta : theta, 1, side, true), new THREE.Vector3(side * .535, -1.27, -.025), -1));
    }
  }
  if (!skin) {
    parts.forEach(g => colored(g, '#202023'));
    // Tailored waist band has real thickness and a narrow top piping.
    const waistband = gridGeometry(8, N, (u, v) => {
      const y = 1.015 + v * .12; const p = torsoPoint(TAU * u, y);
      p.x *= 1.018; p.z *= 1.024; return p;
    });
    parts.push(colored(reverse(waistband), '#101013'));
    for (const side of [-1, 1]) {
      const cuff = gridGeometry(8, N, (u, v) => {
        const p = branchPoint(TAU * u, .88 + v * .12, side, false);
        const r = Math.sin(v * Math.PI) * .014 + .009; p.x += side * Math.sin(TAU * u) * r; p.z += Math.cos(TAU * u) * r; return p;
      });
      parts.push(colored(side < 0 ? reverse(cuff) : cuff, '#282326'));
    }
    // Understated sewn center back; seam follows the actual sculpted surface.
    const center = Array.from({ length: 35 }, (_, i) => { const p = torsoPoint(0, lerp(1.01, -.18, i / 34)); p.z += .006; return p; });
    parts.push(colored(clean(pipe(center, .006)), '#554344'));
    // Two curved pocket top stitches distinguish ordinary shorts from underwear.
    for (const side of [-1, 1]) {
      const points = Array.from({ length: 25 }, (_, i) => {
        const t = i / 24, x = side * lerp(.24, .78, t), y = .69 - .09 * Math.sin(t * Math.PI);
        const [width] = profile(y); const p = torsoPoint(Math.asin(x / width), y); p.z += .009; return p;
      });
      parts.push(colored(clean(pipe(points, .005)), '#554344'));
    }
  }
  let merged = mergeGeometries(parts.map(clean));
  merged = mergeVertices(merged, .00001); merged.computeVertexNormals();
  return merged;
}

const contactX = .78, contactY = .12;
export const contactPoint = torsoPoint(Math.asin(contactX / profile(contactY)[0]), contactY).toArray();
export const contactNormal = (() => {
  const a = Math.asin(contactX / profile(contactY)[0]), epsilon = .0001;
  const tangent = torsoPoint(a + epsilon, contactY).sub(torsoPoint(a - epsilon, contactY));
  const vertical = torsoPoint(a, contactY + epsilon).sub(torsoPoint(a, contactY - epsilon));
  return tangent.cross(vertical).normalize().toArray();
})();
export function addMorphs(geometry) {
  const pos = geometry.attributes.position, press = [], rebound = [];
  const compact = t => Math.abs(t) < 1 ? (1 - t * t) ** 3 : 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const radius = ((x - contactX) / .49) ** 2 + ((y - contactY) / .43) ** 2;
    const influence = z > .15 && radius < 1 ? (1 - radius) ** 3 : 0;
    // A shallow bend just inside the palm edge reveals cloth pressure in the light.
    const bendLine = .505 + .38 * y;
    const bend = z > .15 && radius < 1 ? compact((y - .08) / .30)
      * (-.032 * compact((x - bendLine) / .115) + .010 * compact((x - bendLine + .13) / .105))
      * smooth(THREE.MathUtils.clamp((1 - radius) / .12, 0, 1)) : 0;
    press.push(-.012 * influence, -.007 * influence, -.064 * influence + bend);
    rebound.push(.005 * influence, .003 * influence, .023 * influence - .28 * bend);
  }
  geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(press, 3), new THREE.Float32BufferAttribute(rebound, 3)];
  geometry.morphAttributes.position[0].name = 'press'; geometry.morphAttributes.position[1].name = 'rebound';
  const baseNormal = geometry.attributes.normal;
  geometry.morphAttributes.normal = geometry.morphAttributes.position.map(move => {
    const deformed = geometry.clone(), deformedPosition = pos.clone();
    for (let i = 0; i < pos.count; i++) deformedPosition.setXYZ(i, pos.getX(i) + move.getX(i), pos.getY(i) + move.getY(i), pos.getZ(i) + move.getZ(i));
    deformed.setAttribute('position', deformedPosition); deformed.computeVertexNormals();
    const normal = deformed.attributes.normal, deltas = [];
    for (let i = 0; i < pos.count; i++) deltas.push(normal.getX(i) - baseNormal.getX(i), normal.getY(i) - baseNormal.getY(i), normal.getZ(i) - baseNormal.getZ(i));
    const delta = new THREE.Float32BufferAttribute(deltas, 3); delta.name = move.name;
    deformed.dispose(); return delta;
  });
  geometry.morphTargetsRelative = true;
  return geometry;
}

export function handGeometry() {
  // Anatomical volumes are implicit unions of continuously tapered palm/finger lofts.
  // This replaces the former flat extruded silhouette entirely.
  const smoothMin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; };
  const digits = [
    { x: -.168, endX: -.207, endY: .77, r: .067, curl: .075 },
    { x: -.017, endX: -.002, endY: .90, r: .070, curl: .090 },
    { x: .143, endX: .174, endY: .81, r: .065, curl: .105 },
    { x: .273, endX: .329, endY: .65, r: .057, curl: .125 },
  ].map(d => Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return { p: new THREE.Vector3(lerp(d.x, d.endX, t), lerp(.20, d.endY, t), .012 + d.curl * t * t), r: d.r * (1 - .19 * t + .055 * Math.sin(t * 4 * Math.PI)) };
  }));
  digits.push(Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return { p: new THREE.Vector3(-.12 - .37 * t, -.17 + .46 * t, -.015 + .07 * t * t), r: lerp(.115, .070, t) };
  }));
  function field(x, y, z) {
    const py = THREE.MathUtils.clamp(y, -.64, .31);
    const palmT = THREE.MathUtils.clamp((py + .54) / .75, 0, 1);
    const width = .142 + .133 * smooth(palmT);
    const thickness = .089 + .053 * Math.exp(-(((py + .10) / .25) ** 2));
    const centerX = .025 + .035 * palmT;
    const thenar = .040 * Math.exp(-(((x + .14) / .15) ** 2) - (((py + .09) / .23) ** 2));
    const shiftedZ = z + thenar * .40;
    let distance = (Math.sqrt(((x - centerX) / width) ** 2 + (shiftedZ / (thickness + thenar)) ** 2) - 1) * thickness;
    distance = Math.max(distance, -.64 - y, y - .31);
    for (const digit of digits) {
      let fingerDistance = Infinity;
      for (let i = 0; i < digit.length - 1; i++) {
        const a = digit[i], b = digit[i + 1], dx = b.p.x - a.p.x, dy = b.p.y - a.p.y, dz = b.p.z - a.p.z;
        const t = THREE.MathUtils.clamp(((x - a.p.x) * dx + (y - a.p.y) * dy + (z - a.p.z) * dz) / (dx * dx + dy * dy + dz * dz), 0, 1);
        const px = x - lerp(a.p.x, b.p.x, t), pyy = y - lerp(a.p.y, b.p.y, t), pz = (z - lerp(a.p.z, b.p.z, t)) / .88;
        fingerDistance = Math.min(fingerDistance, Math.hypot(px, pyy, pz) - lerp(a.r, b.r, t));
      }
      distance = smoothMin(distance, fingerDistance, .048);
    }
    return distance;
  }
  // Deterministic marching tetrahedra sews all loft branches into one watertight surface.
  const step = .034, min = new THREE.Vector3(-.60, -.69, -.24), max = new THREE.Vector3(.44, 1.00, .28);
  const nx = Math.ceil((max.x - min.x) / step), ny = Math.ceil((max.y - min.y) / step), nz = Math.ceil((max.z - min.z) / step);
  const points = [], values = [];
  const id = (x, y, z) => (z * (ny + 1) + y) * (nx + 1) + x;
  for (let z = 0; z <= nz; z++) for (let y = 0; y <= ny; y++) for (let x = 0; x <= nx; x++) {
    const p = new THREE.Vector3(min.x + x * step, min.y + y * step, min.z + z * step); points.push(p); values.push(field(p.x, p.y, p.z));
  }
  const tetrahedra = [[0, 5, 1, 6], [0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6]];
  const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]], positions = [];
  const gradient = p => { const e = .001; return new THREE.Vector3(field(p.x + e, p.y, p.z) - field(p.x - e, p.y, p.z), field(p.x, p.y + e, p.z) - field(p.x, p.y - e, p.z), field(p.x, p.y, p.z + e) - field(p.x, p.y, p.z - e)).normalize(); };
  for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const cell = [id(x,y,z),id(x+1,y,z),id(x+1,y+1,z),id(x,y+1,z),id(x,y,z+1),id(x+1,y,z+1),id(x+1,y+1,z+1),id(x,y+1,z+1)];
    for (const tetra of tetrahedra) {
      const ids = tetra.map(i => cell[i]), intersections = [];
      for (const [a, b] of edges) if ((values[ids[a]] < 0) !== (values[ids[b]] < 0)) {
        intersections.push(points[ids[a]].clone().lerp(points[ids[b]], values[ids[a]] / (values[ids[a]] - values[ids[b]])));
      }
      if (intersections.length < 3) continue;
      const center = intersections.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / intersections.length), normal = gradient(center);
      const axis = intersections[0].clone().sub(center).normalize(), other = normal.clone().cross(axis);
      intersections.sort((a,b) => Math.atan2(a.clone().sub(center).dot(other),a.clone().sub(center).dot(axis)) - Math.atan2(b.clone().sub(center).dot(other),b.clone().sub(center).dot(axis)));
      for (let i = 1; i < intersections.length - 1; i++) for (const p of [intersections[0], intersections[i], intersections[i+1]]) positions.push(p.x,p.y,p.z);
    }
  }
  const raw = new THREE.BufferGeometry(); raw.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const g = mergeVertices(raw, .00001), normals = [];
  // Welding neighboring tetrahedra can collapse an almost coincident edge.
  const indices = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < g.index.count; i += 3) {
    const ids = [g.index.getX(i), g.index.getX(i + 1), g.index.getX(i + 2)];
    a.fromBufferAttribute(g.attributes.position, ids[0]); b.fromBufferAttribute(g.attributes.position, ids[1]); c.fromBufferAttribute(g.attributes.position, ids[2]);
    if (b.sub(a).cross(c.sub(a)).lengthSq() > 1e-20) indices.push(...ids);
  }
  g.setIndex(indices);
  for (let i = 0; i < g.attributes.position.count; i++) { const p = new THREE.Vector3().fromBufferAttribute(g.attributes.position, i); normals.push(...gradient(p).toArray()); }
  g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return g;
}
export function cuffGeometry() {
  const g = gridGeometry(12, 48, (u, v) => {
    const a = TAU * u; const y = -.63 + v * .19;
    const r = 1 + .045 * Math.sin(v * Math.PI);
    return new THREE.Vector3(Math.sin(a) * .168 * r, y, Math.cos(a) * .125 * r);
  });
  const positions = [0, -.63, 0], indices = [];
  for (let i = 0; i <= 48; i++) positions.push(Math.sin(TAU * i / 48) * .168, -.63, Math.cos(TAU * i / 48) * .125);
  for (let i = 0; i < 48; i++) indices.push(0, i + 2, i + 1);
  const cap = new THREE.BufferGeometry(); cap.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); cap.setIndex(indices);
  const rim = gridGeometry(2, 48, (u, v) => new THREE.Vector3(Math.sin(TAU * u) * lerp(.168, .14, v), -.44, Math.cos(TAU * u) * lerp(.125, .09, v)));
  const result = mergeGeometries([reverse(g), cap, rim]); result.computeVertexNormals(); return result;
}
