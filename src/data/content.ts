export type ProjectId = 'cosmos' | 'glimpse' | 'esg' | 'mask' | 'sups' | 'avpc'

export interface ContentLink {
  label: string
  url: string
}

export interface ProjectResult {
  label: string
  value: string
  note?: string
}

export interface Project {
  id: ProjectId
  number: string
  title: string
  subtitle: string
  question: string
  year: string
  status: string
  tags: string[]
  role: string
  description: string
  contributions: string[]
  results: ProjectResult[]
  boundary: string
  accent: string
  links?: ContentLink[]
}

export interface Experience {
  id: string
  year: string
  title: string
  subtitle: string
  role: string
  status: string
  description: string
  tags: string[]
  projectId?: ProjectId
  boundary?: string
  links?: ContentLink[]
}

export const profile = {
  name: '陈天一',
  englishName: 'Tianyi Chen',
  displayName: 'Choney Chen',
  initials: 'CC',
  title: '让机器读懂现实，让结果经得起检查。',
  tagline: '寻找线索，建立理解，把它做成系统。',
  introduction:
    '我是陈天一，西交利物浦大学计算机科学与技术专业的本科生。我研究视觉与空间感知，也把人工智能带进环境数据、传感器和软硬件原型。比起一个看起来正确的答案，我更想知道它怎样得到、在哪里失效，以及如何被验证。',
  education: {
    university: '西交利物浦大学',
    universityEnglish: 'Xi’an Jiaotong-Liverpool University',
    abbreviation: 'XJTLU',
    programme: 'Computer Science and Technology',
    programmeChinese: '计算机科学与技术',
    degree: 'BEng',
    stage: 'Stage 4 · 本科最后一年',
    period: '2023 — 2027（预计毕业）',
  },
  mentor: 'Gordon Owusu Boateng',
  interests: ['多模态人工智能', '视觉与空间感知', '自动驾驶', '环境 AI', '科学数据'],
  nextQuestions: [
    '生成模型学到的视觉先验，能怎样变成可靠的感知？',
    '换一个没见过的环境，系统还知道什么？',
    '让环境数据可追溯、可比较，究竟需要哪些条件？',
  ],
  links: [
    { label: 'GitHub', url: 'https://github.com/ChoneyChen' },
    { label: '主页源码', url: 'https://github.com/ChoneyChen/ChoneyChen.github.io' },
  ] satisfies ContentLink[],
}

export const projects: Project[] = [
  {
    id: 'cosmos',
    number: '01',
    title: 'Cosmos-Loc',
    subtitle: '地下停车场的视觉定位',
    question: '在看起来一样的地方，我在哪里？',
    year: '2025.12 — 2026.09',
    status: '已有团队实验结果',
    tags: ['VLM', 'LoRA', 'Visual Localisation'],
    role: '研究团队成员 · Qwen 训练与实验分析',
    description:
      '地下停车场没有可靠的 GPS，重复的柱子和走廊又容易让视觉迷路。我参与研究：一张 RGB 图像里的编号、标志与空间线索，能否帮助视觉语言模型判断车辆的位置和朝向。',
    contributions: [
      '筛选自动驾驶与停车场数据集，检查位姿真值、场景适配和训练可行性。',
      '参与模型选择与微调方案；重点负责 Qwen 系列的环境、参数、过程监控和实验迭代。',
      '比较数据规模、学习率、图像分辨率与模型规模对定位表现的影响。',
      '分析精度、显存、吞吐量和延迟，让性能与计算代价一起被看见。',
    ],
    results: [
      { label: '测试图像', value: '3,497', note: '项目团队实验设置' },
      {
        label: '0.25 m 阈值内准确率',
        value: '97.14%',
        note: '团队报告的 Cosmos-Reason2 + LoRA 结果',
      },
      {
        label: '0.5 m 阈值内准确率',
        value: '99.49%',
        note: '同一团队实验设置',
      },
    ],
    boundary:
      '这些是特定设置下的团队结果；我的主要工作是 Qwen 训练和多轮实验。它们不代表我独立完成全部 Cosmos 实验，也不能直接说明跨停车场泛化。历史开发评测与最终测试需区分。',
    accent: '#B9AED6',
  },
  {
    id: 'glimpse',
    number: '02',
    title: 'U-IMPROVE',
    subtitle: '图像生成驱动的开放词汇语义与几何感知 · FYP',
    question: '画出感知结果，也能明确说「不存在」吗？',
    year: '2026.08/09 — 至今',
    status: '本科毕业研究进行中',
    tags: ['Generative Perception', 'Metadata Strip', 'Metric Geometry'],
    role: '本科毕业设计研究者 · Gordon Owusu Boateng 指导',
    description:
      '我研究预训练图像生成模型能否成为共享的感知骨干：仅接收 RGB 图像与自然语言指令，生成可确定性解码、像素对齐的分割、度量深度与表面法线。Presence-Aware Metadata Strip 显式区分目标存在、不存在与不确定；语义与几何再结合相机内参，抬升为可按语言查询的三维场景。地下停车场是检验跨环境与开放词汇泛化的重点目标域。',
    contributions: [
      '提出 Presence-Aware Metadata Strip 输出协议，将开放词汇分割的目标状态编码为 present、absent、uncertain 三态。',
      '设计共享图像生成骨干与 RGB 任务编码，经确定性解码获得查询分割、度量深度和表面法线；由掩码导出检测框。',
      '设计语义与几何融合及基于相机内参 K 的度量三维抬升；扩散与自回归生成路线作为待比较方案。',
      '推进一般场景、道路与地下停车场的训练测试协议，区分感知微调中已见/未见类别、固定/自然查询和正/负查询；计划以 FPR、IoU 与 AbsRel 评估。',
    ],
    results: [
      { label: '输出协议', value: 'present / absent / uncertain', note: '提出的 Presence-Aware Metadata Strip 三态机制' },
      { label: '共享任务接口', value: '分割 / 度量深度 / 法线', note: 'RGB 编码输出 → 确定性解码 → 语义与几何融合' },
      { label: '评估计划', value: 'FPR / IoU / AbsRel', note: '负查询、分割与深度表现仍待训练和定量验证' },
    ],
    boundary:
      '正式课题为 Image-Generation-Based Open-Vocabulary Object Detection for Driving Environment Perception in Underground Parking Lots。U-IMPROVE 是拟议研究框架，Metadata Strip、跨域与类别泛化及三维语义点云均待实验验证；相机内参 K 是三维抬升的标定信息。BEV、体素与占据表示为后续扩展，多帧融合方案尚待选择。文献的数值不是本人的实验结果；当前未提供完整最终实验结果或已发表论文。',
    accent: '#C5CE91',
  },
  {
    id: 'esg',
    number: '03',
    title: 'ESG AI',
    subtitle: '文档智能与环境数据平台',
    question: '一个数字，怎样获得自己的证据？',
    year: '2026.07 — 至今',
    status: '实习与平台建设进行中',
    tags: ['Document AI', 'Evidence Linking', 'Environmental Data'],
    role: '清华大学苏州环境创新研究院 · AI 与数据分析实习生',
    description:
      '企业环境报告里不缺数字，难的是知道它属于谁、哪个期间、什么单位和统计边界。我参与把 PDF 解析、指标抽取、标准化和证据回溯连成系统，让一项数据能够被检查，再谈比较。',
    contributions: [
      '参与整合 NuExtract3、PaddleOCR-VL 与 Qwen3-Embedding，处理文档理解、抽取和语义匹配。',
      '建设 PDF 到结构化记录的流程，把原始文字、表格与抽取结果关联起来。',
      '参与环境指标清洗、口径标准化和数据库、分析平台建设。',
      '关注批量处理、模型本地部署与计算资源安排，保留数据版本和审核边界。',
    ],
    results: [
      {
        label: '面对的报告规模',
        value: '20,000+',
        note: '项目处理任务规模，非已完成解析数量',
      },
      { label: '工程链路', value: '来源 → 抽取 → 证据', note: '多模块本地工程已建设' },
      { label: '当前重点', value: '准确纳入与可比较', note: '优先重点指标，保留主体、期间、单位和边界' },
    ],
    boundary:
      '项目仍需真实质量评测、完整审核发布闭环与生产部署。公开演示数据不等于真实抽取结果；尚不声称已处理全部报告、最终准确率，或 ESG 与财务表现之间的因果关系。',
    accent: '#BD806A',
    links: [{ label: '公开代码', url: 'https://github.com/ChoneyChen/ESG_DATA_PLATFORM' }],
  },
  {
    id: 'mask',
    number: '04',
    title: '智能光疗面罩',
    subtitle: '从视觉分析到可靠控制 · MEC202',
    question: '模型建议之后，系统怎样行动？',
    year: '2026.03 — 2026.07',
    status: '已完成工程原型 · 竞赛优秀奖',
    tags: ['Embedded Systems', 'System Integration', 'Team Leadership'],
    role: '团队组长 · 软件、嵌入式与系统联调',
    description:
      '我们把视觉分析、软件、无线控制和传感器做进一个可以演示的原型。我担任组长，关心的不只是 AI 能给出什么建议，还包括参数怎样变成控制、反馈怎样回来，以及系统何时应该停下。',
    contributions: [
      '统筹任务分工、进度、系统整合、阶段测试和交付协调。',
      '参与视觉分析与结构化控制参数的转换，以及界面、后端和本地控制开发。',
      '参与 Raspberry Pi、ESP32-S3、LED/加热模块与距离、温度传感器的联调。',
      '参与产品原型建模、装配与跨模块调试；课程结束后继续完善并准备参赛。',
    ],
    results: [
      { label: '课程成绩', value: '79', note: 'MEC202 工程项目' },
      {
        label: '竞赛成果',
        value: '优秀奖',
        note: '2026 中美青年创客大赛 · 苏州选拔赛主赛道',
      },
      { label: '原型链路', value: '视觉 → 参数 → 控制 → 反馈', note: '已形成可演示的团队工程原型' },
    ],
    boundary:
      '成果来自团队协作；这里展示的是工程原型、系统集成和安全控制思路，不作临床疗效或医疗认证声明。',
    accent: '#D3B67D',
    links: [
      {
        label: '公开代码',
        url: 'https://github.com/ChoneyChen/XJTLU_MEC202_25-26_IND3G2_Vision-Model-Based-Intelligent-Phototherapy-Mask-System',
      },
    ],
  },
  {
    id: 'sups',
    number: '05',
    title: 'SUPS / SVL',
    subtitle: '可控制的地下停车场',
    question: '改一个标志，空间还说得通吗？',
    year: '2026.09 — 至今',
    status: '仿真与数据工程进行中',
    tags: ['Simulation', 'Synthetic Data', 'Semantic Geometry'],
    role: '仿真开发与研究参与者',
    description:
      '为了研究环境变化和失败案例，我参与扩展停车场仿真。编号、屋顶和方向标志不是装饰：它们必须与真实分区和几何关系一致，才可能成为有用的感知与定位线索。',
    contributions: [
      '跑通基于 SUPS 的基础仿真链路，并扩展现有场景。',
      '补充停车位编号与屋顶结构，让环境更接近封闭停车场。',
      '研究道路导向、A/B 分区与箭头方向的空间一致性。',
      '探索可控制条件的场景数据，为定位与未见域感知评测提供基础。',
    ],
    results: [
      { label: '已有进展', value: '仿真链路跑通', note: '基础场景已有实际开发记录' },
      { label: '场景扩展', value: '编号与建筑结构', note: '道路标志及分区关联继续推进' },
    ],
    boundary:
      '这是对现有仿真平台的扩展，不是从零开发模拟器。完整样本规模、统一标注、全部导出与公开数据集发布尚未确认。',
    accent: '#6DADAB',
  },
  {
    id: 'avpc',
    number: '06',
    title: 'AVPC 协同感知',
    subtitle: '从不同视角到共同约束',
    question: '不同视角，会自动拼成正确答案吗？',
    year: '2026 — 至今',
    status: '导师团队研究方向',
    tags: ['Collaborative Perception', 'Spatial Reasoning', 'AVP'],
    role: 'Gordon Owusu Boateng 团队 · 研究参与者',
    description:
      '车辆、环境和地图看到的都是局部。这个研究方向希望把它们的线索共享起来，支持可靠的自动泊车与资源优化。我参与数据、方案和仿真探索，也关心观察相互冲突时，系统怎样保留问题。',
    contributions: [
      '筛选具有车辆位置或姿态真值的数据集，检查训练与验证条件。',
      '参与语义地标、地图约束、感知与定位方案讨论。',
      '探索用仿真构造复杂、易混淆与长尾条件，并把失败反馈到新数据。',
      '参与从结构化感知到空间一致性检查、协同决策的研究框架。',
    ],
    results: [
      { label: '研究框架', value: '感知 → 定位 → 协同', note: '各模块成熟度需要分别验证' },
      { label: '迭代构想', value: '失败 → 新场景 → 再验证', note: '红蓝队与闭环学习方向' },
    ],
    boundary:
      '完整停车资源优化系统及量化收益尚未确认。它与 Cosmos-Loc 和 FYP 相关，但不能把定位指标当成协同优化的成果。',
    accent: '#937A9C',
  },
]

export const experienceTimeline: Experience[] = [
  {
    id: 'education',
    year: '2023.09 — 2027.06（预计）',
    title: '西交利物浦大学',
    subtitle: 'BEng · Computer Science and Technology',
    role: '本科生 · 当前 Stage 4',
    status: '在读',
    description:
      '从编程、数据结构与统计建模出发，逐步走向多模态视觉、空间感知和环境 AI。课程基础覆盖软件、网络、计算机系统、数学与嵌入式。',
    tags: ['XJTLU', 'BEng', 'Stage 4'],
  },
  {
    id: 'lif001',
    year: '2023.10 — 2024.05',
    title: '校园食堂客流预测',
    subtitle: 'LIF001 · 让数据解释日常',
    role: '选题、建模与数据处理主要参与者',
    status: '课程项目已完成',
    description:
      '用 Python 清洗数据、编码天气与日期特征，建立多元线性回归；通过 R²、F 检验与残差检查，研究工作日、天气和气温与客流的关系。',
    tags: ['Python', 'Regression', 'Statistical Validation'],
    boundary: '保留方法与工作内容，不补写没有可靠记录的 R² 或预测误差。',
  },
  {
    id: 'kaiding',
    year: '2024 夏',
    title: '凯鼎动力 IT 实习',
    subtitle: '十堰凯鼎动力科技有限公司',
    role: 'IT Intern · Information Department',
    status: '实习已完成',
    description:
      '参与生产管理系统开发维护、前后端联调、数据库核查与功能测试，也做系统配置、故障排查、Git 协作、任务记录和技术文档。',
    tags: ['Software Systems', 'IT Support', 'Git'],
    boundary: '历史材料的结束日期为 8 月或 9 月 1 日，正式日期以实习证明为准。',
  },
  {
    id: 'surf-wearable',
    year: '2025.06 — 2025.09',
    title: '帕金森监测 · 可穿戴数据采集',
    subtitle: 'SURF · 可靠研究从可靠数据开始',
    role: '科研参与者 · 数据采集与质量保障',
    status: '已有实际采集工作',
    description:
      '准备与校准 Shimmer3 IMU/ExG，采集运动与电生理信号；实时核查连接与数据，排查异常，为后续监测研究保留可靠的原始记录。',
    tags: ['Shimmer3', 'IMU / ExG', 'Data Quality'],
    boundary: '我的角色是采集和质量保障，不声称疾病分类准确率或诊断模型成果。',
  },
  {
    id: 'can201',
    year: '2025 · 具体学期待核对',
    title: 'Computer Networking Project',
    subtitle: 'CAN201 · 团队交付与研究起点',
    role: '小组组长',
    status: '课程项目已完成',
    description:
      '担任网络课程项目组长，完成团队交付，Coursework 成绩 82.5。这门由 Gordon 授课的课程，也成为后续科研合作的起点。',
    tags: ['Networking', 'Teamwork', '82.5'],
    boundary: '项目题目与技术细节尚待原报告补齐。',
  },
  {
    id: 'cosmos-research',
    year: '2025.12 — 2026.09',
    title: 'Cosmos-Loc 视觉定位研究',
    subtitle: '从研究调研走到模型实验',
    role: 'Gordon 团队成员 · Qwen 训练与实验',
    status: '已有团队实验结果',
    description:
      '从寒假数据与模型调研开始，参与 Qwen 训练、参数迭代和定位评测，比较数据覆盖、模型规模与计算代价。',
    tags: ['VLM', 'LoRA', 'Localisation'],
    projectId: 'cosmos',
  },
  {
    id: 'surf-parking',
    year: '2026.03 — 2026.08',
    title: '地下停车场多模态定位 SURF',
    subtitle: 'Cosmos-Loc 的关联科研记录',
    role: '科研参与者',
    status: '关联经历',
    description:
      '围绕 GPS 拒止环境中的视觉线索、地图约束、位姿推断与模型评估开展研究；与 Cosmos-Loc 的工作和成果有重叠。',
    tags: ['SURF', 'Visual Localisation'],
    projectId: 'cosmos',
    boundary: '项目关系仍需核对，不把同一组定位实验重复计为独立成果。',
  },
  {
    id: 'mec202',
    year: '2026.03 — 2026.07',
    title: 'AI 智能光疗面罩',
    subtitle: 'MEC202 · 把不同模块做成一个系统',
    role: '团队组长',
    status: '原型已完成',
    description:
      '统筹 AI、软件、嵌入式、硬件与原型结构，参与联调和测试。课程成绩 79；课程结束后继续完善原型并准备竞赛展示。',
    tags: ['Engineering', 'Embedded', 'Leadership'],
    projectId: 'mask',
  },
  {
    id: 'maker-award',
    year: '2026',
    title: '中美青年创客大赛 · 优秀奖',
    subtitle: '苏州选拔赛主赛道',
    role: '智能光疗面罩团队组长',
    status: '团队获奖',
    description: '带领面罩团队在课程交付后继续优化系统，并获得 2026 中美青年创客大赛苏州选拔赛主赛道优秀奖。',
    tags: ['Maker Competition', 'Prototype'],
    projectId: 'mask',
    boundary: '同一面罩项目的竞赛成果，不另计为新项目。',
  },
  {
    id: 'esg-internship',
    year: '2026.07 — 至今',
    title: '环境 AI 与数据分析实习',
    subtitle: '清华大学苏州环境创新研究院',
    role: 'AI & Data Analytics Intern',
    status: '进行中',
    description:
      '参与 ESG 文档解析、模型整合、指标标准化与证据关联，建设数据平台，并关注批量处理和本地部署的工程问题。',
    tags: ['Environmental AI', 'Document AI', 'Data Engineering'],
    projectId: 'esg',
  },
  {
    id: 'fyp',
    year: '2026.08/09 — 至今',
    title: 'U-IMPROVE 本科毕业研究',
    subtitle: 'PSP305 / FYP · 图像生成驱动的开放词汇感知',
    role: '本科毕业设计研究者',
    status: '研究进行中',
    description:
      '提出 Presence-Aware Metadata Strip 三态输出协议，研究共享生成模型的分割、度量深度与法线编码、确定性解码和三维抬升；推进跨环境与感知微调中未见类别的评估设计。',
    tags: ['Image Generation', 'Metadata Strip', 'Semantic-Geometric Fusion'],
    projectId: 'glimpse',
    boundary: '拟议方法仍需训练与定量验证，FPR、IoU、AbsRel 尚无个人结果。三维点云为拟议核心表达，BEV、体素、占据与多帧融合仍为后续研究。',
  },
  {
    id: 'avpc-research',
    year: '2026 — 至今',
    title: 'AVPC 协同感知与停车资源研究',
    subtitle: '导师团队持续研究方向',
    role: '研究参与者',
    status: '研究进行中',
    description:
      '参与数据集筛选、感知定位方案与仿真探索，研究共享局部观察、空间一致性及失败样例的迭代方式。',
    tags: ['Collaborative Perception', 'Spatial Reasoning'],
    projectId: 'avpc',
  },
  {
    id: 'sups-simulation',
    year: '2026.09 — 至今',
    title: 'SUPS / SVL 场景扩展',
    subtitle: '让语义地标与几何保持一致',
    role: '开发与研究参与者',
    status: '工程进行中',
    description:
      '跑通仿真链路，补充车位编号和屋顶，继续推进道路标志、区域关系及可控制的数据场景。',
    tags: ['Simulation', 'Synthetic Data'],
    projectId: 'sups',
  },
  {
    id: 'isa305',
    year: '2026.09 — 至今',
    title: '人工智能与 MATLAB 实验',
    subtitle: 'ISA305 · 保留真实输出，再解释结果',
    role: '学生 · 实验实施者',
    status: '课程实验进行中',
    description:
      '研究感知机、EEG 运动想象分类与 CSP。Week 4 使用 100 个训练与 44 个测试试次；学习率 0.01 时测试准确率 77.27%，CSP 与标准化只在训练集拟合。',
    tags: ['MATLAB', 'EEG', 'CSP', 'Reproducibility'],
    boundary: '这些是特定课程实验；不能推广为临床诊断表现。',
  },
  {
    id: 'stock-tool',
    year: '个人工具 · 持续迭代',
    title: '可追溯的文章研究工作流',
    subtitle: '个人方法实验 · 时间也是证据的一部分',
    role: '个人工具使用与开发',
    status: '工具迭代中',
    description:
      '围绕文章归档、方法账本和时间边界建立研究流程：固定来源、保留条件，让后来的信息不能悄悄改写当时的判断。',
    tags: ['Evidence', 'Temporal Boundaries', 'Personal Tools'],
    boundary: '作为方法实验支线展示；不展示收益、持仓或荐股结论，也不声称静态观察台已接入可靠实时行情。',
  },
]
