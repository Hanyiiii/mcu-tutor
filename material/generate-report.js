// 生成参赛报告：芯师傅 ChipMaster 项目报告（AI创意赛道·教育场景）
// 运行：node generate-report.js  →  输出 芯师傅ChipMaster参赛报告.docx
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, TableLayoutType,
  ShadingType, SectionType, NumberFormat, PageNumber, Footer,
  TableOfContents, PageBreak
} = require("docx");

// ── DM-1 Deep Cyan 配色（AI/科技）──
const P = {
  bg: "162235", titleColor: "FFFFFF", subtitleColor: "B0B8C0",
  metaColor: "90989F", footerColor: "687078", accent: "37DCF2",
  table: { headerBg: "1B6B7A", headerText: "FFFFFF", accentLine: "1B6B7A", innerLine: "C8DDE2", surface: "EDF3F5" }
};
const HEAD_COLOR = "162235";   // 正文标题色（深藏青）
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { ...noBorders, insideHorizontal: NB, insideVertical: NB };

// ── 封面工具（源自 design-system.md）──
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."，。、；：！？", ..."的与和及之在于为", ..."-_—–·/", ..." \t"]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) {
      breakAt = charsPerLine;
      const prev = remaining[breakAt - 1], next = remaining[breakAt];
      if (prev && next && !breakAfter.has(prev) && !breakAfter.has(next) &&
          /[\u4e00-\u9fff]/.test(prev) && /[\u4e00-\u9fff]/.test(next)) breakAt -= 1;
    }
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / (pt * 20));
  let titlePt = preferredPt, lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) { lines = splitTitleLines(title, charsPerLine(minPt)); titlePt = minPt; }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const safeRemaining = Math.max(usableHeight - contentHeight, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

function buildCoverR1(config) {
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length,
    fixedHeight: 400
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];

  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));

  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({
        text: config.englishLabel.split("").join("  "),
        size: 18, color: P.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40
      })]
    }));
  }

  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({
        text: titleLines[i], size: titleSize, bold: true,
        color: P.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" }
      })]
    }));
  }

  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({
        text: config.subtitle, size: 24, color: P.subtitleColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" }
      })]
    }));
  }

  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({
        text: line, size: 24, color: P.metaColor,
        font: { eastAsia: "Microsoft YaHei", ascii: "Arial" }
      })]
    }));
  }

  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));

  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.footerColor, font: { ascii: "Arial" } })
    ]
  }));

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders,
        children
      })]
    })]
  })];
}

// ── 正文组件 ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 200, line: 360 },
    children: [new TextRun({ text, bold: true, size: 32, color: HEAD_COLOR, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 340 },
    children: [new TextRun({ text, bold: true, size: 30, color: HEAD_COLOR, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: opts.after || 0 },
    children: [new TextRun({ text, size: 24, color: "000000", bold: !!opts.bold, font: { eastAsia: "SimSun", ascii: "Times New Roman" } })]
  });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 120 },
    children: [new TextRun({ text, size: 21, color: "000000", font: { eastAsia: "SimSun", ascii: "Times New Roman" } })]
  });
}
function bullet(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 480 },
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: "000000", font: { eastAsia: "SimSun", ascii: "Times New Roman" } })]
  });
}
function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    children: [new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { line: 312 },
      children: [new TextRun({
        text, size: 21, bold: !!opts.bold, color: opts.color || "000000",
        font: { eastAsia: "SimSun", ascii: "Times New Roman" }
      })]
    })]
  });
}
function dataTable(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((ht, i) => cell(ht, { width: widths[i], bold: true, center: true, color: P.table.headerText, fill: P.table.headerBg }))
  });
  const dataRows = rows.map((r) => new TableRow({
    cantSplit: true,
    children: r.map((c, i) => cell(c, { width: widths[i], center: i > 0 && widths[i] < 30 }))
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [headerRow, ...dataRows]
  });
}

// ── 页脚 ──
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: { ascii: "Times New Roman" } })]
    })]
  });
}

const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ════════════════════════════════════════════════
// 封面
// ════════════════════════════════════════════════
const coverConfig = {
  title: "芯师傅 ChipMaster",
  subtitle: "单片机 AI 学习助手 —— 面向 Keil + Proteus 教学场景的大模型创新应用",
  englishLabel: "CHIPMASTER AI",
  metaLines: [
    "2026年第二届重庆市AI大模型创新应用大赛",
    "AI创意赛道（教育场景）参赛作品",
    "参赛学校：【学校名称】        团队名称：【团队名称】",
    "2026 年 9 月"
  ],
  footerLeft: "项目报告",
  footerRight: "在线体验：hanyiiii.github.io/mcu-tutor"
};

// ════════════════════════════════════════════════
// 正文内容
// ════════════════════════════════════════════════
const bodyContent = [];

bodyContent.push(h1("一、项目概述"));
bodyContent.push(body("芯师傅 ChipMaster 是一款面向单片机（8051/STM32）初学者的 AI 学习助手，聚焦单片机课程学习中「Keil 编程调试」与「Proteus 电路仿真」两大核心环节，将大语言模型的对话能力与结构化嵌入式知识库相结合，解决学生「答疑难、代码难、仿真难」三大学习痛点。"));
bodyContent.push(body("产品包含五大功能模块：AI 智能答疑、代码生成、Proteus 仿真向导、知识库、学习路径。内置知识库收录 36 条单片机核心知识点（涵盖 8051 基础、Keil 使用、Proteus 仿真、学习方法四大类），13 个可直接编译的代码模板（覆盖流水灯、按键、数码管、定时器、串口、LCD1602、PWM 等经典例程），8 个常用电路的仿真搭建向导，以及 20 项任务的四阶段学习路径。"));
bodyContent.push(body("技术实现上，前端采用 Vue 3 + Vite 构建单页应用，部署于 GitHub Pages；后端采用 Supabase Edge Function 代理大模型 API（当前接入 DeepSeek），隐藏密钥并支持流式输出；知识库检索在前端本地完成，命中后自动注入对话上下文，实现「零成本、低延迟」的轻量检索增强生成（RAG）机制。作品已在线部署，可通过浏览器直接访问体验。"));

bodyContent.push(h1("二、项目背景与痛点分析"));
bodyContent.push(h2("（一）项目背景"));
bodyContent.push(body("单片机原理与应用是电子信息、自动化、计算机等专业的核心课程，也是学生从纯软件思维转向软硬件结合思维的关键一课。该课程实践性强，学生需要在 Keil 中编写 C51 程序、在 Proteus 中搭建电路仿真验证，二者缺一不可。与此同时，以大模型为代表的人工智能技术正在重塑教育形态，重庆市提出「416」科技创新布局与「33618」现代制造业集群体系建设，亟需培养具备 AI 素养与工程实践能力的复合型人才。将大模型能力引入单片机教学场景，是本项目选题的直接背景。"));
bodyContent.push(h2("（二）学习痛点分析"));
bodyContent.push(body("通过对单片机课程学习过程的梳理，本项目归纳出三个核心痛点，如下表所示。"));
bodyContent.push(caption("表1 单片机学习痛点分析"));
bodyContent.push(dataTable(
  ["痛点", "具体表现", "芯师傅的对策"],
  [
    ["答疑难", "寄存器、中断、时序等概念零散，遇到问题查资料半天找不到答案，卡一个编译错误往往耗掉一晚上", "AI 智能答疑：大模型对话 + 知识库增强，秒级响应，答案贴合教学场景"],
    ["代码难", "网上例程不全、版本混乱、缺头文件，编译报 C202/C141 却不知道从何改起", "代码生成：13 个验证过的经典模板 + AI 按需定制，配套编译检查清单"],
    ["仿真难", "Proteus 元件选型、接线、hex 加载每个环节都有坑，电路搭好却不运行", "仿真向导：8 大常用电路分步教程，含元件清单、接线步骤与避坑提示"]
  ],
  [16, 44, 40]
));
bodyContent.push(body("针对「答疑难」，项目对比了现有学习途径的不足：通用大模型缺乏单片机教学语料，回答泛化且生成的代码往往无法直接编译；搜索引擎与论坛资料碎片化，质量参差不齐；视频课程单向灌输，无法针对学生的个性化问题即时反馈。芯师傅通过「领域知识库 + 大模型」的组合，在保留大模型泛化能力的同时，用结构化知识约束回答的专业性与准确性。"));

bodyContent.push(h1("三、项目目标与预期成果"));
bodyContent.push(body("功能目标：建成一个开箱即用、无需安装的单片机 AI 学习助手，覆盖「提问—生成—搭建—学习」完整链路；技术目标：实现前后端分离的可靠部署架构，对话采用流式输出，知识库检索命中后自动注入上下文，单轮响应控制在秒级；内容目标：知识库与代码模板全部经过 Keil 编译与 Proteus 仿真验证，确保内容可复现、可落地。"));
bodyContent.push(body("预期成果以可量化指标呈现：内置知识库 36 条、代码模板 13 个、仿真向导 8 个、学习路径任务 20 项，全部功能在线上环境可访问、可演示，并配套项目报告、路演演示文稿与演示视频脚本等参赛材料。"));

bodyContent.push(h1("四、解决方案设计"));
bodyContent.push(h2("（一）产品功能体系"));
bodyContent.push(body("产品围绕单片机学习全流程设计五大模块，各模块功能如下表所示。"));
bodyContent.push(caption("表2 产品功能体系"));
bodyContent.push(dataTable(
  ["模块", "核心功能", "对应痛点"],
  [
    ["AI 智能答疑", "流式对话；提问后自动检索知识库并注入相关资料；回答支持代码块与排版渲染", "答疑难"],
    ["代码生成", "13 个经典模板（流水灯至电子时钟、STM32 HAL 点灯）；AI 按需求定制代码；一键复制/下载；附 Keil 编译检查清单", "代码难"],
    ["Proteus 仿真向导", "8 大电路分步搭建教程；每步含元件清单、接线步骤、避坑提示；与代码模板联动跳转", "仿真难"],
    ["知识库", "36 条知识点按分类浏览与关键词搜索；命中条目一键展开", "答疑难"],
    ["学习路径", "四阶段进阶路线（入门基础→输入输出→内部资源→综合项目），进度本地持久化", "全局导航"]
  ],
  [18, 58, 24]
));
bodyContent.push(h2("（二）技术架构"));
bodyContent.push(body("系统采用典型的前后端分离三层架构：展示层为 Vue 3 + Vite 构建的单页应用，静态托管于 GitHub Pages，具备零运维、免费、高可用的特点；服务层为 Supabase Edge Function（Deno 运行时），负责接收前端请求、携带密钥调用大模型接口、将上游流式响应转换为统一数据格式转发给前端，密钥仅存于服务端环境变量，前端不接触任何敏感信息；模型层接入 OpenAI 兼容协议的大模型接口，当前使用 DeepSeek，通过环境变量可无缝切换豆包、智谱、通义千问等国内主流大模型。"));
bodyContent.push(body("本地开发环境额外提供与 Edge Function 同协议的 Node 服务，保证开发调试与线上运行行为一致。整体架构无需自购服务器，运行成本仅包含按量计费的大模型 API 调用费用。"));
bodyContent.push(h2("（三）轻量 RAG 机制"));
bodyContent.push(body("为提升回答质量，产品实现了「本地轻量检索增强生成」机制：用户提问后，前端在内置知识库中进行关键词与标签打分检索，选取最相关的 3 条资料随请求注入大模型上下文，引导模型依据知识库作答。与传统基于向量嵌入的 RAG 相比，该方案无需 embedding 接口与向量数据库，检索在浏览器本地毫秒级完成，零额外成本，且答案来源可追溯、内容可控。知识库内容由项目团队结合 Keil 与 Proteus 实操经验编写，每段代码模板均经过编译与仿真验证，从数据源头降低了大模型幻觉风险。"));

bodyContent.push(h1("五、实施路线与里程碑"));
bodyContent.push(body("项目按照大赛日程倒排工期，从立项到提交共约两周，实施过程如下表所示。"));
bodyContent.push(caption("表3 实施路线与里程碑"));
bodyContent.push(dataTable(
  ["阶段", "时间", "主要工作", "交付物"],
  [
    ["立项与设计", "9月8日—9月9日", "选题论证、痛点调研、产品与技术方案设计", "设计方案"],
    ["功能开发", "9月8日—9月12日", "前端五大模块、知识库与模板内容编写、Edge Function 后端", "可运行系统"],
    ["部署联调", "9月13日—9月15日", "GitHub Pages 与 Supabase 部署、端到端联调、兼容性测试", "线上可访问地址"],
    ["材料撰写", "9月16日—9月19日", "项目报告、演示文稿、演示视频脚本", "参赛材料包"],
    ["打磨提交", "9月20日—9月23日", "内容校对、演示演练、按大赛要求提交作品", "最终作品"]
  ],
  [14, 22, 42, 22]
));

bodyContent.push(h1("六、资源与成本估算"));
bodyContent.push(body("项目采用全开源工具链，无硬件采购需求，成本构成如下表所示。"));
bodyContent.push(caption("表4 成本估算"));
bodyContent.push(dataTable(
  ["项目", "方案", "费用"],
  [
    ["前端托管", "GitHub Pages（免费静态托管）", "0 元"],
    ["后端服务", "Supabase 免费额度（Edge Function 与项目托管）", "0 元"],
    ["大模型 API", "DeepSeek，按量计费；演示与开发阶段调用量少，预估 10—20 元；正式运营可按调用量规划预算", "约 10—20 元"],
    ["开发工具", "VS Code、Keil（教学环境）、Node.js 等均为免费", "0 元"]
  ],
  [20, 60, 20]
));
bodyContent.push(body("可见，项目在近乎零成本的前提下完成了从开发到部署的全流程，验证了「大模型 + 免费云服务」在高校创新实践中的可行性，为缺乏经费支持的学生团队提供了一条可复制的技术路径。"));

bodyContent.push(h1("七、风险分析与对策"));
bodyContent.push(body("项目主要风险及应对措施如下表所示。"));
bodyContent.push(caption("表5 风险分析与对策"));
bodyContent.push(dataTable(
  ["风险", "影响", "对策"],
  [
    ["大模型回答幻觉", "生成的代码可能无法编译，误导初学者", "知识库与模板全部实测验证；提示词要求输出完整可编译代码；前端附编译检查清单引导自查"],
    ["API 成本失控", "线上服务被高频调用产生费用", "Edge Function 隐藏密钥防盗用；正式运营可加请求限流与缓存；知识库命中类问题可离线降级"],
    ["知识库覆盖不足", "超出知识库范围的问题回答质量下降", "知识库持续扩充（STM32、ESP32、RTOS）；未命中时由大模型兜底回答"],
    ["平台依赖", "单一托管平台故障影响可用性", "前后端解耦，后端可平滑迁移至任意云函数平台；前端本地可独立运行"]
  ],
  [20, 34, 46]
));

bodyContent.push(h1("八、预期效益与商业价值"));
bodyContent.push(body("教育效益：项目将大模型能力精准注入单片机教学最吃力的环节，让每个学生拥有「随问随答的 AI 助教」，有望显著降低入门门槛、缩短调试时间，并示范了 AI 与工科实践教学融合的可行范式，呼应大赛「智育人才、创领未来」的主题。"));
bodyContent.push(body("商业价值：产品具备清晰的商业化路径——面向高校实验教学，可作为单片机/嵌入式课程的教学辅助平台，配套题库与学情分析功能向院校提供服务；面向教培机构与开发板厂商，可作为课程服务的增值模块或产品配套学习工具；面向个人学习者，采用免费基础功能 + 增值服务（进阶题库、项目实战、AI 批改）的订阅模式。知识库与模板体系构成核心内容资产，可跨平台复用。"));
bodyContent.push(body("社会价值：项目全部基于免费与开源基础设施完成，验证了低成本 AI 教育应用的可复制性，为教育普惠提供了参考样本。"));

bodyContent.push(h1("九、总结与展望"));
bodyContent.push(body("本项目在两周内完成了从选题、开发到上线的完整闭环：以「大模型 + 领域知识库」为核心思路，构建了覆盖答疑、代码、仿真、知识、路径五大环节的单片机 AI 学习助手，全部功能已在线部署并可公开访问，代码开源托管于 GitHub。项目证明，AI 大模型与垂直教学场景的结合，能以极低成本产生切实可用的教学工具。"));
bodyContent.push(body("后续展望：一是持续扩充知识库与模板，覆盖 STM32 外设、ESP32 与 RTOS；二是接入硬件联调能力（串口助手、逻辑分析仪数据解读）；三是增加学情统计与个性化练习，形成教学闭环；四是积极寻求在高校单片机课程中的试点应用，让作品走出比赛、服务真实课堂。"));

// 附录
bodyContent.push(h1("附录A 代码模板清单"));
bodyContent.push(caption("表A-1 内置代码模板（13 个，均经 Keil 编译验证）"));
bodyContent.push(dataTable(
  ["编号", "模板名称", "芯片", "难度", "功能说明"],
  [
    ["t01", "LED 流水灯", "8051", "入门", "P1 口循环左移实现流水效果"],
    ["t02", "独立按键控制 LED", "8051", "入门", "含完整软件消抖处理"],
    ["t03", "数码管 0—9 循环显示", "8051", "入门", "共阴段码表与静态显示"],
    ["t04", "定时器 1 秒 LED 翻转", "8051", "进阶", "T0 方式1 + 50ms 中断累加"],
    ["t05", "串口发送字符串", "8051", "进阶", "9600 波特率，虚拟终端可见"],
    ["t06", "外部中断按键计数", "8051", "进阶", "INT0 下降沿触发计数"],
    ["t07", "无源蜂鸣器发声", "8051", "进阶", "IO 翻转产生 1kHz 方波"],
    ["t08", "4×4 矩阵键盘扫描", "8051", "进阶", "逐行扫描 + 消抖 + 查表"],
    ["t09", "LCD1602 显示字符串", "8051", "进阶", "8 位并行接口两行显示"],
    ["t10", "PWM 呼吸灯", "8051", "挑战", "100us 中断软件模拟 PWM"],
    ["t11", "数码管电子时钟", "8051", "挑战", "动态扫描 + 定时器精确计时"],
    ["t12", "74HC595 扩展 8 路 LED", "8051", "挑战", "串转并移位寄存器"],
    ["t13", "STM32 HAL 库点灯", "STM32", "入门", "CubeMX 工程骨架 GPIO 翻转"]
  ],
  [8, 26, 10, 10, 46]
));

bodyContent.push(h1("附录B 知识库构成"));
bodyContent.push(caption("表B-1 内置知识库分类统计（36 条）"));
bodyContent.push(dataTable(
  ["类别", "条数", "内容示例"],
  [
    ["基础概念", "16", "最小系统、IO 口特性、机器周期、中断、定时器、串口、数码管、按键消抖、PWM、I2C、看门狗等"],
    ["Keil 使用", "8", "新建工程、生成 hex、常见编译错误对照（C141/C202/C231）、中文乱码、软件仿真调试等"],
    ["Proteus 仿真", "6", "添加元件、加载 hex、仿真故障排查、虚拟示波器、串口仿真等"],
    ["学习方法", "6", "学习路线、51 与 STM32 区别、中断函数规范、动态扫描重影、课设选题等"]
  ],
  [16, 12, 72]
));

// ════════════════════════════════════════════════
// 组装文档（封面 / 目录 / 正文 三个 Section）
// ════════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimSun" }, size: 24, color: "000000" },
        paragraph: { spacing: { line: 312 } }
      }
    }
  },
  sections: [
    // 1. 封面：无边距、无页脚页码
    {
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1(coverConfig)
    },
    // 2. 目录：罗马数字页码
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } }
      },
      footers: { default: pageNumFooter() },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "目  录", bold: true, size: 32, font: { eastAsia: "SimHei", ascii: "Times New Roman" } })]
        }),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "提示：本目录由域代码生成，页码为占位值。用 Word/WPS 打开后，右键目录选择\u201c更新域\u201d即可刷新为真实页码。",
              italics: true, size: 18, color: "888888", font: { eastAsia: "SimSun" }
            }),
            new PageBreak()
          ]
        })
      ]
    },
    // 3. 正文：阿拉伯数字页码，从 1 开始
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } }
      },
      footers: { default: pageNumFooter() },
      children: bodyContent
    }
  ]
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("芯师傅ChipMaster参赛报告.docx", buf);
  console.log("已生成：芯师傅ChipMaster参赛报告.docx");
});
