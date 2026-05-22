'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DataCount {
  projectRequirements: number;
  designSolutions: number;
  glassResources: number;
  icResources: number;
  qualityRecords: number;
  componentCodes: number;
}

interface DiagnosisData {
  status: string;
  dataCount: DataCount;
  database: string;
}

interface Requirement {
  id: number;
  requirementId: string | null;
  customerName: string | null;
  productCategory: string | null;
  projectLevel: string | null;
  createdAt: string;
}

interface RequirementWithSolutions extends Requirement {
  solutions: Solution[];
}

interface Solution {
  id: number;
  productModel: string | null;
  createdAt: string;
}

export default function DiagnosisPage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [relationData, setRelationData] = useState<RequirementWithSolutions[]>([]);
  const [requirementSearch, setRequirementSearch] = useState('');
  const [filteredRequirements, setFilteredRequirements] = useState<RequirementWithSolutions[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newRequirementId, setNewRequirementId] = useState('');
  const [maxSequence, setMaxSequence] = useState<number>(0);
  const [dbDiagnosisResult, setDbDiagnosisResult] = useState<any>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // 数据库诊断函数
  const runDbDiagnosis = async () => {
    setLoading('diagnosis');
    setDbDiagnosisResult(null);
    try {
      const res = await fetch('/api/db-diagnosis');
      const data = await res.json();
      setDbDiagnosisResult(data);
    } catch (e) {
      setDbDiagnosisResult({
        results: [{
          step: '诊断失败',
          status: 'error',
          message: '无法连接到诊断API',
          error: (e as Error).message
        }]
      });
    }
    setLoading(null);
  };

  const loadDiagnosis = async () => {
    setLoading('diagnosis');
    setMessage(null);
    try {
      const res = await fetch('/api/diagnosis');
      const data = await res.json();
      setDiagnosis(data);
    } catch (e) {
      showMessage('error', '加载失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  const loadRelationData = async () => {
    setLoading('relation');
    try {
      const res = await fetch('/api/diagnosis?action=relation');
      const data = await res.json();
      if (data.data?.projectRequirements) {
        setRelationData(data.data.projectRequirements);
        // 计算数据库中最大的编号序号
        let maxSeq = 0;
        data.data.projectRequirements.forEach((req: RequirementWithSolutions) => {
          if (req.requirementId) {
            const match = req.requirementId.match(/RFQ-\d{2}-(\d+)/);
            if (match) {
              const seq = parseInt(match[1]);
              if (seq > maxSeq) maxSeq = seq;
            }
          }
        });
        setMaxSequence(maxSeq);
      }
    } catch (e) {
      showMessage('error', '加载关联数据失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  useEffect(() => {
    loadDiagnosis();
    loadRelationData();
  }, []);

  useEffect(() => {
    if (relationData && relationData.length > 0) {
      const filtered = relationData.filter((req) => {
        const searchLower = requirementSearch.toLowerCase();
        return (
          !requirementSearch ||
          req.requirementId?.toLowerCase().includes(searchLower) ||
          req.customerName?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredRequirements(filtered);
    } else {
      setFilteredRequirements([]);
    }
  }, [relationData, requirementSearch]);

  const clearDatabase = async (table: string) => {
    if (!confirm(`确定要清空 ${table === 'all' ? '所有' : table} 数据吗？此操作不可恢复！`)) {
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
        showMessage('success', data.message);
        localStorage.removeItem('requirementSequenceNumber');
        loadDiagnosis();
        loadRelationData();
      } else {
        showMessage('error', data.error || '清空失败');
      }
    } catch (e) {
      showMessage('error', '清空失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  const handleEditRequirementId = (id: number, currentId: string) => {
    setEditingId(id);
    setNewRequirementId(currentId || '');
  };

  const handleSaveRequirementId = async () => {
    if (!editingId || !newRequirementId.trim()) return;
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'requirement',
          id: editingId,
          data: { requirementId: newRequirementId.trim() }
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '需求编号已更新');
        setEditingId(null);
        loadRelationData();
      } else {
        showMessage('error', data.error || '更新失败');
      }
    } catch (e) {
      showMessage('error', '更新失败: ' + (e as Error).message);
    }
  };

  const handleDeleteRequirement = async (id: number) => {
    if (!confirm('确定要删除此需求吗？关联的设计方案也会被删除。')) {
      return;
    }
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'requirement', id }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', '需求已删除');
        loadDiagnosis();
        loadRelationData();
      } else {
        showMessage('error', data.error || '删除失败');
      }
    } catch (e) {
      showMessage('error', '删除失败: ' + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">系统诊断与管理</h1>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="status" className="space-y-6">
          <TabsList>
            <TabsTrigger value="status">数据状态</TabsTrigger>
            <TabsTrigger value="relation">需求-关联视图</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            {/* 数据库状态 */}
            <Card>
              <CardHeader>
                <CardTitle>数据库状态</CardTitle>
                <CardDescription>查看各表数据量</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  {diagnosis?.dataCount && Object.entries(diagnosis.dataCount).map(([key, value]) => (
                    <div key={key} className="bg-gray-100 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{value}</div>
                      <div className="text-sm text-gray-600">{key}</div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={loadDiagnosis} disabled={loading === 'diagnosis'}>
                  刷新状态
                </Button>
              </CardContent>
            </Card>

            {/* 数据清理 */}
            <Card>
              <CardHeader>
                <CardTitle>编号管理</CardTitle>
                <CardDescription>管理需求编号的生成和同步</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm">
                    <span className="font-semibold">数据库最大编号：</span>
                    <Badge variant="outline" className="ml-2">
                      RFQ-26-{maxSequence.toString().padStart(4, '0')}
                    </Badge>
                    <span className="text-gray-500 ml-4">
                      → 下一个需求将编号为 RFQ-26-{(maxSequence + 1).toString().padStart(4, '0')}
                    </span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2 text-red-600">危险操作</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => clearDatabase('all')}
                      disabled={loading === 'clear'}
                    >
                      清空所有数据
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => clearDatabase('projectRequirements')}
                      disabled={loading === 'clear'}
                    >
                      清空需求
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => clearDatabase('designSolutions')}
                      disabled={loading === 'clear'}
                    >
                      清空方案
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 数据库诊断卡片 */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>数据库连接诊断</CardTitle>
                <CardDescription>检测数据库连接状态，定位连接问题</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={runDbDiagnosis}
                  disabled={loading === 'diagnosis'}
                  className="mb-4"
                >
                  {loading === 'diagnosis' ? '诊断中...' : '开始诊断'}
                </Button>
                
                {dbDiagnosisResult && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm text-gray-500">
                      诊断时间: {new Date(dbDiagnosisResult.timestamp).toLocaleString()}
                    </div>
                    {dbDiagnosisResult.results.map((result: any, index: number) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.status === 'success' ? 'bg-green-50 border-green-200' :
                          result.status === 'error' ? 'bg-red-50 border-red-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'}
                          </span>
                          <span className="font-medium">{result.step}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">{result.message}</div>
                        {result.error && (
                          <div className="mt-2 text-sm text-red-600 font-mono bg-red-100 p-2 rounded">
                            {result.error}
                          </div>
                        )}
                        {result.data && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relation">
            <Card>
              <CardHeader>
                <CardTitle>需求-关联视图</CardTitle>
                <CardDescription>管理需求编号与产品型号的对应关系</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="搜索需求编号..."
                    value={requirementSearch}
                    onChange={(e) => setRequirementSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {loading === 'relation' ? (
                  <div className="text-center py-8">加载中...</div>
                ) : filteredRequirements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无数据</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>需求编号</TableHead>
                        <TableHead>产品型号</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequirements.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-mono">
                            {editingId === req.id ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={newRequirementId}
                                  onChange={(e) => setNewRequirementId(e.target.value)}
                                  className="w-36"
                                  placeholder="RFQ-26-0001"
                                />
                                <Button size="sm" onClick={handleSaveRequirementId}>保存</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>取消</Button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-base px-3 py-1">
                                {req.requirementId}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {req.solutions && req.solutions.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {req.solutions.map((sol) => (
                                  <Badge key={sol.id} variant="secondary" className="font-mono text-xs">
                                    {sol.productModel || `方案#${sol.id}`}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">暂无方案</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {editingId !== req.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditRequirementId(req.id, req.requirementId || '')}
                                >
                                  重置
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">删除</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除需求 {req.requirementId} 吗？
                                      {req.solutions && req.solutions.length > 0 && (
                                        <span className="block mt-2 text-red-600">
                                          注意：该需求关联 {req.solutions.length} 个设计方案，删除后将一并删除。
                                        </span>
                                      )}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRequirement(req.id)}>
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
