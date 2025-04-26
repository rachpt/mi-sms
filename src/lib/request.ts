/**
 * 为请求添加重试和错误处理
 */
import gmFetch from '@sec-ant/gm-fetch'
import { sleep } from '../utils/wait'

let handleError: ErrorHandler = (error: Error, url?: string | URL | Request): void => {
  console.error('Fetch Error:', error.message, url)
}

/**
 * 封装带有重试和错误拦截器的 fetch
 */
export default async function sendRequest(
  url: string | URL | Request,
  options: RequestInit = {},
  retryCount: number = 3,
): Promise<any> {
  let attempts = 0 // 当前尝试次数
  let _err: any

  while (true) {
    try {
      const response = await gmFetch(url, options)

      // 如果响应状态码不是 2xx, 抛出异常
      if (!response.ok) {
        const { status, statusText } = response
        const message = `状态: ${statusText || status}`
        throw new FetchError(message)
      }

      // 根据 responseType 返回不同类型的数据
      const responseType = options.responseType || 'auto'

      if (responseType === 'blob') {
        return await response.blob()
      } else if (responseType === 'text') {
        return await response.text()
      } else {
        // auto 或其他
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        } else {
          return await response.text()
        }
      }
    } catch (error) {
      if (!_err) _err = error as FetchError
      attempts++ // 增加尝试次数
      if (attempts >= retryCount) {
        handleError((_err || error) as Error, url)
        throw _err || error // 重新抛出错误，以便可以在调用处进一步处理
      }
      await sleep(200 * attempts)
    }
  }
}

/**
 * 外部设置自定义的错误处理函数
 */
export function setErrorHandler(customErrorHandler: ErrorHandler): void {
  handleError = customErrorHandler
}

type ErrorHandler = (error: Error, url?: string | URL | Request) => void

class FetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FetchError'
  }
}

// 扩展 RequestInit 接口，添加 responseType 属性
declare global {
  interface RequestInit {
    responseType?: 'auto' | 'blob' | 'text' | 'json'
  }
}
