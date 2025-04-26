/**
 * 存储工具
 * 用于管理本地存储中的设置
 */

// 存储键名
const STORAGE_KEYS = {
  SMS_FILTER_KEYWORD: 'mi-sms-filter-keyword',
  SMS_FILTER_ENABLED: 'mi-sms-filter-enabled',
}

/**
 * 获取短信过滤关键词
 * @returns 存储的关键词，如果没有则返回默认值
 */
export function getSmsFilterKeyword(): string {
  return localStorage.getItem(STORAGE_KEYS.SMS_FILTER_KEYWORD) || '【美团】'
}

/**
 * 设置短信过滤关键词
 * @param keyword 要存储的关键词
 */
export function setSmsFilterKeyword(keyword: string): void {
  localStorage.setItem(STORAGE_KEYS.SMS_FILTER_KEYWORD, keyword)
}

/**
 * 获取短信过滤是否启用
 * @returns 是否启用过滤，默认为启用
 */
export function getSmsFilterEnabled(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.SMS_FILTER_ENABLED)
  return value === null ? true : value === 'true'
}

/**
 * 设置短信过滤是否启用
 * @param enabled 是否启用过滤
 */
export function setSmsFilterEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.SMS_FILTER_ENABLED, String(enabled))
}
