'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ClientTestComponent() {
  const [result, setResult] = useState('点击按钮测试')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const testClientConnection = async () => {
    addLog('开始测试客户端连接...')
    try {
      addLog('创建客户端...')
      const supabase = createClient()
      addLog('客户端创建成功')

      addLog('执行查询...')
      const startTime = Date.now()

      // 添加超时
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('查询超时 (5秒)')), 5000)
      )

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .limit(1)

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

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
      setResult(`测试异常: ${e.message}`)
    }
  }

  return (
    <>
      <button
        onClick={testClientConnection}
        className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
      >
        测试客户端连接
      </button>
      <p className="mt-2 text-sm">{result}</p>
      <div className="mt-4 p-2 rounded-lg bg-white/5 max-h-40 overflow-y-auto">
        {logs.map((log, i) => (
          <div key={i} className="text-xs font-mono text-green-400">{log}</div>
        ))}
      </div>
    </>
  )
}
