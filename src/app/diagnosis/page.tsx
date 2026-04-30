'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DiagnosisPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  const loadDiagnosis = async () => {
    setLoading('diagnosis');
    setMessage(null);
    try {
      const res = await fetch('/api/diagnosis');
      const data = await res.json();
      setDiagnosis(data);
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (e) {
      setMessage({ type: 'error', text: '加载失败: ' + (e as Error).message });
    }
    setLoading(null);
  };

  const initData = async () => {
    setLoading('init');
    setMessage(null);
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        loadDiagnosis();
      } else {
        setMessage({ type: 'error', text: data.error || '初始化失败' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '初始化失败: ' + (e as Error).message });
    }
    setLoading(null);
  };

  const clearDatabase = async (table: string) => {
    if (!confirm(`确定要清理 ${table === 'all' ? '所有' : table} 表的数据吗？此操作不可恢复！`)) {
      return;
    }
    setLoading('clear');
    setMessage(null);
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, confirm: true }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        loadDiagnosis();
      } else {
        setMessage({ type: 'error', text: data.error || '清理失败' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '清理失败: ' + (e as Error).message });
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">系统诊断与管理</h1>
          <p className="text-slate-600">数据库状态查看、数据初始化和清理功能</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                数据库状态
              </CardTitle>
              <CardDescription>查看各表数据量</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={loadDiagnosis} 
                disabled={loading === 'diagnosis'}
                className="w-full"
                variant="outline"
              >
                {loading === 'diagnosis' ? '加载中...' : '刷新状态'}
              </Button>
              {diagnosis?.dataCount && (
                <div className="mt-4 space-y-2">
                  {Object.entries(diagnosis.dataCount).map(([table, count]) => (
                    <div key={table} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm font-medium">{table}</span>
                      <Badge variant="secondary">{String(count)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                初始化数据
              </CardTitle>
              <CardDescription>添加示例项目需求数据</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                将添加 2 条以 RFQ-26- 开头的示例项目需求数据
              </p>
              <Button 
                onClick={initData} 
                disabled={loading === 'init'}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading === 'init' ? '初始化中...' : '初始化示例数据'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🗑️</span>
                清理数据
              </CardTitle>
              <CardDescription>删除指定表的数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-red-600 mb-2">⚠️ 危险操作！删除后数据无法恢复</p>
              <Button 
                onClick={() => clearDatabase('projectRequirements')}
                disabled={loading === 'clear'}
                variant="destructive"
                className="w-full"
              >
                清空项目需求表
              </Button>
              <Button 
                onClick={() => clearDatabase('designSolutions')}
                disabled={loading === 'clear'}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                清空设计方案表
              </Button>
              <Button 
                onClick={() => clearDatabase('qualityRecords')}
                disabled={loading === 'clear'}
                variant="outline"
                className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                清空质量记录表
              </Button>
            </CardContent>
          </Card>
        </div>

        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>项目需求列表</CardTitle>
              <CardDescription>当前数据库中的所有项目需求</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">需求编号</th>
                      <th className="text-left p-3">业务组</th>
                      <th className="text-left p-3">客户名称</th>
                      <th className="text-left p-3">尺寸</th>
                      <th className="text-left p-3">分辨率</th>
                      <th className="text-left p-3">产品类别</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50">
                        <td className="p-3">{p.id}</td>
                        <td className="p-3 font-mono">
                          {p.requirementId || <span className="text-red-400">null</span>}
                        </td>
                        <td className="p-3">{p.businessGroup}</td>
                        <td className="p-3">{p.customerName}</td>
                        <td className="p-3">{p.size || '-'}</td>
                        <td className="p-3">{p.resolution || '-'}</td>
                        <td className="p-3">{p.productCategory}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>提示：初始化数据后，业务部提交的 RFQ 编号将自动生成</p>
        </div>
      </div>
    </div>
  );
}
