import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import {
  Color,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three'

export interface MaterialFieldProps {
  mode: string
  energy: number
  /** Screen coordinates in [-1, 1], with positive y pointing down. */
  pointer: MutableRefObject<{ x: number; y: number; down: boolean; dx: number; dy: number }>
  reducedMotion: boolean
}

const modeNumbers: Record<string, number> = {
  home: 0,
  cosmos: 1,
  glimpse: 2,
  esg: 3,
  mask: 4,
  sups: 5,
  avpc: 6,
}

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// An original, single-body distance field. Quantisation is part of the surface
// mapping, so the glass and the stepped silhouette are the same material.
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uDrag;
  uniform float uTime;
  uniform float uPress;
  uniform float uEnergy;
  uniform float uMode;
  uniform vec3 uMineral;
  uniform vec3 uLilac;
  uniform vec3 uMoss;
  uniform vec3 uCopper;

  mat2 turn(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.45);
    return fract(p.x * p.y);
  }

  float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  vec3 tint() {
    float a = 0.5 + 0.5 * sin(uMode * 1.73 + 0.4);
    float b = 0.5 + 0.5 * cos(uMode * 1.19 + 0.8);
    return mix(mix(uLilac, uMoss, a * 0.75), uCopper, b * 0.28);
  }

  vec3 bodySpace(vec3 p) {
    vec2 touch = vec2(uPointer.x, -uPointer.y);
    p.xy = turn(-0.23 + touch.x * 0.11 + sin(uTime * 0.17) * 0.025) * p.xy;
    p.xz = turn(-0.61 + touch.x * 0.09 + sin(uMode * 1.3) * 0.035) * p.xz;
    p.yz = turn(0.32 + touch.y * 0.06) * p.yz;

    // Pressure compresses one axis and displaces the same volume sideways.
    p.y /= 1.0 - uPress * 0.11;
    p.x /= 1.0 + uPress * 0.065;
    p.z /= 1.0 + uPress * 0.06;
    float dent = exp(-dot(p.xy - touch * 0.72, p.xy - touch * 0.72) * 2.7);
    p.z += dent * uPress * 0.18;
    p.xy -= vec2(uDrag.x, -uDrag.y) * (0.45 + p.z * 0.5);

    float flow = 0.025 + uEnergy * 0.065;
    p += flow * vec3(
      sin(p.y * 2.7 + p.z * 2.0 + uTime * 0.39),
      sin(p.z * 3.2 - p.x * 1.8 + uTime * 0.31),
      sin(p.x * 2.3 + p.y * 2.6 - uTime * 0.35)
    );
    return p;
  }

  float roundedBox(vec3 p, vec3 size, float rounding) {
    vec3 q = abs(p) - size;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - rounding;
  }

  float smoothUnion(float a, float b, float width) {
    float h = clamp(0.5 + 0.5 * (b - a) / width, 0.0, 1.0);
    return mix(b, a, h) - width * h * (1.0 - h);
  }

  float shapeDistance(vec3 p, float shape, float pixel) {
    float rounding = mix(0.19, 0.13, pixel);
    if (shape < 0.5) {
      return roundedBox(p, vec3(0.74, 0.77, 0.69), rounding);
    }
    if (shape < 1.5) {
      // COSMOS: one thick, slanted map plane, bending at its discrete edge.
      p.xy = turn(0.15) * p.xy;
      p.yz = turn(-0.18) * p.yz;
      p.z += sin(p.x * 2.6 + p.y) * 0.035;
      return roundedBox(p, vec3(0.93, 0.66, 0.07), 0.1);
    }
    if (shape < 2.5) {
      // Glimpse: an aperture through a continuous band; missing material is
      // meaningful here, because the project concerns partial observations.
      p.xy = turn(-0.12) * p.xy;
      float band = roundedBox(p, vec3(0.69, 0.77, 0.24), rounding);
      float aperture = 0.43 - length(p.xy - vec2(0.08, 0.03));
      return max(band, aperture);
    }
    if (shape < 3.5) {
      // ESG: a thin report sheet with a continuous curled surface.
      p.z += sin(p.y * 3.2) * 0.13 + sin(p.x * 3.4) * 0.07;
      p.xy = turn(0.12) * p.xy;
      return roundedBox(p, vec3(0.76, 0.86, 0.04), 0.09);
    }
    if (shape < 4.5) {
      // Mask: an open arc, rather than a closed interface card.
      p.xy = turn(-0.24) * p.xy;
      vec2 ring = vec2(length(p.xy) - 0.7, p.z);
      float arc = length(ring) - 0.16;
      float opening = min(p.x - 0.1, -p.y - 0.08);
      return max(arc, opening);
    }
    if (shape < 5.5) {
      // SUPS: two folded layers meet along a shared liquid spine.
      p.z -= abs(p.x) * 0.34;
      float top = roundedBox(p - vec3(0.0, 0.23, 0.04), vec3(0.79, 0.36, 0.045), 0.1);
      float bottom = roundedBox(p - vec3(0.0, -0.26, -0.24), vec3(0.8, 0.34, 0.045), 0.1);
      float spine = roundedBox(p - vec3(0.0, -0.01, -0.08), vec3(0.025, 0.58, 0.13), 0.12);
      return smoothUnion(min(top, bottom), spine, 0.16);
    }
    // AVPC: two observations flow into one volume; the pixel seam remains.
    float left = length((p - vec3(-0.39, 0.1, 0.05)) * vec3(1.0, 1.04, 1.0)) - 0.59;
    float right = length((p - vec3(0.38, -0.12, -0.08)) * vec3(1.0, 1.04, 1.0)) - 0.56;
    float joined = smoothUnion(left, right, 0.3);
    float steppedSeam = p.x + 0.025 * sin(floor(p.y / 0.12) * 1.7);
    return joined + exp(-abs(steppedSeam) * 42.0) * 0.045;
  }

  float materialField(vec3 world) {
    vec3 p = bodySpace(world);
    float cell = 0.105 + 0.017 * sin(uMode * 1.7);
    vec3 stepped = (floor(p / cell + 0.5)) * cell;
    float seam = p.x * 0.65 - p.y * 0.7 + p.z * 0.22;
    seam += 0.16 * sin(p.y * 3.0 + uTime * 0.22) - uEnergy * 0.24;
    float pixel = smoothstep(-0.29, 0.26, seam);
    p = mix(p, stepped, pixel * 0.94);
    p /= 1.0 + uEnergy * 0.04;
    float lower = floor(clamp(uMode, 0.0, 6.0));
    float blend = smoothstep(0.0, 1.0, fract(uMode));
    float current = shapeDistance(p, lower, pixel);
    float next = shapeDistance(p, min(lower + 1.0, 6.0), pixel);
    return mix(current, next, blend);
  }

  vec3 normalAt(vec3 p) {
    // The tetrahedral gradient remains readable on the quantised boundaries.
    vec2 e = vec2(0.009, -0.009);
    return normalize(
      e.xyy * materialField(p + e.xyy) +
      e.yyx * materialField(p + e.yyx) +
      e.yxy * materialField(p + e.yxy) +
      e.xxx * materialField(p + e.xxx)
    );
  }

  vec3 environment(vec3 ray) {
    float upper = smoothstep(-0.45, 0.85, ray.y);
    vec3 col = mix(uMineral * 0.7, uMineral * 1.7, upper);
    float lilacLight = pow(max(dot(ray, normalize(vec3(-0.9, 0.7, 0.4))), 0.0), 5.0);
    float mossLight = pow(max(dot(ray, normalize(vec3(0.7, -0.3, -0.8))), 0.0), 8.0);
    float copperLight = pow(max(dot(ray, normalize(vec3(0.5, 0.5, 0.7))), 0.0), 12.0);
    col += uLilac * lilacLight * 0.9 + uMoss * mossLight * 0.75 + uCopper * copperLight * 0.7;
    // Two narrow studio strips produce crisp reflections and transmitted bands.
    float strip = exp(-pow(ray.y + ray.x * 0.42 - 0.22, 2.0) * 650.0);
    float secondStrip = exp(-pow(ray.y + ray.x * 0.42 - 0.34, 2.0) * 1500.0);
    col += (mix(uLilac, vec3(1.0), 0.6) * strip * 1.1 + uMoss * secondStrip * 0.68)
      * smoothstep(-0.4, 0.5, ray.z);
    return col;
  }

  vec3 backdrop(vec2 uv) {
    vec2 centre = uv - vec2(-0.05, 0.03);
    float halo = exp(-dot(centre, centre) * 1.55);
    vec3 col = uMineral * (0.75 + halo * 0.57);
    col += uLilac * 0.028 * exp(-dot(uv - vec2(-0.7, 0.45), uv - vec2(-0.7, 0.45)) * 2.1);
    col += uCopper * 0.023 * exp(-dot(uv - vec2(0.8, -0.5), uv - vec2(0.8, -0.5)) * 2.0);
    // This quiet, physical background is sampled again by the refracted ray.
    // It is texture behind the object, rather than interface coordinates.
    vec2 gridPosition = uv * 15.0;
    vec2 gridDistance = abs(fract(gridPosition + 0.5) - 0.5);
    float grid = 1.0 - smoothstep(0.012, 0.033, min(gridDistance.x, gridDistance.y));
    float gridFade = exp(-dot(uv, uv) * 0.62);
    col += mix(uLilac, uMoss, 0.48) * grid * gridFade * 0.027;
    float ground = exp(-pow(uv.x * 1.2, 2.0) - pow((uv.y + 0.78) * 9.0, 2.0));
    return col * (1.0 - ground * 0.23);
  }

  vec3 inclusion(vec3 p) {
    vec3 cell = floor(p * 17.0);
    vec3 local = fract(p * 17.0) - 0.5;
    float seed = hash31(cell);
    float fleck = (1.0 - smoothstep(0.13, 0.21, max(abs(local.x), max(abs(local.y), abs(local.z)))))
      * step(0.84, seed);
    return mix(uMoss, uLilac, seed) * fleck;
  }

  void main() {
    vec2 screen = (2.0 * gl_FragCoord.xy - uResolution.xy) / uResolution.y;
    float aspect = uResolution.x / uResolution.y;
    float portrait = 1.0 - smoothstep(0.6, 1.0, aspect);
    float projectScene = smoothstep(0.0, 0.8, uMode);
    float viewScale = 1.1 + portrait * mix(1.9, 1.47, projectScene);
    vec2 sceneOffset = vec2(portrait * aspect * mix(0.46, -0.34, projectScene),
      portrait * mix(-0.04, -0.18, projectScene));
    vec2 uv = (screen + sceneOffset) * viewScale;
    vec3 color = backdrop(uv);
    vec3 origin = vec3(0.0, 0.0, 4.55);
    vec3 ray = normalize(vec3(uv * 1.04, -2.9));

    // A cheap enclosing sphere leaves the surrounding mineral field inexpensive.
    float b = dot(origin, ray);
    float discriminant = b * b - dot(origin, origin) + 3.24;
    if (discriminant > 0.0) {
      float travel = max(0.0, -b - sqrt(discriminant));
      float limit = -b + sqrt(discriminant);
      bool hit = false;
      vec3 point = origin + ray * travel;
      for (int i = 0; i < 72; i++) {
        point = origin + ray * travel;
        float distance = materialField(point);
        if (distance < 0.006) { hit = true; break; }
        travel += max(distance * 0.55, 0.004);
        if (travel > limit) break;
      }

      if (hit) {
        vec3 normal = normalAt(point);
        vec3 reflected = reflect(ray, normal);
        vec3 insideRay = refract(ray, normal, 1.0 / 1.43);
        vec3 insideStart = point + insideRay * 0.035;
        float thickness = 0.035;
        vec3 exitPoint = insideStart;
        for (int j = 0; j < 24; j++) {
          exitPoint = point + insideRay * thickness;
          float insideDistance = materialField(exitPoint);
          if (insideDistance > 0.003 && thickness > 0.055) break;
          thickness += max(-insideDistance * 0.64, 0.035);
          if (thickness > 3.1) break;
        }
        vec3 exitNormal = normalAt(exitPoint);
        vec3 outgoing = refract(insideRay, -exitNormal, 1.43);
        if (dot(outgoing, outgoing) < 0.01) outgoing = reflect(insideRay, -exitNormal);
        // Trace the exit ray onto the background plane. Grid lines visibly bend
        // through the cube, while the environment adds reflections from outside.
        float backdropDepth = max(0.0, (-2.7 - exitPoint.z) / min(outgoing.z, -0.1));
        vec3 backdropPoint = exitPoint + outgoing * backdropDepth;
        vec2 refractedUv = backdropPoint.xy * (2.9 / 7.25) / 1.04;
        vec3 bentLight = backdrop(refractedUv) + environment(outgoing) * 0.48;
        // Small colour dispersion stays within the single transparent volume.
        bentLight.r = backdrop(refractedUv + normal.xy * 0.006).r + environment(normalize(outgoing + normal * 0.009)).r * 0.48;
        bentLight.b = backdrop(refractedUv - normal.xy * 0.006).b + environment(normalize(outgoing - normal * 0.009)).b * 0.48;
        vec3 absorption = exp(-thickness * (vec3(0.06) + (vec3(1.0) - tint()) * 0.12));
        vec3 transmitted = bentLight * absorption + tint() * (vec3(1.0) - absorption) * 0.19;
        vec3 grains = vec3(0.0);
        float threads = 0.0;
        for (int k = 0; k < 14; k++) {
          float depth = (float(k) + 0.5) / 14.0;
          vec3 innerPoint = bodySpace(point + insideRay * thickness * depth);
          grains += inclusion(innerPoint) * (1.0 - depth * 0.45);
          float filament = innerPoint.y + sin(innerPoint.x * 3.4 + innerPoint.z * 1.7) * 0.11;
          float filament2 = innerPoint.z * 0.7 - innerPoint.y + innerPoint.x * 0.22 - 0.31;
          threads += (exp(-filament * filament * 4500.0) + exp(-filament2 * filament2 * 6200.0) * 0.6)
            * (1.0 - depth * 0.4);
        }
        transmitted += grains * 0.2 + mix(uLilac, uMoss, 0.38) * threads * 0.095;
        float facing = clamp(dot(-ray, normal), 0.0, 1.0);
        float fresnel = 0.055 + 0.945 * pow(1.0 - facing, 4.0);
        color = mix(transmitted, environment(reflected), fresnel * 0.86);
        float softLight = max(dot(normal, normalize(vec3(-0.7, 1.0, 1.5))), 0.0);
        color += tint() * softLight * 0.075;
        float highlight = pow(max(dot(reflected, normalize(vec3(-0.5, 0.8, 1.0))), 0.0), 135.0);
        color += mix(uLilac, vec3(1.0), 0.68) * highlight * 1.1;
        float reflectionBand = exp(-pow(reflected.y + reflected.x * 0.42 - 0.22, 2.0) * 1100.0);
        float reflectionBand2 = exp(-pow(reflected.y + reflected.x * 0.42 - 0.34, 2.0) * 1900.0);
        color += (vec3(0.95) * reflectionBand * 0.46 + uMoss * reflectionBand2 * 0.25)
          * smoothstep(-0.3, 0.7, reflected.z);
        float edge = pow(1.0 - facing, 12.0);
        float thinEdge = pow(1.0 - facing, 32.0);
        color += mix(tint(), vec3(1.0), 0.52) * edge * 0.58 + uLilac * thinEdge * 0.6;
      }
    }
    float grain = hash21(gl_FragCoord.xy) - 0.5;
    color += grain * 0.006;
    gl_FragColor = vec4(max(color, vec3(0.0)), 1.0);
    #include <colorspace_fragment>
  }
`

export default function MaterialField({ mode, energy, pointer, reducedMotion }: MaterialFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controls = useRef({ mode, energy, reducedMotion })
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    controls.current = { mode, energy, reducedMotion }
  }, [mode, energy, reducedMotion])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch {
      setFallback(true)
      return
    }
    // StrictMode replays effects on the same connected canvas. A successfully
    // created renderer must clear a previous instance's fallback state.
    setFallback(false)
    renderer.outputColorSpace = SRGBColorSpace
    renderer.setClearColor('#171B1D')
    const uniforms = {
      uResolution: { value: new Vector2(1, 1) },
      uPointer: { value: new Vector2() },
      uDrag: { value: new Vector2() },
      uTime: { value: 0 },
      uPress: { value: 0 },
      uEnergy: { value: 0 },
      uMode: { value: modeNumbers[controls.current.mode] ?? 0 },
      uMineral: { value: new Color('#171B1D') },
      uLilac: { value: new Color('#B9AED6') },
      uMoss: { value: new Color('#C5CE91') },
      uCopper: { value: new Color('#BD806A') },
    }
    const geometry = new PlaneGeometry(2, 2)
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false })
    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quad = new Mesh(geometry, material)
    quad.frustumCulled = false
    scene.add(quad)

    let disposed = false
    let frameId = 0
    let previousTime = 0
    let elapsed = 0
    let inView = true
    let contextLost = false
    let shaderFailed = false
    let dirty = true
    let measuredSeconds = 0
    let measuredFrames = 0

    canvas.dataset.renderer = 'webgl'

    renderer.debug.onShaderError = () => {
      if (disposed) return
      shaderFailed = true
      canvas.dataset.renderer = 'fallback'
      setFallback(true)
    }

    const visible = () => !disposed && inView && !document.hidden && !contextLost && !shaderFailed
    const stop = () => {
      if (frameId) cancelAnimationFrame(frameId)
      frameId = 0
      previousTime = 0
      measuredSeconds = 0
      measuredFrames = 0
    }

    const draw = (time: number) => {
      frameId = 0
      if (!visible()) return
      const rawDelta = previousTime ? (time - previousTime) / 1000 : 0
      const delta = rawDelta ? Math.min(rawDelta, 0.066) : 1 / 60
      previousTime = time
      measuredSeconds += rawDelta
      const settings = controls.current
      const currentPointer = pointer.current
      const targetX = MathUtils.clamp(currentPointer.x || 0, -1, 1)
      const targetY = MathUtils.clamp(currentPointer.y || 0, -1, 1)
      const targetEnergy = MathUtils.clamp(settings.energy || 0, 0, 1)
      const targetMode = modeNumbers[settings.mode] ?? 0
      const oldValues = [uniforms.uPointer.value.x, uniforms.uPointer.value.y, uniforms.uDrag.value.x,
        uniforms.uDrag.value.y, uniforms.uPress.value, uniforms.uEnergy.value, uniforms.uMode.value]

      uniforms.uPointer.value.x = MathUtils.damp(uniforms.uPointer.value.x, targetX, 5, delta)
      uniforms.uPointer.value.y = MathUtils.damp(uniforms.uPointer.value.y, targetY, 5, delta)
      uniforms.uDrag.value.x = MathUtils.damp(uniforms.uDrag.value.x,
        currentPointer.down ? MathUtils.clamp(currentPointer.dx || 0, -0.4, 0.4) * 3 : 0, 7, delta)
      uniforms.uDrag.value.y = MathUtils.damp(uniforms.uDrag.value.y,
        currentPointer.down ? MathUtils.clamp(currentPointer.dy || 0, -0.4, 0.4) * 3 : 0, 7, delta)
      uniforms.uPress.value = MathUtils.damp(uniforms.uPress.value, currentPointer.down ? 1 : 0, 7, delta)
      uniforms.uEnergy.value = MathUtils.damp(uniforms.uEnergy.value, targetEnergy, 4, delta)
      uniforms.uMode.value = MathUtils.damp(uniforms.uMode.value, targetMode, 3, delta)

      if (!settings.reducedMotion) elapsed += delta
      uniforms.uTime.value = settings.reducedMotion ? 0 : elapsed
      const newValues = [uniforms.uPointer.value.x, uniforms.uPointer.value.y, uniforms.uDrag.value.x,
        uniforms.uDrag.value.y, uniforms.uPress.value, uniforms.uEnergy.value, uniforms.uMode.value]
      const moving = newValues.some((value, index) => Math.abs(value - oldValues[index]) > 0.00004)
      if (dirty || moving || !settings.reducedMotion) {
        try {
          renderer.render(scene, camera)
          measuredFrames += 1
          dirty = false
        } catch {
          shaderFailed = true
          canvas.dataset.renderer = 'fallback'
          setFallback(true)
        }
      }
      // These diagnostics describe this device's actual rendered frames. Paused
      // time is excluded, and DOM attributes are written at most once a second.
      if (measuredSeconds >= 1) {
        canvas.dataset.fps = (measuredFrames / measuredSeconds).toFixed(1)
        canvas.dataset.frameMs = (measuredFrames ? measuredSeconds * 1000 / measuredFrames : 0).toFixed(1)
        measuredSeconds = 0
        measuredFrames = 0
      }
      if (visible()) frameId = requestAnimationFrame(draw)
    }

    const start = () => {
      if (visible() && !frameId) {
        dirty = true
        frameId = requestAnimationFrame(draw)
      }
    }

    const resize = () => {
      if (disposed || contextLost) return
      const { width, height } = container.getBoundingClientRect()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.setSize(Math.max(1, width), Math.max(1, height), false)
      renderer.getDrawingBufferSize(uniforms.uResolution.value)
      dirty = true
      start()
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    const onContextLost = (event: Event) => {
      if (disposed) return
      event.preventDefault()
      contextLost = true
      canvas.dataset.renderer = 'fallback'
      stop()
      setFallback(true)
    }
    const onContextRestored = () => {
      if (disposed) return
      contextLost = false
      shaderFailed = false
      canvas.dataset.renderer = 'webgl'
      setFallback(false)
      resize()
      start()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) start()
      else stop()
    }, { rootMargin: '80px' })
    intersectionObserver.observe(container)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', onContextRestored)
    resize()
    start()

    return () => {
      disposed = true
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', onContextRestored)
      geometry.dispose()
      material.dispose()
      scene.clear()
      renderer.dispose()
      // React's development effect replay keeps this canvas connected and
      // reuses its context immediately. Only a real removal may lose it.
      window.setTimeout(() => {
        if (!canvas.isConnected) renderer.forceContextLoss()
      }, 0)
    }
  }, [pointer])

  return (
    <div ref={containerRef} className="material-field" aria-hidden="true" data-renderer={fallback ? 'fallback' : 'webgl'}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', background: '#171B1D' }}>
      <canvas ref={canvasRef} style={{ display: fallback ? 'none' : 'block', width: '100%', height: '100%' }} />
      {fallback && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
        background: 'radial-gradient(ellipse at 48% 45%, #34333c 0%, #171b1d 66%)' }}>
        <div style={{ width: 'min(57vh, 66vw)', aspectRatio: '1', transform: 'rotate(-8deg)',
          background: 'linear-gradient(135deg, #b9aed680 0%, #b9aed630 32%, #c5ce916b 61%, #bd806a85 100%)',
          borderRadius: '22% 27% 18% 21%', boxShadow: 'inset 14px 12px 28px #d1cbe72b, inset -18px -16px 30px #171b1d99, 0 35px 90px #0005',
          clipPath: 'polygon(16% 0, 81% 0, 81% 5%, 88% 5%, 88% 11%, 94% 11%, 94% 20%, 100% 20%, 100% 78%, 94% 78%, 94% 87%, 87% 87%, 87% 94%, 77% 94%, 77% 100%, 15% 100%, 7% 93%, 0 77%, 0 22%, 7% 6%)' }} />
      </div>}
    </div>
  )
}
