// 芯师傅 ChipMaster —— Supabase Edge Function：代理 LLM API，流式返回
// 部署后需在 Supabase Dashboard 配置 Secrets：
//   LLM_BASE_URL（默认 https://api.deepseek.com/v1）
//   LLM_API_KEY
//   LLM_MODEL（默认 deepseek-chat）

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (req.method !== 'POST') return new Response('Not found', { status: 404, headers: cors })

  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages) || !messages.length) {
      return new Response(JSON.stringify({ error: 'messages 参数无效' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const baseUrl = (Deno.env.get('LLM_BASE_URL') || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
    const apiKey = Deno.env.get('LLM_API_KEY') || ''
    const model = Deno.env.get('LLM_MODEL') || 'deepseek-chat'
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'LLM_API_KEY 未配置' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, stream: true, temperature: 0.6 })
    })

    if (!upstream.ok || !upstream.body) {
      const errText = await upstream.text()
      return new Response(JSON.stringify({ error: `上游接口错误 ${upstream.status}: ${errText.slice(0, 300)}` }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    // 把上游 SSE 转换为统一的 { content } 数据流
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const stream = new ReadableStream({
      async start(controller) {
        let buf = ''
        for await (const chunk of upstream.body) {
          buf += decoder.decode(chunk, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6).trim()
            if (payload === '[DONE]') { controller.enqueue(encoder.encode('data: [DONE]\n\n')); continue }
            try {
              const j = JSON.parse(payload)
              const delta = j.choices?.[0]?.delta?.content
              if (delta) controller.enqueue(encoder.encode('data: ' + JSON.stringify({ content: delta }) + '\n\n'))
            } catch { /* 忽略无法解析的行 */ }
          }
        }
        controller.close()
      }
    })

    return new Response(stream, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
