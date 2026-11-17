// Low-resolution render, then a pixel-art pass:
//   outlines and edge highlights (from depth + normals), a fixed palette, a vignette.
import * as THREE from 'three';

export const GAME_W = 384;
export const GAME_H = 216;
export const PX_PER_UNIT = 16;
export const CAMERA_ELEVATION = THREE.MathUtils.degToRad(32);

// Layers: 0 = solid things that get outlines; 1 = effects and tiny details (no outline).
export const LAYER_FX = 1;

// 32 colours sampled from the style anchor (docs/concept/00-style-anchor.webp),
// plus a few accents the anchor is short on (bone, flame core, gold, crown white, crimson cloth).
export const PALETTE = [
  '#0b0a0b', '#15131a', '#291c25', '#412024', '#2f2735', '#3a3242', '#4a2f37', '#5f2925',
  '#463a4a', '#543742', '#434259', '#7e3326', '#653d43', '#3a4e6f', '#814138', '#794344',
  '#a53f22', '#814d4c', '#934b3a', '#7b5660', '#965047', '#a95136', '#4a709f', '#bd592a',
  '#c45c35', '#be6b47', '#a2776e', '#ef6d25', '#6a9bc5', '#eb7935', '#e0a171', '#b4cacb',
  '#d8d0b8', '#ffc45a', '#fff0b0', '#c9963a', '#e6f4ff', '#1f1a2e',
  '#5a1420', '#8c1f2b', '#b02c38',
];

function oklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return new THREE.Vector3(
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  );
}
function hexRgb(hex) { return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); }

export function createPixelRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.autoUpdate = false;

  const opts = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
  const colorTarget = new THREE.WebGLRenderTarget(GAME_W, GAME_H, { ...opts, type: THREE.HalfFloatType });
  colorTarget.depthTexture = new THREE.DepthTexture(GAME_W, GAME_H);
  const normalTarget = new THREE.WebGLRenderTarget(GAME_W, GAME_H, opts);
  normalTarget.depthTexture = new THREE.DepthTexture(GAME_W, GAME_H);
  const finalTarget = new THREE.WebGLRenderTarget(GAME_W, GAME_H, { ...opts, depthBuffer: false });
  const normalMat = new THREE.MeshNormalMaterial({ flatShading: true });

  const palRgb = PALETTE.map(hexRgb);
  const N = PALETTE.length;

  const post = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: colorTarget.texture },
      tNormal: { value: normalTarget.texture },
      tDepth: { value: normalTarget.depthTexture },
      tDepthAll: { value: colorTarget.depthTexture },
      uRes: { value: new THREE.Vector2(GAME_W, GAME_H) },
      uDepthRange: { value: 1 },
      uExposure: { value: 1.9 },
      uVignette: { value: 0.6 },
      uOutline: { value: 0.62 },      // how much outlines darken
      uHighlight: { value: 0.32 },    // how much lit edges brighten
      uCrease: { value: 0.4 },        // how much inner corners darken
      uPalette: { value: 1 },
      uDither: { value: 0.03 },
      uPal: { value: palRgb.map((c) => oklab(c.map((v) => Math.pow(v, 2.2)))) },
      uPalRgb: { value: palRgb.map((c) => new THREE.Vector3(...c)) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      #define PAL_N ${N}
      uniform sampler2D tScene, tNormal, tDepth, tDepthAll;
      uniform vec2 uRes;
      uniform float uDepthRange, uExposure, uVignette, uOutline, uHighlight, uCrease, uPalette, uDither;
      uniform vec3 uPal[PAL_N];
      uniform vec3 uPalRgb[PAL_N];
      varying vec2 vUv;

      float depthAt(vec2 uv) { return texture2D(tDepth, uv).x * uDepthRange; }     // world units
      vec3 normalAt(vec2 uv) { return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }

      vec3 oklab(vec3 c) {
        float l = pow(0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b, 1.0 / 3.0);
        float m = pow(0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b, 1.0 / 3.0);
        float s = pow(0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b, 1.0 / 3.0);
        return vec3(0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
                    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
                    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
      }
      float bayer(vec2 p) {
        vec2 q = mod(p, 4.0);
        float i = q.x + q.y * 4.0;
        float m[16];
        m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
        m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
        return m[int(i)] / 16.0;
      }

      void main() {
        vec3 c = max(texture2D(tScene, vUv).rgb, 0.0);
        float m0 = max(c.r, max(c.g, c.b));
        c *= (1.0 - exp(-m0 * uExposure)) / max(m0, 1e-4);     // curve on brightness only, keeps hue
        c = pow(c, vec3(1.0 / 2.2));
        vec2 vd = (vUv - 0.5) * vec2(1.0, 0.82);
        c *= mix(1.0, smoothstep(0.78, 0.22, length(vd)), uVignette);

        // --- edges ------------------------------------------------------------
        vec2 px = 1.0 / uRes;
        float d = depthAt(vUv);
        vec3 n = normalAt(vUv);
        float nearer = 0.0, crease = 0.0, lap = 0.0;
        vec2 o[4];
        o[0] = vec2(0.0, 1.0); o[1] = vec2(0.0, -1.0); o[2] = vec2(1.0, 0.0); o[3] = vec2(-1.0, 0.0);
        for (int i = 0; i < 4; i++) {
          vec2 uv = vUv + o[i] * px;
          float dn = depthAt(uv);
          vec3 nn = normalAt(uv);
          float diff = dn - d;                                   // > 0: we are in front of the neighbour
          nearer += clamp(diff, 0.0, 1.0);
          lap += clamp(diff, -0.3, 0.3);
          // only one side of a crease reacts: the face tilted more up/right/toward the camera
          float bias = smoothstep(-0.01, 0.01, dot(n - nn, vec3(1.0)));
          crease += (1.0 - dot(n, nn)) * bias * step(abs(diff), 0.25);
        }
        float solid = step(d - texture2D(tDepthAll, vUv).x * uDepthRange, 0.02);   // 0 where an effect covers this pixel
        float outline = smoothstep(0.3, 0.5, nearer) * solid;
        float isCrease = step(0.3, crease) * (1.0 - outline) * solid;
        float convex = isCrease * step(0.02, lap);               // a ridge: catches the light
        float concave = isCrease * step(lap, -0.02);             // an inner corner: stays dark
        c *= 1.0 - uOutline * outline;
        c *= 1.0 + uHighlight * convex;
        c *= 1.0 - uCrease * concave;

        // --- palette ----------------------------------------------------------
        if (uPalette > 0.5) {
          vec3 lab = oklab(pow(clamp(c, 0.0, 1.0), vec3(2.2)));
          lab.x += (bayer(floor(vUv * uRes)) - 0.5) * uDither;
          float best = 1e9;
          vec3 pick = c;
          for (int i = 0; i < PAL_N; i++) {
            vec3 e = lab - uPal[i];
            float dist = dot(e * vec3(1.0, 1.6, 1.6), e * vec3(1.0, 1.6, 1.6));
            if (dist < best) { best = dist; pick = uPalRgb[i]; }
          }
          c = pick;
        }
        gl_FragColor = vec4(c, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });

  const blit = new THREE.ShaderMaterial({
    uniforms: { tFinal: { value: finalTarget.texture } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D tFinal; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(tFinal, vUv).rgb, 1.0); }',
    depthTest: false,
    depthWrite: false,
  });

  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  function resize() {
    const s = Math.max(1, Math.floor(Math.min(innerWidth / GAME_W, innerHeight / GAME_H)));
    renderer.setSize(GAME_W * s, GAME_H * s, true);
  }
  addEventListener('resize', resize);
  resize();

  function render(scene, camera) {
    post.uniforms.uDepthRange.value = camera.far - camera.near;

    // 1. the lit scene, everything
    camera.layers.enableAll();
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(colorTarget);
    renderer.render(scene, camera);

    // 2. normals + depth of the solid things only, for edge detection
    camera.layers.set(0);
    const bg = scene.background;
    scene.background = null;
    scene.overrideMaterial = normalMat;
    renderer.setRenderTarget(normalTarget);
    renderer.setClearColor(0x8080ff, 1);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    scene.background = bg;
    camera.layers.enableAll();

    // 3. pixel-art pass at game resolution, 4. sharp upscale
    quad.material = post;
    renderer.setRenderTarget(finalTarget);
    renderer.render(quadScene, quadCam);
    quad.material = blit;
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCam);
  }

  return { renderer, post, render, finalTarget };
}

// Fixed high three-quarter orthographic camera, 16 px per world unit.
export function createCamera() {
  const hw = GAME_W / PX_PER_UNIT / 2;
  const hh = GAME_H / PX_PER_UNIT / 2;
  const cam = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0.1, 140);
  const target = new THREE.Vector3(0, 1.6, -2.3);
  cam.position.set(target.x, target.y + Math.sin(CAMERA_ELEVATION) * 50, target.z + Math.cos(CAMERA_ELEVATION) * 50);
  cam.lookAt(target);
  return cam;
}
