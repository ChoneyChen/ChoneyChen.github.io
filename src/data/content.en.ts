import {
  experienceTimeline as chineseExperiences,
  projects as chineseProjects,
  profile as chineseProfile,
  type Experience,
  type Project,
} from "./content";

export const profile = {
  ...chineseProfile,
  name: "Tianyi Chen",
  title: "Helping machines read reality. Keeping results open to scrutiny.",
  tagline: "Find clues, build understanding, make it a system.",
  introduction:
    "I am Tianyi Chen, a Computer Science and Technology undergraduate at Xi’an Jiaotong-Liverpool University. I work on visual and spatial perception, and bring AI into environmental data, sensors, and engineering prototypes. I want to understand how a result was obtained, where it fails, and how to verify it.",
  education: {
    ...chineseProfile.education,
    university: "Xi’an Jiaotong-Liverpool University",
    programmeChinese: "Computer Science and Technology",
    stage: "Stage 4 · Final undergraduate year",
    period: "2023 — 2027 (expected graduation)",
  },
  interests: [
    "Multimodal AI",
    "Visual and spatial perception",
    "Autonomous driving",
    "Environmental AI",
    "Scientific data",
  ],
  nextQuestions: [
    "How can the visual priors of generative models become reliable perception?",
    "What does a system still know in an environment it has never seen?",
    "What does it take to make environmental data traceable and comparable?",
  ],
  links: chineseProfile.links.map((link) => ({
    ...link,
    label: link.label === "GitHub" ? "GitHub" : "Homepage source",
  })),
};

const projectCopy: Record<string, Partial<Project>> = {
  cosmos: {
    subtitle: "Visual localisation in underground car parks",
    question: "When everything looks alike, where am I?",
    status: "Team experiments reported",
    role: "Research team member · Qwen training and experimental analysis",
    description:
      "Underground car parks lack reliable GPS, while repetitive pillars and corridors can confuse visual localisation. I help investigate whether numbers, signs, and spatial clues in a single RGB image can help a vision-language model estimate a vehicle’s position and orientation.",
    contributions: [
      "Screened driving and car-park datasets, checking pose ground truth, scene suitability, and training feasibility.",
      "Contributed to model selection and fine-tuning; my main work covers Qwen environments, parameters, monitoring, and experimental iteration.",
      "Compared the effects of dataset size, learning rate, image resolution, and model size on localisation.",
      "Analysed accuracy, memory use, throughput, and latency to assess performance alongside computational cost.",
    ],
    results: [
      {
        label: "Test images",
        value: "3,497",
        note: "Team experimental setting",
      },
      {
        label: "Accuracy within 0.25 m",
        value: "97.14%",
        note: "Team-reported Cosmos-Reason2 + LoRA result",
      },
      {
        label: "Accuracy within 0.5 m",
        value: "99.49%",
        note: "The same team experimental setting",
      },
    ],
    boundary:
      "These are team results under a particular experimental setting. My main contribution is Qwen training and repeated experiments, rather than sole authorship of the full Cosmos evaluation. These metrics do not establish generalisation across car parks. Development evaluations and the final test must be distinguished.",
  },
  glimpse: {
    subtitle: "Generative open-vocabulary and spatial perception · FYP",
    question: "Can a generated answer be read by a program?",
    year: "2026.08/09 — present",
    status: "Undergraduate dissertation in progress",
    role: "Undergraduate researcher · Supervised by Gordon Owusu Boateng",
    description:
      "I investigate whether pretrained image generators can turn their semantic and geometric priors into decodable perception. Given an image and a language instruction, the output should be pixel-aligned and explicitly represent target absence. Underground car parks provide a target domain for studying generalisation to unseen environments.",
    contributions: [
      "Developing an open-vocabulary detection topic into a unified framework for segmentation, depth, and spatial perception.",
      "Designing task representations from RGB and language to structured visual output and deterministic decoding.",
      "Exploring strip-assisted segmentation, with generation strategy and 2D/3D representation as independent research axes.",
      "Reviewing literature and datasets, and designing train/test protocols for class transfer, domain transfer, and absent targets.",
    ],
    results: [
      {
        label: "Work developed",
        value: "Framework and experiment design",
        note: "Literature, tasks, data splits, and system model",
      },
      {
        label: "Two research axes",
        value: "How to generate / How to represent",
        note: "Can be explored and validated independently",
      },
      {
        label: "Next step",
        value: "Training and quantitative validation",
        note: "Segmentation decoding and cross-domain performance remain to be tested",
      },
    ],
    boundary:
      "The formal topic is Image-Generation-Based Open-Vocabulary Object Detection for Driving Environment Perception in Underground Parking Lots. Strip methods, latent/token decoding, semantic point clouds, BEV, and occupancy are research directions. Complete final experiments and published papers are not yet available.",
  },
  esg: {
    subtitle: "Document intelligence and environmental data",
    question: "How does a number acquire its evidence?",
    year: "2026.07 — present",
    status: "Internship and platform development in progress",
    role: "AI & Data Analytics Intern · Research Institute for Environmental Innovation (Suzhou), Tsinghua University",
    description:
      "Environmental reports contain plenty of numbers. The challenge is identifying the entity, reporting period, unit, and boundary behind each one. I help connect PDF parsing, extraction, standardisation, and evidence tracing so a record can be checked before it is compared.",
    contributions: [
      "Contributing to the integration of NuExtract3, PaddleOCR-VL, and Qwen3-Embedding for document understanding, extraction, and semantic matching.",
      "Building the PDF-to-structured-record workflow and linking source text and tables to extracted results.",
      "Supporting environmental indicator cleaning, definition standardisation, databases, and analysis platform development.",
      "Working on batch processing, local model deployment, and compute planning while preserving versions and review boundaries.",
    ],
    results: [
      {
        label: "Report task scale",
        value: "20,000+",
        note: "The planned processing workload, not the number already parsed",
      },
      {
        label: "Engineering chain",
        value: "Source → Extraction → Evidence",
        note: "Multiple local engineering modules developed",
      },
      {
        label: "Current focus",
        value: "Correct inclusion and comparability",
        note: "Preserve entity, period, unit, and boundary for priority indicators",
      },
    ],
    boundary:
      "Real quality evaluation, a complete review and release loop, and production deployment remain necessary. Public demonstration data is not a real extraction result. I do not claim all reports have been processed, a final accuracy, or a causal relationship between ESG and financial performance.",
    links: [
      {
        label: "Public code",
        url: chineseProjects.find((p) => p.id === "esg")!.links![0].url,
      },
    ],
  },
  mask: {
    title: "Intelligent phototherapy mask",
    subtitle: "From visual analysis to dependable control · MEC202",
    question: "After a model advises, how does a system act?",
    status: "Engineering prototype completed · Excellence Award",
    role: "Team leader · Software, embedded systems, and integration",
    description:
      "Our team brought visual analysis, software, wireless control, and sensors into a demonstrable prototype. As team leader, I considered how recommendations become control parameters, how feedback returns, and when the system should stop.",
    contributions: [
      "Coordinated task allocation, progress, integration, staged testing, and delivery.",
      "Contributed to translating visual analysis into structured control parameters, and to interface, backend, and local control development.",
      "Helped integrate Raspberry Pi, ESP32-S3, LED/heating modules, and distance and temperature sensors.",
      "Contributed to prototype modelling, assembly, and cross-module debugging; continued improvements and competition preparation after the course.",
    ],
    results: [
      { label: "Course mark", value: "79", note: "MEC202 engineering project" },
      {
        label: "Competition result",
        value: "Excellence Award",
        note: "2026 China–US Young Maker Competition · Suzhou selection, main track",
      },
      {
        label: "Prototype chain",
        value: "Vision → Parameters → Control → Feedback",
        note: "A demonstrable team engineering prototype",
      },
    ],
    boundary:
      "This is a team achievement. The work concerns an engineering prototype, systems integration, and control safeguards; it makes no claim of clinical efficacy or medical certification.",
    links: [
      {
        label: "Public code",
        url: chineseProjects.find((p) => p.id === "mask")!.links![0].url,
      },
    ],
  },
  sups: {
    subtitle: "A controllable underground car park",
    question: "Change a sign. Does the space still make sense?",
    year: "2026.09 — present",
    status: "Simulation and data engineering in progress",
    role: "Simulation developer and research participant",
    description:
      "To study environmental changes and failure cases, I help extend a car-park simulation. Numbers, roofs, and directional signs must agree with zones and geometry before they can serve as useful perception and localisation cues.",
    contributions: [
      "Ran the baseline SUPS simulation workflow and extended the existing scene.",
      "Added parking-space numbers and roof structures to approximate an enclosed car park.",
      "Investigated consistency between wayfinding, A/B zones, and arrow directions.",
      "Explored controllable scenes to support localisation and unseen-domain perception evaluation.",
    ],
    results: [
      {
        label: "Progress",
        value: "Baseline workflow running",
        note: "Actual development records for the baseline scene",
      },
      {
        label: "Scene extensions",
        value: "Numbering and architecture",
        note: "Wayfinding and zone relationships remain in development",
      },
    ],
    boundary:
      "This extends an existing simulation platform rather than building a simulator from scratch. A complete sample count, unified annotations, full export, and public dataset release have not been confirmed.",
  },
  avpc: {
    title: "AVPC collaborative perception",
    subtitle: "From separate perspectives to shared constraints",
    question: "Do different views automatically make a correct answer?",
    year: "2026 — present",
    status: "Ongoing research direction in the supervisor’s team",
    role: "Research participant · Gordon Owusu Boateng’s team",
    description:
      "Vehicles, the environment, and maps each provide a partial view. This direction explores sharing these clues for reliable automated valet parking and resource optimisation. I contribute to data, methods, and simulation, including how a system represents conflicting observations.",
    contributions: [
      "Screened datasets with vehicle position or pose ground truth, checking training and validation conditions.",
      "Participated in discussions on semantic landmarks, map constraints, perception, and localisation.",
      "Explored simulations for complex, ambiguous, and long-tail conditions, feeding failures into new data.",
      "Contributed to a framework linking structured perception, spatial consistency, and collaborative decisions.",
    ],
    results: [
      {
        label: "Research framework",
        value: "Perception → Localisation → Collaboration",
        note: "Each module requires separate validation",
      },
      {
        label: "Iteration concept",
        value: "Failure → New scene → Revalidation",
        note: "Red/blue-team and closed-loop learning directions",
      },
    ],
    boundary:
      "A complete parking-resource optimisation system and quantified benefits have not been confirmed. This relates to Cosmos-Loc and my FYP, but localisation metrics are not results for collaborative optimisation.",
  },
};

export const projects: Project[] = chineseProjects.map((project) => ({
  ...project,
  ...projectCopy[project.id],
}));

const experienceCopy: Record<string, Partial<Experience>> = {
  education: {
    year: "2023.09 — 2027.06 (expected)",
    title: "Xi’an Jiaotong-Liverpool University",
    role: "Undergraduate · Currently Stage 4",
    status: "Enrolled",
    description:
      "Starting with programming, data structures, and statistical modelling, I gradually moved toward multimodal vision, spatial perception, and environmental AI. My coursework includes software, networking, computer systems, mathematics, and embedded systems.",
  },
  lif001: {
    title: "Campus canteen footfall prediction",
    subtitle: "LIF001 · Using data to understand the everyday",
    role: "Major contributor to the topic, modelling, and data processing",
    status: "Course project completed",
    description:
      "Cleaned data in Python, encoded weather and date features, and built multiple linear regression models. Used R², F-tests, and residual checks to study the relationship between footfall, weekdays, weather, and temperature.",
    boundary:
      "Methods and contributions are retained; unrecorded R² values or prediction errors are not invented.",
  },
  kaiding: {
    year: "Summer 2024",
    title: "Kaiding Power IT internship",
    subtitle: "Shiyan Kaiding Power Technology Co., Ltd.",
    status: "Internship completed",
    description:
      "Contributed to production-management software development and maintenance, frontend/backend integration, database checks, and functional testing. Also worked on system configuration, troubleshooting, Git collaboration, task records, and technical documentation.",
    boundary:
      "Historical records give an end date in August or 1 September. Formal dates should follow the internship certificate.",
  },
  "surf-wearable": {
    title: "Parkinson’s monitoring · Wearable data collection",
    subtitle: "SURF · Reliable research starts with reliable data",
    role: "Research participant · Data collection and quality assurance",
    status: "Data collection work completed",
    description:
      "Prepared and calibrated Shimmer3 IMU/ExG devices and collected motion and electrophysiological signals. Checked connections and data in real time, investigated anomalies, and retained reliable raw records for later monitoring research.",
    boundary:
      "My role was collection and quality assurance; I do not claim disease-classification accuracy or diagnostic model results.",
  },
  can201: {
    year: "2025 · Exact semester to be checked",
    subtitle: "CAN201 · Team delivery and a research starting point",
    role: "Group leader",
    status: "Course project completed",
    description:
      "Led the networking coursework team and completed its delivery, earning a coursework mark of 82.5. Gordon taught this course, which became the starting point for our later research collaboration.",
    boundary:
      "The project title and technical details require the original report.",
  },
  "cosmos-research": {
    title: "Cosmos-Loc visual localisation research",
    subtitle: "From research review to model experiments",
    role: "Gordon’s team · Qwen training and experiments",
    status: "Team experiments reported",
    description:
      "Starting with winter-break data and model research, I contributed to Qwen training, parameter iteration, and localisation evaluation, comparing data coverage, model sizes, and computational costs.",
  },
  "surf-parking": {
    title: "Underground car-park multimodal localisation SURF",
    subtitle: "Research associated with Cosmos-Loc",
    role: "Research participant",
    status: "Related experience",
    description:
      "Research on visual cues, map constraints, pose inference, and evaluation in GPS-denied environments. This overlaps with the work and results of Cosmos-Loc.",
    boundary:
      "The project relationship needs further checking. The same localisation experiments are not counted as independent achievements.",
  },
  mec202: {
    title: "Intelligent phototherapy mask",
    subtitle: "MEC202 · Connecting modules into one system",
    role: "Team leader",
    status: "Prototype completed",
    description:
      "Coordinated AI, software, embedded systems, hardware, and prototype structure, contributing to integration and testing. Course mark: 79. The team continued improvements and competition preparation after the course.",
  },
  "maker-award": {
    title: "China–US Young Maker Competition · Excellence Award",
    subtitle: "Suzhou selection · Main track",
    role: "Phototherapy mask team leader",
    status: "Team award",
    description:
      "Led the mask team in improving the system after course delivery and received an Excellence Award in the main track of the 2026 China–US Young Maker Competition’s Suzhou selection.",
    boundary:
      "A competition result for the same prototype, rather than a separate new project.",
  },
  "esg-internship": {
    year: "2026.07 — present",
    title: "Environmental AI and data analytics internship",
    subtitle:
      "Research Institute for Environmental Innovation (Suzhou), Tsinghua University",
    status: "In progress",
    description:
      "Contributing to ESG document parsing, model integration, indicator standardisation, evidence linking, and the data platform, including engineering challenges in batch processing and local deployment.",
  },
  fyp: {
    year: "2026.08/09 — present",
    title: "U-GLIMPSE undergraduate dissertation",
    subtitle: "PSP305 / FYP · From generation to perception",
    role: "Undergraduate dissertation researcher",
    status: "Research in progress",
    description:
      "Exploring decodable open-vocabulary visual outputs, pixel-level semantics, and metric geometry. Developing the topic, literature review, system model, and unseen-domain experiment design.",
    boundary:
      "The methods and 3D representation routes require training and quantitative validation.",
  },
  "avpc-research": {
    year: "2026 — present",
    title: "AVPC collaborative perception and parking resources",
    subtitle: "An ongoing direction in my supervisor’s team",
    role: "Research participant",
    status: "Research in progress",
    description:
      "Contributing to dataset screening, perception/localisation methods, and simulation, studying shared local observations, spatial consistency, and iteration through failure cases.",
  },
  "sups-simulation": {
    year: "2026.09 — present",
    title: "SUPS / SVL scene extensions",
    subtitle: "Keeping semantic landmarks consistent with geometry",
    role: "Development and research participant",
    status: "Engineering in progress",
    description:
      "Ran the simulation workflow, added space numbering and roofs, and continued work on signs, zone relationships, and controllable data scenes.",
  },
  isa305: {
    year: "2026.09 — present",
    title: "Artificial intelligence and MATLAB experiments",
    subtitle: "ISA305 · Keep real outputs, then interpret results",
    role: "Student · Experiment implementer",
    status: "Course experiments in progress",
    description:
      "Studying perceptrons, EEG motor-imagery classification, and CSP. Week 4 used 100 training and 44 test trials. Test accuracy was 77.27% at a learning rate of 0.01; CSP and standardisation were fitted on training data only.",
    boundary:
      "These are specific coursework experiments, not a measure of clinical diagnostic performance.",
  },
  "stock-tool": {
    year: "Personal tools · Ongoing iteration",
    title: "Traceable article-research workflow",
    subtitle: "A personal method experiment · Time is part of evidence",
    role: "Personal tool use and development",
    status: "Tool iteration in progress",
    description:
      "A research workflow built around article archiving, method logs, and temporal boundaries: retain sources and conditions so later information cannot quietly rewrite an earlier judgement.",
    boundary:
      "Presented as a method experiment. No returns, holdings, or stock recommendations are shown; the static observation desk is not described as a reliable live market feed.",
  },
};

export const experienceTimeline: Experience[] = chineseExperiences.map(
  (experience) => ({ ...experience, ...experienceCopy[experience.id] }),
);
