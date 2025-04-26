/**
 * 覆写 history.pushState 方法，允许在 pushState 被调用时执行自定义回调函数
 * @param {PushStateCallback} callback - 当 pushState 方法被调用时执行的回调函数
 * @callback PushStateCallback
 * @param {any} state - pushState 方法的 state 参数
 * @param {string} unused - pushState 方法的 title 参数，虽然目前大多数浏览器忽略此参数，但仍需传递
 * @param {string | null | undefined} url - pushState 方法的 url 参数，表示要推入历史记录的 URL
 */
export function overridePushState(callback: PushStateCallback): void {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function (state: any, unused: string, url?: string | null) {
    callback(state, unused, url) // 调用传入的回调函数
    const args: [any, string, (string | null | undefined)?] = [state, unused, url]
    return originalPushState.apply(history, args)
  }

  history.replaceState = function (state: any, unused: string, url?: string | null) {
    callback(state, unused, url) // 调用传入的回调函数
    const args: [any, string, (string | null | undefined)?] = [state, unused, url]
    return originalReplaceState.apply(history, args)
  }
}

type PushStateCallback = (state: any, title: string, url?: string | null) => void
