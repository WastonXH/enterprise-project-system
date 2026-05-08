'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Database, Trash2, RefreshCw, ShoppingCart, Search, CheckCircle2, AlertCircle, Clock, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// 资源类型
type ResourceType = 'glass' | 'ic';

interface GlassResource {
  id: number;
  modelNumber: string;
  manufacturer: string | null;
  specifications: string | null;
  stockStatus: string | null;
  remarks: string | null;
}

interface ICResource {
  id: number;
  modelNumber: string;
  manufacturer: string | null;
  specifications: string | null;
  stockStatus: string | null;
  remarks: string | null;
}

// 零部件申请接口
interface ComponentRequest {
  id: number;
  componentType: string;
  componentName: string;
  modelNumber: string | null;
  quantity: number;
  urgency: string;
  purpose: string | null;
  remarks: string | null;
  status: string;
  createdAt: string;
}

// 待审批物料接口
interface PendingMaterial {
  type: 'glass' | 'ic'; // 物料类型
  id: number;
  modelNumber: string;
  manufacturer: string | null;
  resolution: string | null;
  interfaceType?: string | null;
  thickness?: string | null;
  packageType?: string | null;
  submittedBy: string | null;
  solutionId: number | null;
  productModel: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  finalModelNumber: string | null;
  remarks: string | null;
  createdAt: string;
}

export default function PurchasingDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('request');
  const [glassResources, setGlassResources] = useState<GlassResource[]>([]);
  const [icResources, setIcResources] = useState<ICResource[]>([]);
  const [componentRequests, setComponentRequests] = useState<ComponentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 待审批物料状态
  const [pendingGlass, setPendingGlass] = useState<PendingMaterial[]>([]);
  const [pendingIc, setPendingIc] = useState<PendingMaterial[]>([]);
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    type: 'glass' | 'ic';
    material: PendingMaterial | null;
    action: 'approve' | 'reject' | null;
  }>({ open: false, type: 'glass', material: null, action: null });
  const [approveForm, setApproveForm] = useState({ finalModelNumber: '', remarks: '' });

  // 表单状态
  const [glassForm, setGlassForm] = useState({
    modelNumber: '',
    manufacturer: '',
    specifications: '',
    stockStatus: '充足',
    remarks: '',
  });

  const [icForm, setIcForm] = useState({
    modelNumber: '',
    manufacturer: '',
    specifications: '',
    stockStatus: '充足',
    remarks: '',
  });

  // 零部件申请表单
  const [requestForm, setRequestForm] = useState({
    componentType: '',
    componentName: '',
    modelNumber: '',
    quantity: '',
    urgency: '一般',
    purpose: '',
    remarks: '',
  });

  // 成功信息
  const [successInfo, setSuccessInfo] = useState<{ requestId: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const [glassRes, icRes, requestRes, pendingGlassRes, pendingIcRes] = await Promise.all([
        fetch('/api/resources/glass'),
        fetch('/api/resources/ic'),
        fetch('/api/component-requests'),
        fetch('/api/pending-resources?type=glass'),
        fetch('/api/pending-resources?type=ic'),
      ]);

      if (glassRes.ok) {
        const glassData = await glassRes.json();
        setGlassResources(glassData.data || glassData.resources || []);
      }

      if (icRes.ok) {
        const icData = await icRes.json();
        setIcResources(icData.data || icData.resources || []);
      }

      if (requestRes.ok) {
        const requestData = await requestRes.json();
        setComponentRequests(requestData.data || []);
      }

      // 加载待审批物料
      if (pendingGlassRes.ok) {
        const pendingGlassData = await pendingGlassRes.json();
        setPendingGlass(pendingGlassData.data || []);
      }

      if (pendingIcRes.ok) {
        const pendingIcData = await pendingIcRes.json();
        setPendingIc(pendingIcData.data || []);
      }
    } catch (error) {
      console.error('加载资源失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!glassForm.modelNumber) {
      toast.error('请填写型号');
      return;
    }

    try {
      const response = await fetch('/api/resources/glass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(glassForm),
      });

      if (!response.ok) throw new Error('添加失败');

      toast.success('玻璃资源添加成功');
      setGlassForm({
        modelNumber: '',
        manufacturer: '',
        specifications: '',
        stockStatus: '充足',
        remarks: '',
      });
      loadResources();
    } catch (error) {
      toast.error('添加失败，请重试');
    }
  };

  const handleIcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!icForm.modelNumber) {
      toast.error('请填写型号');
      return;
    }

    try {
      const response = await fetch('/api/resources/ic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(icForm),
      });

      if (!response.ok) throw new Error('添加失败');

      toast.success('IC资源添加成功');
      setIcForm({
        modelNumber: '',
        manufacturer: '',
        specifications: '',
        stockStatus: '充足',
        remarks: '',
      });
      loadResources();
    } catch (error) {
      toast.error('添加失败，请重试');
    }
  };

  // 打开审批对话框
  const openApproveDialog = (type: 'glass' | 'ic', material: PendingMaterial, action: 'approve' | 'reject') => {
    setApproveDialog({ open: true, type, material, action });
    setApproveForm({
      finalModelNumber: material.modelNumber, // 预填充原型号
      remarks: '',
    });
  };

  // 处理审批操作
  const handleApprove = async () => {
    if (!approveDialog.material) return;

    if (approveDialog.action === 'approve' && !approveForm.finalModelNumber) {
      toast.error('请填写正式型号编码');
      return;
    }

    try {
      const response = await fetch('/api/pending-resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: approveDialog.type,
          action: approveDialog.action,
          id: approveDialog.material.id,
          finalModelNumber: approveForm.finalModelNumber,
          remarks: approveForm.remarks,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(approveDialog.action === 'approve' ? '已批准，物料已转入正式库' : '已拒绝');
        setApproveDialog({ open: false, type: 'glass', material: null, action: null });
        loadResources(); // 刷新列表
      } else {
        toast.error(data.error || '操作失败');
      }
    } catch (error) {
      toast.error('操作失败');
    }
  };

  // 删除待审批物料
  const handleDeletePending = async (type: 'glass' | 'ic', id: number) => {
    if (!confirm('确定要删除这条申请记录吗？')) return;

    try {
      const response = await fetch('/api/pending-resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('已删除');
        loadResources();
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 零部件申请提交
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestForm.componentType || !requestForm.componentName || !requestForm.quantity) {
      toast.error('请填写所有必填项');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/component-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...requestForm,
          quantity: parseInt(requestForm.quantity),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '提交失败');
      }

      const result = await response.json();
      setSuccessInfo({ requestId: result.data?.id?.toString() || '已提交' });

      toast.success('零部件申请提交成功！');

      // 重置表单
      setRequestForm({
        componentType: '',
        componentName: '',
        modelNumber: '',
        quantity: '',
        urgency: '一般',
        purpose: '',
        remarks: '',
      });

      loadResources();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteResource = async (type: ResourceType, id: number) => {
    try {
      const response = await fetch(`/api/resources/${type}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      toast.success('删除成功');
      loadResources();
    } catch (error) {
      toast.error('删除失败，请重试');
    }
  };

  // 获取状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case '待处理':
        return 'bg-yellow-100 text-yellow-700';
      case '处理中':
        return 'bg-blue-100 text-blue-700';
      case '已完成':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // 获取紧急程度样式
  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case '紧急':
        return 'bg-red-100 text-red-700';
      case '高':
        return 'bg-orange-100 text-orange-700';
      case '一般':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* 顶部导航 */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">采购部工作台</h1>
                <p className="text-sm text-slate-500">资源管理与零部件申请</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto">
            <TabsTrigger value="request" className="text-base">
              <ShoppingCart className="h-4 w-4 mr-2" />
              零部件申请
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-base">
              <Clock className="h-4 w-4 mr-2" />
              待审批物料
              {pendingGlass.filter(p => p.status === 'pending').length + pendingIc.filter(p => p.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingGlass.filter(p => p.status === 'pending').length + pendingIc.filter(p => p.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="glass" className="text-base">
              <Database className="h-4 w-4 mr-2" />
              玻璃资源库
            </TabsTrigger>
            <TabsTrigger value="ic" className="text-base">
              <Database className="h-4 w-4 mr-2" />
              IC资源库
            </TabsTrigger>
          </TabsList>

          {/* 零部件申请 Tab */}
          <TabsContent value="request" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  零部件申请
                </CardTitle>
                <CardDescription className="text-orange-100 text-base">
                  提交零部件采购申请
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        零部件类别 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={requestForm.componentType}
                        onValueChange={(v) => {
                          setRequestForm({ ...requestForm, componentType: v });
                          setSuccessInfo(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择类别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="玻璃">玻璃</SelectItem>
                          <SelectItem value="IC芯片">IC芯片</SelectItem>
                          <SelectItem value="FPC">FPC</SelectItem>
                          <SelectItem value="背光">背光</SelectItem>
                          <SelectItem value="偏光片">偏光片</SelectItem>
                          <SelectItem value="触摸屏">触摸屏</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        零部件名称 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="例如：15.6寸IPS玻璃"
                        value={requestForm.componentName}
                        onChange={(e) => {
                          setRequestForm({ ...requestForm, componentName: e.target.value });
                          setSuccessInfo(null);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">型号规格</Label>
                      <Input
                        placeholder="例如：LCM-G-156-001"
                        value={requestForm.modelNumber}
                        onChange={(e) => setRequestForm({ ...requestForm, modelNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        申请数量 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="请输入数量"
                        value={requestForm.quantity}
                        onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">紧急程度</Label>
                      <Select
                        value={requestForm.urgency}
                        onValueChange={(v) => setRequestForm({ ...requestForm, urgency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="紧急">紧急</SelectItem>
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="一般">一般</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">用途说明</Label>
                      <Input
                        placeholder="例如：XX项目试产"
                        value={requestForm.purpose}
                        onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">备注</Label>
                    <Textarea
                      placeholder="其他需要说明的信息..."
                      value={requestForm.remarks}
                      onChange={(e) => setRequestForm({ ...requestForm, remarks: e.target.value })}
                      rows={3}
                    />
                  </div>

                  {/* 成功提示 */}
                  {successInfo && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        申请提交成功！
                      </h4>
                      <div className="text-sm text-emerald-700">
                        <p>申请ID: <span className="font-bold">{successInfo.requestId}</span></p>
                        <p>请等待审批处理</p>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        提交申请
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 申请记录 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>申请记录</CardTitle>
                    <CardDescription>查看已提交的零部件申请</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadResources} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>零部件名称</TableHead>
                      <TableHead>类别</TableHead>
                      <TableHead>型号</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>紧急程度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {componentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                          暂无申请记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      componentRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.componentName}</TableCell>
                          <TableCell>{request.componentType}</TableCell>
                          <TableCell>{request.modelNumber || '-'}</TableCell>
                          <TableCell>{request.quantity}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyStyle(request.urgency)}`}>
                              {request.urgency}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(request.status)}`}>
                              {request.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 待审批物料 */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Clock className="h-6 w-6" />
                  研发部物料申请审批
                </CardTitle>
                <CardDescription className="text-purple-100 text-base">
                  审核研发部提交的临时物料申请，通过后加入正式资源库
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* 待审批玻璃物料 */}
                {pendingGlass.filter(p => p.status === 'pending').length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      待审批玻璃物料 ({pendingGlass.filter(p => p.status === 'pending').length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>申请型号</TableHead>
                          <TableHead>厂商</TableHead>
                          <TableHead>分辨率</TableHead>
                          <TableHead>关联产品</TableHead>
                          <TableHead>提交时间</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingGlass.filter(p => p.status === 'pending').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.modelNumber}</TableCell>
                            <TableCell>{item.manufacturer || '-'}</TableCell>
                            <TableCell>{item.resolution || '-'}</TableCell>
                            <TableCell>{item.productModel || '-'}</TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" onClick={() => openApproveDialog('glass', item, 'approve')}>
                                  <CheckCheck className="h-4 w-4 mr-1" /> 批准
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openApproveDialog('glass', item, 'reject')}>
                                  <X className="h-4 w-4 mr-1" /> 拒绝
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeletePending('glass', item.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 待审批IC物料 */}
                {pendingIc.filter(p => p.status === 'pending').length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      待审批IC物料 ({pendingIc.filter(p => p.status === 'pending').length})
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>申请型号</TableHead>
                          <TableHead>厂商</TableHead>
                          <TableHead>分辨率</TableHead>
                          <TableHead>关联产品</TableHead>
                          <TableHead>提交时间</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingIc.filter(p => p.status === 'pending').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.modelNumber}</TableCell>
                            <TableCell>{item.manufacturer || '-'}</TableCell>
                            <TableCell>{item.resolution || '-'}</TableCell>
                            <TableCell>{item.productModel || '-'}</TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="default" onClick={() => openApproveDialog('ic', item, 'approve')}>
                                  <CheckCheck className="h-4 w-4 mr-1" /> 批准
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => openApproveDialog('ic', item, 'reject')}>
                                  <X className="h-4 w-4 mr-1" /> 拒绝
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeletePending('ic', item.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 已处理记录 */}
                {(pendingGlass.filter(p => p.status !== 'pending').length > 0 || pendingIc.filter(p => p.status !== 'pending').length > 0) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      已处理记录
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>类型</TableHead>
                          <TableHead>申请型号</TableHead>
                          <TableHead>审批后型号</TableHead>
                          <TableHead>状态</TableHead>
                          <TableHead>审批时间</TableHead>
                          <TableHead>备注</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...pendingGlass, ...pendingIc].filter(p => p.status !== 'pending').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline">{item.type === 'glass' ? '玻璃' : 'IC'}</Badge>
                            </TableCell>
                            <TableCell>{item.modelNumber}</TableCell>
                            <TableCell>{item.finalModelNumber || '-'}</TableCell>
                            <TableCell>
                              <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                                {item.status === 'approved' ? '已批准' : '已拒绝'}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.approvedAt ? new Date(item.approvedAt).toLocaleString() : '-'}</TableCell>
                            <TableCell>{item.remarks || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 无待审批物料 */}
                {pendingGlass.filter(p => p.status === 'pending').length === 0 && pendingIc.filter(p => p.status === 'pending').length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-lg">暂无待审批物料</p>
                    <p className="text-sm">研发部提交的新物料申请将显示在这里</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 玻璃资源 */}
          <TabsContent value="glass" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  添加玻璃资源
                </CardTitle>
                <CardDescription className="text-green-100 text-base">
                  添加新的玻璃型号到资源库，供研发部选型使用
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleGlassSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="glassModel" className="text-base font-medium">
                        玻璃型号 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="glassModel"
                        placeholder="例如：LCM-G-156-001"
                        value={glassForm.modelNumber}
                        onChange={(e) => setGlassForm({ ...glassForm, modelNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="glassManufacturer" className="text-base font-medium">厂家</Label>
                      <Input
                        id="glassManufacturer"
                        placeholder="例如：京东方"
                        value={glassForm.manufacturer}
                        onChange={(e) => setGlassForm({ ...glassForm, manufacturer: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="glassSpecs" className="text-base font-medium">规格说明</Label>
                    <Textarea
                      id="glassSpecs"
                      placeholder="请描述玻璃的规格参数，例如：15.6英寸、IPS、1920×1080"
                      value={glassForm.specifications}
                      onChange={(e) => setGlassForm({ ...glassForm, specifications: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="glassStock" className="text-base font-medium">库存状态</Label>
                      <Select
                        value={glassForm.stockStatus}
                        onValueChange={(value) => setGlassForm({ ...glassForm, stockStatus: value })}
                      >
                        <SelectTrigger id="glassStock">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="充足">充足</SelectItem>
                          <SelectItem value="紧张">紧张</SelectItem>
                          <SelectItem value="缺货">缺货</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="glassRemarks" className="text-base font-medium">备注</Label>
                      <Input
                        id="glassRemarks"
                        placeholder="其他说明信息"
                        value={glassForm.remarks}
                        onChange={(e) => setGlassForm({ ...glassForm, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    添加玻璃资源
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* 玻璃资源列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>玻璃资源列表</CardTitle>
                    <CardDescription>当前资源库中的所有玻璃型号</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadResources} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>型号</TableHead>
                      <TableHead>厂家</TableHead>
                      <TableHead>规格说明</TableHead>
                      <TableHead>库存状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {glassResources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          暂无玻璃资源
                        </TableCell>
                      </TableRow>
                    ) : (
                      glassResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.modelNumber}</TableCell>
                          <TableCell>{resource.manufacturer || '-'}</TableCell>
                          <TableCell>{resource.specifications || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              resource.stockStatus === '充足' ? 'bg-green-100 text-green-700' :
                              resource.stockStatus === '紧张' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {resource.stockStatus || '未知'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteResource('glass', resource.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IC资源 */}
          <TabsContent value="ic" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  添加IC资源
                </CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  添加新的IC型号到资源库，供研发部选型使用
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleIcSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="icModel" className="text-base font-medium">
                        IC型号 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="icModel"
                        placeholder="例如：ST7701SN"
                        value={icForm.modelNumber}
                        onChange={(e) => setIcForm({ ...icForm, modelNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icManufacturer" className="text-base font-medium">厂家</Label>
                      <Input
                        id="icManufacturer"
                        placeholder="例如：联咏科技"
                        value={icForm.manufacturer}
                        onChange={(e) => setIcForm({ ...icForm, manufacturer: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icSpecs" className="text-base font-medium">规格说明</Label>
                    <Textarea
                      id="icSpecs"
                      placeholder="请描述IC的规格参数，例如：支持分辨率、接口类型等"
                      value={icForm.specifications}
                      onChange={(e) => setIcForm({ ...icForm, specifications: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="icStock" className="text-base font-medium">库存状态</Label>
                      <Select
                        value={icForm.stockStatus}
                        onValueChange={(value) => setIcForm({ ...icForm, stockStatus: value })}
                      >
                        <SelectTrigger id="icStock">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="充足">充足</SelectItem>
                          <SelectItem value="紧张">紧张</SelectItem>
                          <SelectItem value="缺货">缺货</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icRemarks" className="text-base font-medium">备注</Label>
                      <Input
                        id="icRemarks"
                        placeholder="其他说明信息"
                        value={icForm.remarks}
                        onChange={(e) => setIcForm({ ...icForm, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    添加IC资源
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* IC资源列表 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>IC资源列表</CardTitle>
                    <CardDescription>当前资源库中的所有IC型号</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadResources} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>型号</TableHead>
                      <TableHead>厂家</TableHead>
                      <TableHead>规格说明</TableHead>
                      <TableHead>库存状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icResources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                          暂无IC资源
                        </TableCell>
                      </TableRow>
                    ) : (
                      icResources.map((resource) => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.modelNumber}</TableCell>
                          <TableCell>{resource.manufacturer || '-'}</TableCell>
                          <TableCell>{resource.specifications || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              resource.stockStatus === '充足' ? 'bg-green-100 text-green-700' :
                              resource.stockStatus === '紧张' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {resource.stockStatus || '未知'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteResource('ic', resource.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* 审批对话框 */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => !open && setApproveDialog({ open: false, type: 'glass', material: null, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approveDialog.action === 'approve' ? '批准物料申请' : '拒绝物料申请'}
            </DialogTitle>
            <DialogDescription>
              {approveDialog.action === 'approve' ? (
                <>
                  <p>物料型号：<strong>{approveDialog.material?.modelNumber}</strong></p>
                  <p className="mt-2">请填写审批后的正式型号编码：</p>
                </>
              ) : (
                <>确定要拒绝此物料申请吗？</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {approveDialog.action === 'approve' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="finalModelNumber">正式型号编码 <span className="text-red-500">*</span></Label>
                <Input
                  id="finalModelNumber"
                  value={approveForm.finalModelNumber}
                  onChange={(e) => setApproveForm({ ...approveForm, finalModelNumber: e.target.value })}
                  placeholder="审批后的正式型号编码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approveRemarks">备注</Label>
                <Textarea
                  id="approveRemarks"
                  value={approveForm.remarks}
                  onChange={(e) => setApproveForm({ ...approveForm, remarks: e.target.value })}
                  placeholder="可选备注信息"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectRemarks">拒绝原因</Label>
                <Textarea
                  id="rejectRemarks"
                  value={approveForm.remarks}
                  onChange={(e) => setApproveForm({ ...approveForm, remarks: e.target.value })}
                  placeholder="请说明拒绝原因"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, type: 'glass', material: null, action: null })}>
              取消
            </Button>
            <Button onClick={handleApprove}>
              {approveDialog.action === 'approve' ? '确认批准' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
