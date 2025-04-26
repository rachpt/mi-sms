/**
 * 等待页面工具函数
 */

/**
 * 等待指定时间
 * @param {number} interval - 等待的时间（单位：毫秒）
 * @returns {Promise<void>} 返回一个 Promise，解析为 void
 */
export const sleep = (interval: number): Promise<void> => {
  const start = performance.now()
  return new Promise<void>(resolve => {
    const loop = () => {
      if (performance.now() - start >= interval) {
        resolve()
      } else {
        requestAnimationFrame(loop)
      }
    }
    requestAnimationFrame(loop)
  })
}

/**
 * 等待指定选择器的元素出现在 DOM 中
 * @param {string} selector - CSS 选择器字符串
 * @param {number} [loopCount=200] - 超时时间（单位：次数），默认为 200 次
 * @param {number} [interval=300] - 每次检查的间隔时间（单位：毫秒），默认为 300ms
 * @param {boolean} [needContent=false] - 是否需要等待元素内容加载，默认为 false
 * @returns {Promise<HTMLElement | null>} 返回一个 Promise，解析为匹配的 HTMLElement 或 null（如果未找到）
 */
export async function waitElement(
  selector: string,
  loopCount: number = 200,
  interval: number = 300,
  needContent: boolean = false,
): Promise<HTMLElement | null> {
  while (loopCount--) {
    const element = document.querySelector(selector) as HTMLElement
    if (!element) {
      await sleep(interval)
      continue
    }

    if (needContent && element.innerText?.length === 0) {
      await sleep(interval)
      continue
    }
    return element
  }
  return null
}
