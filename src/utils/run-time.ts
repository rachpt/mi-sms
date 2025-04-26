/**
 * 在文档加载完成时执行指定的函数或函数列表
 * @param funcs 需要在文档加载完成后执行的函数或函数列表
 */
export function runAtDocumentEnd(funcs: Func | Func[]): void {
  const funcArray = Array.isArray(funcs) ? funcs : [funcs]
  const executeFunctions = () => {
    funcArray.forEach((func, index) => {
      try {
        func()
      } catch (error) {
        console.error(`执行函数 ${func.name || `#${index + 1}`} 时发生错误:`, error)
      }
    })
  }
  if (document.readyState === 'complete') executeFunctions()
  else window.addEventListener('load', executeFunctions)
}

type Func = () => void
