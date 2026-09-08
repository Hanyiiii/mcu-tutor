// 后端服务地址配置
// 本地开发：走 vite 代理 /api → http://localhost:8787
// 线上部署：指向 Supabase Edge Function 的 URL（部署时填入）
export const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? '/api'
  : 'https://wffiyxvlhchfgbelgwgy.supabase.co/functions/v1'

// 产品信息
export const APP_NAME = '芯师傅 ChipMaster'
export const APP_VERSION = 'v1.0'
