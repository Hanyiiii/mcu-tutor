<script setup>
import { ref, computed, watch } from 'vue'
import { API_BASE } from '../config.js'
import { TEMPLATES, findTemplate } from '../data/templates.js'
import { store } from '../store.js'
import { highlightC } from '../utils/highlight.js'

const chip = ref('8051')
const peripherals = ref([])
const need = ref('')
const templateId = ref('t01')
const code = ref(findTemplate('t01').code)
const codeName = ref(findTemplate('t01').name)
const codeDesc = ref(findTemplate('t01').desc)
const busy = ref(false)
const error = ref('')
const copied = ref(false)

const PERIPH = ['LED', '独立按键', '数码管', '定时器', '中断', '串口', '蜂鸣器', 'LCD1602', '矩阵键盘', 'PWM', 'DS18B20', '74HC595']

const compileChecklist = [
  '文件保存为 .c 后缀，且已 Add 到 Source Group',
  '已包含 #include <reg52.h>（8051）或 STM32 对应头文件',
  '魔术棒 Output 里勾选了 Create HEX File',
  '代码中无中文分号、全角括号（注释除外）',
  '每条语句以分号结尾，括号成对',
  'sbit 引脚定义与 Proteus 原理图接线一致'
]

// 从仿真向导跳转过来时自动应用对应模板
watch(() => store.pendingTemplate, (id) => {
  if (!id) return
  applyTemplate(id)
  store.pendingTemplate = null
})

function applyTemplate(id) {
  const t = findTemplate(id)
  if (!t) return
  templateId.value = id
  code.value = t.code
  codeName.value = t.name
  codeDesc.value = t.desc
  chip.value = t.chip
  error.value = ''
}

function togglePeriph(p) {
  const i = peripherals.value.indexOf(p)
  if (i >= 0) peripherals.value.splice(i, 1)
  else peripherals.value.push(p)
}

async function aiGenerate() {
  if (busy.value) return
  busy.value = true
  error.value = ''
  code.value = '// AI 生成中，请稍候……'
  codeName.value = 'AI 定制代码'
  codeDesc.value = ''

  const desc = [
    need.value || '实现一个基础功能演示程序',
    peripherals.value.length ? `涉及外设：${peripherals.value.join('、')}` : '',
    `目标芯片：${chip.value}`
  ].filter(Boolean).join('；')

  const msgs = [
    {
      role: 'system',
      content: `你是嵌入式代码专家，请根据用户需求生成完整代码。
要求：
- ${chip.value === '8051'
        ? '使用 Keil C51 语法（#include <reg52.h>），中文注释，自包含必要的延时函数，代码完整可直接编译'
        : '使用 STM32 HAL 库（#include "stm32f1xx_hal.h"），CubeMX 工程骨架，中文注释'}
- 不要省略 main 函数，不要使用占位符
- 用 ~~~c 代码围栏只输出代码本身，不要任何额外解释`
    },
    { role: 'user', content: desc }
  ]

  try {
    const res = await fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    })
    if (!res.ok) {
      let err = `HTTP ${res.status}`
      try { const j = await res.json(); if (j.error) err = j.error } catch { /* ignore */ }
      throw new Error(err)
    }
    const ct = res.headers.get('content-type') || ''
    let full = ''
    if (ct.includes('text/event-stream')) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const p = line.slice(6).trim()
          if (p === '[DONE]') continue
          try { const j = JSON.parse(p); if (j.content) full += j.content } catch { /* ignore */ }
        }
      }
    } else {
      const j = await res.json()
      if (j.error) throw new Error(j.error)
      full = j.content || ''
    }
    const m = full.match(/~~~c\n([\s\S]*?)~~~/i) || full.match(/```c\n([\s\S]*?)```/i)
    code.value = m ? m[1].trim() : full.trim()
    codeName.value = 'AI 定制代码'
    codeDesc.value = 'AI 生成：' + desc
  } catch (e) {
    error.value = 'AI 生成失败：' + (e.message || e) + '。请确认后端已启动（npm run server），可先使用下方模板。'
    applyTemplate(templateId.value)
  } finally {
    busy.value = false
  }
}

const highlighted = computed(() => highlightC(code.value))

function copyCode() {
  navigator.clipboard.writeText(code.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  })
}

function downloadCode() {
  const blob = new Blob([code.value], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = chip.value === '8051' ? 'main.c' : 'main.c'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <div class="page-title">⚡ 代码生成</div>
    <div class="page-sub">经典例程模板 + AI 按需定制，生成的代码可直接在 Keil C51 编译</div>

    <div class="code-grid">
      <!-- 左侧：需求表单 -->
      <div class="card form-card">
        <div class="section-title"><span class="bar"></span>你的需求</div>

        <label class="f-label">目标芯片</label>
        <div class="chip-row">
          <button class="btn small" :class="{ primary: chip === '8051' }" @click="chip = '8051'">8051 (C51)</button>
          <button class="btn small" :class="{ primary: chip === 'STM32' }" @click="chip = 'STM32'">STM32 (HAL)</button>
        </div>

        <label class="f-label">用到哪些外设？</label>
        <div class="periph-row">
          <button
            v-for="p in PERIPH" :key="p"
            class="tag periph-tag" :class="{ on: peripherals.includes(p) }"
            @click="togglePeriph(p)"
          >{{ p }}</button>
        </div>

        <label class="f-label">需求描述</label>
        <textarea v-model="need" rows="3" placeholder="例：用定时器中断做一个 1 秒翻转一次的 LED，带中文注释"></textarea>

        <button class="btn primary gen-btn" :disabled="busy" @click="aiGenerate">
          {{ busy ? '🤖 AI 生成中…' : '🤖 AI 生成代码' }}
        </button>

        <div class="divider">—— 或者直接用经典模板 ——</div>

        <label class="f-label">选择模板（{{ TEMPLATES.length }} 个）</label>
        <select :value="templateId" @change="applyTemplate($event.target.value)">
          <option v-for="t in TEMPLATES" :key="t.id" :value="t.id">
            [{{ t.chip }} · {{ t.level }}] {{ t.name }}
          </option>
        </select>

        <div v-if="error" class="error-box">{{ error }}</div>

        <div class="section-title" style="margin-top: 18px"><span class="bar"></span>Keil 编译检查清单</div>
        <ul class="checklist">
          <li v-for="c in compileChecklist" :key="c">☑ {{ c }}</li>
        </ul>
      </div>

      <!-- 右侧：代码输出 -->
      <div class="card code-card">
        <div class="code-head">
          <span>📄 {{ codeName }} <span class="tag blue" style="margin-left: 8px">{{ chip }}</span></span>
          <span>
            <button class="btn small" @click="copyCode">{{ copied ? '✅ 已复制' : '📋 复制' }}</button>
            <button class="btn small" style="margin-left: 6px" @click="downloadCode">⬇️ 下载 .c</button>
          </span>
        </div>
        <div v-if="codeDesc" class="code-desc">📝 {{ codeDesc }}</div>
        <pre class="code-pre"><code v-html="highlighted"></code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-grid { display: grid; grid-template-columns: 380px 1fr; gap: 16px; align-items: start; }
@media (max-width: 1000px) { .code-grid { grid-template-columns: 1fr; } }

.f-label { display: block; font-size: 13px; color: var(--muted); margin: 14px 0 6px; }
.chip-row { display: flex; gap: 8px; }
.periph-row { display: flex; flex-wrap: wrap; gap: 6px; }
.periph-tag { cursor: pointer; user-select: none; transition: all .15s; }
.periph-tag.on { background: rgba(45,212,167,.18); border-color: var(--accent); color: var(--text); }

.gen-btn { width: 100%; margin-top: 14px; }
.divider { text-align: center; color: var(--dim); font-size: 12.5px; margin: 16px 0; }
.error-box {
  margin-top: 12px; padding: 10px 12px; border-radius: 9px; font-size: 12.5px;
  background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.35); color: var(--danger);
}
.checklist { list-style: none; font-size: 12.5px; color: var(--muted); }
.checklist li { margin: 5px 0; }

.code-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.code-card .code-head { padding: 12px 16px; }
.code-desc { padding: 0 16px 10px; font-size: 12.5px; color: var(--muted); }
.code-pre { margin: 0; padding: 4px 16px 16px; overflow-x: auto; font-family: var(--mono); font-size: 13px; line-height: 1.6; color: #d7e3f5; white-space: pre; max-height: 640px; overflow-y: auto; }
</style>
