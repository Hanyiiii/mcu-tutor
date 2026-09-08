// 轻量 C51/C 语法高亮（占位符法，无外部依赖）
const KW = 'void|int|char|unsigned|signed|long|short|float|double|while|for|if|else|return|switch|case|break|continue|do|const|static|volatile|extern|struct|union|enum|typedef|sizeof|default|goto|bit|sbit|sfr|sbit16|sfr16|data|idata|xdata|pdata|code|bdata|interrupt|using|reentrant|main'
const TYPE = 'uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t'

export function highlightC(code) {
  let s = code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 用占位符先抽走注释/字符串/预处理行，避免后续规则破坏标签
  const placeholders = []
  const stash = (re, cls) => {
    s = s.replace(re, (m) => {
      const i = placeholders.length
      placeholders.push(`<span class="${cls}">${m}</span>`)
      return `\u0000P${i}\u0000`
    })
  }
  stash(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, 'hl-com')
  stash(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')/g, 'hl-str')
  stash(/^(\s*#\s*\w+.*)$/gm, 'hl-pre')

  // 数字
  s = s.replace(/\b(0[xX][0-9a-fA-F]+|\d+[uUlLfF]*)\b/g, '<span class="hl-num">$1</span>')
  // 类型
  s = s.replace(new RegExp(`\\b(${TYPE})\\b`, 'g'), '<span class="hl-type">$1</span>')
  // sbit/sfr 特殊声明
  s = s.replace(/\b(sbit|sfr)\b/g, '<span class="hl-sbit">$1</span>')
  // 关键字
  s = s.replace(new RegExp(`\\b(${KW})\\b`, 'g'), '<span class="hl-kw">$1</span>')

  // 还原占位符
  s = s.replace(/\u0000P(\d+)\u0000/g, (m, i) => placeholders[+i])
  return s
}
