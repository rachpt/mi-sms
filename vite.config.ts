import { resolve } from 'node:path'
import { writeFileSync, readFileSync } from 'node:fs'

import { defineConfig } from 'vite'
import type { Plugin as VitePlugin } from 'vite'
import monkey from 'vite-plugin-monkey'

const updatedVersion = updatePackageVersion()

// https://vitejs.dev/config/
export default defineConfig({
  define: { ['import.meta.env.VERSION']: JSON.stringify(updatedVersion) },
  build: { minify: true, cssMinify: true, target: 'es2020' },
  css: { modules: { localsConvention: 'camelCase' } },
  plugins: [
    compressCssInJs(),
    monkey({
      server: { open: false },
      entry: 'src/main.ts',
      build: { systemjs: 'inline', metaFileName: true },
      userscript: {
        license: 'MIT',
        'run-at': 'document-start',
        namespace: 'https://rachpt.cn',
        icon: 'https://cdn.web-global.fds.api.mi-img.com/mcfe--fds-static-files/micloud-images/favicon.ico',
        match: ['https://i.mi.com/sms/*'],
      },
    }),
  ],
})

function updatePackageVersion() {
  const version = generateVersion()
  const packageJsonPath = resolve(__dirname, 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  packageJson.version = version
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

  console.log(`Version updated to ${version}`)
  return version
}

function generateVersion() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = now.getHours() * 100 + now.getMinutes()

  return `${year}.${month}.${day}.${time}`
}

function compressCssInJs(): VitePlugin {
  function compressString(str: string): string {
    return str
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/:\s+/g, ':')
      .replace(/;\s+/g, ';')
      .trim()
      .replace(/\\/g, '\\\\') // 先转义反斜杠
      .replace(/"/g, '\\"') // 再转义双引号
      .replace(/\n/g, '\\n') // 转义换行符
      .trim()
  }

  return {
    enforce: 'pre',
    name: 'compress-css-in-js',
    transform(code, id) {
      if (!/\.[jt]sx?$/.test(id)) return
      if (id.includes('node_modules/')) return

      // 注意 ` 在替换后仍需保留, 否者变量会出现异常
      const cssStringRegex = /`([^`]*\.[^`]*\{[^`]*\})`/gs
      const insertStyleSheetRegex = /insertStyleSheet\s*\(\s*(['"])[\w-]+\1\s*,\s*`([\s\S]+?)`[,\s]*\)/gs
      const createElementWithHTMLRegex = /createElementWithHTML\s*\(\s*`([^`]+?)`\s*\)/gs
      const htmlAssignmentRegex = /(\w+\.innerHTML\s*=\s*)`([^`]+?)`/gs
      const htmlCssRegex = /(\w+\.cssText\s*=\s*)`([^`]+?)`/gs

      const log = false // Vite插件调试开关
      try {
        const newCode = code
          .replace(cssStringRegex, match => {
            if (log) console.log('\nmatch:: ', '-------css----')
            if (log)
              console.log('newCode:: ', match.replace(/\s+/g, ' ').replace(/:\s+/g, ':').replace(/;\s+/g, ';').trim())
            return match.replace(/\s+/g, ' ').replace(/:\s+/g, ':').replace(/;\s+/g, ';').trim()
          })
          .replace(insertStyleSheetRegex, (_, quote, cssString) => {
            const compressedCss = compressString(cssString)
            if (log) console.log('\nmatch: insertStyleSheet : ', quote, cssString)
            if (log) console.log('newCode:: ', compressedCss)
            return `insertStyleSheet(${quote}sort-table${quote},\`${compressedCss}\`)`
          })
          .replace(htmlAssignmentRegex, (_, prefix, htmlString) => {
            const compressedHtml = compressString(htmlString)
            if (log) console.log('\nmatch: innerHTML : ', prefix, htmlString)
            if (log) console.log('newCode:: ', `${prefix}\`${compressedHtml}\``)
            return `${prefix}\`${compressedHtml}\``
          })
          .replace(htmlCssRegex, (_, prefix, htmlString) => {
            const compressedHtml = compressString(htmlString)
            if (log) console.log('\nmatch: cssText : ', prefix, htmlString)
            if (log) console.log('newCode:: ', `${prefix}\`${compressedHtml}\``)
            return `${prefix}\`${compressedHtml}\``
          })
          .replace(createElementWithHTMLRegex, (_, htmlString) => {
            const compressedHtml = compressString(htmlString)
            if (log) console.log('\nmatch: createElementWithHTML : ', htmlString)
            if (log) console.log('newCode:: ', compressedHtml)
            return `createElementWithHTML(\`${compressedHtml}\`)`
          })

        return {
          code: newCode,
          map: null,
        }
      } catch (error) {
        console.error(`Error processing file ${id}:`, error)
        return null // 返回 null 表示不修改原始代码
      }
    },
  }
}
