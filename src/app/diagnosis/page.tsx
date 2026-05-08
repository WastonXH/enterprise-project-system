'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Requirement {
  id: number;
  requirementId: string | null;
  businessGroup: string;
  customerName: string;
  size: string | null;
  resolution: string | null;
  productCategory: string | null;
  productStructure: string | null;
  projectLevel: string | null;
  touchTechnology: string | null;
  viewingAngleTechnology: string | null;
  workTempLow: string | null;
  workTempHigh: string | null;
  storageTempLow: string | null;
  storageTempHigh: string | null;
  solutions: Solution[];
}

interface Solution {
  id: number;
  requirementId: number | null;
  solutionId: string | null;
  productModel: string | null;
  designStatus: string | null;
}

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

const requirementFields: EditableField[] = [
  { key: 'requirementId', label: '需求编号', type: 'text' },
  { key: 'businessGroup', label: '业务组', type: 'text' },
  { key: 'customerName', label: '客户名称', type: 'text' },
  { key: 'size', label: '尺寸', type: 'text' },
  { key: 'resolution', label: '分辨率', type: 'text' },
  { key: 'productCategory', label: '产品类别', type: 'select', options: [
    { value: 'T', label: 'TFT' },
    { value: 'F', label: 'FSTN' },
    { value: 'C', label: 'CTP' },
  ]},
  { key: 'productStructure', label: '产品结构', type: 'select', options: [
    { value: 's_lcm', label: 'S-LCM' },
    { value: 't_lcm', label: 'T-LCM' },
    { value: 'a_lcm', label: 'A-LCM' },
  ]},
  { key: 'projectLevel', label: '项目等级', type: 'select', options: [
    { value: 'A级', label: 'A级' },
    { value: 'B级', label: 'B级' },
    { value: 'C级', label: 'C级' },
  ]},
  { key: 'touchTechnology', label: '触控技术', type: 'select', options: [
    { value: '无', label: '无' },
    { value: 'GG', label: 'GG' },
    { value: 'GFF', label: 'GFF' },
    { value: 'INCELL', label: 'INCELL' },
    { value: 'ONCELL', label: 'ONCELL' },
  ]},
  { key: 'viewingAngleTechnology', label: '视角技术', type: 'select', options: [
    { value: 'IPS', label: 'IPS' },
    { value: 'TN', label: 'TN' },
  ]},
];

export default function DiagnosisPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [relationData, setRelationData] = useState<Requirement[]>([]);
  const [editingItem, setEditingItem] = useState<{ type: string; id: number; data: any } | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('data-status');

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
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
      }
    } catch (e) {
      showMessage('error', '加载关联数据失败: ' + (e as Error).message);
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
        showMessage('success', data.message);
        loadDiagnosis();
      } else {
        showMessage('error', data.error || '初始化失败');
      }
    } catch (e) {
      showMessage('error', '初始化失败: ' + (e as Error).message);
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
        showMessage('success', data.message);
        // 清空所有数据时自动重置需求编号
        if (table === 'all') {
          localStorage.removeItem('requirementSequenceNumber');
        }
        loadDiagnosis();
        loadRelationData();
      } else {
        showMessage('error', data.error || '清理失败');
      }
    } catch (e) {
      showMessage('error', '清理失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  // 重置需求编号
  const resetRequirementSequence = () => {
    if (!confirm('确定要重置需求编号从 0001 开始吗？此操作不可恢复！')) {
      return;
    }
    // 清除 localStorage 中的需求编号
    localStorage.removeItem('requirementSequenceNumber');
    showMessage('success', '需求编号已重置为 0001');
  };

  // 单条数据编辑
  const openEditDialog = (type: string, id: number, data: any) => {
    setEditingItem({ type, id, data });
    setEditForm(data || {});
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setLoading('save');
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editingItem.type,
          id: editingItem.id,
          data: editForm,
        }),
      });
      const result = await res.json();
      if (result.success) {
        showMessage('success', '修改成功');
        setEditingItem(null);
        loadRelationData();
      } else {
        showMessage('error', result.error || '修改失败');
      }
    } catch (e) {
      showMessage('error', '修改失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  // 单条数据删除
  const handleDeleteOne = async (type: string, id: number, name: string) => {
    if (!confirm(`确定要删除 "${name || ('ID: ' + id)}" 吗？此操作不可恢复！`)) {
      return;
    }
    setLoading('delete');
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      const result = await res.json();
      if (result.success) {
        showMessage('success', '删除成功');
        loadRelationData();
        loadDiagnosis();
      } else {
        showMessage('error', result.error || '删除失败');
      }
    } catch (e) {
      showMessage('error', '删除失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  // 删除需求（同时删除关联的设计方案）
  const handleDeleteRequirement = async (id: number, requirementId: string) => {
    if (!confirm(`确定要删除需求 "${requirementId}" 吗？\n这将同时删除该需求关联的所有设计方案！\n此操作不可恢复！`)) {
      return;
    }
    setLoading('delete');
    setMessage(null);
    try {
      // 先删除关联的设计方案
      const req = relationData.find(r => r.id === id);
      if (req?.solutions?.length) {
        for (const sol of req.solutions) {
          await fetch('/api/diagnosis', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'solution', id: sol.id }),
          });
        }
      }
      // 再删除需求本身
      const res = await fetch('/api/diagnosis', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'requirement', id }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', `需求 "${requirementId}" 已删除`);
        loadDiagnosis();
        loadRelationData();
      } else {
        showMessage('error', data.error || '删除失败');
      }
    } catch (e) {
      showMessage('error', '删除失败: ' + (e as Error).message);
    }
    setLoading(null);
  };

  useEffect(() => {
    loadDiagnosis();
    loadRelationData();
  }, []);

  const getFieldLabel = (key: string) => {
    const field = requirementFields.find(f => f.key === key);
    return field?.label || key;
  };

  const getFieldOptions = (key: string) => {
    const field = requirementFields.find(f => f.key === key);
    return field?.options || [];
  };

  const getFieldType = (key: string) => {
    const field = requirementFields.find(f => f.key === key);
    return field?.type || 'text';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">系统诊断与管理</h1>
          <p className="text-slate-600">数据库状态查看、数据初始化、单条数据编辑和清理功能</p>
        </div>

        {message && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-600' : 'text-green-600'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="data-status">数据状态</TabsTrigger>
            <TabsTrigger value="requirement-manage">需求管理</TabsTrigger>
            <TabsTrigger value="relation-view">需求-方案关联视图</TabsTrigger>
          </TabsList>

          <TabsContent value="data-status">
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
                    <span className="text-2xl">📋</span>
                    需求管理
                  </CardTitle>
                  <CardDescription>查看和删除项目需求</CardDescription>
                </CardHeader>
                <CardContent>
                  {diagnosis?.dataCount?.projectRequirements && diagnosis.dataCount.projectRequirements > 0 ? (
                    <>
                      <p className="text-sm text-slate-600 mb-2">
                        共 {diagnosis.dataCount.projectRequirements} 条需求
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        可在下方"需求-方案关联视图"中查看详情并删除
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">
                      暂无项目需求数据
                    </p>
                  )}
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
                    onClick={() => clearDatabase('all')}
                    disabled={loading === 'clear'}
                    variant="outline"
                    className="w-full border-red-500 text-red-600 hover:bg-red-50"
                  >
                    清空所有数据
                  </Button>
                  <Button
                    onClick={resetRequirementSequence}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    重置需求编号
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirement-manage">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>需求管理</CardTitle>
                <CardDescription>查看和删除项目需求，删除需求时会一并删除关联的设计方案</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={loadRelationData}
                  disabled={loading === 'relation'}
                  variant="outline"
                  className="mb-4"
                >
                  {loading === 'relation' ? '加载中...' : '刷新数据'}
                </Button>

                {relationData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    暂无项目需求数据
                  </div>
                ) : (
                  <div className="space-y-4">
                    {relationData.map((req) => (
                      <div key={req.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm">
                              需求 #{req.id}
                            </Badge>
                            <span className="font-mono font-medium text-lg">
                              {req.requirementId}
                            </span>
                            <Badge variant={req.solutions.length > 0 ? "default" : "secondary"}>
                              {req.solutions.length > 0 ? `已设计方案` : '未设计'}
                            </Badge>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => req.requirementId && handleDeleteRequirement(req.id, req.requirementId)}
                            disabled={loading === 'delete'}
                          >
                            删除
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-400">客户:</span> {req.customerName || '-'}
                          </div>
                          <div>
                            <span className="text-slate-400">业务组:</span> {req.businessGroup || '-'}
                          </div>
                          <div>
                            <span className="text-slate-400">产品类别:</span> {req.productCategory || '-'}
                          </div>
                          <div>
                            <span className="text-slate-400">项目等级:</span> {req.projectLevel || '-'}
                          </div>
                        </div>
                        {req.solutions.length > 0 && (
                          <div className="mt-3 pt-3 border-t text-sm text-slate-500">
                            关联设计方案: {req.solutions.map(s => s.productModel || `#${s.id}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relation-view">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>需求-方案关联视图</CardTitle>
                <CardDescription>查看项目需求及其对应的设计方案，支持单条数据编辑和删除</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={loadRelationData}
                  disabled={loading === 'relation'}
                  variant="outline"
                  className="mb-4"
                >
                  {loading === 'relation' ? '加载中...' : '刷新数据'}
                </Button>

                {relationData.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    暂无数据，请先初始化或提交项目需求
                  </div>
                ) : (
                  <div className="space-y-6">
                    {relationData.map((req) => (
                      <div key={req.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-sm">
                              需求 #{req.id}
                            </Badge>
                            <span className="font-mono font-semibold text-blue-600">
                              {req.requirementId || '未分配编号'}
                            </span>
                            <span className="text-slate-500">
                              {req.businessGroup} | {req.customerName}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog('requirement', req.id, req)}
                            >
                              编辑需求
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteOne('requirement', req.id, req.requirementId || req.customerName)}
                            >
                              删除需求
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                          <div><span className="text-slate-500">尺寸:</span> {req.size || '-'}</div>
                          <div><span className="text-slate-500">分辨率:</span> {req.resolution || '-'}</div>
                          <div><span className="text-slate-500">类别:</span> {req.productCategory || '-'}</div>
                          <div><span className="text-slate-500">等级:</span> {req.projectLevel || '-'}</div>
                          <div><span className="text-slate-500">触控:</span> {req.touchTechnology || '-'}</div>
                          <div><span className="text-slate-500">视角:</span> {req.viewingAngleTechnology || '-'}</div>
                          <div><span className="text-slate-500">工作温度:</span> {req.workTempLow || '-'}°C ~ {req.workTempHigh || '-'}°C</div>
                          <div><span className="text-slate-500">存储温度:</span> {req.storageTempLow || '-'}°C ~ {req.storageTempHigh || '-'}°C</div>
                        </div>

                        {/* 设计方案列表 */}
                        <div className="ml-4 pl-4 border-l-2 border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-slate-700">设计方案</span>
                            <Badge variant="secondary">{req.solutions?.length || 0}</Badge>
                          </div>
                          {req.solutions && req.solutions.length > 0 ? (
                            <div className="space-y-2">
                              {req.solutions.map((sol) => (
                                <div key={sol.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                                  <div>
                                    <span className="font-mono text-green-600">{sol.solutionId || '无编号'}</span>
                                    <span className="mx-2">|</span>
                                    <span>产品型号: {sol.productModel || '-'}</span>
                                    <span className="mx-2">|</span>
                                    <Badge variant={sol.designStatus === '已完成' ? 'default' : 'outline'} className="ml-2">
                                      {sol.designStatus || '未开始'}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditDialog('solution', sol.id, sol)}
                                    >
                                      编辑
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteOne('solution', sol.id, sol.solutionId || '方案#' + sol.id)}
                                    >
                                      删除
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400 italic">暂无设计方案</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>提示：在"需求-方案关联视图"中可以编辑或删除单条数据</p>
        </div>

        {/* 编辑对话框 */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                编辑 {editingItem?.type === 'requirement' ? '项目需求' : '设计方案'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {Object.entries(editForm).map(([key, value]) => {
                // 跳过内部字段
                if (['id', 'solutions', 'createdAt', 'updatedAt'].includes(key)) return null;
                const fieldType = getFieldType(key);
                return (
                  <div key={key} className="space-y-2">
                    <Label>{getFieldLabel(key)}</Label>
                    {fieldType === 'select' ? (
                      <Select 
                        value={value || ''} 
                        onValueChange={(v) => setEditForm({ ...editForm, [key]: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`选择${getFieldLabel(key)}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getFieldOptions(key).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={value || ''} 
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit} disabled={loading === 'save'}>
                {loading === 'save' ? '保存中...' : '保存修改'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
