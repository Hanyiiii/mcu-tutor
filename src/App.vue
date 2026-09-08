<script setup>
import { computed } from 'vue'
import { store, go } from './store.js'
import HomeView from './components/HomeView.vue'
import ChatView from './components/ChatView.vue'
import CodeGenView from './components/CodeGenView.vue'
import SimGuideView from './components/SimGuideView.vue'
import KbView from './components/KbView.vue'
import LearnPathView from './components/LearnPathView.vue'

const views = [
  { id: 'home', name: '首页', icon: '🏠', comp: HomeView },
  { id: 'chat', name: 'AI 答疑', icon: '💬', comp: ChatView },
  { id: 'code', name: '代码生成', icon: '⚡', comp: CodeGenView },
  { id: 'sim', name: '仿真向导', icon: '🔧', comp: SimGuideView },
  { id: 'kb', name: '知识库', icon: '📚', comp: KbView },
  { id: 'path', name: '学习路径', icon: '🗺️', comp: LearnPathView }
]

const currentView = computed(() => views.find((v) => v.id === store.view).comp)
</script>

<template>
  <div class="app">
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">💾</div>
        <div>
          <div class="logo-name">芯师傅</div>
          <div class="logo-sub">ChipMaster AI</div>
        </div>
      </div>
      <nav class="nav">
        <button
          v-for="v in views"
          :key="v.id"
          class="nav-item"
          :class="{ active: store.view === v.id }"
          @click="go(v.id)"
        >
          <span class="ico">{{ v.icon }}</span>
          <span>{{ v.name }}</span>
        </button>
      </nav>
      <div class="side-footer">
        单片机 AI 学习助手<br />
        2026 重庆市AI大模型<br />创新应用大赛参赛作品
      </div>
    </aside>
    <main class="main">
      <transition name="fade" mode="out-in">
        <component :is="currentView" :key="store.view" />
      </transition>
    </main>
  </div>
</template>
