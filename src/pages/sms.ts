/**
 * 短信页面过滤
 */

import XHRAndFetchInterceptor from '../lib/intercept'
import { getSmsFilterKeyword, setSmsFilterKeyword, getSmsFilterEnabled, setSmsFilterEnabled } from '../utils/storage'

export default function runSmsTool() {
  // 初始化拦截器
  void new XHRAndFetchInterceptor([
    {
      url: 'https://i.mi.com/sms/full/thread',
      beforeSendCallback: handleBeforeSendCallback,
      lastCallback: handleLastCallback,
      method: 'GET',
    },
  ])

  // 在页面完全加载后创建悬浮设置按钮
  document.addEventListener('DOMContentLoaded', () => {
    createFilterSettingButton()
  })

  // 监听设置更新事件，刷新页面或重新加载数据
  document.addEventListener('refresh-sms-filter', () => {
    // 如果页面上有刷新按钮，可以尝试点击它
    const refreshButton = document.querySelector('.refresh-button') as HTMLButtonElement
    if (refreshButton) {
      refreshButton.click()
    } else {
      // 否则尝试重新加载页面
      window.location.reload()
    }
  })
}

/**
 * 创建悬浮设置按钮
 */
function createFilterSettingButton() {
  // 创建设置按钮
  const settingButton = document.createElement('button')
  settingButton.textContent = '设置过滤'
  settingButton.style.cssText = `
    position: fixed;
    top: 14px;
    right: 220px;
    z-index: 9999;
    padding: 8px 12px;
    background-color: #ff6700;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    transition: all 0.3s ease;
  `

  // 创建开关按钮
  const toggleButton = document.createElement('button')
  // 获取当前过滤状态
  const isFilterEnabled = getSmsFilterEnabled()
  toggleButton.textContent = isFilterEnabled ? '已开启' : '已关闭'
  toggleButton.style.cssText = `
    position: fixed;
    top: 14px;
    right: 310px;
    z-index: 9999;
    padding: 8px 12px;
    background-color: ${isFilterEnabled ? '#4CAF50' : '#9e9e9e'};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    transition: all 0.3s ease;
  `

  // 悬停效果
  settingButton.addEventListener('mouseover', () => {
    settingButton.style.backgroundColor = '#ff8533'
    settingButton.style.transform = 'translateY(-2px)'
    settingButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
  })

  settingButton.addEventListener('mouseout', () => {
    settingButton.style.backgroundColor = '#ff6700'
    settingButton.style.transform = 'translateY(0)'
    settingButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'
  })

  // 点击按钮显示设置面板
  settingButton.addEventListener('click', () => {
    showFilterSettingPanel()
  })

  // 悬停效果 - 开关按钮
  toggleButton.addEventListener('mouseover', () => {
    const isEnabled = getSmsFilterEnabled()
    toggleButton.style.backgroundColor = isEnabled ? '#66BB6A' : '#bdbdbd'
    toggleButton.style.transform = 'translateY(-2px)'
    toggleButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'
  })

  toggleButton.addEventListener('mouseout', () => {
    const isEnabled = getSmsFilterEnabled()
    toggleButton.style.backgroundColor = isEnabled ? '#4CAF50' : '#9e9e9e'
    toggleButton.style.transform = 'translateY(0)'
    toggleButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)'
  })

  // 点击开关按钮切换过滤状态
  toggleButton.addEventListener('click', () => {
    const currentState = getSmsFilterEnabled()
    const newState = !currentState
    setSmsFilterEnabled(newState)

    // 更新按钮外观
    toggleButton.textContent = newState ? '已开启' : '已关闭'
    toggleButton.style.backgroundColor = newState ? '#4CAF50' : '#9e9e9e'

    // 显示状态变更提示
    showToast(`过滤功能已${newState ? '开启' : '关闭'}`)

    // 触发页面刷新以应用新设置
    try {
      const refreshEvent = new Event('refresh-sms-filter')
      document.dispatchEvent(refreshEvent)
    } catch (error) {
      console.error('应用新设置时出错:', error)
    }
  })

  // 添加到页面
  document.body.appendChild(settingButton)
  document.body.appendChild(toggleButton)
}

/**
 * 显示过滤设置面板
 */
function showFilterSettingPanel() {
  // 创建设置面板
  const panel = document.createElement('div')
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    min-width: 300px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  `

  // 创建标题
  const title = document.createElement('h3')
  title.textContent = '短信过滤设置'
  title.style.margin = '0 0 15px 0'

  // 创建输入框
  const input = document.createElement('input')
  input.type = 'text'
  input.value = getSmsFilterKeyword()
  input.placeholder = '请输入过滤关键词'
  input.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  `

  // 创建按钮容器
  const buttonContainer = document.createElement('div')
  buttonContainer.style.display = 'flex'
  buttonContainer.style.justifyContent = 'flex-end'
  buttonContainer.style.gap = '10px'

  // 取消按钮
  const cancelButton = document.createElement('button')
  cancelButton.textContent = '取消'
  cancelButton.style.cssText = `
    padding: 6px 12px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
  `
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(panel)
  })

  // 保存按钮
  const saveButton = document.createElement('button')
  saveButton.textContent = '保存'
  saveButton.style.cssText = `
    padding: 6px 12px;
    background-color: #ff6700;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  `

  // 悬停效果
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.backgroundColor = '#ff8533'
  })

  saveButton.addEventListener('mouseout', () => {
    saveButton.style.backgroundColor = '#ff6700'
  })
  saveButton.addEventListener('click', () => {
    // 获取新的关键词
    const newKeyword = input.value.trim()

    // 检查是否有变化
    const oldKeyword = getSmsFilterKeyword()
    const hasChanged = newKeyword !== oldKeyword

    // 保存设置
    setSmsFilterKeyword(newKeyword)
    document.body.removeChild(panel)

    // 显示保存成功提示
    if (hasChanged) {
      showToast(`设置已保存：过滤关键词"${newKeyword}"`)

      // 尝试重新加载数据以应用新的过滤条件
      try {
        // 触发页面刷新以应用新设置
        const refreshEvent = new Event('refresh-sms-filter')
        document.dispatchEvent(refreshEvent)
      } catch (error) {
        console.error('应用新设置时出错:', error)
      }
    } else {
      showToast('设置未变更')
    }
  })

  // 添加元素到面板
  buttonContainer.appendChild(cancelButton)
  buttonContainer.appendChild(saveButton)
  panel.appendChild(title)
  panel.appendChild(input)
  panel.appendChild(buttonContainer)

  // 添加面板到页面
  document.body.appendChild(panel)
}

/**
 * 显示提示信息
 * @param message 提示信息
 */
function showToast(message: string) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 10000;
  `
  document.body.appendChild(toast)

  // 3秒后自动消失
  setTimeout(() => {
    if (toast.parentNode) {
      document.body.removeChild(toast)
    }
  }, 3000)
}

function handleBeforeSendCallback(request: any): any {
  request.url.searchParams.set('limit', '200')
  return request
}

function handleLastCallback(response: any): any {
  // 检查过滤功能是否启用
  const isFilterEnabled = getSmsFilterEnabled()

  // 如果过滤功能已关闭，直接返回原始响应
  if (!isFilterEnabled) {
    return response
  }

  // 从本地存储获取过滤关键词
  const filterKeyword = getSmsFilterKeyword()

  const result = response.data.entries.filter((i: { entry: { snippet: string } }) => {
    return i.entry.snippet.startsWith(filterKeyword)
  })
  response.data.entries = result
  return response
}
