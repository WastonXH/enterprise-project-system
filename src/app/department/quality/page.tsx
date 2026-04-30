'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ShieldCheck, CheckCircle2, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// 设计方案接口
interface DesignSolution {
  id: number;
  productModel: string | null;
  projectId: number | null;
  createdAt: string;
}

// 质量记录接口
interface QualityRecord {
  id: number;
  designId: number | null;
  productModel: string | null;
  trialProductionDate: string | null;
  productionBatch: string | null;
  qualityMetrics: string | null;
  defectRate: string | null;
  testResults: string | null;
  issues: string | null;
  improvement: string | null;
  inspector: string | null;
  createdAt: string;
}

export default function QualityDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('record');

  // 数据列表
  const [designSolutions, setDesignSolutions] = useState<DesignSolution[]>([]);
  const [qualityRecords, setQualityRecords] = useState<QualityRecord[]>([]);

  // 搜索
  const [searchProductModel, setSearchProductModel] = useState('');

  // 表单数据
  const [formData, setFormData] = useState({
    designId: '',
    trialProductionDate: '',
    productionBatch: '',
    qualityMetrics: '',
    defectRate: '',
    testResults: '',
    issues: '',
    improvement: '',
    inspector: '',
  });

  // 成功信息
  const [successInfo, setSuccessInfo] = useState<{ productModel: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [designRes, qualityRes] = await Promise.all([
        fetch('/api/design-solutions'),
        fetch('/api/quality-records'),
      ]);

      if (designRes.ok) {
        const data = await designRes.json();
        setDesignSolutions(data.data || []);
      }

      if (qualityRes.ok) {
        const data = await qualityRes.json();
        setQualityRecords(data.data || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setSuccessInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.designId || !formData.trialProductionDate || !formData.inspector) {
      toast.error('请填写所有必填项');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quality-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          designId: parseInt(formData.designId),
          defectRate: formData.defectRate ? parseFloat(formData.defectRate) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '提交失败');
      }

      const result = await response.json();
      const selectedDesign = designSolutions.find(d => d.id === parseInt(formData.designId));

      setSuccessInfo({
        productModel: selectedDesign?.productModel || '',
      });

      toast.success('质量记录提交成功！', {
        description: `产品型号: ${selectedDesign?.productModel || '-'}`,
      });

      // 重置表单
      setFormData({
        designId: '',
        trialProductionDate: '',
        productionBatch: '',
        qualityMetrics: '',
        defectRate: '',
        testResults: '',
        issues: '',
        improvement: '',
        inspector: '',
      });

      // 重新加载数据
      loadData();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 筛选质量记录
  const filteredRecords = qualityRecords.filter(record => {
    if (searchProductModel && record.productModel && !record.productModel.includes(searchProductModel)) {
      return false;
    }
    return true;
  });

  // 获取未录入质量记录的产品型号
  const availableDesigns = designSolutions.filter(d => 
    d.productModel && !qualityRecords.some(q => q.designId === d.id)
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedDesign = designSolutions.find(d => d.id === parseInt(formData.designId));

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
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">质量部工作台</h1>
                <p className="text-sm text-slate-500">试产记录与质量管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="record" className="text-base">
              <FileText className="h-4 w-4 mr-2" />
              录入试产记录
            </TabsTrigger>
            <TabsTrigger value="query" className="text-base">
              <Search className="h-4 w-4 mr-2" />
              查询记录
            </TabsTrigger>
          </TabsList>

          {/* 录入试产记录 */}
          <TabsContent value="record">
            <Card className="border-2 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6" />
                  试产记录录入
                </CardTitle>
                <CardDescription className="text-green-100 text-base">
                  选择产品型号并填写试产质量数据
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 产品型号选择 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        选择产品型号 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.designId}
                        onValueChange={(v) => handleInputChange('designId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择产品型号" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDesigns.length === 0 ? (
                            <div className="p-2 text-sm text-slate-500">
                              暂无可录入的产品型号（所有产品已录入或无设计方案）
                            </div>
                          ) : (
                            availableDesigns.map((design) => (
                              <SelectItem key={design.id} value={design.id.toString()}>
                                {design.productModel}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {selectedDesign && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                          <span className="text-slate-600">产品型号: </span>
                          <span className="font-bold text-blue-600">{selectedDesign.productModel}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        检验员 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="请输入检验员姓名"
                        value={formData.inspector}
                        onChange={(e) => handleInputChange('inspector', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 试产信息 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        试产日期 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={formData.trialProductionDate}
                        onChange={(e) => handleInputChange('trialProductionDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">生产批次</Label>
                      <Input
                        placeholder="例如：BATCH-2025-001"
                        value={formData.productionBatch}
                        onChange={(e) => handleInputChange('productionBatch', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">不良率(%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="例如：0.5"
                        value={formData.defectRate}
                        onChange={(e) => handleInputChange('defectRate', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 质量指标 */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">质量指标</Label>
                    <Textarea
                      placeholder="请填写各项质量指标数据..."
                      value={formData.qualityMetrics}
                      onChange={(e) => handleInputChange('qualityMetrics', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 测试结果 */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">测试结果</Label>
                    <Textarea
                      placeholder="请填写测试结果..."
                      value={formData.testResults}
                      onChange={(e) => handleInputChange('testResults', e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* 问题和改进 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">发现问题</Label>
                      <Textarea
                        placeholder="请填写发现的问题..."
                        value={formData.issues}
                        onChange={(e) => handleInputChange('issues', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">改进措施</Label>
                      <Textarea
                        placeholder="请填写改进措施..."
                        value={formData.improvement}
                        onChange={(e) => handleInputChange('improvement', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* 成功提示 */}
                  {successInfo && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        提交成功！
                      </h4>
                      <div className="text-sm text-emerald-700">
                        <p>产品型号: <span className="font-bold">{successInfo.productModel}</span> 的试产记录已保存</p>
                      </div>
                    </div>
                  )}

                  {/* 提交按钮 */}
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.designId}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          提交中...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          提交记录
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 查询记录 */}
          <TabsContent value="query">
            <Card>
              <CardHeader>
                <CardTitle>试产记录查询</CardTitle>
                <CardDescription>查看所有试产质量记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 搜索 */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>产品型号</Label>
                      <Input
                        placeholder="输入产品型号搜索..."
                        value={searchProductModel}
                        onChange={(e) => setSearchProductModel(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => setSearchProductModel('')}>
                        清除
                      </Button>
                    </div>
                  </div>

                  {/* 表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>产品型号</TableHead>
                        <TableHead>试产日期</TableHead>
                        <TableHead>生产批次</TableHead>
                        <TableHead>不良率</TableHead>
                        <TableHead>检验员</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                            暂无记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-mono font-medium">
                              {record.productModel || '-'}
                            </TableCell>
                            <TableCell>
                              {record.trialProductionDate 
                                ? new Date(record.trialProductionDate).toLocaleDateString('zh-CN')
                                : '-'}
                            </TableCell>
                            <TableCell>{record.productionBatch || '-'}</TableCell>
                            <TableCell>
                              {record.defectRate ? `${record.defectRate}%` : '-'}
                            </TableCell>
                            <TableCell>{record.inspector || '-'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                已录入
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
