// 本地开发服务器：与 Supabase Edge Function 实现相同协议
// 用法：node server/local-server.mjs（需在项目根目录配置 .env.local）
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const env = { ...process.env }
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
  return env
}

const env = loadEnv()
const BASE_URL = (env.LLM_BASE_URL || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
const API_KEY = env.LLM_API_KEY || ''
const MODEL = env.LLM_MODEL || 'deepseek-chat'

const json = (res, status, obj) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(obj))
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }
  if (req.method !== 'POST' || req.url !== '/chat') { res.writeHead(404); res.end('Not found'); return }

  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(body || '{}')
      if (!Array.isArray(messages) || !messages.length) return json(res, 400, { error: 'messages 参数无效' })
      if (!API_KEY) {
        return json(res, 500, { error: '后端未配置 LLM_API_KEY：请在项目根目录 .env.local 中填写（参考 .env.local.example）' })
      }

      const upstream = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({ model: MODEL, messages, stream: true, temperature: 0.6 })
      })

      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text()
        return json(res, 502, { error: `上游接口错误 ${upstream.status}: ${errText.slice(0, 300)}` })
      }

      res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' })
      const reader = upstream.body.getReader()
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
          if (payload === '[DONE]') { res.write('data: [DONE]\n\n'); continue }
          try {
            const j = JSON.parse(payload)
            const delta = j.choices?.[0]?.delta?.content
            if (delta) res.write('data: ' + JSON.stringify({ content: delta }) + '\n\n')
          } catch { /* 忽略无法解析的行 */ }
        }
      }
      res.end()
    } catch (e) {
      json(res, 500, { error: String((e && e.message) || e) })
    }
  })
})

server.listen(8787, () => {
  console.log('芯师傅本地服务已启动: http://localhost:8787')
  console.log(`LLM: ${MODEL} @ ${BASE_URL}` + (API_KEY ? '' : '（⚠️ 未配置 API Key）'))
})
