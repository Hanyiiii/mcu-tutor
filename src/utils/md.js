// 轻量 Markdown 渲染（仅支持本项目用到的语法：标题/粗体/行内代码/代码块/列表/分隔线）
import { highlightC } from './highlight.js'

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function mdToHtml(text) {
  if (!text) return ''
  let src = text.replace(/\r\n/g, '\n')
  // 先把代码块取出来（支持 ``` 和 ~~~ 围栏），避免内部语法被转义处理
  const codeBlocks = []
  src = src.replace(/(```|~~~)(\w*)\n([\s\S]*?)\1/g, (m, fence, lang, code) => {
    const idx = codeBlocks.length
    const highlighted = lang === 'c' ? highlightC(code.trimEnd()) : escapeHtml(code.trimEnd())
    codeBlocks.push(`<pre><code>${highlighted}</code></pre>`)
    return `\u0000CODE${idx}\u0000`
  })
  // 流式输出时围栏尚未闭合：把尾部内容当作代码块渲染
  src = src.replace(/(```|~~~)(\w*)\n([\s\S]*)$/g, (m, fence, lang, code) => {
    const idx = codeBlocks.length
    const highlighted = lang === 'c' ? highlightC(code.trimEnd()) : escapeHtml(code.trimEnd())
    codeBlocks.push(`<pre><code>${highlighted}</code></pre>`)
    return `\u0000CODE${idx}\u0000`
  })

  let html = escapeHtml(src)

  // 行内代码
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>')
  // 粗体
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
  // 标题
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*)$/gm, '<h3>$1</h3>')
  // 分隔线
  html = html.replace(/^---+\s*$/gm, '<hr>')
  // 列表
  html = html.replace(/^(?:[-*]|\d+\.) (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>')
  // 段落与换行
  html = html.replace(/\n{2,}/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = `<p>${html}</p>`
  // 清理空段落
  html = html.replace(/<p>\s*<\/p>/g, '')

  // 还原代码块
  html = html.replace(/\u0000CODE(\d+)\u0000/g, (m, i) => codeBlocks[+i])
  return html
}
