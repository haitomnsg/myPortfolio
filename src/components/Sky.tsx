'use client';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/engine';

// A slow sky for the top of a chapter: the Robotics stage's blue (robotics.css), its horizon pushed
// about by drifting noise so the blue rolls like weather, clearing into paper below. It is drawn
// small on a WebGL canvas and stretched, since a gradient has no detail to lose; it only runs while
// on screen and holds one still frame under reduced motion. Without WebGL the CSS under it stays.

const SCALE = 4; // CSS px per drawn pixel
const START = 40; // s into the weather, a calm first look

const VERT = `attribute vec2 p; varying vec2 uv; void main() { uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 uv;
uniform vec2 res;
uniform float t;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// simplex noise (Ashima Arts, MIT): smooth, with no grid for the eye to find in a soft gradient
vec3 permute(vec3 x) { return mod((x * 34.0 + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 a0 = x - floor(x + 0.5);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g = vec3(a0.x * x0.x + h.x * x0.y, a0.yz * x12.xz + h.yz * x12.yw);
  return 130.0 * dot(m, g);
}
float fbm(vec2 p) {
  const mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 2; i++) { v += a * snoise(p); p = turn * p * 2.0 + 11.0; a *= 0.5; }
  return v; // about -0.5..0.5
}
// the Robotics stage's sky, top (0) to bottom (1)
vec3 sky(float y) {
  vec3 c = vec3(0.404, 0.565, 0.776);
  c = mix(c, vec3(0.553, 0.698, 0.871), smoothstep(0.0, 0.09, y));
  c = mix(c, vec3(0.737, 0.835, 0.937), smoothstep(0.09, 0.19, y));
  c = mix(c, vec3(0.918, 0.945, 0.973), smoothstep(0.19, 0.32, y));
  return mix(c, vec3(0.961, 0.973, 0.984), smoothstep(0.32, 0.62, y));
}
void main() {
  float y = 1.0 - uv.y;
  vec2 p = vec2(uv.x * res.x / res.y, y) * 0.7;
  float s = t * 0.016;
  vec2 q = vec2(fbm(p + vec2(0.0, s * 0.5)), fbm(p + vec2(5.2, 1.3) - vec2(s, 0.0)));
  float n = fbm(p + 0.55 * q + vec2(s * 1.4, -s * 0.4));
  float top = 1.0 - smoothstep(0.0, 0.5, y);
  // where the weather runs deep the blue reaches lower and darkens; where it thins, it clears to a sheen
  vec3 c = sky(y - n * 0.22 * top);
  c = mix(c, vec3(0.255, 0.416, 0.667), smoothstep(0.0, 0.5, n) * top * top * 0.3);
  c = mix(c, vec3(1.0), smoothstep(0.1, 0.5, -n) * top * 0.12);
  c += (hash(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0);
}`;

export function Sky({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!canvas || !gl) return;
    const prog = gl.createProgram()!;
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]] as const) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      gl.attachShader(prog, sh);
    }
    gl.bindAttribLocation(prog, 0, 'p');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    // one triangle over the whole canvas
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'res');
    const uT = gl.getUniformLocation(prog, 't');

    const still = prefersReducedMotion();
    let raf = 0;
    let visible = false;
    let last = 0;
    let clock = START;
    const draw = () => {
      gl.uniform1f(uT, clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!('on' in canvas.dataset)) canvas.dataset.on = '';
    };
    const size = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth / SCALE));
      const h = Math.max(1, Math.round(canvas.clientHeight / SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
      draw();
    };
    const tick = (now: number) => {
      clock += last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      draw();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible && !still && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    });
    const ro = new ResizeObserver(size);
    const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; delete canvas.dataset.on; io.disconnect(); };
    canvas.addEventListener('webglcontextlost', lost);
    size();
    io.observe(canvas);
    ro.observe(canvas);
    return () => { io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); canvas.removeEventListener('webglcontextlost', lost); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
