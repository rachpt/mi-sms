/**
 * 脚本入口
 */

import runSmsTool from './pages/sms'
import { runAtDocumentEnd } from './utils/run-time'

// 热更新配置
// if (import.meta.hot) {
//   import.meta.hot.accept()
// }

// main
;(() => {
  runSmsTool()
  // 页面完成后运行
  runAtDocumentEnd([])
})()
