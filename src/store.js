// 全局轻量状态：视图导航 + 跨页面联动
import { reactive } from 'vue'

export const store = reactive({
  view: 'home',
  // 从仿真向导跳转到代码生成时预选的模板 id
  pendingTemplate: null
})

export function go(view) {
  store.view = view
}
