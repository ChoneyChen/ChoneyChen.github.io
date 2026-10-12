import { useScenePresence as useInView } from "../hooks/useScenePresence";
import { slowMotion, PRESENTATION_SPEED } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Table2,
  Piano,
  Music2,
  Dribbble,
  MoveHorizontal,
  X,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./tools-chapter.css";
import { QuantPilotWorkflow } from "./QuantPilotWorkflow";

type Translate = (zh: string, en: string) => string;
const makeToolFiles = (t: Translate) => [
  {
    kind: "excel" as const, name: t("IT 技能", "IT skills"), label: t("办公工具", "OFFICE TOOL"),
    action: "EXCEL",
    body: t("Excel 是我的 IT 技能之一。", "Excel is part of my IT skill set."),
    context: t("技能 · 办公工具", "Skill · office tool"),
    tags: ["Excel", t("IT 技能", "IT skill")], color: "#237F58",
  },
  {
    kind: "piano" as const, name: t("钢琴", "Piano"), label: t("音乐", "MUSIC"),
    action: t("钢琴十级", "PIANO · LEVEL 10"),
    body: t("钢琴十级。音乐是我的个人兴趣之一。", "Piano · Level 10. Music is one of my personal interests."),
    context: t("个人兴趣 · 音乐", "Personal interest · music"),
    tags: [t("钢琴十级", "Level 10"), t("音乐", "Music")], color: "#28313C",
  },
  {
    kind: "media" as const, name: t("自媒体运营", "Self-media"), label: t("个人实践", "PERSONAL PRACTICE"),
    action: t("自媒体运营", "SELF-MEDIA OPERATION"),
    body: t("自媒体运营是我的个人实践之一。", "Self-media operation is part of my personal practice."),
    context: t("个人实践 · 自媒体运营", "Personal practice · self-media operation"),
    tags: [t("自媒体运营", "Self-media operation")], color: "#E45165",
  },
  {
    kind: "basketball" as const, name: t("篮球", "Basketball"), label: t("运动", "SPORT"),
    action: t("篮球", "BASKETBALL"),
    body: t("篮球是我的个人兴趣之一。", "Basketball is one of my personal interests."),
    context: t("个人兴趣 · 运动", "Personal interest · sport"),
    tags: [t("篮球", "Basketball"), t("运动", "Sport")], color: "#CA713A",
  },
];

type ToolFile = ReturnType<typeof makeToolFiles>[number];

type ArchiveControl = {
  select: (index: number) => void;
  setQuiet: (quiet: boolean) => void;
};

// Original code-native object artwork. The familiar rotating archive remains a
// rendering-on-demand turntable; the four silhouettes carry the actual facts.
function paintWorksheet(surface: HTMLCanvasElement) {
  const context = surface.getContext("2d")!;
  context.fillStyle = "#F3F7E9";
  context.fillRect(0, 0, 512, 768);
  context.fillStyle = "#237F58";
  context.fillRect(0, 0, 512, 166);
  context.fillStyle = "#FFF9E8";
  context.font = '600 102px "Space Grotesk", sans-serif';
  context.fillText("X", 32, 119);
  context.font = '500 48px "Space Grotesk", sans-serif';
  context.fillText("Excel", 153, 107);
  const left = 36, top = 214, cellWidth = 110, cellHeight = 68;
  for (let row = 0; row < 7; row++) {
    for (let column = 0; column < 4; column++) {
      context.fillStyle = row === 0 || column === 0 ? "#D6E9D4" : row % 2 ? "#F9FCF0" : "#EAF1DF";
      context.fillRect(left + column * cellWidth, top + row * cellHeight, cellWidth, cellHeight);
      context.strokeStyle = "#AAC6A7";
      context.lineWidth = 2;
      context.strokeRect(left + column * cellWidth, top + row * cellHeight, cellWidth, cellHeight);
    }
  }
  context.strokeStyle = "#237F58";
  context.lineWidth = 9;
  context.strokeRect(left + cellWidth * 2, top + cellHeight * 3, cellWidth, cellHeight);
  context.fillStyle = "#237F58";
  context.fillRect(left + cellWidth * 3 - 7, top + cellHeight * 4 - 7, 14, 14);
}

function makeWorksheetTexture(THREE: typeof Three) {
  const surface = document.createElement("canvas");
  surface.width = 512;
  surface.height = 768;
  paintWorksheet(surface);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function makeInterestObject(
  THREE: typeof Three,
  kind: ToolFile["kind"],
  geometries: Three.BufferGeometry[],
  materials: Three.Material[],
  textures: Three.CanvasTexture[],
) {
  const object = new THREE.Group();
  const material = (color: string, roughness = .55, metalness = .08) => {
    const result = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    materials.push(result);
    return result;
  };
  const mesh = (geometry: Three.BufferGeometry, appearance: Three.Material, x = 0, y = 0, z = 0) => {
    geometries.push(geometry);
    const result = new THREE.Mesh(geometry, appearance);
    result.position.set(x, y, z);
    object.add(result);
    return result;
  };
  if (kind === "excel") {
    const green = material("#237F58", .43, .12);
    const edge = material("#B8D4BC", .55);
    mesh(new THREE.BoxGeometry(1.12, 1.66, .16), green);
    const texture = makeWorksheetTexture(THREE);
    textures.push(texture);
    const worksheet = new THREE.MeshStandardMaterial({ map: texture, roughness: .78 });
    materials.push(worksheet);
    mesh(new THREE.PlaneGeometry(1, 1.5), worksheet, 0, 0, .081);
    mesh(new THREE.BoxGeometry(.58, .07, .38), edge, 0, -.855, -.035);
  } else if (kind === "piano") {
    const casing = material("#25303A", .42, .2);
    const white = material("#FFF9E8", .42);
    const black = material("#171E25", .38);
    const accent = material("#85B8C5", .38, .25);
    mesh(new THREE.BoxGeometry(.78, 1.82, .24), casing);
    mesh(new THREE.BoxGeometry(.53, .12, .03), accent, 0, .74, .135);
    const whiteKey = new THREE.BoxGeometry(.58, .099, .045);
    const blackKey = new THREE.BoxGeometry(.32, .05, .08);
    geometries.push(whiteKey, blackKey);
    for (let index = 0; index < 14; index++) {
      const y = -.72 + index * .102;
      const key = new THREE.Mesh(whiteKey, white);
      key.position.set(0, y, .139);
      object.add(key);
      if (index < 13 && index % 7 !== 2 && index % 7 !== 6) {
        const sharp = new THREE.Mesh(blackKey, black);
        sharp.position.set(.13, y + .051, .2);
        object.add(sharp);
      }
    }
    mesh(new THREE.BoxGeometry(.6, .07, .4), casing, 0, -.94, -.03);
  } else if (kind === "media") {
    const note = new THREE.Shape();
    note.moveTo(.05, .78); note.lineTo(.28, .78);
    note.bezierCurveTo(.31, .47, .46, .36, .64, .34); note.lineTo(.64, .1);
    note.bezierCurveTo(.47, .11, .35, .18, .28, .27); note.lineTo(.28, -.33);
    note.bezierCurveTo(.28, -.63, .05, -.8, -.2, -.8);
    note.bezierCurveTo(-.47, -.8, -.63, -.61, -.61, -.39);
    note.bezierCurveTo(-.61, -.14, -.39, .04, -.08, .03); note.lineTo(-.08, -.22);
    note.bezierCurveTo(-.39, -.14, -.45, -.51, -.2, -.52);
    note.bezierCurveTo(-.03, -.52, .05, -.44, .05, -.3); note.lineTo(.05, .78);
    const extrusion = new THREE.ExtrudeGeometry(note, { depth: .09, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .02, bevelThickness: .02, curveSegments: 14 });
    geometries.push(extrusion);
    for (const [color, x, y, z] of [["#46D4D4", -.065, .055, -.105], ["#EA4F69", .065, -.055, -.055], ["#1C2631", 0, 0, 0]] as const) {
      const layer = new THREE.Mesh(extrusion, material(color, .36, .13));
      layer.position.set(x - .045, y, z);
      object.add(layer);
    }
  } else {
    const surface = document.createElement("canvas");
    surface.width = surface.height = 128;
    const context = surface.getContext("2d")!;
    context.fillStyle = "#CA713A"; context.fillRect(0, 0, 128, 128);
    context.fillStyle = "#A550272E";
    for (let row = 0; row < 21; row++) for (let column = 0; column < 21; column++) {
      context.beginPath(); context.arc(column * 6 + (row % 2) * 3, row * 6, 1.4, 0, Math.PI * 2); context.fill();
    }
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const rubber = new THREE.MeshStandardMaterial({ map: texture, roughness: .9 });
    materials.push(rubber);
    mesh(new THREE.SphereGeometry(.68, 40, 28), rubber, 0, -.15, 0);
    const seam = material("#342F2A", .92, 0);
    const seamGeometry = new THREE.TorusGeometry(.682, .013, 6, 80);
    geometries.push(seamGeometry);
    for (const [x, y] of [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]]) {
      const ring = new THREE.Mesh(seamGeometry, seam);
      ring.position.y = -.15;
      ring.rotation.set(x, y, .15);
      object.add(ring);
    }
  }
  // Each silhouette rests on the same turntable plane before the selected lift.
  const floorOffset = kind === "piano" ? .13 : kind === "excel" ? .045 : 0;
  object.children.forEach(child => { child.position.y += floorOffset; });
  return object;
}

const objectIcons = { excel: Table2, piano: Piano, media: Music2, basketball: Dribbble };

export function ToolsChapter({ quiet = false }: { quiet?: boolean }) {
  const { t, language } = useI18n();
  const toolFiles = makeToolFiles(t);
  const filesRef = useRef(toolFiles);
  filesRef.current = toolFiles;
  const prefersQuiet = useReducedMotion();
  const lowMotion = quiet || Boolean(prefersQuiet);
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState(false);
  useCollapseOnLeave("tools", () => setOpened(false));
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneInView = useInView(hostRef, { amount: 0.2 });
  const sceneReady = lowMotion || sceneInView;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<ArchiveControl | null>(null);
  const activeRef = useRef(active);
  const quietRef = useRef(lowMotion);
  activeRef.current = active;
  quietRef.current = lowMotion;

  function selectFile(index: number) {
    const normalized = (index + toolFiles.length) % toolFiles.length;
    activeRef.current = normalized;
    setActive(normalized);
    setOpened(true);
    controlsRef.current?.select(normalized);
  }

  useEffect(() => {
    controlsRef.current?.setQuiet(lowMotion);
  }, [lowMotion]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    let disposed = false;
    let visible = false;
    let loading = false;
    let requestDraw = () => {};
    let stopDraw = () => {};
    let resizeScene = () => {};
    let disposeScene = () => {};
    let rearmScene = () => {};
    let exitTimer = 0;

    async function initialize() {
      if (loading || disposed || controlsRef.current) return;
      loading = true;
      const THREE = await import("three");
      await document.fonts.ready;
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas: canvas!,
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
      } catch {
        if (!disposed) setMode("fallback");
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 30);
      camera.position.set(0, 1.7, 7.6);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight(0xfff4d7, 0x103338, 2.5));
      const key = new THREE.DirectionalLight(0xfff4d7, 3.2);
      key.position.set(-3, 5, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffad86, 1.5);
      rim.position.set(3, 1, -4);
      scene.add(rim);

      const carousel = new THREE.Group();
      scene.add(carousel);
      const books: Three.Group[] = [];
      const coverTextures: Three.CanvasTexture[] = [];
      const geometries: Three.BufferGeometry[] = [];
      const materials: Three.Material[] = [];
      const radius = 1.46;
      const turn = (Math.PI * 2) / toolFiles.length;
      filesRef.current.forEach((file, index) => {
        const book = makeInterestObject(THREE, file.kind, geometries, materials, coverTextures);
        const angle = index * turn;
        const initialRadius = quietRef.current ? radius : radius * 0.72;
        book.position.set(
          Math.sin(angle) * initialRadius,
          quietRef.current ? 0 : 0.65 + index * 0.09,
          Math.cos(angle) * initialRadius,
        );
        book.rotation.y = angle + (quietRef.current ? 0 : 0.22);
        book.visible = quietRef.current || index === 0;
        book.userData.fileIndex = index;
        book.userData.kind = file.kind;
        carousel.add(book);
        books.push(book);
      });

      const baseGeometry = new THREE.CylinderGeometry(2.2, 2.23, 0.09, 64);
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: "#FFF4D7",
        roughness: 0.42,
        metalness: 0.64,
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.89;
      scene.add(base);
      const ringGeometry = new THREE.TorusGeometry(2.04, 0.011, 5, 72);
      const ringMaterial = new THREE.MeshStandardMaterial({
        color: "#2347AA",
        roughness: 0.4,
        metalness: 0.5,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.837;
      scene.add(ring);
      geometries.push(baseGeometry, ringGeometry);
      materials.push(baseMaterial, ringMaterial);

      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = shadowCanvas.height = 128;
      const shadowContext = shadowCanvas.getContext("2d")!;
      const gradient = shadowContext.createRadialGradient(
        64,
        64,
        8,
        64,
        64,
        64,
      );
      gradient.addColorStop(0, "#10333845");
      gradient.addColorStop(1, "#10333800");
      shadowContext.fillStyle = gradient;
      shadowContext.fillRect(0, 0, 128, 128);
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
      coverTextures.push(shadowTexture);
      const shadowGeometry = new THREE.PlaneGeometry(6, 5);
      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        depthWrite: false,
      });
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.96;
      scene.add(shadow);
      geometries.push(shadowGeometry);
      materials.push(shadowMaterial);

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let rotation = -activeRef.current * turn;
      let target: number | null = rotation;
      let tilt = -0.015;
      let tiltTarget = tilt;
      let velocity = 0;
      let currentFile = activeRef.current;
      let frame = 0;
      let lastTime = 0;
      let draws = 0;
      let contextLost = false;
      let introduction = !quietRef.current;
      let introductionElapsed = 0;
      const introductionVelocity = books.map(() => 0);
      const introductionRadius = books.map(() =>
        quietRef.current ? radius : radius * 0.72,
      );
      let dragging: {
        id: number;
        x: number;
        y: number;
        originX: number;
        originY: number;
        time: number;
        moved: boolean;
      } | null = null;
      carousel.rotation.y = rotation;

      const canDraw = () =>
        !disposed && !contextLost && visible && !document.hidden;
      function stop() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        canvas!.dataset.renderState = "paused";
      }
      function schedule() {
        if (!frame && canDraw()) frame = requestAnimationFrame(draw);
      }
      function announce(index: number) {
        if (currentFile === index) return;
        currentFile = index;
        activeRef.current = index;
        setActive(index);
      }
      function select(index: number) {
        setOpened(true);
        const requested = -index * turn;
        target =
          rotation +
          Math.atan2(
            Math.sin(requested - rotation),
            Math.cos(requested - rotation),
          );
        velocity = 0;
        dragging = null;
        tiltTarget = -0.015;
        announce(index);
        if (quietRef.current) {
          rotation = target;
          tilt = tiltTarget;
        }
        schedule();
      }
      function draw(time: number) {
        frame = 0;
        if (!canDraw()) return;
        const delta = lastTime
          ? Math.min((time - lastTime) / 1000, 0.045)
          : 1 / 60;
        lastTime = time;
        const animationDelta = delta * PRESENTATION_SPEED;
        const damping = 1 - Math.exp(-10 * animationDelta);
        let moving = false;
        if (
          !dragging &&
          target === null &&
          Math.abs(velocity) > 0.018 &&
          !quietRef.current
        ) {
          rotation += velocity * animationDelta;
          velocity *= Math.exp(-6.5 * animationDelta);
          moving = true;
        } else if (!dragging && target === null) {
          target = Math.round(rotation / turn) * turn;
          velocity = 0;
        }
        if (!dragging && target !== null) {
          if (quietRef.current || Math.abs(target - rotation) < 0.0005)
            rotation = target;
          else {
            rotation += (target - rotation) * damping;
            moving = true;
          }
          const nextFile =
            ((Math.round(-rotation / turn) % toolFiles.length) +
              toolFiles.length) %
            toolFiles.length;
          if (Math.abs(target - rotation) < 0.05) announce(nextFile);
        }
        if (dragging || quietRef.current || Math.abs(tiltTarget - tilt) < 0.0005)
          tilt = tiltTarget;
        else {
          tilt += (tiltTarget - tilt) * damping;
          moving = true;
        }
        carousel.rotation.set(tilt, rotation, 0);
        if (introduction) {
          introductionElapsed += animationDelta;
          let seated = true;
          books.forEach((book, index) => {
            const height = currentFile === index ? 0.12 : 0;
            const angle = index * turn;
            const arrivalOrder = (index - currentFile + books.length) % books.length;
            if (!quietRef.current && introductionElapsed < arrivalOrder * 0.065) {
              seated = false;
              return;
            }
            book.visible = true;
            if (!quietRef.current) {
              introductionVelocity[index] +=
                (height - book.position.y) * 145 * animationDelta;
              introductionVelocity[index] *= Math.exp(-14.5 * animationDelta);
              book.position.y += introductionVelocity[index] * animationDelta;
              if (book.position.y < height - 0.012) {
                book.position.y = height - 0.012;
                introductionVelocity[index] = 0;
              }
              introductionRadius[index] +=
                (radius - introductionRadius[index]) * damping;
              book.rotation.y += (angle - book.rotation.y) * damping;
              book.position.x = Math.sin(angle) * introductionRadius[index];
              book.position.z = Math.cos(angle) * introductionRadius[index];
              if (
                Math.abs(book.position.y - height) > 0.002 ||
                Math.abs(introductionVelocity[index]) > 0.007 ||
                Math.abs(radius - introductionRadius[index]) > 0.002
              )
                seated = false;
            }
          });
          if (quietRef.current || seated || introductionElapsed > 1.3) {
            introduction = false;
            books.forEach((book, index) => {
              book.visible = true;
              book.position.set(
                Math.sin(index * turn) * radius,
                currentFile === index ? 0.12 : 0,
                Math.cos(index * turn) * radius,
              );
              book.rotation.y = index * turn;
            });
          } else moving = true;
        } else {
          books.forEach((book, index) => {
            const height = currentFile === index ? 0.12 : 0;
            if (quietRef.current || Math.abs(book.position.y - height) < 0.0005)
              book.position.y = height;
            else {
              book.position.y += (height - book.position.y) * damping;
              moving = true;
            }
          });
        }
        renderer.render(scene, camera);
        if (draws === 0 && !disposed) setMode("webgl");
        canvas!.dataset.renderState = moving ? "moving" : "idle";
        canvas!.dataset.entrance = introduction ? "seating" : "ready";
        canvas!.dataset.draws = String(++draws);
        if (moving) schedule();
        else lastTime = 0;
      }
      function resize() {
        if (disposed) return;
        const width = host!.clientWidth;
        const height = host!.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = camera.aspect < 0.95 ? 8.9 : 7.6;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        schedule();
      }
      function hitFile(event: PointerEvent) {
        const rect = canvas!.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        scene.updateMatrixWorld(true);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(books, true)[0];
        let object: Three.Object3D | null = hit?.object ?? null;
        while (object && typeof object.userData.fileIndex !== "number") object = object.parent;
        return object ? object.userData.fileIndex as number : null;
      }
      function pointerDown(event: PointerEvent) {
        if (event.button !== 0 || contextLost) return;
        canvas!.focus({ preventScroll: true });
        canvas!.setPointerCapture(event.pointerId);
        dragging = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          originX: event.clientX,
          originY: event.clientY,
          time: performance.now(),
          moved: false,
        };
        target = null;
        velocity = 0;
        canvas!.style.cursor = "grabbing";
      }
      function pointerMove(event: PointerEvent) {
        if (!dragging || dragging.id !== event.pointerId) {
          canvas!.style.cursor = hitFile(event) === null ? "grab" : "pointer";
          return;
        }
        const now = performance.now();
        const x = event.clientX - dragging.x;
        const y = event.clientY - dragging.y;
        const elapsed = Math.max(10, now - dragging.time) / 1000;
        const sensitivity = 0.008;
        rotation += x * sensitivity;
        velocity = THREE.MathUtils.clamp((x * sensitivity) / elapsed, -4, 4);
        tiltTarget = THREE.MathUtils.clamp(tiltTarget + y * 0.0025, -0.23, 0.2);
        dragging.moved ||=
          Math.hypot(
            event.clientX - dragging.originX,
            event.clientY - dragging.originY,
          ) > 6;
        dragging.x = event.clientX;
        dragging.y = event.clientY;
        dragging.time = now;
        schedule();
      }
      function pointerUp(event: PointerEvent) {
        if (!dragging || dragging.id !== event.pointerId) return;
        const moved = dragging.moved;
        if (moved && event.type !== "pointercancel") setOpened(true);
        if (performance.now() - dragging.time > 100) velocity = 0;
        dragging = null;
        if (canvas!.hasPointerCapture(event.pointerId))
          canvas!.releasePointerCapture(event.pointerId);
        canvas!.style.cursor = "grab";
        if (!moved && event.type !== "pointercancel") {
          const index = hitFile(event);
          if (index !== null) select(index);
          else target = Math.round(rotation / turn) * turn;
        } else if (quietRef.current || event.type === "pointercancel") {
          target = Math.round(rotation / turn) * turn;
          velocity = 0;
        }
        tiltTarget = -0.015;
        schedule();
      }
      function loseContext(event: Event) {
        event.preventDefault();
        contextLost = true;
        stop();
        if (!disposed) setMode("fallback");
      }
      canvas!.addEventListener("pointerdown", pointerDown);
      canvas!.addEventListener("pointermove", pointerMove);
      canvas!.addEventListener("pointerup", pointerUp);
      canvas!.addEventListener("pointercancel", pointerUp);
      canvas!.addEventListener("webglcontextlost", loseContext);
      controlsRef.current = {
        select,
        setQuiet(value) {
          quietRef.current = value;
          if (value) velocity = 0;
          schedule();
        },
      };
      requestDraw = schedule;
      stopDraw = stop;
      resizeScene = resize;
      disposeScene = () => {
        stop();
        canvas!.removeEventListener("pointerdown", pointerDown);
        canvas!.removeEventListener("pointermove", pointerMove);
        canvas!.removeEventListener("pointerup", pointerUp);
        canvas!.removeEventListener("pointercancel", pointerUp);
        canvas!.removeEventListener("webglcontextlost", loseContext);
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
        coverTextures.forEach((texture) => texture.dispose());
        renderer.dispose();
        // StrictMode may reuse this connected canvas; never force context loss here.
      };
      rearmScene = () => {
        if (dragging) return;
        introduction = !quietRef.current;
        introductionElapsed = 0;
        velocity = 0;
        books.forEach((book, index) => {
          introductionVelocity[index] = 0;
          introductionRadius[index] = quietRef.current ? radius : radius * .72;
          book.visible = quietRef.current || index === currentFile;
          book.position.set(Math.sin(index * turn) * introductionRadius[index], quietRef.current ? (currentFile === index ? .12 : 0) : .36 + index * .08, Math.cos(index * turn) * introductionRadius[index]);
        });
        canvas!.dataset.entrance = "reset";
      };
      resize();
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      window.clearTimeout(exitTimer);
      if (visible) {
        void initialize().catch(() => {
          if (!disposed) setMode("fallback");
        });
        requestDraw();
      } else {
        stopDraw();
        exitTimer = window.setTimeout(() => {
          const bounds = host.getBoundingClientRect();
          const returned = bounds.bottom > -160 && bounds.top < window.innerHeight + 160;
          if (returned) { visible = true; requestDraw(); }
          else if (!visible) rearmScene();
        }, 120);
      }
    }, { rootMargin: "160px 0px 160px 0px", threshold: 0 });
    observer.observe(host);
    const resizeObserver = new ResizeObserver(() => resizeScene());
    resizeObserver.observe(host);
    function visibilityChanged() {
      if (document.hidden) stopDraw();
      else requestDraw();
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearTimeout(exitTimer);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
      controlsRef.current = null;
      disposeScene();
    };
  }, []);

  const file = toolFiles[active];
  const ActiveIcon = objectIcons[file.kind];
  return (
    <section
      id="tools"
      lang={language}
      className={`chapter tools-chapter${lowMotion ? " is-quiet" : ""}`}
      aria-labelledby="tools-title"
    >
      <div className="chapter-inner tools-inner">
        <div className="tools-heading-line">
          <p className="chapter-kicker">{t("08 / 技能与个人兴趣", "08 / SKILLS & PERSONAL INTERESTS")}</p>
          <span>CHONEY’S PERSONAL OBJECTS</span>
        </div>
        <header className="tools-heading"><div><span className="tools-project-label">{t("IT · 音乐 · 自媒体 · 运动", "IT · MUSIC · MEDIA · SPORT")}</span><h2 id="tools-title" className="project-title">{t("技能与个人兴趣", "Skills & personal interests")}</h2></div><p className="project-summary">{t("办公工具、钢琴十级、自媒体运营与篮球。", "Excel, piano at Level 10, self-media operation and basketball.")}</p></header>
        <div className="tools-archive-layout">
          <div className="tools-scene-column">
            <div className="tools-scene-topline">
              <span>{t("四件个人物品", "FOUR PERSONAL OBJECTS")}</span>
              <span>{String(active + 1).padStart(2, "0")} / {String(toolFiles.length).padStart(2, "0")}</span>
            </div>
            <div className="tools-scene" ref={hostRef}>
              <motion.canvas
                ref={canvasRef}
                className={mode !== "webgl" ? "tools-canvas-hidden" : undefined}
                data-renderer={mode}
                initial={lowMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: sceneReady ? 1 : 0, y: sceneReady ? 0 : 16 }}
                transition={slowMotion(lowMotion ? { duration: 0 } : { duration: 0.48, ease: [0.22, 1, 0.36, 1] })}
                tabIndex={0}
                role="group"
                aria-label={t(
                  "我的三维技能与兴趣转盘，水平拖动旋转，点击物品查看，左右方向键选择",
                  "My 3D skills and interests. Drag to rotate, click an object to read, or choose with the arrow keys.",
                )}
                aria-describedby="tools-interaction-hint"
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    selectFile(
                      activeRef.current + (event.key === "ArrowRight" ? 1 : -1),
                    );
                  }
                  if (event.key === "Home") {
                    event.preventDefault();
                    selectFile(0);
                  }
                  if (event.key === "End") { event.preventDefault(); selectFile(toolFiles.length - 1); }
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpened(!opened);
                  }
                  if (event.key === "Escape") setOpened(false);
                }}
              />
              {mode !== "webgl" && (
                <motion.div className="tools-flat-file" initial={lowMotion ? false : { opacity: 0 }} animate={{ opacity: sceneReady ? 1 : 0 }} transition={slowMotion({ duration: lowMotion ? 0 : 0.35 })}>
                  <ActiveIcon size={35} strokeWidth={1} />
                  <span>{String(active + 1).padStart(2, "0")} / PERSONAL OBJECT</span>
                  <strong>{file.name}</strong>
                  <p>{file.action}</p>
                  <small>
                    {mode === "pending"
                      ? t("正在载入个人物品", "Loading my personal objects")
                      : t(
                          "选择下方条目，查看技能与兴趣",
                          "Choose an item below to read about my skills and interests",
                        )}
                  </small>
                </motion.div>
              )}
            </div>
            <div className="tools-scene-controls">
              <p id="tools-interaction-hint">
                <MoveHorizontal size={15} />
                {t(
                  "水平拖动旋转 · 点击物品查看",
                  "Drag to rotate · click an object to read",
                )}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => selectFile(active - 1)}
                  aria-label={t("上一件物品", "Previous object")}
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => selectFile(active + 1)}
                  aria-label={t("下一件物品", "Next object")}
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
          <div id="tools-work-reading" className={`tools-reading-column${opened ? " is-open" : ""}`} aria-live="polite">
            <div className="reading-switch"><AnimatePresence initial={false}>
              <motion.div
                key={opened ? active : "closed"}
                initial={{ opacity: 0, y: lowMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={slowMotion({ duration: lowMotion ? 0 : 0.2 })}
              >
                {opened ? <>
                <div className="tools-reading-header"><span className="tools-file-label">0{active + 1} / {file.label}</span><button type="button" className="tools-close" aria-label={t("收起技能与兴趣说明", "Close skill or interest notes")} onClick={() => setOpened(false)}><X size={18}/></button></div>
                <h3>{file.name}</h3>
                <p className="tools-personal-use">{file.body}</p>
                <div className="tools-use-tags">
                  {file.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                </> : <div className="tools-closed-intro"><span className="tools-file-label">{t("技能 · 实践 · 兴趣", "SKILLS · PRACTICE · INTERESTS")}</span><h3>{t("选择一件物品", "Choose an object")}</h3><p className="tools-personal-use">{t("转动转盘，查看我的技能与兴趣。", "Rotate the turntable to explore my skills and interests.")}</p><button type="button" className="tools-open-file" onClick={() => selectFile(active)}>{t("查看这件物品", "Read about this object")}<ActiveIcon size={17}/></button></div>}
              </motion.div>
            </AnimatePresence></div>
          </div>
        </div>
        <div
          className="tools-file-index"
          aria-label={t("选择技能或个人兴趣", "Choose a skill or personal interest")}
        >
          {toolFiles.map((item, index) => (
            <button
              type="button"
              key={item.name}
              aria-pressed={opened && active === index}
              aria-expanded={opened && active === index}
              aria-controls="tools-work-reading"
              onClick={() => { if (opened && active === index) setOpened(false); else selectFile(index); }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
              <ArrowUpRight size={14} />
            </button>
          ))}
        </div>
        <article className="tools-public-repository" aria-labelledby="quantpilot-title"><div><span>{t("公开项目 · 代码与文档", "PUBLIC PROJECT · CODE & DOCUMENTATION")}</span><h3 id="quantpilot-title">{t("QuantPilot — A 股研究智能体与仪表盘", "QuantPilot — A-share Research Agent & Dashboard")}</h3><p>{t("连接确定性因子、人工复核与会话记忆的 Windows 原生研究工具。", "A Windows-native research tool connecting deterministic factors, human review and session memory.")}</p><a href="https://github.com/ChoneyChen/quantpilot-a-share-agent" target="_blank" rel="noreferrer">{t("查看公开仓库", "View public repository")}<ArrowUpRight size={18}/></a></div><QuantPilotWorkflow quiet={lowMotion}/></article>

      </div>
    </section>
  );
}
