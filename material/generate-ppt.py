# -*- coding: utf-8 -*-
# 生成路演 PPT：芯师傅 ChipMaster（16:9 深色科技风）
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import os

SHOTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")

BG      = RGBColor(0x0B, 0x12, 0x20)
PANEL   = RGBColor(0x11, 0x1C, 0x30)
PANEL2  = RGBColor(0x16, 0x23, 0x3C)
ACCENT  = RGBColor(0x2D, 0xD4, 0xA7)
ACCENT2 = RGBColor(0x38, 0xBD, 0xF8)
TEXT    = RGBColor(0xE8, 0xEE, 0xF8)
MUTED   = RGBColor(0x8F, 0xA3, 0xBF)
DIM     = RGBColor(0x5F, 0x73, 0x94)
BORDER  = RGBColor(0x2A, 0x3B, 0x5C)
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)

FONT = "微软雅黑"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def set_font(run, size=14, color=TEXT, bold=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = FONT
    r = run._r
    rPr = r.get_or_add_rPr()
    ea = rPr.find(qn('a:ea'))
    if ea is None:
        ea = rPr.makeelement(qn('a:ea'), {})
        rPr.append(ea)
    ea.set('typeface', FONT)


def slide_bg(slide, color=BG):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color


def add_box(slide, x, y, w, h, fill=None, line=None, radius=None):
    shape_type = MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE
    shp = slide.shapes.add_shape(shape_type, x, y, w, h)
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid()
        shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line
        shp.line.width = Pt(1)
    shp.shadow.inherit = False
    return shp


def add_text(slide, x, y, w, h, text, size=14, color=TEXT, bold=False,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, line_spacing=1.15):
    tb = slide.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    lines = text.split("\n")
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        r = p.add_run()
        r.text = ln
        set_font(r, size, color, bold)
    return tb


def add_title(slide, text, sub=None, idx=None):
    if idx:
        add_box(slide, Inches(0.55), Inches(0.42), Inches(0.09), Inches(0.62), fill=ACCENT)
        add_text(slide, Inches(0.80), Inches(0.34), Inches(9.5), Inches(0.8), text,
                 size=27, color=WHITE, bold=True)
    else:
        add_box(slide, Inches(0.55), Inches(0.45), Inches(0.09), Inches(0.55), fill=ACCENT)
        add_text(slide, Inches(0.80), Inches(0.36), Inches(9.5), Inches(0.8), text,
                 size=27, color=WHITE, bold=True)
    if sub:
        add_text(slide, Inches(0.82), Inches(1.02), Inches(11.5), Inches(0.5), sub,
                 size=12.5, color=MUTED)


def add_card(slide, x, y, w, h, icon, title, desc, accent=ACCENT):
    add_box(slide, x, y, w, h, fill=PANEL, line=BORDER, radius=True)
    add_box(slide, x, y, w, Inches(0.055), fill=accent)
    add_text(slide, x + Inches(0.25), y + Inches(0.18), w - Inches(0.5), Inches(0.6),
             icon + "  " + title, size=17, color=WHITE, bold=True)
    add_text(slide, x + Inches(0.25), y + Inches(0.75), w - Inches(0.5), h - Inches(0.95),
             desc, size=12, color=MUTED, line_spacing=1.3)


def add_shot(slide, x, y, w, name, caption=None):
    path = os.path.join(SHOTS, name)
    if os.path.exists(path):
        slide.shapes.add_picture(path, x, y, width=w)
        add_box(slide, x - Inches(0.03), y - Inches(0.03), w + Inches(0.06),
                Emu(0), fill=None)
    if caption:
        add_text(slide, x, y, w, Inches(0.35), caption, size=12, color=MUTED)


def footer(slide, num):
    add_text(slide, Inches(12.3), Inches(7.05), Inches(0.8), Inches(0.35),
             str(num), size=12, color=DIM, align=PP_ALIGN.RIGHT)


# ═══════════ 1. 封面 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_box(s, Inches(0), Inches(0), Inches(0.28), Inches(7.5), fill=ACCENT)
add_box(s, Inches(0), Inches(7.16), Inches(13.333), Inches(0.34), fill=PANEL2)
add_text(s, Inches(0.9), Inches(0.62), Inches(6), Inches(0.5), "CHIPMASTER AI", size=15, color=ACCENT, bold=True)
add_text(s, Inches(0.9), Inches(2.0), Inches(11.5), Inches(1.7),
         "芯师傅 ChipMaster", size=60, color=WHITE, bold=True)
add_text(s, Inches(0.9), Inches(3.15), Inches(11.5), Inches(0.8),
         "单片机 AI 学习助手 —— 从点亮第一盏灯，到独立完成课程设计", size=22, color=MUTED)
add_box(s, Inches(0.9), Inches(4.35), Inches(3.6), Inches(0.05), fill=ACCENT)
add_text(s, Inches(0.9), Inches(4.75), Inches(11.5), Inches(1.6),
         "2026 年第二届重庆市 AI 大模型创新应用大赛\nAI 创意赛道 · 教育场景\n参赛学校：【学校名称】    团队：【团队名称】    2026 年 9 月",
         size=14, color=MUTED, line_spacing=1.4)
add_text(s, Inches(0.9), Inches(6.55), Inches(11), Inches(0.4),
         "在线体验：hanyiiii.github.io/mcu-tutor    代码开源：github.com/Hanyiiii/mcu-tutor",
         size=12, color=ACCENT2)

# ═══════════ 2. 目录 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "内容提纲", "Contents", idx=True)
items = [
    ("01", "痛点分析", "单片机学习为什么这么难"),
    ("02", "解决方案", "五大功能模块 + 技术架构"),
    ("03", "核心机制", "大模型 + 领域知识库（轻量 RAG）"),
    ("04", "创新点", "垂直场景、内容资产、低成本落地"),
    ("05", "商业价值", "教育效益与商业化路径"),
    ("06", "实施过程", "两周从立项到上线"),
]
for i, (num, t, d) in enumerate(items):
    col = i % 2
    row = i // 2
    x = Inches(0.8 + col * 6.1)
    y = Inches(1.85 + row * 1.62)
    add_box(s, x, y, Inches(5.7), Inches(1.35), fill=PANEL, line=BORDER, radius=True)
    add_text(s, x + Inches(0.3), y + Inches(0.28), Inches(1.1), Inches(0.8), num,
             size=30, color=ACCENT, bold=True)
    add_text(s, x + Inches(1.35), y + Inches(0.24), Inches(4.1), Inches(0.5), t,
             size=17, color=WHITE, bold=True)
    add_text(s, x + Inches(1.35), y + Inches(0.72), Inches(4.1), Inches(0.5), d,
             size=11.5, color=MUTED)
footer(s, 2)

# ═══════════ 3. 痛点 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "单片机学习，为什么这么难？", "三大痛点直击课程学习核心环节")
pains = [
    ("❓", "答疑难", "寄存器、中断、时序等概念零散；\n查资料半天找不到答案；\n一个编译报错卡一晚上。"),
    ("⌨️", "代码难", "网上例程不全、版本混乱；\nKeil 报 C202/C141 不知从何改起；\n代码不能直接用。"),
    ("🔌", "仿真难", "Proteus 元件选型、接线、hex 加载\n每个环节都是坑；\n电路搭好却不运行。"),
]
for i, (icon, t, d) in enumerate(pains):
    x = Inches(0.8 + i * 4.15)
    add_card(s, x, Inches(2.0), Inches(3.7), Inches(3.4), icon, t, d)
add_text(s, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.7),
         "→ 通用大模型缺教学语料、搜索引擎碎片化、视频课程无反馈，芯师傅给出垂直场景答案",
         size=14, color=ACCENT, bold=True)
footer(s, 3)

# ═══════════ 4. 解决方案总览 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "解决方案：五大功能模块", "覆盖「提问 — 生成 — 搭建 — 学习」完整链路")
feats = [
    ("💬", "AI 智能答疑", "大模型流式对话，命中知识库自动注入资料"),
    ("⚡", "代码生成", "13 个实测模板 + AI 定制 + 编译检查清单"),
    ("🔧", "仿真向导", "8 大电路分步搭建：清单 / 步骤 / 避坑"),
    ("📚", "知识库", "37 条核心知识点，分类浏览 + 搜索"),
    ("🗺️", "学习路径", "四阶段进阶路线，进度本地持久化"),
]
for i, (icon, t, d) in enumerate(feats):
    col = i % 3
    row = i // 3
    x = Inches(0.8 + col * 4.15)
    y = Inches(1.9 + row * 2.45)
    add_card(s, x, y, Inches(3.7), Inches(2.1), icon, t, d)
footer(s, 4)

# ═══════════ 5. 演示：AI 答疑 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "功能演示：AI 智能答疑", "提问 → 知识库检索 → 资料注入 → 大模型流式作答")
add_box(s, Inches(0.55), Inches(1.75), Inches(7.6), Inches(5.15), fill=PANEL, line=BORDER, radius=True)
add_shot(s, Inches(0.75), Inches(1.95), Inches(7.2), "05_chat.png")
add_text(s, Inches(8.45), Inches(2.2), Inches(4.3), Inches(4.2),
         "• 流式输出，提问秒回\n\n• 命中知识库时自动注入\n  3 条相关资料，回答更\n  贴合教学场景\n\n• 支持代码块渲染与复制\n\n• 内置快捷提问引导\n\n• 未配置接口时友好降级\n  提示，不崩溃",
         size=14, color=MUTED, line_spacing=1.5)
footer(s, 5)

# ═══════════ 6. 演示：代码生成 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "功能演示：代码生成", "经典模板 + AI 定制，生成即用，配套编译检查清单")
add_box(s, Inches(0.55), Inches(1.75), Inches(8.6), Inches(5.15), fill=PANEL, line=BORDER, radius=True)
add_shot(s, Inches(0.75), Inches(1.95), Inches(8.2), "02_codegen.png")
add_text(s, Inches(9.45), Inches(2.2), Inches(3.4), Inches(4.2),
         "• 13 个模板全部经\n  Keil 编译验证\n\n• 覆盖流水灯 → 电子时钟\n  及 STM32 HAL 点灯\n\n• AI 按外设组合生成\n  完整可编译代码\n\n• 一键复制 / 下载 .c",
         size=13.5, color=MUTED, line_spacing=1.5)
footer(s, 6)

# ═══════════ 7. 演示：仿真向导 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "功能演示：Proteus 仿真向导", "照着做就能跑：元件清单 → 接线步骤 → 避坑提示")
add_box(s, Inches(0.55), Inches(1.75), Inches(8.6), Inches(5.15), fill=PANEL, line=BORDER, radius=True)
add_shot(s, Inches(0.75), Inches(1.95), Inches(8.2), "03_simguide.png")
add_text(s, Inches(9.45), Inches(2.2), Inches(3.4), Inches(4.2),
         "• 8 大常用电路：最小系统\n  LED / 按键 / 数码管 /\n  串口 / 蜂鸣器 / LCD /\n  DS18B20\n\n• 每步给出元件库名与\n  接线细节\n\n• 与代码模板联动，\n  一键跳转配套程序",
         size=13.5, color=MUTED, line_spacing=1.5)
footer(s, 7)

# ═══════════ 8. 演示：知识库与学习路径 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "知识库与学习路径", "结构化内容资产 + 四阶段进阶导航")
add_box(s, Inches(0.55), Inches(1.75), Inches(6.0), Inches(5.15), fill=PANEL, line=BORDER, radius=True)
add_shot(s, Inches(0.7), Inches(1.95), Inches(5.7), "04_kb.png")
add_box(s, Inches(6.85), Inches(1.75), Inches(6.0), Inches(5.15), fill=PANEL, line=BORDER, radius=True)
add_shot(s, Inches(7.0), Inches(1.95), Inches(5.7), "06_path.png")
footer(s, 8)

# ═══════════ 9. 技术架构 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "技术架构", "前后端分离 · 密钥隔离 · 全免费基础设施")
layers = [
    ("展示层", "Vue 3 + Vite 单页应用\nGitHub Pages 静态托管", ACCENT2),
    ("服务层", "Supabase Edge Function（Deno）\n代理大模型 API · 流式转发 · 密钥仅存服务端", ACCENT),
    ("模型层", "DeepSeek（OpenAI 兼容协议）\n可无缝切换豆包 / 智谱 / 通义", RGBColor(0xF9, 0xA8, 0xD4)),
]
for i, (name, desc, color) in enumerate(layers):
    y = Inches(2.0 + i * 1.55)
    add_box(s, Inches(2.2), y, Inches(8.9), Inches(1.25), fill=PANEL, line=BORDER, radius=True)
    add_box(s, Inches(2.2), y, Inches(0.09), Inches(1.25), fill=color)
    add_text(s, Inches(2.55), y + Inches(0.22), Inches(1.9), Inches(0.8), name,
             size=18, color=WHITE, bold=True)
    add_text(s, Inches(4.45), y + Inches(0.14), Inches(6.5), Inches(1.0), desc,
             size=13, color=MUTED, line_spacing=1.35)
    if i < 2:
        add_text(s, Inches(6.35), y + Inches(1.18), Inches(0.8), Inches(0.45), "▲",
                 size=15, color=DIM, align=PP_ALIGN.CENTER)
add_text(s, Inches(2.2), Inches(6.55), Inches(9), Inches(0.6),
         "开发工具链与托管全部免费，运行成本仅为按量计费的大模型 API（演示阶段预估 10—20 元）",
         size=13, color=ACCENT, bold=True)
footer(s, 9)

# ═══════════ 10. 轻量 RAG ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "核心机制：本地轻量 RAG", "大模型泛化能力 + 领域知识库专业性的结合")
steps = [
    ("1", "用户提问", "「Keil 报错 C202 是什么意思？」"),
    ("2", "本地检索", "标签 + 关键词打分，毫秒级选出最相关 3 条"),
    ("3", "注入上下文", "相关资料随请求发给大模型作为回答依据"),
    ("4", "流式作答", "答案贴合教学场景，代码可编译、来源可追溯"),
]
for i, (num, t, d) in enumerate(steps):
    x = Inches(0.75 + i * 3.15)
    add_box(s, x, Inches(2.1), Inches(2.8), Inches(3.1), fill=PANEL, line=BORDER, radius=True)
    add_box(s, x + Inches(0.28), Inches(2.5), Inches(0.85), Inches(0.85), fill=ACCENT, radius=True)
    add_text(s, x + Inches(0.28), Inches(2.62), Inches(0.85), Inches(0.6), num,
             size=24, color=BG, bold=True, align=PP_ALIGN.CENTER)
    add_text(s, x + Inches(0.25), Inches(3.55), Inches(2.35), Inches(0.5), t,
             size=15, color=WHITE, bold=True)
    add_text(s, x + Inches(0.25), Inches(4.0), Inches(2.35), Inches(1.1), d,
             size=10.5, color=MUTED, line_spacing=1.3)
    if i < 3:
        add_text(s, x + Inches(2.78), Inches(3.2), Inches(0.45), Inches(0.5), "→",
                 size=18, color=ACCENT)
add_box(s, Inches(0.75), Inches(5.75), Inches(11.85), Inches(0.95), fill=PANEL2, line=BORDER, radius=True)
add_text(s, Inches(1.05), Inches(5.92), Inches(11.3), Inches(0.6),
         "相比向量化 RAG：零 embedding 成本 · 检索在浏览器本地完成 · 知识内容全部经 Keil 编译与 Proteus 仿真实测，从源头降低幻觉",
         size=12.5, color=TEXT)
footer(s, 10)

# ═══════════ 11. 创新点 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "创新点", "Innovation Highlights")
innov = [
    ("🎯", "垂直场景切入", "不做通用问答，聚焦单片机教学最吃力的\n「编程 + 仿真」环节，问题与答案都来自真实课堂。"),
    ("📚", "领域内容资产", "37 条知识点 + 13 个模板 + 8 个向导，全部\n经编译与仿真验证，构成可复用的内容壁垒。"),
    ("🧩", "轻量 RAG 机制", "本地检索 + 上下文注入，不依赖向量库，\n零成本实现答案可控、来源可追溯。"),
    ("💸", "零成本可复制", "GitHub Pages + Supabase 免费额度 + 按量\n计费 API，两周上线，学生团队即可复制。"),
]
for i, (icon, t, d) in enumerate(innov):
    col = i % 2
    row = i // 2
    x = Inches(0.8 + col * 6.1)
    y = Inches(1.95 + row * 2.5)
    add_card(s, x, y, Inches(5.7), Inches(2.15), icon, t, d, accent=ACCENT2)
footer(s, 11)

# ═══════════ 12. 商业价值 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_title(s, "预期效益与商业价值", "从比赛作品走向真实课堂")
paths = [
    ("🏫", "高校实验教学", "单片机课程教学辅助平台\n题库 + 学情分析 + AI 批改"),
    ("🏬", "教培与硬件厂商", "课程增值模块\n开发板 / 课程配套学习工具"),
    ("👤", "个人学习者", "免费基础功能 + 增值订阅\n进阶题库 / 项目实战 / AI 批改"),
]
for i, (icon, t, d) in enumerate(paths):
    x = Inches(0.8 + i * 4.15)
    add_card(s, x, Inches(2.0), Inches(3.7), Inches(2.6), icon, t, d)
add_text(s, Inches(0.8), Inches(5.1), Inches(11.7), Inches(1.4),
         "教育价值：每个学生拥有「随问随答的 AI 助教」，显著降低单片机入门门槛，示范 AI 与工科实践教学的融合范式\n社会价值：全部基于免费与开源基础设施，验证低成本 AI 教育应用的可复制性，助力教育普惠",
         size=14, color=MUTED, line_spacing=1.5)
footer(s, 12)

# ═══════════ 13. 结束页 ═══════════
s = prs.slides.add_slide(BLANK)
slide_bg(s)
add_box(s, Inches(0), Inches(0), Inches(0.28), Inches(7.5), fill=ACCENT)
add_text(s, Inches(0.9), Inches(2.3), Inches(11.5), Inches(1.2),
         "智育人才 · 创领未来", size=44, color=WHITE, bold=True)
add_text(s, Inches(0.9), Inches(3.6), Inches(11.5), Inches(0.7),
         "芯师傅 ChipMaster —— 让每个单片机学习者都有自己的 AI 私教", size=18, color=MUTED)
add_box(s, Inches(0.9), Inches(4.6), Inches(3.6), Inches(0.05), fill=ACCENT)
add_text(s, Inches(0.9), Inches(5.1), Inches(11.5), Inches(1.2),
         "在线体验：hanyiiii.github.io/mcu-tutor\n代码开源：github.com/Hanyiiii/mcu-tutor\n感谢各位评委老师！", size=14, color=MUTED, line_spacing=1.5)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "芯师傅ChipMaster路演PPT.pptx")
prs.save(out)
print("已生成：" + out)
