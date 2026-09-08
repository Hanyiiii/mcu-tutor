<script setup>
import { ref, nextTick } from 'vue'
import { API_BASE } from '../config.js'
import { searchKB } from '../data/kb.js'
import { mdToHtml } from '../utils/md.js'

const SYSTEM_PROMPT = `你是"芯师傅"，一名面向单片机与嵌入式初学者的 AI 教学助手，擅长 8051/STM32、Keil C51 与 Proteus 仿真。
回答规则：
1. 用中文，面向初学者，先直接给出结论，再展开讲解；
2. 涉及代码时给出完整、可直接在 Keil C51 编译的代码块，使用 ~~~c 代码围栏包裹；
3. 涉及 Proteus 时说明关键元件名和接线要点；
4. 若系统提供了知识库资料，优先依据资料回答并保持术语一致；
5. 回答控制在合理篇幅，重点突出；不确定的内容明确说明。`

const messages = ref([
  {
    role: 'assistant',
    kb: null,
    content: `你好，我是**芯师傅** 👋 你的单片机 AI 私教。

我可以帮你：
- **答疑解惑**：寄存器、中断、串口、Keil 报错……随时问
- **写代码**：给出可直接编译的 Keil C51 例程
- **指导仿真**：Proteus 元件选型、接线、加载 hex

试试问我：「流水灯怎么写？」「Keil 报错 C202 是什么意思？」「定时器中断怎么配置？」`
  }
])
const input = ref('')
const busy = ref(false)
const boxRef = ref(null)
const inputRef = ref(null)

const quickPrompts = [
  '流水灯怎么写？',
  'Keil 报错 C202 是什么意思？',
  '定时器中断怎么配置？',
  'Proteus 里晶振怎么接？',
  '数码管共阴共阳有什么区别？'
]

function scrollBottom() {
  nextTick(() => {
    if (boxRef.value) boxRef.value.scrollTop = boxRef.value.scrollHeight
  })
}

function renderMd(t) {
  return mdToHtml(t || '')
}

async function send(text) {
  const q = (text ?? input.value).trim()
  if (!q || busy.value) return

  // 知识库检索（本地轻量 RAG）
  const hits = searchKB(q, 3)
  messages.value.push({ role: 'user', content: q, kb: hits })
  input.value = ''
  busy.value = true
  messages.value.push({ role: 'assistant', content: '', kb: null })
  const aiMsg = messages.value[messages.value.length - 1]
  scrollBottom()

  const msgs = [{ role: 'system', content: SYSTEM_PROMPT }]
  if (hits.length) {
    msgs.push({
      role: 'system',
      content: '以下为内置知识库中与用户问题相关的资料，请优先依据它们回答：\n\n' +
        hits.map((h) => `【${h.q}】\n${h.a}`).join('\n\n')
    })
  }
  msgs.push({ role: 'user', content: q })

  try {
    const res = await fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs })
    })
    if (!res.ok) {
      let err = `服务不可用（HTTP ${res.status}）`
      try { const j = await res.json(); if (j.error) err = j.error } catch { /* ignore */ }
      throw new Error(err)
    }
    const ct = res.headers.get('content-type') || ''
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
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const j = JSON.parse(payload)
            if (j.content) aiMsg.content += j.content
          } catch { /* ignore */ }
        }
        scrollBottom()
      }
    } else {
      const j = await res.json()
      if (j.error) throw new Error(j.error)
      aiMsg.content = j.content || '（空响应）'
    }
  } catch (e) {
    let msg = e.message || e
    if (msg === 'Failed to fetch') {
      msg = '无法连接后端服务（服务未启动或网络中断），请稍后重试'
    }
    aiMsg.content = `⚠️ **出错了**：${msg}

> 提示：本地开发需先运行 \`npm run server\` 启动后端，并在项目根目录配置 \`.env.local\`（参考 .env.local.example）。`
  } finally {
    busy.value = false
    scrollBottom()
  }
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="chat-wrap">
    <div class="page-title">💬 AI 智能答疑</div>
    <div class="page-sub">大模型 + 内置知识库（命中时自动注入相关资料，回答更贴合单片机教学场景）</div>

    <div class="chat-box card" ref="boxRef">
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div v-if="m.role === 'user'" class="user-bubble">
          <div class="user-text">{{ m.content }}</div>
          <div v-if="m.kb && m.kb.length" class="kb-hit">
            📚 已命中知识库 {{ m.kb.length }} 条：<span v-for="h in m.kb" :key="h.id" class="tag">{{ h.q }}</span>
          </div>
        </div>
        <div v-else class="ai-row">
          <div class="ai-avatar">💾</div>
          <div class="ai-bubble">
            <div v-if="m.content" class="md" v-html="renderMd(m.content)"></div>
            <div v-else-if="busy" class="typing">
              <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
            </div>
            <div v-else class="dim-text">（无内容）</div>
          </div>
        </div>
      </div>
    </div>

    <div class="quick">
      <span class="quick-label">快捷提问：</span>
      <button v-for="p in quickPrompts" :key="p" class="tag quick-tag" :disabled="busy" @click="send(p)">{{ p }}</button>
    </div>

    <div class="input-row">
      <textarea
        ref="inputRef"
        v-model="input"
        rows="2"
        placeholder="输入你的单片机问题，Enter 发送，Shift+Enter 换行……"
        @keydown="onKeydown"
      ></textarea>
      <button class="btn primary send-btn" :disabled="busy || !input.trim()" @click="send()">
        {{ busy ? '思考中…' : '发送 ➤' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-wrap { display: flex; flex-direction: column; height: 100%; }

.chat-box { flex: 1; overflow-y: auto; padding: 18px; margin-bottom: 12px; min-height: 260px; }

.msg { margin-bottom: 16px; }
.user-bubble { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.user-text {
  background: linear-gradient(135deg, rgba(45,212,167,.16), rgba(56,189,248,.1));
  border: 1px solid rgba(45,212,167,.3);
  border-radius: 12px 12px 4px 12px;
  padding: 10px 14px; max-width: 76%;
}
.kb-hit { font-size: 11.5px; color: var(--muted); display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.kb-hit .tag { font-size: 10.5px; }

.ai-row { display: flex; gap: 10px; }
.ai-avatar {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--accent), #0ea5e9);
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.ai-bubble {
  background: var(--panel-2); border: 1px solid var(--border-soft);
  border-radius: 4px 12px 12px 12px; padding: 10px 14px; max-width: 82%;
  font-size: 14px;
}
.dim-text { color: var(--dim); font-size: 13px; }

.quick { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
.quick-label { color: var(--dim); font-size: 12.5px; }
.quick-tag { cursor: pointer; transition: all .15s; }
.quick-tag:hover { background: rgba(45,212,167,.15); border-color: var(--accent); }
.quick-tag:disabled { opacity: .5; cursor: not-allowed; }

.input-row { display: flex; gap: 10px; align-items: stretch; }
.input-row textarea { flex: 1; }
.send-btn { min-width: 110px; }
</style>
