# 芯师傅 ChipMaster —— 单片机 AI 学习助手

> 2026 年第二届重庆市 AI 大模型创新应用大赛 · AI 创意赛道（教育场景）参赛作品

面向单片机（8051/STM32）初学者的 AI 学习助手：把大模型的对话能力与结构化的嵌入式知识库结合，解决「答疑难、代码难、仿真难」三大学习痛点。

## 功能

- **💬 AI 智能答疑**：大模型流式对话 + 内置 36 条单片机知识库（本地轻量 RAG，命中自动注入上下文）
- **⚡ 代码生成**：13 个经典 Keil C51 / STM32 HAL 例程模板 + AI 按需定制 + 编译检查清单
- **🔧 Proteus 仿真向导**：8 大常用电路分步搭建（元件清单 / 接线步骤 / 避坑提示）
- **📚 知识库**：36 条知识点分类浏览与搜索
- **🗺️ 学习路径**：四阶段进阶路线，进度本地持久化

## 技术架构

```
Vue 3 + Vite 前端（GitHub Pages）
        │  POST /chat（SSE 流式）
        ▼
Supabase Edge Function（Deno，隐藏 API Key）
        │  OpenAI 兼容协议
        ▼
DeepSeek / 豆包 / 智谱 / 通义 等大模型 API
```

## 本地开发

```bash
npm install
# 1. 配置后端：复制 .env.local.example 为 .env.local，填入 LLM_API_KEY
npm run server        # 启动本地后端（:8787）
npm run dev           # 启动前端（:5173，/api 自动代理到后端）
```

## 线上部署

1. 前端：push 到 main，GitHub Actions 自动构建部署到 GitHub Pages
2. 后端：Supabase 新建项目 → 部署 `supabase/functions/chat` → 设置 Secrets（`LLM_BASE_URL` / `LLM_API_KEY` / `LLM_MODEL`）→ 将函数 URL 填入 `src/config.js` 的 `API_BASE`

## 项目结构

```
src/
  components/    # 6 个视图组件
  data/          # kb.js 知识库 / templates.js 代码模板 / simguides.js 仿真向导
  utils/         # markdown 渲染 / C 语法高亮
server/          # 本地开发后端（与 Edge Function 同协议）
supabase/        # Edge Function 源码
```
