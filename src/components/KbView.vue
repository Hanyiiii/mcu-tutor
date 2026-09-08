<script setup>
import { ref, computed } from 'vue'
import { KB } from '../data/kb.js'
import { mdToHtml } from '../utils/md.js'

const keyword = ref('')
const openId = ref(null)
const category = ref('全部')

const categories = ['全部', '基础概念', 'Keil', 'Proteus', '学习方法']

function catOf(item) {
  const q = item.q
  if (q.includes('Keil')) return 'Keil'
  if (q.includes('Proteus')) return 'Proteus'
  if (q.includes('学习') || q.includes('课程设计') || q.includes('区别')) return '学习方法'
  return '基础概念'
}

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return KB.filter((item) => {
    const okCat = category.value === '全部' || catOf(item) === category.value
    if (!okCat) return false
    if (!kw) return true
    return (
      item.q.toLowerCase().includes(kw) ||
      item.tags.some((t) => t.toLowerCase().includes(kw)) ||
      item.a.toLowerCase().includes(kw)
    )
  })
})

function toggle(id) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <div>
    <div class="page-title">📚 知识库</div>
    <div class="page-sub">{{ KB.length }} 条单片机核心知识点，支持搜索浏览，也是 AI 答疑的知识来源</div>

    <div class="kb-toolbar">
      <input v-model="keyword" type="text" placeholder="搜索：如「定时器」「Proteus」「消抖」……" class="kb-search" />
      <div class="cat-row">
        <button
          v-for="c in categories" :key="c"
          class="btn small" :class="{ primary: category === c }"
          @click="category = c"
        >{{ c }}</button>
      </div>
    </div>

    <div class="kb-count">共 {{ filtered.length }} 条</div>

    <div class="kb-list">
      <div v-for="item in filtered" :key="item.id" class="card kb-card">
        <div class="kb-head" @click="toggle(item.id)">
          <div class="kb-q">
            <b>Q: {{ item.q }}</b>
            <div class="kb-tags">
              <span v-for="t in item.tags" :key="t" class="tag">{{ t }}</span>
              <span class="tag blue">{{ catOf(item) }}</span>
            </div>
          </div>
          <span class="guide-arrow">{{ openId === item.id ? '▲' : '▼' }}</span>
        </div>
        <div v-if="openId === item.id" class="kb-body fade-up md" v-html="mdToHtml(item.a)"></div>
      </div>
    </div>

    <div v-if="!filtered.length" class="empty">没有找到匹配的知识点，换个关键词试试，或直接去「AI 答疑」提问</div>
  </div>
</template>

<style scoped>
.kb-toolbar { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.kb-search { max-width: 460px; }
.cat-row { display: flex; gap: 8px; flex-wrap: wrap; }
.kb-count { color: var(--dim); font-size: 12.5px; margin-bottom: 10px; }

.kb-list { display: flex; flex-direction: column; gap: 10px; }
.kb-card { padding: 14px 18px; }
.kb-head { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
.kb-q { flex: 1; }
.kb-q b { font-size: 14.5px; }
.kb-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.kb-tags .tag { font-size: 11px; }
.kb-body { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-soft); font-size: 13.5px; }
</style>
