'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// 设计方案接口
interface DesignSolution {
  id: number;
  productModel: string | null;
  projectId: number;
  createdAt: Date;
}

export default function QualityDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 设计方案列表
  const [designSolutions, setDesignSolutions] = useState<DesignSolution[]>([]);

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

  useEffect(() => {
    setMounted(true);
    loadDesignSolutions();
  }, []);

  const loadDesignSolutions = async () => {
    try {
      const response = await fetch('/api/design-solutions');
      if (response.ok) {
        const data = await response.json();
        setDesignSolutions(data.solutions || []);
      }
    } catch (error) {
      console.error('加载设计方案失败:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 基本验证
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
          defectRate: formData.defectRate ? parseFloat(formData.defectRate) : null,
        }),
      });

      if (!response.ok) throw new Error('提交失败');

      toast.success('质量记录提交成功！');

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
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedSolution = designSolutions.find(s => s.id === parseInt(formData.designId));

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
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">质量部工作台</h1>
                <p className="text-sm text-slate-500">试产质量记录</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-2xl flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6" />
              试产质量记录
            </CardTitle>
            <CardDescription className="text-orange-100 text-base">
              记录产品试产过程中的质量表现、测试结果及改进措施
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 选择产品 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    选择产品
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="design" className="text-base font-medium">
                      选择设计方案（产品型号） <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.designId} onValueChange={(v) => handleInputChange('designId', v)}>
                      <SelectTrigger id="design">
                        <SelectValue placeholder="请选择产品型号" />
                      </SelectTrigger>
                      <SelectContent>
                        {designSolutions.length === 0 ? (
                          <div className="p-2 text-sm text-slate-500">暂无设计方案</div>
                        ) : (
                          designSolutions.map((solution) => (
                            <SelectItem key={solution.id} value={solution.id.toString()}>
                              {solution.productModel || '未命名产品'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 试产基本信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    试产基本信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-base font-medium">
                        试产日期 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.trialProductionDate}
                        onChange={(e) => handleInputChange('trialProductionDate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batch" className="text-base font-medium">生产批次</Label>
                      <Input
                        id="batch"
                        placeholder="例如：BATCH-2025-001"
                        value={formData.productionBatch}
                        onChange={(e) => handleInputChange('productionBatch', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 质量指标 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    质量指标
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="metrics" className="text-base font-medium">质量指标</Label>
                      <Textarea
                        id="metrics"
                        placeholder="请描述主要质量指标，例如：亮度300cd/m²、对比度1000:1、色域72% NTSC"
                        value={formData.qualityMetrics}
                        onChange={(e) => handleInputChange('qualityMetrics', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defectRate" className="text-base font-medium">缺陷率 (%)</Label>
                      <Input
                        id="defectRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="例如：2.5"
                        value={formData.defectRate}
                        onChange={(e) => handleInputChange('defectRate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 测试结果 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    测试结果
                  </h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="请详细记录测试结果，包括各项测试的通过情况、异常表现等"
                      value={formData.testResults}
                      onChange={(e) => handleInputChange('testResults', e.target.value)}
                      rows={6}
                    />
                  </div>
                </div>

                {/* 问题与改进 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    问题与改进
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="issues" className="text-base font-medium">问题记录</Label>
                      <Textarea
                        id="issues"
                        placeholder="请记录试产过程中发现的问题，包括问题描述、发生频率、影响程度等"
                        value={formData.issues}
                        onChange={(e) => handleInputChange('issues', e.target.value)}
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="improvement" className="text-base font-medium">改进措施</Label>
                      <Textarea
                        id="improvement"
                        placeholder="请描述针对发现的问题制定的改进措施、责任人、完成时限等"
                        value={formData.improvement}
                        onChange={(e) => handleInputChange('improvement', e.target.value)}
                        rows={5}
                      />
                    </div>
                  </div>
                </div>

                {/* 检验信息 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-orange-500 rounded"></div>
                    检验信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="inspector" className="text-base font-medium">
                        检验员 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="inspector"
                        placeholder="请输入检验员姓名"
                        value={formData.inspector}
                        onChange={(e) => handleInputChange('inspector', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Link href="/">
                  <Button variant="outline" type="button">
                    取消
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      提交质量记录
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
