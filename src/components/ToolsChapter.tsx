import { slowMotion, PRESENTATION_SPEED } from "../lib/motionTiming";
import { useCollapseOnLeave } from "../hooks/useCollapseOnLeave";
import { useEffect, useRef, useState } from "react";
import type * as Three from "three";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  MoveHorizontal,
  X,
} from "lucide-react";
import { useI18n } from "../i18n";
import "./tools-chapter.css";

type Translate = (zh: string, en: string) => string;
const makeToolFiles = (t: Translate) => [
  {
    name: "Python / Qwen",
    cover: ["Python", "Qwen"],
    label: "MODEL EXPERIMENTS",
    action: t("训练 · 参数 · 验证", "TRAIN · TUNE · VERIFY"),
    title: t("把模型，训练到能验证。", "Train models, then test what they do."),
    body: t(
      "在 Cosmos-Loc 中，我参与 Qwen 系列的环境配置、训练参数设定、中间结果监控与多轮实验。比较数据规模、分辨率和模型规模时，我也一起看显存、吞吐量与延迟。",
      "In Cosmos-Loc, I contributed to Qwen environment setup, training parameters, intermediate result monitoring and repeated experiments. When comparing data size, resolution and model size, I also considered GPU memory, throughput and latency.",
    ),
    context: t("Cosmos-Loc · 团队研究", "Cosmos-Loc · team research"),
    link: "#cosmos",
    tags: [
      t("Qwen 系列训练", "Qwen training"),
      "LoRA",
      t("实验迭代", "Experiment iteration"),
    ],
    color: "#2347AA",
  },
  {
    name: "MATLAB / EEG",
    cover: ["MATLAB", "EEG"],
    label: "SIGNALS & METHODS",
    action: t("脑电 · CSP · 复现", "EEG · CSP · REPRODUCE"),
    title: t(
      "先留下真实输出，再解释结果。",
      "Record the output before explaining the result.",
    ),
    body: t(
      "ISA305 实验中，我使用 MATLAB、EEGLAB 与 BioSig 研究感知机和脑电运动想象分类。训练与测试先分开，CSP 和标准化参数只用训练数据拟合，再记录输出、分析并修复问题。",
      "In ISA305, I used MATLAB, EEGLAB and BioSig for perceptron experiments and EEG motor imagery classification. I separated training and test data, fitted CSP and standardisation on training data only, then recorded outputs, analysed results and fixed issues.",
    ),
    context: t("ISA305 · 人工智能课程实验", "ISA305 · AI course experiments"),
    link: "#archive",
    tags: ["MATLAB", "EEGLAB / BioSig", "CSP"],
    color: "#15514D",
  },
  {
    name: t("FastAPI / 嵌入式", "FastAPI / embedded"),
    cover: ["FastAPI", "Embedded"],
    label: "CONNECTED SYSTEMS",
    action: t("接口 · 嵌入式 · 联调", "API · EMBED · INTEGRATE"),
    title: t(
      "让接口，真正接到设备上。",
      "Connect an interface to a real device.",
    ),
    body: t(
      "在 MEC202 团队原型中，我参与本地软件、参数转换与通信控制。FastAPI 提供本地接口，Raspberry Pi 与 ESP32-S3 连接设备控制；我的工作还包括跨模块联调、测试与整合。",
      "For the MEC202 team prototype, I contributed to local software, parameter conversion and communication control. FastAPI provided local interfaces; Raspberry Pi and ESP32-S3 connected device control. I also helped debug, test and integrate modules.",
    ),
    context: t(
      "MEC202 · 团队组长与系统整合",
      "MEC202 · team leadership & integration",
    ),
    link: "#mask",
    tags: ["FastAPI", "Raspberry Pi", "ESP32-S3"],
    color: "#B63D32",
  },
  {
    name: "Document AI",
    cover: ["Document", "AI"],
    label: "DOCUMENTS & EVIDENCE",
    action: t("解析 · 抽取 · 证据", "PARSE · EXTRACT · TRACE"),
    title: t(
      "模型之间，还需要一条数据流程。",
      "Models need a data workflow between them.",
    ),
    body: t(
      "研究院实习中，我参与整合 NuExtract3、PaddleOCR-VL 与 Qwen3-Embedding，分别用于结构化抽取、文档理解和语义匹配。原始文字、表格、结构化记录与证据关联一起进入工程流程。",
      "During my research institute internship, I helped integrate NuExtract3, PaddleOCR-VL and Qwen3-Embedding for structured extraction, document understanding and semantic matching. Source text, tables, structured records and evidence links all belong in the engineering workflow.",
    ),
    context: t("ESG AI · 研究院实习", "ESG AI · research institute internship"),
    link: "#esg",
    tags: ["NuExtract3", "PaddleOCR-VL", "Qwen3-Embedding"],
    color: "#6C183C",
  },
  {
    name: "SUPS / SVL",
    cover: ["SUPS", "SVL"],
    label: "CONTROLLED SPACES",
    action: t("场景 · 编号 · 几何", "SCENES · LABELS · GEOMETRY"),
    title: t(
      "把研究问题，放进可控制的空间。",
      "Give research a controlled space.",
    ),
    body: t(
      "我跑通基于 SUPS 的仿真链路，并参与扩展现有停车场场景。补充车位编号与屋顶结构，继续推进导向标志和 A/B 分区的空间一致性，为感知与定位研究准备可控制的条件。",
      "I ran the SUPS simulation pipeline and helped extend an existing parking scene with space numbers and roof structures. I continue to work on the spatial consistency of direction signs and A/B zones, preparing controlled conditions for perception and localisation research.",
    ),
    context: t("SUPS / SVL · 场景扩展", "SUPS / SVL · scene extension"),
    link: "#sups",
    tags: [
      t("现有场景扩展", "Existing scene extension"),
      t("语义地标", "Semantic landmarks"),
      t("几何一致性", "Geometric consistency"),
    ],
    color: "#254CC7",
  },
  {
    name: t("Python / 统计", "Python / statistics"),
    cover: ["Python", "Statistics"],
    label: "EVERYDAY DATA",
    action: t("回归 · 检验 · 残差", "REGRESS · TEST · RESIDUALS"),
    title: t(
      "让日常问题，也能被数据检验。",
      "Test everyday questions with data.",
    ),
    body: t(
      "LIF001 食堂客流项目中，我参与 Python 数据清洗、特征工程与多元线性回归。把天气、日期等信息编码成数值，再通过 R²、F 检验与残差检查，研究它们和客流之间的关系。",
      "For the LIF001 canteen footfall project, I contributed to Python data cleaning, feature engineering and multiple linear regression. I encoded weather and dates as numerical features, then used R², F-tests and residual checks to study their relationship with footfall.",
    ),
    context: t("LIF001 · 校园食堂客流预测", "LIF001 · campus canteen footfall"),
    link: "#origins",
    tags: [
      "Python",
      t("多元线性回归", "Multiple linear regression"),
      t("统计检验", "Statistical tests"),
    ],
    color: "#F2D169",
  },
];
type ToolFile = ReturnType<typeof makeToolFiles>[number];

type ArchiveControl = {
  select: (index: number) => void;
  setQuiet: (quiet: boolean) => void;
  updateFiles: (files: ToolFile[]) => void;
};

// Interaction references: Three.js r180 Raycaster and rendering-on-demand manual.
// All book geometry and cover artwork below are original; no external models are loaded.
function paintBookCover(
  surface: HTMLCanvasElement,
  index: number,
  file: ToolFile,
) {
  const context = surface.getContext("2d")!;
  const coverColors = [
    {
      paper: "#FFF4D7",
      ink: "#2347AA",
      grid: "#2347AA26",
      footerInk: "#FFF4D7",
    },
    {
      paper: "#F2D169",
      ink: "#103338",
      grid: "#10333826",
      footerInk: "#FFF4D7",
    },
    {
      paper: "#2347AA",
      ink: "#FFF4D7",
      grid: "#FFF4D726",
      footerInk: "#FFF4D7",
    },
    {
      paper: "#DDF3E4",
      ink: "#6C183C",
      grid: "#6C183C26",
      footerInk: "#FFF4D7",
    },
    {
      paper: "#F2D169",
      ink: "#103338",
      grid: "#254CC726",
      footerInk: "#FFF4D7",
    },
    {
      paper: "#103338",
      ink: "#FFF4D7",
      grid: "#FFF4D726",
      footerInk: "#103338",
    },
  ][index];
  context.fillStyle = coverColors.paper;
  context.fillRect(0, 0, 512, 768);
  context.fillStyle = file.color;
  context.fillRect(0, 0, 22, 768);
  context.strokeStyle = coverColors.grid;
  context.lineWidth = 1;
  for (let x = 62; x <= 450; x += 97) {
    context.beginPath();
    context.moveTo(x, 156);
    context.lineTo(x, 580);
    context.stroke();
  }
  context.fillStyle = coverColors.ink;
  context.font = '23px "IBM Plex Mono", monospace';
  context.fillText("CHONEY / WORK FILE", 53, 66);
  context.font = '50px "Space Grotesk", sans-serif';
  context.fillText(String(index + 1).padStart(2, "0"), 402, 116);
  context.fillRect(53, 138, 397, 2);
  context.font = '600 73px "Space Grotesk", sans-serif';
  file.cover.forEach((line, lineIndex) => {
    const size = line.length > 8 ? 56 : 73;
    context.font = `600 ${size}px "Space Grotesk", sans-serif`;
    context.fillText(line, 48, 292 + lineIndex * 94, 410);
  });
  context.font = '20px "IBM Plex Mono", monospace';
  context.fillText(file.label, 52, 491, 409);
  context.fillStyle = file.color;
  context.fillRect(0, 600, 512, 168);
  context.fillStyle = coverColors.footerInk;
  context.font = '30px "Space Grotesk", "PingFang SC", sans-serif';
  context.fillText(file.action, 45, 661, 420);
  context.font = '20px "IBM Plex Mono", monospace';
  context.fillText("TOOLS WITH A CONTEXT", 45, 721);
}

function makeBookTexture(THREE: typeof Three, index: number, file: ToolFile) {
  const surface = document.createElement("canvas");
  surface.width = 512;
  surface.height = 768;
  paintBookCover(surface, index, file);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

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
    controlsRef.current?.updateFiles(filesRef.current);
  }, [language]);

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
      const books: Three.Mesh<
        Three.BoxGeometry,
        Three.MeshStandardMaterial[]
      >[] = [];
      const coverTextures: Three.CanvasTexture[] = [];
      const geometries: Three.BufferGeometry[] = [];
      const materials: Three.Material[] = [];
      const radius = 1.46;
      const turn = (Math.PI * 2) / toolFiles.length;
      const bookGeometry = new THREE.BoxGeometry(1.06, 1.62, 0.22);
      geometries.push(bookGeometry);
      filesRef.current.forEach((file, index) => {
        const texture = makeBookTexture(THREE, index, file);
        coverTextures.push(texture);
        const side = new THREE.MeshStandardMaterial({
          color: "#FFF4D7",
          roughness: 0.83,
        });
        const binding = new THREE.MeshStandardMaterial({
          color: file.color,
          roughness: 0.66,
          metalness: 0.16,
        });
        const cover = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.82,
          metalness: 0.03,
        });
        materials.push(side, binding, cover);
        const book = new THREE.Mesh(bookGeometry, [
          side,
          binding,
          side,
          side,
          cover,
          binding,
        ]);
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
            if (!quietRef.current && introductionElapsed < index * 0.065) {
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
        const hit = raycaster.intersectObjects(books, false)[0];
        return hit ? (hit.object.userData.fileIndex as number) : null;
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
        updateFiles(files) {
          files.forEach((file, index) => {
            const texture = coverTextures[index];
            paintBookCover(texture.image as HTMLCanvasElement, index, file);
            texture.needsUpdate = true;
          });
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
      setMode("webgl");
      resize();
    }

    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        void initialize().catch(() => {
          if (!disposed) setMode("fallback");
        });
        requestDraw();
      } else stopDraw();
    });
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
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", visibilityChanged);
      controlsRef.current = null;
      disposeScene();
    };
  }, []);

  const file = toolFiles[active];
  return (
    <section
      id="tools"
      lang={language}
      className={`chapter tools-chapter${lowMotion ? " is-quiet" : ""}`}
      aria-labelledby="tools-title"
    >
      <div className="chapter-inner tools-inner">
        <div className="tools-heading-line">
          <p className="chapter-kicker">10 / TOOLS IN MY WORK</p>
          <span>CHONEY CHEN’S WORKING LIBRARY</span>
        </div>
        <header className="tools-heading">
          <h2 id="tools-title">
            {t("工具的名字之外，", "Behind the tools,")}
            <br />
            {t("是我", "there is ")}
            <span>{t("怎样用它。", "the work.")}</span>
          </h2>
          <p>
            {t("六册工作档案。", "Six files from my work. ")}
            <br />
            {t(
              "每一本都连着一段真实经历。",
              "Each opens onto a real experience.",
            )}
          </p>
        </header>
        <div className="tools-archive-layout">
          <div className="tools-scene-column">
            <div className="tools-scene-topline">
              <span>PERSONAL TOOL ARCHIVE</span>
              <span>{String(active + 1).padStart(2, "0")} / 06</span>
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
                  "我的三维工具档案，水平拖动旋转，点击书册阅读，左右方向键选择档案",
                  "My 3D tool archive. Drag horizontally to rotate, click a book to read, or use the left and right arrow keys to choose a file.",
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
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setOpened(!opened);
                  }
                  if (event.key === "Escape") setOpened(false);
                }}
              />
              {mode !== "webgl" && (
                <motion.div className="tools-flat-file" initial={lowMotion ? false : { opacity: 0 }} animate={{ opacity: sceneReady ? 1 : 0 }} transition={slowMotion({ duration: lowMotion ? 0 : 0.35 })}>
                  <BookOpen size={35} strokeWidth={1} />
                  <span>{String(active + 1).padStart(2, "0")} / WORK FILE</span>
                  <strong>{file.name}</strong>
                  <p>{file.action}</p>
                  <small>
                    {mode === "pending"
                      ? t("正在打开我的工具档案", "Opening my tool archive")
                      : t(
                          "选择下方档案，继续阅读",
                          "Choose a file below to keep reading",
                        )}
                  </small>
                </motion.div>
              )}
            </div>
            <div className="tools-scene-controls">
              <p id="tools-interaction-hint">
                <MoveHorizontal size={15} />
                {t(
                  "水平拖动旋转 · 点书册阅读",
                  "Drag to rotate · click a book to read",
                )}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => selectFile(active - 1)}
                  aria-label={t("上一册工具档案", "Previous tool file")}
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => selectFile(active + 1)}
                  aria-label={t("下一册工具档案", "Next tool file")}
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
          <div id="tools-work-reading" className={`tools-reading-column${opened ? " is-open" : ""}`} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                layout={!lowMotion}
                key={opened ? active : "closed"}
                initial={{ opacity: 0, y: lowMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={slowMotion({ duration: lowMotion ? 0 : 0.2 })}
              >
                {opened ? <>
                <div className="tools-reading-header"><span className="tools-file-label">FILE {String(active + 1).padStart(2, "0")} / {file.label}</span><button type="button" className="tools-close" aria-label={t("合上工作档案", "Close work file")} onClick={() => setOpened(false)}><X size={18}/></button></div>
                <h3>{file.name}</h3>
                <h4>{file.title}</h4>
                <p className="tools-personal-use">{file.body}</p>
                <div className="tools-use-tags">
                  {file.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a className="tools-context-link" href={file.link}>
                  <span>
                    <small>{t("关联经历", "RELATED EXPERIENCE")}</small>
                    {file.context}
                  </span>
                  <ArrowUpRight size={19} />
                </a>
                </> : <div className="tools-closed-intro"><span className="tools-file-label">{t("六册档案 · 六段实践", "SIX FILES · SIX EXPERIENCES")}</span><h3>{t("工具，也有来处。", "Every tool has a context.")}</h3><p className="tools-personal-use">{t("从模型训练到系统联调。打开一册，看看我怎样把工具用进项目。", "From model training to system integration. Open a file to see how I used the tools in a project.")}</p><button type="button" className="tools-open-file" onClick={() => selectFile(active)}>{t("打开这册档案", "Open this file")}<BookOpen size={17}/></button></div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div
          className="tools-file-index"
          aria-label={t("按工具选择我的工作档案", "Choose a work file by tool")}
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
        <div className="tools-closing">
          <p>{t("模型 · 信号 · 接口 · 文档 · 空间 · 数据", "Models · signals · interfaces · documents · spaces · data")}</p>
          <a className="chapter-link" href="#archive">
            {t("回到我的完整经历", "Explore my complete experience")}{" "}
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
