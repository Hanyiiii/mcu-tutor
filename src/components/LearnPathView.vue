<script setup>
import { ref, computed, watch } from 'vue'
import { store } from '../store.js'

const STAGES = [
  {
    name: '第一阶段 · 入门基础',
    icon: '🌱',
    desc: '点亮第一盏灯，建立对单片机运行原理的感性认识',
    items: [
      { text: 'C 语言基础：变量 / 循环 / 函数 / 位运算' },
      { text: '51 最小系统：电源 + 晶振 + 复位' },
      { text: 'Keil 新建工程并生成 hex' },
      { text: 'Proteus 搭建最小系统并加载 hex' },
      { text: '点亮第一盏 LED（流水灯）', link: 't01', linkType: 'code' }
    ]
  },
  {
    name: '第二阶段 · 输入输出与外设',
    icon: '🔘',
    desc: '让单片机"会看会说"：按键输入、数码管显示',
    items: [
      { text: '独立按键 + 软件消抖', link: 't02', linkType: 'code' },
      { text: '数码管静态显示与段码', link: 't03', linkType: 'code' },
      { text: '数码管动态扫描显示' },
      { text: '矩阵键盘扫描', link: 't08', linkType: 'code' },
      { text: '蜂鸣器发声', link: 't07', linkType: 'code' }
    ]
  },
  {
    name: '第三阶段 · 内部资源进阶',
    icon: '⚙️',
    desc: '掌握中断、定时器、串口三大内部资源',
    items: [
      { text: '中断系统：外部中断实验', link: 't06', linkType: 'code' },
      { text: '定时器：精确计时 1s', link: 't04', linkType: 'code' },
      { text: '定时器 + PWM 呼吸灯', link: 't10', linkType: 'code' },
      { text: '串口通信：发送与接收', link: 't05', linkType: 'code' },
      { text: 'LCD1602 字符显示', link: 't09', linkType: 'code' }
    ]
  },
  {
    name: '第四阶段 · 综合项目与进阶',
    icon: '🏆',
    desc: '独立完成课程设计，向 STM32 进发',
    items: [
      { text: '综合项目：数码管电子时钟', link: 't11', linkType: 'code' },
      { text: '74HC595 IO 扩展', link: 't12', linkType: 'code' },
      { text: 'DS18B20 温度采集（单总线）' },
      { text: 'STM32 + CubeMX + HAL 库入门', link: 't13', linkType: 'code' },
      { text: '独立完成一个课程设计项目' }
    ]
  }
]

const LS_KEY = 'chipmaster_progress'
const done = ref(load())

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}')
  } catch {
    return {}
  }
}

watch(done, (v) => {
  localStorage.setItem(LS_KEY, JSON.stringify(v))
}, { deep: true })

function toggleItem(stageIdx, itemIdx) {
  const key = stageIdx + '-' + itemIdx
  done.value[key] = !done.value[key]
}

function openResource(link) {
  store.pendingTemplate = link
  store.view = 'code'
}

const total = computed(() => STAGES.reduce((s, st) => s + st.items.length, 0))
const finished = computed(() => Object.values(done.value).filter(Boolean).length)
const percent = computed(() => Math.round((finished.value / total.value) * 100))
</script>

<template>
  <div>
    <div class="page-title">🗺️ 学习路径</div>
    <div class="page-sub">四阶段进阶路线，进度保存在本地浏览器，完成一项勾一项</div>

    <div class="card progress-card">
      <div class="progress-info">
        <span>总体进度</span>
        <b>{{ finished }} / {{ total }} 项（{{ percent }}%）</b>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: percent + '%' }"></div>
      </div>
    </div>

    <div class="stage-list">
      <div v-for="(st, si) in STAGES" :key="si" class="card stage-card">
        <div class="stage-head">
          <span class="stage-icon">{{ st.icon }}</span>
          <div>
            <b>{{ st.name }}</b>
            <p>{{ st.desc }}</p>
          </div>
        </div>
        <div class="stage-items">
          <div
            v-for="(it, ii) in st.items" :key="ii"
            class="stage-item"
            :class="{ done: done[si + '-' + ii] }"
            @click="toggleItem(si, ii)"
          >
            <span class="check">{{ done[si + '-' + ii] ? '✅' : '⬜' }}</span>
            <span class="item-text">{{ it.text }}</span>
            <button v-if="it.link" class="btn small link-btn" @click.stop="openResource(it.link)">查看模板</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-card { margin-bottom: 16px; }
.progress-info { display: flex; justify-content: space-between; font-size: 13.5px; color: var(--muted); margin-bottom: 10px; }
.progress-info b { color: var(--accent); }
.progress-bar { height: 10px; background: var(--bg-soft); border-radius: 999px; overflow: hidden; }
.progress-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  transition: width .3s ease;
}

.stage-list { display: flex; flex-direction: column; gap: 14px; }
.stage-head { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.stage-icon { font-size: 28px; }
.stage-head b { font-size: 15.5px; }
.stage-head p { color: var(--muted); font-size: 12.5px; }

.stage-items { display: flex; flex-direction: column; gap: 4px; }
.stage-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 8px; cursor: pointer;
  transition: background .15s; font-size: 13.5px;
}
.stage-item:hover { background: var(--panel-2); }
.stage-item.done .item-text { color: var(--dim); text-decoration: line-through; }
.item-text { flex: 1; }
.link-btn { flex-shrink: 0; }
</style>
