// Lit materials with a pixel texture laid out in screen pixels, plus glow sprites.
import * as THREE from 'three';
import { CAMERA_ELEVATION, LAYER_FX } from './render.js';

export const texUniforms = {
  uNoise: { value: 0.3 },
  uElev: { value: new THREE.Vector2(Math.sin(CAMERA_ELEVATION), Math.cos(CAMERA_ELEVATION)) },
};

// pattern: 'plain' | 'floor' (ringed flagstones) | 'brick' (coursed masonry) | 'course' (column drums)
// The surface texture is laid out in screen pixels: one texel is one pixel on screen.
export function stoneMaterial({ color = 0xffffff, pattern = 'plain', flat = false, noise = 1, glow = 0 } = {}) {
  const m = new THREE.MeshLambertMaterial({ color, flatShading: flat });
  if (glow) m.emissive = new THREE.Color(color).multiplyScalar(glow);
  m.onBeforeCompile = (s) => {
    s.uniforms.uPattern = { value: { plain: 0, floor: 1, brick: 2, course: 3 }[pattern] };
    s.uniforms.uNoiseMul = { value: noise };
    s.uniforms.uNoise = texUniforms.uNoise;
    s.uniforms.uElev = texUniforms.uElev;

    s.vertexShader = s.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWN;')
      .replace('#include <project_vertex>', /* glsl */ `#include <project_vertex>
        vec4 wp4 = vec4(transformed, 1.0);
        vec3 wn3 = objectNormal;
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4;
          wn3 = mat3(instanceMatrix) * wn3;
        #endif
        vWPos = (modelMatrix * wp4).xyz;
        vWN = normalize(mat3(modelMatrix) * wn3);`);

    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', /* glsl */ `#include <common>
        varying vec3 vWPos;
        varying vec3 vWN;
        uniform float uPattern, uNoiseMul, uNoise;
        uniform vec2 uElev;
        float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        // ringed flagstones: x = per-stone random, y = 1 on a joint
        vec2 flagstone(vec2 xz) {
          float ringW = 0.95;
          float r = length(xz);
          float ring = floor(r / ringW);
          float segs = max(5.0, floor(ring * 5.5 + 5.0));
          float a = fract(atan(xz.y, xz.x) / 6.2831853 + 0.5 + h2(vec2(ring, 3.0)));
          float seg = floor(a * segs);
          float aw = 0.07 / (max(r, 0.4) * 6.2831853 / segs);
          float joint = (fract(r / ringW) < 0.075 || fract(a * segs) < aw) ? 1.0 : 0.0;
          return vec2(h2(vec2(ring, seg) + 7.0), joint);
        }`)
      .replace('#include <color_fragment>', /* glsl */ `#include <color_fragment>
        {
          vec3 P = vWPos - vWN * 0.02;
          bool top = vWN.y > 0.5;
          // texel grid in screen pixels: flat faces are squashed by the camera tilt, walls by its cosine
          vec2 t = top
            ? vec2(P.x * 16.0, P.z * 16.0 * uElev.x)
            : vec2((abs(vWN.z) >= abs(vWN.x) ? P.x : P.z) * 16.0, P.y * 16.0 * uElev.y);
          vec2 q = floor(t);
          float n = h2(q + (top ? 0.0 : 91.0));
          float n2 = h2(floor(q / 3.0) + 11.0);
          float k = 1.0 + ((n - 0.5) * 0.4 + (n2 - 0.5) * 0.7) * uNoise * uNoiseMul;

          if (uPattern > 0.5 && uPattern < 1.5 && top) {
            float dz = 1.0 / (16.0 * uElev.x);                    // one screen pixel along z
            vec2 st = flagstone(P.xz);
            k *= 0.86 + 0.28 * st.x;
            if (st.y > 0.5) k *= 0.42;                             // joint
            else if (flagstone(P.xz - vec2(0.0, dz)).y > 0.5) k *= 1.2;   // top edge of a stone catches light
            else if (flagstone(P.xz + vec2(0.0, dz)).y > 0.5) k *= 0.84;  // bottom edge sits in shade
            if (h2(floor(P.xz * 2.0) + 5.0) > 0.93 && n > 0.6) k *= 0.6;  // worn chips
          } else if (uPattern > 2.5) {
            if (!top) {
              float bh = 14.0;                                     // one column drum, in pixels
              float fy = mod(q.y + 3.0, bh);
              k *= 0.92 + 0.16 * h2(vec2(floor((q.y + 3.0) / bh), 5.0));
              if (fy < 0.5) k *= 0.55;                             // seam
              else if (fy > bh - 1.5) k *= 1.12;
              else if (fy < 1.5) k *= 0.9;
              k *= mix(0.7, 1.0, smoothstep(-0.15, 0.6, P.y));
            }
          } else if (uPattern > 1.5) {
            if (!top) {
              float bw = 10.0, bh = 5.0;                           // brick size in pixels
              float row = floor(q.y / bh);
              float ox = mod(row, 2.0) * 5.0;
              float col = floor((q.x + ox) / bw);
              float fx = mod(q.x + ox, bw), fy = mod(q.y, bh);
              float id = h2(vec2(col, row) + 3.0);
              k *= 0.86 + 0.26 * id;
              if (id > 0.9) k *= 0.82;
              if (fy < 0.5 || fx < 0.5) k *= 0.5;                  // mortar
              else if (fy > bh - 1.5) k *= 1.16;                   // top of the brick, lit
              else if (fy < 1.5) k *= 0.88;
              k *= mix(0.66, 1.0, smoothstep(-0.15, 0.5, P.y));    // darker where walls meet the ground
            } else {
              float id = h2(floor(q / vec2(10.0, 6.0)) + 17.0);
              k *= 0.9 + 0.2 * id;
            }
          }
          diffuseColor.rgb *= k;
        }`);
  };
  return m;
}

// Characters are many small parts. Drawing each part into every shadow map is the single
// largest cost, so parts cast nothing and this invisible capsule casts for the whole body.
const SHADOW_ONLY = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
export function shadowProxy(radius, height) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, Math.max(0.01, height - radius * 2), 2, 6), SHADOW_ONLY);
  m.position.y = height / 2;
  m.castShadow = true;
  m.layers.set(LAYER_FX);                                   // kept out of the outline pass
  return m;
}

// Soft round glow sprite; the pixel pass turns it into stepped halos.
let glowTex = null;
export function glowSprite(color, size, opacity = 0.5) {
  if (!glowTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    glowTex = new THREE.CanvasTexture(c);
  }
  const mat = new THREE.SpriteMaterial({
    map: glowTex, color, opacity, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const s = new THREE.Sprite(mat);
  s.layers.set(LAYER_FX);
  s.scale.set(size, size, 1);
  return s;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
