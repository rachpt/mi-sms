// 防抖函数
export const debounce = (fn: Function, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(null, args)
      timer = null
    }, delay)
  }
}
