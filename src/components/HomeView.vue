<script setup>
import { go } from '../store.js'
import { KB_COUNT } from '../data/kb.js'
import { TEMPLATES } from '../data/templates.js'
import { GUIDES } from '../data/simguides.js'

const painPoints = [
  { icon: '❓', title: '概念零散，没人随时问', desc: '寄存器、中断、时序……遇到问题查资料半天找不到答案，卡一个 bug 耗掉一晚上。' },
  { icon: '⌨️', title: '代码不会写，例程看不懂', desc: '网上例程要么不全、要么报错，Keil 编译一堆 C202/C141 却不知道从哪改起。' },
  { icon: '🔌', title: '仿真搭不出，电路不运行', desc: 'Proteus 元件怎么选、线怎么接、hex 怎么加载，新手每一步都是坑。' }
]

const features = [
  { id: 'chat', icon: '💬', name: 'AI 智能答疑', desc: '大模型 + 内置 36 条单片机知识库，随时解答 Keil/Proteus/寄存器问题，代码随手可复制。', cta: '去提问' },
  { id: 'code', icon: '⚡', name: '代码生成', desc: '13 个经典例程模板（流水灯到电子时钟），AI 按需定制，生成即用、配套编译检查清单。', cta: '生成代码' },
  { id: 'sim', icon: '🔧', name: 'Proteus 仿真向导', desc: '8 大常用电路分步搭建教程：元件清单、接线步骤、避坑提示，照着做就能跑。', cta: '开始搭建' },
  { id: 'path', icon: '🗺️', name: '学习路径', desc: '从 C 语言到 STM32 的四阶段进阶路线，进度自动保存，每一步都有资源配套。', cta: '查看路线' }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">
        <span class="tag">智育人才 · 创领未来</span>
        <span class="tag blue">AI 大模型 × 嵌入式教育</span>
      </div>
      <h1 class="hero-title">芯师傅 <span class="grad">ChipMaster</span></h1>
      <p class="hero-sub">你的单片机 AI 私教 —— 从点亮第一盏灯，到独立完成课程设计</p>
      <div class="hero-actions">
        <button class="btn primary" @click="go('chat')">💬 立即提问</button>
        <button class="btn" @click="go('code')">⚡ 生成代码</button>
        <button class="btn" @click="go('sim')">🔧 仿真向导</button>
      </div>
      <div class="hero-stats">
        <div class="stat"><b>{{ KB_COUNT }}</b><span>条内置知识</span></div>
        <div class="stat"><b>{{ TEMPLATES.length }}</b><span>个代码模板</span></div>
        <div class="stat"><b>{{ GUIDES.length }}</b><span>个仿真向导</span></div>
        <div class="stat"><b>4</b><span>阶段学习路径</span></div>
      </div>
    </section>

    <!-- 痛点 -->
    <section>
      <div class="section-title"><span class="bar"></span>单片机学习，为什么这么难？</div>
      <div class="grid-3">
        <div v-for="p in painPoints" :key="p.title" class="card pain-card">
          <div class="pain-icon">{{ p.icon }}</div>
          <h3>{{ p.title }}</h3>
          <p>{{ p.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 解决方案 -->
    <section>
      <div class="section-title"><span class="bar"></span>芯师傅的解决方案</div>
      <div class="grid-2">
        <div v-for="f in features" :key="f.id" class="card feat-card">
          <div class="feat-head">
            <span class="feat-icon">{{ f.icon }}</span>
            <h3>{{ f.name }}</h3>
          </div>
          <p class="feat-desc">{{ f.desc }}</p>
          <button class="btn small" @click="go(f.id)">{{ f.cta }} →</button>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      基于大模型 + 本地知识增强（RAG）的教育场景应用 · 2026 年第二届重庆市AI大模型创新应用大赛参赛作品
    </footer>
  </div>
</template>

<style scoped>
.hero { text-align: center; padding: 34px 0 40px; }
.hero-badge { display: flex; gap: 8px; justify-content: center; margin-bottom: 18px; }
.hero-title { font-size: 44px; font-weight: 800; letter-spacing: 2px; }
.hero-title .grad {
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.hero-sub { color: var(--muted); margin: 12px 0 24px; font-size: 16px; }
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.hero-stats {
  display: flex; gap: 14px; justify-content: center; margin-top: 34px; flex-wrap: wrap;
}
.stat {
  background: var(--panel); border: 1px solid var(--border-soft);
  border-radius: var(--radius); padding: 12px 22px; min-width: 110px;
}
.stat b { display: block; font-size: 26px; color: var(--accent); }
.stat span { font-size: 12px; color: var(--muted); }

section { margin-bottom: 34px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (max-width: 900px) { .grid-3, .grid-2 { grid-template-columns: 1fr; } }

.pain-card h3 { margin: 10px 0 6px; font-size: 15.5px; }
.pain-card p { color: var(--muted); font-size: 13.5px; }
.pain-icon { font-size: 26px; }

.feat-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.feat-head h3 { font-size: 16px; }
.feat-icon {
  width: 40px; height: 40px; border-radius: 10px; font-size: 20px;
  background: var(--panel-2); display: flex; align-items: center; justify-content: center;
}
.feat-desc { color: var(--muted); font-size: 13.5px; margin-bottom: 14px; }

.home-footer { text-align: center; color: var(--dim); font-size: 12px; padding: 10px 0 4px; }
</style>
