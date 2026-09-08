<script setup>
import { ref } from 'vue'
import { GUIDES } from '../data/simguides.js'
import { store } from '../store.js'

const openId = ref('g01')

// 向导 → 代码模板联动
const guideTemplateMap = {
  g02: 't01', g03: 't02', g04: 't11', g05: 't05', g06: 't07', g07: 't09'
}

function toggle(id) {
  openId.value = openId.value === id ? null : id
}

function openTemplate(g) {
  const tid = guideTemplateMap[g.id]
  if (!tid) return
  store.pendingTemplate = tid
  store.view = 'code'
}
</script>

<template>
  <div>
    <div class="page-title">🔧 Proteus 仿真向导</div>
    <div class="page-sub">8 大常用电路分步搭建：元件清单、接线步骤、避坑提示，照着做就能跑</div>

    <div class="guide-list">
      <div v-for="g in GUIDES" :key="g.id" class="card guide-card">
        <div class="guide-head" @click="toggle(g.id)">
          <span class="guide-icon">{{ g.icon }}</span>
          <div class="guide-title">
            <b>{{ g.name }}</b>
            <span class="tag amber">{{ g.level }}</span>
          </div>
          <span class="guide-desc">{{ g.desc }}</span>
          <span class="guide-arrow">{{ openId === g.id ? '▲' : '▼' }}</span>
        </div>

        <div v-if="openId === g.id" class="guide-body fade-up">
          <div class="g-block">
            <div class="g-label">🧱 元件清单</div>
            <div class="parts-row">
              <span v-for="p in g.parts" :key="p.name" class="part-item">
                <b>{{ p.name }}</b>
                <i>{{ p.note }}</i>
              </span>
            </div>
          </div>

          <div class="g-block">
            <div class="g-label">📐 搭建步骤</div>
            <ol class="step-list">
              <li v-for="(s, i) in g.steps" :key="i">{{ s }}</li>
            </ol>
          </div>

          <div class="g-block">
            <div class="g-label">⚠️ 避坑提示</div>
            <ul class="tip-list">
              <li v-for="(t, i) in g.tips" :key="i">{{ t }}</li>
            </ul>
          </div>

          <button v-if="guideTemplateMap[g.id]" class="btn small" @click="openTemplate(g)">
            ⚡ 查看配套代码 →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-list { display: flex; flex-direction: column; gap: 10px; }

.guide-head {
  display: flex; align-items: center; gap: 14px; cursor: pointer;
  padding: 4px; user-select: none;
}
.guide-icon { font-size: 26px; }
.guide-title { display: flex; align-items: center; gap: 8px; min-width: 170px; }
.guide-title b { font-size: 15.5px; }
.guide-desc { color: var(--muted); font-size: 13px; flex: 1; }
.guide-arrow { color: var(--dim); font-size: 12px; }

.guide-body { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-soft); }
.g-block { margin-bottom: 16px; }
.g-label { font-size: 13.5px; font-weight: 700; color: var(--accent-2); margin-bottom: 8px; }

.parts-row { display: flex; flex-wrap: wrap; gap: 8px; }
.part-item {
  background: var(--panel-2); border: 1px solid var(--border-soft);
  border-radius: 8px; padding: 6px 12px; font-size: 12.5px;
  display: flex; flex-direction: column;
}
.part-item b { color: var(--text); font-family: var(--mono); font-weight: 600; }
.part-item i { color: var(--muted); font-style: normal; font-size: 11.5px; }

.step-list { margin-left: 20px; }
.step-list li { margin: 6px 0; font-size: 13.5px; }
.tip-list { margin-left: 20px; }
.tip-list li { margin: 5px 0; font-size: 13px; color: var(--muted); }
</style>
