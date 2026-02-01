'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

export function ClientTestComponent() {
  const [result, setResult] = useState('点击按钮测试')
  const [logs, setLogs] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const testClientConnection = async () => {
    setIsTesting(true)
    setLogs([])
    setResult('正在测试...')
    addLog('开始测试客户端连接...')
    try {
      addLog('创建客户端...')
      const supabase = createClient()
      addLog('客户端创建成功')

      addLog('执行查询...')
      const startTime = Date.now()

      // 直接执行查询，超时由客户端层面控制（60秒）
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      const elapsed = Date.now() - startTime
      addLog(`查询完成，耗时: ${elapsed}ms`)

      if (error) {
        addLog(`错误: ${error.message}`)
        setResult(`查询失败: ${error.message}`)
      } else {
        addLog(`成功! 数据: ${JSON.stringify(data)}`)
        setResult(`查询成功! 耗时 ${elapsed}ms`)
      }
    } catch (e: any) {
      addLog(`异常: ${e.message}`)
      // 检测是否是超时/中止错误
      if (e.name === 'AbortError' || e.message.includes('abort')) {
        setResult('请求超时 - 请确保浏览器已配置代理')
      } else if (e.message.includes('fetch') || e.message.includes('network')) {
        setResult(`网络错误: ${e.message}`)
      } else {
        setResult(`测试异常: ${e.message}`)
      }
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={testClientConnection}
        disabled={isTesting}
        className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isTesting ? '测试中...' : '测试客户端连接'}
      </button>
      <p className="mt-2 text-sm">{result}</p>
      {logs.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-xs font-mono text-green-400">{log}</div>
          ))}
        </div>
      )}
      {/* 网络错误提示 */}
      {(result.includes('超时') || result.includes('网络') || result.includes('Failed to fetch') || result.includes('Abort')) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-medium mb-1">网络连接提示</p>
            <p className="text-yellow-200/70">
              如果无法访问 Supabase，请确保浏览器已配置代理。
              您可以开启 Clash/V2Ray 的系统代理模式，或使用浏览器代理扩展。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
