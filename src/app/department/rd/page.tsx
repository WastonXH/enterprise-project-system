'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Cpu, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// 偏光片类型（5个选项）
const POLARIZER_TYPES = [
  '普通型',
  '广视角型',
  '高对比度型',
  '低反射型',
  '特殊应用型',
] as const;

// FPC/背光类型
const TYPE_OPTIONS = ['共用型号', '新开'] as const;

// 触摸屏类型
const TOUCHSCREEN_TYPES = ['盖板规格', '电容触控IC 方案'] as const;

// 触摸屏模式
const TOUCHSCREEN_MODES = ['触控/盖板方案（多选）', '电阻触摸屏型号（填写）'] as const;

// 电容屏触控IC特性
const CAPACITIVE_FEATURES = ['触控IC (填写)', '防水', '手套', '主/被动笔', '触控点数（填写）', '其它'] as const;

// 盖板材质和结构
const COVER_MATERIALS = ['GG', 'GFF', 'OGS', '其它'] as const;

// 盖板及表面处理
const SURFACE_TREATMENTS = ['AG', 'AR', 'AF', '抗UV', '其它（填写）'] as const;

// 特殊要求
const SPECIAL_REQUIREMENTS = ['连接器型号及品牌', '其它'] as const;

// 项目需求接口
interface ProjectRequirement {
  id: number;
  businessGroup: string;
  customerName: string;
  productCategory: string;
  size: string | null;
  resolution: string | null;
  projectLevel: string;
}

// 玻璃资源接口
interface GlassResource {
  id: number;
  modelNumber: string;
  manufacturer: string | null;
}

// IC资源接口
interface ICResource {
  id: number;
  modelNumber: string;
  manufacturer: string | null;
}

export default function RDDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 资源数据
  const [projects, setProjects] = useState<ProjectRequirement[]>([]);
  const [glassResources, setGlassResources] = useState<GlassResource[]>([]);
  const [icResources, setIcResources] = useState<ICResource[]>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    projectId: '',
    // 核心组件 - 玻璃
    glassModelId: '',
    glassManualInput: '',
    // 核心组件 - IC
    icModelId: '',
    icManualInput: '',
    // 核心组件 - 偏光片
    polarizerType: '',
    polarizerManualInput: '',
    // FPC配置
    fpcModel: '',
    fpcType: '',
    // 背光配置
    backlightModel: '',
    backlightType: '',
    // 触摸屏配置
    touchscreenType: [] as string[],
    touchscreenMode: 'multi-select', // 'multi-select' 或 'resistive'
    // 电阻屏字段
    resistiveModel: '',
    resistiveType: '',
    // 电容屏 - 触控IC
    capacitiveTouchIC: '',
    capacitiveTouchFeatures: [] as string[],
    capacitiveTouchFeatureOther: '',
    capacitiveTouchPoints: '',
    // 盖板规格 - 盖板材质和结构
    coverMaterial: '',
    coverMaterialOther: '',
    // 盖板规格 - 盖板及表面处理
    coverThickness: '',
    coverSurfaceTreatments: [] as string[],
    coverSurfaceTreatmentOther: '',
    // 电容屏 - 特殊要求
    capacitiveSpecialRequirements: [] as string[],
    capacitiveConnectorModel: '',
    capacitiveSpecialOther: '',
  });

  // 生成产品型号
  const [generatedModel, setGeneratedModel] = useState('');

  useEffect(() => {
    setMounted(true);
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      // 加载项目需求
      const projRes = await fetch('/api/project-requirements');
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.requirements || []);
      }

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
    }
  };

  const generateProductModel = () => {
    const project = projects.find(p => p.id === parseInt(formData.projectId));

    if (!project) {
      return '';
    }

    // 获取玻璃型号（下拉选择或手动输入）
    let glassCode = '';
    if (formData.glassModelId && formData.glassModelId !== 'manual') {
      const glass = glassResources.find(g => g.id === parseInt(formData.glassModelId));
      glassCode = glass?.modelNumber.split('-').pop() || '';
    } else if (formData.glassManualInput) {
      glassCode = formData.glassManualInput;
    }

    // 获取IC型号（下拉选择或手动输入）
    let icCode = '';
    if (formData.icModelId && formData.icModelId !== 'manual') {
      const ic = icResources.find(i => i.id === parseInt(formData.icModelId));
      icCode = ic?.modelNumber.split('-').pop() || '';
    } else if (formData.icManualInput) {
      icCode = formData.icManualInput;
    }

    if (!glassCode || !icCode) {
      return '';
    }

    // 产品型号格式: 产品类别-尺寸-玻璃型号-IC型号-序号
    const size = project.size || 'XX';
    const category = project.productCategory.replace('-', '');
    const model = `LCM-${category}-${size}-${glassCode}-${icCode}`;

    setGeneratedModel(model);
    return model;
  };

  useEffect(() => {
    if (formData.projectId && (formData.glassModelId || formData.glassManualInput) && (formData.icModelId || formData.icManualInput)) {
      generateProductModel();
    }
  }, [formData.projectId, formData.glassModelId, formData.glassManualInput, formData.icModelId, formData.icManualInput]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev as any)[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value),
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 基本验证
    if (!formData.projectId || (!formData.glassModelId && !formData.glassManualInput) || (!formData.icModelId && !formData.icManualInput)) {
      toast.error('请选择项目，并提供玻璃型号和IC型号（下拉选择或手动输入）');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/design-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productModel: generatedModel,
          capacitiveTouchPoints: formData.capacitiveTouchPoints ? parseInt(formData.capacitiveTouchPoints) : null,
        }),
      });

      if (!response.ok) throw new Error('提交失败');

      toast.success('设计方案保存成功！', {
        description: `产品型号: ${generatedModel}`,
      });

      // 重置表单
      setFormData({
        projectId: '',
        glassModelId: '',
        glassManualInput: '',
        icModelId: '',
        icManualInput: '',
        polarizerType: '',
        polarizerManualInput: '',
        fpcModel: '',
        fpcType: '',
        backlightModel: '',
        backlightType: '',
        touchscreenType: [],
        touchscreenMode: 'multi-select',
        resistiveModel: '',
        resistiveType: '',
        capacitiveTouchIC: '',
        capacitiveTouchFeatures: [],
        capacitiveTouchFeatureOther: '',
        capacitiveTouchPoints: '',
        coverMaterial: '',
        coverMaterialOther: '',
        coverThickness: '',
        coverSurfaceTreatments: [],
        coverSurfaceTreatmentOther: '',
        capacitiveSpecialRequirements: [],
        capacitiveConnectorModel: '',
        capacitiveSpecialOther: '',
      });
      setGeneratedModel('');
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

  const selectedProject = projects.find(p => p.id === parseInt(formData.projectId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
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
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">研发部工作台</h1>
                <p className="text-sm text-slate-500">设计方案与型号生成</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 项目选择 */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Layers className="h-6 w-6" />
                选择项目需求
              </CardTitle>
              <CardDescription className="text-purple-100 text-base">
                选择业务部提交的项目需求，基于此进行方案设计
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="project" className="text-base font-medium">
                  选择项目 <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.projectId} onValueChange={(v) => handleInputChange('projectId', v)}>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="请选择项目需求" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">暂无项目需求</div>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.customerName} - {project.productCategory} ({project.size || '未指定尺寸'})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {selectedProject && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-slate-900 mb-2">项目信息</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div><span className="text-slate-600">客户:</span> {selectedProject.customerName}</div>
                      <div><span className="text-slate-600">类别:</span> {selectedProject.productCategory}</div>
                      <div><span className="text-slate-600">尺寸:</span> {selectedProject.size || '-'}</div>
                      <div><span className="text-slate-600">等级:</span> {selectedProject.projectLevel}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 核心组件选型 */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-violet-600 text-white">
              <CardTitle className="text-2xl">核心组件选型</CardTitle>
              <CardDescription className="text-violet-100 text-base">
                从采购部资源库中选择或手动输入玻璃、IC、偏光片型号（二选一）
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {/* 玻璃型号 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">玻璃型号 <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.glassModelId}
                      onValueChange={(v) => {
                        handleInputChange('glassModelId', v);
                        if (v !== 'manual') {
                          handleInputChange('glassManualInput', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择玻璃型号" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">手动输入</SelectItem>
                        {glassResources.map((glass) => (
                          <SelectItem key={glass.id} value={glass.id.toString()}>
                            {glass.modelNumber} ({glass.manufacturer || '未知厂家'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="或手动输入玻璃型号"
                      value={formData.glassManualInput}
                      onChange={(e) => {
                        handleInputChange('glassManualInput', e.target.value);
                        handleInputChange('glassModelId', 'manual');
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* IC型号 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">IC型号 <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.icModelId}
                      onValueChange={(v) => {
                        handleInputChange('icModelId', v);
                        if (v !== 'manual') {
                          handleInputChange('icManualInput', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择IC型号" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">手动输入</SelectItem>
                        {icResources.map((ic) => (
                          <SelectItem key={ic.id} value={ic.id.toString()}>
                            {ic.modelNumber} ({ic.manufacturer || '未知厂家'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="或手动输入IC型号"
                      value={formData.icManualInput}
                      onChange={(e) => {
                        handleInputChange('icManualInput', e.target.value);
                        handleInputChange('icModelId', 'manual');
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* 偏光片类型 */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">偏光片类型</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.polarizerType}
                      onValueChange={(v) => {
                        handleInputChange('polarizerType', v);
                        if (v !== 'manual') {
                          handleInputChange('polarizerManualInput', '');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="请选择偏光片类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">手动输入</SelectItem>
                        {POLARIZER_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="或手动输入偏光片型号"
                      value={formData.polarizerManualInput}
                      onChange={(e) => {
                        handleInputChange('polarizerManualInput', e.target.value);
                        handleInputChange('polarizerType', 'manual');
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* 产品型号生成结果 */}
              {generatedModel && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-green-600" />
                    生成的产品型号
                  </h4>
                  <div className="text-2xl font-bold text-green-700">{generatedModel}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FPC和背光配置 */}
          <Card>
            <CardHeader>
              <CardTitle>FPC和背光配置</CardTitle>
              <CardDescription>配置FPC和背光方案</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FPC配置 */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">FPC型号</Label>
                  <Input
                    placeholder="输入FPC型号"
                    value={formData.fpcModel}
                    onChange={(e) => handleInputChange('fpcModel', e.target.value)}
                  />
                  <div>
                    <Label className="text-sm font-medium">类型</Label>
                    <RadioGroup
                      value={formData.fpcType}
                      onValueChange={(v) => handleInputChange('fpcType', v)}
                      className="mt-2"
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`fpc-${option}`} />
                          <Label htmlFor={`fpc-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>

                {/* 背光配置 */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">背光型号</Label>
                  <Input
                    placeholder="输入背光型号"
                    value={formData.backlightModel}
                    onChange={(e) => handleInputChange('backlightModel', e.target.value)}
                  />
                  <div>
                    <Label className="text-sm font-medium">类型</Label>
                    <RadioGroup
                      value={formData.backlightType}
                      onValueChange={(v) => handleInputChange('backlightType', v)}
                      className="mt-2"
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`backlight-${option}`} />
                          <Label htmlFor={`backlight-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 触摸屏配置 */}
          <Card>
            <CardHeader>
              <CardTitle>触控及盖板配置</CardTitle>
              <CardDescription>选择触控或盖板类型并配置相关参数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">触摸屏方案选择</Label>
                  <RadioGroup
                    value={formData.touchscreenMode}
                    onValueChange={(v) => {
                      handleInputChange('touchscreenMode', v);
                      // 切换模式时清空相关数据
                      if (v === 'multi-select') {
                        handleInputChange('touchscreenType', []);
                        handleInputChange('resistiveModel', '');
                      } else {
                        handleInputChange('touchscreenType', []);
                        handleInputChange('resistiveModel', '');
                      }
                    }}
                    className="mt-2"
                  >
                    {TOUCHSCREEN_MODES.map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <RadioGroupItem value={mode === '触控/盖板方案（多选）' ? 'multi-select' : 'resistive'} id={`mode-${mode}`} />
                        <Label htmlFor={`mode-${mode}`} className="text-sm">{mode}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* 电阻触摸屏型号 */}
                {formData.touchscreenMode === 'resistive' && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <Label className="text-base font-medium">电阻触摸屏型号</Label>
                    <Input
                      placeholder="请输入电阻触摸屏型号"
                      value={formData.resistiveModel}
                      onChange={(e) => handleInputChange('resistiveModel', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* 触控/盖板方案（多选） */}
                {formData.touchscreenMode === 'multi-select' && (
                  <>
                    <div>
                      <Label className="text-base font-medium">触控/盖板方案（多选）</Label>
                      <div className="mt-2 space-y-2">
                        {TOUCHSCREEN_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`touch-${type}`}
                              checked={formData.touchscreenType.includes(type)}
                              onCheckedChange={(checked) => handleMultiSelectChange('touchscreenType', type, checked === true)}
                            />
                            <Label htmlFor={`touch-${type}`} className="text-sm">{type}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                {/* 盖板规格配置 */}
                {formData.touchscreenType.includes('盖板规格') && (
                  <div className="p-4 bg-slate-50 rounded-lg space-y-6">
                    {/* a. 盖板材质和结构 */}
                    <div>
                      <Label className="text-base font-medium">a. 盖板材质和结构</Label>
                      <div className="mt-2">
                        <RadioGroup
                          value={formData.coverMaterial}
                          onValueChange={(v) => {
                            handleInputChange('coverMaterial', v);
                            if (v !== '其它') handleInputChange('coverMaterialOther', '');
                          }}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {COVER_MATERIALS.map((material) => (
                              <div key={material} className="flex items-center space-x-2">
                                <RadioGroupItem value={material} id={`cover-material-${material}`} />
                                <Label htmlFor={`cover-material-${material}`} className="text-sm">{material}</Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                      {formData.coverMaterial === '其它' && (
                        <Input
                          placeholder="请说明"
                          value={formData.coverMaterialOther}
                          onChange={(e) => handleInputChange('coverMaterialOther', e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* b. 盖板及表面处理 */}
                    <div>
                      <Label className="text-base font-medium">b. 盖板及表面处理</Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex items-center gap-4">
                          <Label className="text-sm whitespace-nowrap">厚度</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="例如：0.7"
                            value={formData.coverThickness}
                            onChange={(e) => handleInputChange('coverThickness', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-slate-600">mm</span>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {SURFACE_TREATMENTS.map((treatment) => (
                            <div key={treatment} className="flex items-center space-x-2">
                              <Checkbox
                                id={`cover-treatment-${treatment}`}
                                checked={formData.coverSurfaceTreatments.includes(treatment)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('coverSurfaceTreatments', [...formData.coverSurfaceTreatments, treatment]);
                                  } else {
                                    handleInputChange('coverSurfaceTreatments', formData.coverSurfaceTreatments.filter(t => t !== treatment));
                                  }
                                }}
                              />
                              <Label htmlFor={`cover-treatment-${treatment}`} className="text-sm">{treatment}</Label>
                            </div>
                          ))}
                        </div>
                        {formData.coverSurfaceTreatments.includes('其它（填写）') && (
                          <Input
                            placeholder="请说明"
                            value={formData.coverSurfaceTreatmentOther}
                            onChange={(e) => handleInputChange('coverSurfaceTreatmentOther', e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 触控IC方案配置 */}
                {formData.touchscreenType.includes('电容触控IC 方案') && (
                  <div className="p-4 bg-slate-50 rounded-lg space-y-6">
                    {/* a. 触控IC特性 */}
                    <div>
                      <Label className="text-base font-medium">a. 触控IC特性</Label>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {CAPACITIVE_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={`feature-${feature}`}
                              checked={formData.capacitiveTouchFeatures.includes(feature)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleInputChange('capacitiveTouchFeatures', [...formData.capacitiveTouchFeatures, feature]);
                                } else {
                                  handleInputChange('capacitiveTouchFeatures', formData.capacitiveTouchFeatures.filter(f => f !== feature));
                                }
                              }}
                            />
                            <Label htmlFor={`feature-${feature}`} className="text-sm">{feature}</Label>
                          </div>
                        ))}
                      </div>
                      {formData.capacitiveTouchFeatures.includes('触控IC (填写)') && (
                        <Input
                          placeholder="请输入触控IC型号"
                          value={formData.capacitiveTouchIC}
                          onChange={(e) => handleInputChange('capacitiveTouchIC', e.target.value)}
                          className="mt-2"
                        />
                      )}
                      {formData.capacitiveTouchFeatures.includes('触控点数（填写）') && (
                        <Input
                          type="number"
                          placeholder="例如：10"
                          value={formData.capacitiveTouchPoints}
                          onChange={(e) => handleInputChange('capacitiveTouchPoints', e.target.value)}
                          className="mt-2"
                        />
                      )}
                      {formData.capacitiveTouchFeatures.includes('其它') && (
                        <Input
                          placeholder="请说明"
                          value={formData.capacitiveTouchFeatureOther}
                          onChange={(e) => handleInputChange('capacitiveTouchFeatureOther', e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>

                    {/* b. 特殊要求 */}
                    <div>
                      <Label className="text-base font-medium">b. 特殊要求</Label>
                      <div className="mt-2 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {SPECIAL_REQUIREMENTS.map((req) => (
                            <div key={req} className="flex items-center space-x-2">
                              <Checkbox
                                id={`special-${req}`}
                                checked={formData.capacitiveSpecialRequirements.includes(req)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    handleInputChange('capacitiveSpecialRequirements', [...formData.capacitiveSpecialRequirements, req]);
                                  } else {
                                    handleInputChange('capacitiveSpecialRequirements', formData.capacitiveSpecialRequirements.filter(r => r !== req));
                                  }
                                }}
                              />
                              <Label htmlFor={`special-${req}`} className="text-sm">{req}</Label>
                            </div>
                          ))}
                        </div>
                        {formData.capacitiveSpecialRequirements.includes('连接器型号及品牌') && (
                          <Input
                            placeholder="请输入连接器型号及品牌"
                            value={formData.capacitiveConnectorModel}
                            onChange={(e) => handleInputChange('capacitiveConnectorModel', e.target.value)}
                            className="mt-2"
                          />
                        )}
                        {formData.capacitiveSpecialRequirements.includes('其它') && (
                          <Textarea
                            placeholder="请说明"
                            value={formData.capacitiveSpecialOther}
                            onChange={(e) => handleInputChange('capacitiveSpecialOther', e.target.value)}
                            rows={3}
                            className="mt-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </>
                )}
              </div>
            </CardContent>
          </Card>

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
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存设计方案
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
