'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Database, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

export default function PurchasingDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'glass' | 'ic'>('glass');
  const [glassResources, setGlassResources] = useState<GlassResource[]>([]);
  const [icResources, setIcResources] = useState<ICResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      // 加载玻璃资源
      const glassRes = await fetch('/api/resources/glass');
      if (glassRes.ok) {
        const glassData = await glassRes.json();
        setGlassResources(glassData.resources || []);
      }

      // 加载IC资源
      const icRes = await fetch('/api/resources/ic');
      if (icRes.ok) {
        const icData = await icRes.json();
        setIcResources(icData.resources || []);
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">采购部工作台</h1>
                <p className="text-sm text-slate-500">资源库管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'glass' | 'ic')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="glass" className="text-base">玻璃资源库</TabsTrigger>
            <TabsTrigger value="ic" className="text-base">IC资源库</TabsTrigger>
          </TabsList>

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
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  添加IC资源
                </CardTitle>
                <CardDescription className="text-green-100 text-base">
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
                        placeholder="例如：LCM-IC-8825-001"
                        value={icForm.modelNumber}
                        onChange={(e) => setIcForm({ ...icForm, modelNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icManufacturer" className="text-base font-medium">厂家</Label>
                      <Input
                        id="icManufacturer"
                        placeholder="例如：联发科"
                        value={icForm.manufacturer}
                        onChange={(e) => setIcForm({ ...icForm, manufacturer: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icSpecs" className="text-base font-medium">规格说明</Label>
                    <Textarea
                      id="icSpecs"
                      placeholder="请描述IC的规格参数，例如：驱动IC、支持1920×1080分辨率、MIPI接口"
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
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
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
    </div>
  );
}
