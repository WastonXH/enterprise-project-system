'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, FileText, CheckCircle2, Info, Printer, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// 生成需求编号：RFQ + 年份末两位 + 四位流水号
function generateRequirementId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const storageKey = 'requirementSequenceNumber';
  let sequence = parseInt(localStorage.getItem(storageKey) || '0');
  
  sequence = (sequence + 1) % 10000;
  localStorage.setItem(storageKey, sequence.toString());
  
  const sequenceStr = sequence.toString().padStart(4, '0');
  return `RFQ-${year}-${sequenceStr}`;
}

// 技术类别选项
const PRODUCT_CATEGORIES = [
  { value: 'T', label: 'T:TFT-LCD(全透)' },
  { value: 'R', label: 'R:TFT-LCD(反射)' },
  { value: 'F', label: 'F:TFT-LCD(半透)' },
  { value: 'P', label: 'P:e-Papper(电子纸)' },
  { value: 'E', label: 'E:AMOLED/PMOLED(有机发光管)' },
  { value: 'N', label: 'N:S_H_TN-LCD(被动液晶显示)' },
  { value: 'Z', label: 'Z:其它' },
  { value: 'M', label: 'M:Micro-LED' },
] as const;

// 应用类别选项
const APPLICATION_CATEGORIES = [
  { value: 'vehicle_pre', label: '车载前装' },
  { value: 'vehicle_after', label: '车载后装' },
  { value: 'industrial', label: '工控' },
  { value: 'medical', label: '医疗' },
  { value: 'appliance', label: '家电' },
  { value: 'commercial', label: '商业' },
  { value: 'other', label: '其它' },
] as const;

// 产品结构选项
const PRODUCT_STRUCTURE = [
  { value: 's_lcm', label: 'S-LCM（单模组，FOG+背光，可含铁框）' },
  { value: 't_lcm', label: 'T-LCM（TP/LENS+LCM）' },
  { value: 'p_lcm', label: 'P-LCM（S-LCM+PCBA）' },
  { value: 'a_lcm', label: 'A-LCM(总成，如LCM+盖板+PCBA)' },
  { value: 'fog', label: 'FOG' },
  { value: 'fob', label: 'FOB' },
  { value: 'other', label: '其它' },
] as const;

// 组合式总成A-LCM组件选项
const A_LCM_COMPONENTS = [
  { value: 'cover_glass', label: '盖板玻璃' },
  { value: 'touch_panel', label: '触摸屏（TP）' },
  { value: 'frame', label: '铁框' },
  { value: 'pcba', label: 'PCBA' },
  { value: 'backlight', label: '背光' },
  { value: 's_lcm', label: 'S-LCM' },
  { value: 'fog', label: 'FOG' },
  { value: 'fob', label: 'FOB' },
  { value: 'other_component', label: '其它' },
] as const;

// 出图要求选项
const DRAWING_REQUIREMENTS = [
  '仅报价评估',
  '立项评估',
] as const;

// 项目等级选项
const PROJECT_LEVELS = [
  'S级',
  'A级',
  'B级',
  'C级',
  'D级',
] as const;

// 触控技术选项
const TOUCH_TECHNOLOGIES = [
  { value: '外挂式', label: '外挂式' },
  { value: 'INCELL', label: 'INCELL' },
  { value: 'ONCELL', label: 'ONCELL' },
] as const;

// 视角技术选项
const VIEWING_ANGLE_TECHNOLOGIES = [
  { value: 'TN', label: 'TN' },
  { value: 'IPS', label: 'IPS' },
  { value: 'VA', label: 'VA' },
  { value: 'MVA', label: 'MVA' },
  { value: 'PLS', label: 'PLS' },
  { value: '其它', label: '其它' },
] as const;

interface FormData {
  businessGroup: string;
  customerName: string;
  size: string;
  resolution: string;
  productApplication: string;
  productCategory: string;
  otherProductCategory: string;
  projectLevel: string;
  basicInfo: string;
  drawingRequirement: string;
  applicationCategory: string;
  otherApplication: string;
  productStructure: string;
  otherProductStructure: string;
  brightness: string;
  contrastRatio: string;
  workStabilityRequirement: 'industrial' | 'other' | ''; // 工作温度要求：工控/其它
  workTempLow: string;
  workTempHigh: string;
  storageTempLow: string;
  storageTempHigh: string;
  useALcm: boolean;
  aLcmComponents: string[];
  aLcmOtherComponent: string;
  aLcmDescription: string;
  // 新增字段
  potentialOrderQuantity: string; // 潜在订单量
  environmentalRequirements: string[]; // 环保要求（多选）
  environmentalOther: string; // 环保要求-其它（选填）
  touchTechnology: string; // 触控技术
  viewingAngleTechnology: string; // 视角技术
}

export default function BusinessDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementId, setRequirementId] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPrintPreview, setIsPrintPreview] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    businessGroup: '',
    customerName: '',
    size: '',
    resolution: '',
    productApplication: '',
    productCategory: '',
    otherProductCategory: '',
    projectLevel: '',
    basicInfo: '',
    drawingRequirement: '',
    applicationCategory: '',
    otherApplication: '',
    productStructure: '',
    otherProductStructure: '',
    brightness: '',
    contrastRatio: '',
    workStabilityRequirement: '',
    workTempLow: '',
    workTempHigh: '',
    storageTempLow: '',
    storageTempHigh: '',
    useALcm: false,
    aLcmComponents: [],
    aLcmOtherComponent: '',
    aLcmDescription: '',
    // 新增字段
    potentialOrderQuantity: '',
    environmentalRequirements: [],
    environmentalOther: '',
    touchTechnology: '',
    viewingAngleTechnology: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value,
      };

      if (field === 'productStructure' && value === 'a_lcm') {
        newData.useALcm = true;
      }

      if (field === 'productStructure' && value !== 'a_lcm' && typeof value === 'string') {
        newData.useALcm = false;
        newData.aLcmComponents = [];
        newData.aLcmOtherComponent = '';
        newData.aLcmDescription = '';
      }

      // 工作温度要求：工控时自动填充温度，其它时清空
      if (field === 'workStabilityRequirement' && typeof value === 'string') {
        if (value === 'industrial') {
          // 工控：工作温度 -20°C~70°C，存储温度 -30°C~80°C
          newData.workTempLow = '-20';
          newData.workTempHigh = '70';
          newData.storageTempLow = '-30';
          newData.storageTempHigh = '80';
        } else if (value === 'other') {
          // 其它：清空温度让用户填写
          newData.workTempLow = '';
          newData.workTempHigh = '';
          newData.storageTempLow = '';
          newData.storageTempHigh = '';
        }
      }

      return newData;
    });
  };

  // 预览打印
  const handlePreview = () => {
    // 基本验证
    if (!formData.businessGroup || !formData.customerName || !formData.productCategory || !formData.projectLevel) {
      toast.error('请填写所有必填项');
      return;
    }
    
    // 生成需求编号
    const newRequirementId = generateRequirementId();
    setRequirementId(newRequirementId);
    setShowPreview(true);
  };

  // 确认提交
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 只发送 schema 中定义的字段
      const submitData = {
        requirementId: requirementId,
        businessGroup: formData.businessGroup,
        customerName: formData.customerName,
        size: formData.size || null,
        resolution: formData.resolution || null,
        productApplication: formData.productApplication || null,
        productCategory: formData.productCategory === 'Z' ? formData.otherProductCategory : formData.productCategory,
        productStructure: formData.productStructure === 'other' ? formData.otherProductStructure : formData.productStructure,
        projectLevel: formData.projectLevel,
        drawingRequirement: formData.drawingRequirement || null,
        applicationCategory: formData.applicationCategory === 'other' ? formData.otherApplication : formData.applicationCategory,
        brightness: formData.brightness || null,
        contrastRatio: formData.contrastRatio || null,
        workTempLow: formData.workTempLow || null,
        workTempHigh: formData.workTempHigh || null,
        storageTempLow: formData.storageTempLow || null,
        storageTempHigh: formData.storageTempHigh || null,
        basicInfo: formData.basicInfo || null,
      };

      const response = await fetch('/api/project-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.details || '提交失败');
      }

      setShowPreview(false);
      setShowSuccess(true);
      
      toast.success('项目需求提交成功！', {
        description: `需求编号: ${requirementId}`,
      });
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败: ' + (error instanceof Error ? error.message : '请重试'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打印功能
  const handlePrint = () => {
    setIsPrintPreview(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrintPreview(false), 100);
    }, 100);
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      businessGroup: '',
      customerName: '',
      size: '',
      resolution: '',
      productApplication: '',
      productCategory: '',
      otherProductCategory: '',
      projectLevel: '',
      basicInfo: '',
      drawingRequirement: '',
      applicationCategory: '',
      otherApplication: '',
      productStructure: '',
      otherProductStructure: '',
      brightness: '',
      contrastRatio: '',
      workStabilityRequirement: '',
      workTempLow: '',
      workTempHigh: '',
      storageTempLow: '',
      storageTempHigh: '',
      useALcm: false,
      aLcmComponents: [],
      aLcmOtherComponent: '',
      aLcmDescription: '',
      potentialOrderQuantity: '',
      environmentalRequirements: [],
      environmentalOther: '',
      touchTechnology: '',
      viewingAngleTechnology: '',
    });
    setRequirementId('');
    setShowPreview(false);
    setShowSuccess(false);
  };

  // 处理A-LCM组件勾选
  const handleALcmComponentChange = (component: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        aLcmComponents: [...prev.aLcmComponents, component]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        aLcmComponents: prev.aLcmComponents.filter(c => c !== component)
      }));
    }
  };

  // 处理环保要求勾选
  const handleEnvironmentalChange = (requirement: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        environmentalRequirements: [...prev.environmentalRequirements, requirement]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        environmentalRequirements: prev.environmentalRequirements.filter(r => r !== requirement)
      }));
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
    <>
      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          /* 隐藏所有非打印内容 */
          .no-print, header, main, footer {
            display: none !important;
          }

          /* 仅显示打印模板 */
          .print-container {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background: white;
          }

          /* 打印模板样式 */
          .print-template {
            display: block !important;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-family: "SimSun", "宋体", serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            background: #fff;
          }

          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
          }

          .print-header h1 {
            font-size: 24pt;
            font-weight: bold;
            margin: 0 0 20px 0;
            color: #000;
          }

          .print-info {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 15px;
            font-size: 12pt;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .print-table td {
            border: 1px solid #000;
            padding: 10px 12px;
            vertical-align: middle;
          }

          .print-table .section-label {
            background-color: #f0f0f0;
            font-weight: bold;
            font-size: 13pt;
            text-align: left;
            padding: 12px;
          }

          .print-table .field-label {
            background-color: #fafafa;
            font-weight: bold;
            width: 15%;
            white-space: nowrap;
          }

          .print-table .field-value {
            background-color: #fff;
            width: 35%;
          }

          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10pt;
            color: #666;
          }

          @page {
            size: A4;
            margin: 20mm 15mm;
          }

          body {
            margin: 0;
            padding: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* 正常浏览时隐藏打印容器 */
        .print-container {
          display: none;
        }
      `}</style>

      {/* 主界面内容 */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 no-print">
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
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">业务部工作台</h1>
                <p className="text-sm text-slate-500">项目需求录入</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!showPreview && !showSuccess ? (
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Plus className="h-6 w-6" />
                新增项目需求
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                请填写完整的项目需求信息，所有标记为 * 的字段为必填项
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="space-y-8">
                {/* 基础信息 */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="h-1 w-6 bg-blue-500 rounded"></div>
                      基础信息
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessGroup" className="text-base font-medium">
                          业务组别 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="businessGroup"
                          placeholder="例如：华东区一组"
                          value={formData.businessGroup}
                          onChange={(e) => handleInputChange('businessGroup', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-base font-medium">
                          客户名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          placeholder="例如：华为技术有限公司"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectLevel" className="text-base font-medium">
                          项目等级 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.projectLevel}
                          onValueChange={(value) => handleInputChange('projectLevel', value)}
                          required
                        >
                          <SelectTrigger id="projectLevel">
                            <SelectValue placeholder="请选择项目等级" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROJECT_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="drawingRequirement" className="text-base font-medium">
                          出图要求 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.drawingRequirement}
                          onValueChange={(value) => handleInputChange('drawingRequirement', value)}
                          required
                        >
                          <SelectTrigger id="drawingRequirement">
                            <SelectValue placeholder="请选择出图要求" />
                          </SelectTrigger>
                          <SelectContent>
                            {DRAWING_REQUIREMENTS.map((req) => (
                              <SelectItem key={req} value={req}>
                                {req}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="applicationCategory" className="text-base font-medium">
                          应用类别 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.applicationCategory}
                          onValueChange={(value) => handleInputChange('applicationCategory', value)}
                          required
                        >
                          <SelectTrigger id="applicationCategory">
                            <SelectValue placeholder="请选择应用类别" />
                          </SelectTrigger>
                          <SelectContent>
                            {APPLICATION_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.applicationCategory === 'other' && (
                        <div className="space-y-2">
                          <Label htmlFor="otherApplication" className="text-base font-medium">
                            请填写具体应用 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="otherApplication"
                            placeholder="请输入具体应用内容"
                            value={formData.otherApplication}
                            onChange={(e) => handleInputChange('otherApplication', e.target.value)}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="potentialOrderQuantity" className="text-base font-medium">
                          潜在订单量
                        </Label>
                        <Input
                          id="potentialOrderQuantity"
                          placeholder="例如：10000/月"
                          value={formData.potentialOrderQuantity}
                          onChange={(e) => handleInputChange('potentialOrderQuantity', e.target.value)}
                        />
                      </div>
                    </div>
                    {/* 项目应用（选填） */}
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="productApplication" className="text-base font-medium">
                        项目应用
                      </Label>
                      <Textarea
                        id="productApplication"
                        placeholder="请描述产品的应用场景（选填）"
                        value={formData.productApplication}
                        onChange={(e) => handleInputChange('productApplication', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* 规格需求 */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="h-1 w-6 bg-blue-500 rounded"></div>
                      规格需求
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-base font-medium">
                          尺寸 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="size"
                          placeholder="例如：15.6英寸"
                          value={formData.size}
                          onChange={(e) => handleInputChange('size', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resolution" className="text-base font-medium">
                          分辨率 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="resolution"
                          placeholder="例如：1920×1080"
                          value={formData.resolution}
                          onChange={(e) => handleInputChange('resolution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productCategory" className="text-base font-medium">
                          技术类别 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.productCategory}
                          onValueChange={(value) => handleInputChange('productCategory', value)}
                          required
                        >
                          <SelectTrigger id="productCategory">
                            <SelectValue placeholder="请选择技术类别" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.productCategory === 'Z' && (
                        <div className="space-y-2">
                          <Label htmlFor="otherProductCategory" className="text-base font-medium">
                            请填写具体技术类别 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="otherProductCategory"
                            placeholder="请输入具体技术类别"
                            value={formData.otherProductCategory}
                            onChange={(e) => handleInputChange('otherProductCategory', e.target.value)}
                            required={formData.productCategory === 'Z'}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="touchTechnology" className="text-base font-medium">触控技术</Label>
                        <Select
                          value={formData.touchTechnology}
                          onValueChange={(value) => handleInputChange('touchTechnology', value)}
                        >
                          <SelectTrigger id="touchTechnology">
                            <SelectValue placeholder="请选择触控技术（选填）" />
                          </SelectTrigger>
                          <SelectContent>
                            {TOUCH_TECHNOLOGIES.map((tech) => (
                              <SelectItem key={tech.value} value={tech.value}>
                                {tech.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productStructure" className="text-base font-medium">
                          常见产品结构
                        </Label>
                        <Select
                          value={formData.productStructure}
                          onValueChange={(value) => handleInputChange('productStructure', value)}
                          required
                        >
                          <SelectTrigger id="productStructure">
                            <SelectValue placeholder="请选择常见产品结构" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_STRUCTURE.map((structure) => (
                              <SelectItem key={structure.value} value={structure.value}>
                                {structure.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.productStructure === 'other' && (
                        <div className="space-y-2">
                          <Label htmlFor="otherProductStructure" className="text-base font-medium">
                            请填写具体产品结构 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="otherProductStructure"
                            placeholder="请输入具体产品结构"
                            value={formData.otherProductStructure}
                            onChange={(e) => handleInputChange('otherProductStructure', e.target.value)}
                            required={formData.productStructure === 'other'}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="viewingAngleTechnology" className="text-base font-medium">视角技术</Label>
                        <Select
                          value={formData.viewingAngleTechnology}
                          onValueChange={(value) => handleInputChange('viewingAngleTechnology', value)}
                        >
                          <SelectTrigger id="viewingAngleTechnology">
                            <SelectValue placeholder="请选择视角技术（选填）" />
                          </SelectTrigger>
                          <SelectContent>
                            {VIEWING_ANGLE_TECHNOLOGIES.map((tech) => (
                              <SelectItem key={tech.value} value={tech.value}>
                                {tech.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* A-LCM组件选择 */}
                    {(formData.productStructure === 'a_lcm' || formData.useALcm) && (
                      <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                              <Info className="h-5 w-5 text-blue-600" />
                              组合式总成A-LCM组件
                            </h4>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-base font-medium mb-3 block">请选择组合组件：</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {A_LCM_COMPONENTS.map((component) => (
                                <div key={component.value} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                                  <Checkbox
                                    id={component.value}
                                    checked={formData.aLcmComponents.includes(component.value)}
                                    onCheckedChange={(checked) => handleALcmComponentChange(component.value, checked as boolean)}
                                  />
                                  <Label htmlFor={component.value} className="cursor-pointer font-medium text-slate-700">
                                    {component.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          {formData.aLcmComponents.includes('other_component') && (
                            <div className="space-y-2">
                              <Label htmlFor="aLcmOtherComponent" className="text-base font-medium">
                                请填写其它组件 <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="aLcmOtherComponent"
                                placeholder="请输入其它组件名称"
                                value={formData.aLcmOtherComponent}
                                onChange={(e) => handleInputChange('aLcmOtherComponent', e.target.value)}
                              />
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label htmlFor="aLcmDescription" className="text-base font-medium">A-LCM组合说明</Label>
                            <Textarea
                              id="aLcmDescription"
                              placeholder="请详细描述A-LCM的组合方式、规格要求、特殊要求等..."
                              value={formData.aLcmDescription}
                              onChange={(e) => handleInputChange('aLcmDescription', e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 规格需求 */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="brightness" className="text-base font-medium">亮度要求</Label>
                        <Input
                          id="brightness"
                          placeholder="例如：500"
                          value={formData.brightness}
                          onChange={(e) => handleInputChange('brightness', e.target.value)}
                        />
                        <p className="text-sm text-slate-500">单位：cd/m²</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contrastRatio" className="text-base font-medium">对比度要求</Label>
                        <Input
                          id="contrastRatio"
                          placeholder="例如：1000:1"
                          value={formData.contrastRatio}
                          onChange={(e) => handleInputChange('contrastRatio', e.target.value)}
                        />
                      </div>
                      {/* 工作温度要求：二选一（工控/其它） */}
                      <div className="space-y-3 md:col-span-2">
                        <Label className="text-base font-medium">
                          工作温度要求 <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.workStabilityRequirement}
                          onValueChange={(value) => handleInputChange('workStabilityRequirement', value)}
                          className="flex flex-col space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <RadioGroupItem value="industrial" id="industrial" />
                            <Label htmlFor="industrial" className="flex-1 cursor-pointer">
                              <span className="font-medium">工控标准</span>
                              <span className="ml-2 text-slate-500">（工作温度：-20°C~70°C，存储温度：-30°C~80°C）</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other" className="flex-1 cursor-pointer">
                              <span className="font-medium">其它标准</span>
                              <span className="ml-2 text-slate-500">（请在下方手动填写温度要求）</span>
                            </Label>
                          </div>
                        </RadioGroup>
                        <p className="text-sm text-slate-500">
                          {formData.workStabilityRequirement === 'industrial' ? '已自动填充工控温度标准' : ''}
                          {formData.workStabilityRequirement === 'other' ? '请在下方手动填写温度要求' : ''}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">工作温度要求</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              placeholder="低温"
                              value={formData.workTempLow}
                              onChange={(e) => handleInputChange('workTempLow', e.target.value)}
                              disabled={formData.workStabilityRequirement === 'industrial'}
                            />
                          </div>
                          <span className="text-slate-500">°C</span>
                          <span className="text-slate-400">~</span>
                          <div className="flex-1">
                            <Input
                              placeholder="高温"
                              value={formData.workTempHigh}
                              onChange={(e) => handleInputChange('workTempHigh', e.target.value)}
                              disabled={formData.workStabilityRequirement === 'industrial'}
                            />
                          </div>
                          <span className="text-slate-500">°C</span>
                        </div>
                        {formData.workStabilityRequirement === 'industrial' && (
                          <p className="text-sm text-blue-600">已设置为工控标准温度：-20°C ~ 70°C</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">存储温度要求</Label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              placeholder="低温"
                              value={formData.storageTempLow}
                              onChange={(e) => handleInputChange('storageTempLow', e.target.value)}
                              disabled={formData.workStabilityRequirement === 'industrial'}
                            />
                          </div>
                          <span className="text-slate-500">°C</span>
                          <span className="text-slate-400">~</span>
                          <div className="flex-1">
                            <Input
                              placeholder="高温"
                              value={formData.storageTempHigh}
                              onChange={(e) => handleInputChange('storageTempHigh', e.target.value)}
                              disabled={formData.workStabilityRequirement === 'industrial'}
                            />
                          </div>
                          <span className="text-slate-500">°C</span>
                        </div>
                        {formData.workStabilityRequirement === 'industrial' && (
                          <p className="text-sm text-blue-600">已设置为工控标准温度：-30°C ~ 80°C</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 环保要求 */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="h-1 w-6 bg-blue-500 rounded"></div>
                      环保要求
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <Checkbox
                            id="rohs"
                            checked={formData.environmentalRequirements.includes('ROHS')}
                            onCheckedChange={(checked) => handleEnvironmentalChange('ROHS', checked as boolean)}
                          />
                          <Label htmlFor="rohs" className="cursor-pointer font-medium text-slate-700">
                            ROHS
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <Checkbox
                            id="reach"
                            checked={formData.environmentalRequirements.includes('REACH')}
                            onCheckedChange={(checked) => handleEnvironmentalChange('REACH', checked as boolean)}
                          />
                          <Label htmlFor="reach" className="cursor-pointer font-medium text-slate-700">
                            REACH
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                          <Checkbox
                            id="environmentalOther"
                            checked={formData.environmentalRequirements.includes('其它')}
                            onCheckedChange={(checked) => handleEnvironmentalChange('其它', checked as boolean)}
                          />
                          <Label htmlFor="environmentalOther" className="cursor-pointer font-medium text-slate-700">
                            其它
                          </Label>
                        </div>
                      </div>
                      {formData.environmentalRequirements.includes('其它') && (
                        <div className="space-y-2 ml-4">
                          <Label htmlFor="environmentalOtherInput" className="text-base font-medium">
                            请填写其它环保要求 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="environmentalOtherInput"
                            placeholder="请输入其它环保要求"
                            value={formData.environmentalOther}
                            onChange={(e) => handleInputChange('environmentalOther', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 项目基本信息及要求 */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="h-1 w-6 bg-blue-500 rounded"></div>
                      项目基本信息及要求
                    </h3>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="请详细描述项目的基本信息、技术要求、交付时间、特殊要求等..."
                        value={formData.basicInfo}
                        onChange={(e) => handleInputChange('basicInfo', e.target.value)}
                        rows={6}
                      />
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
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    预览并提交
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : showPreview ? (
          /* 预览界面 */
          <Card className="border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Eye className="h-6 w-6" />
                需求单预览
              </CardTitle>
              <CardDescription className="text-blue-100 text-base">
                需求编号: {requirementId} - 请确认信息无误后提交
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* 预览内容 */}
              <div className="border rounded-lg p-6 bg-white mb-6">
                <PrintTemplate formData={formData} requirementId={requirementId} />
              </div>
              
              {/* 操作按钮 */}
              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  返回修改
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    打印预览
                  </Button>
                  <Button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        确认提交
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 成功界面 */
          <Card className="border-2 shadow-xl">
            <CardContent className="pt-8">
              <div className="text-center py-12">
                <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">提交成功！</h2>
                <p className="text-lg text-slate-600 mb-2">需求编号：<span className="font-bold text-green-600">{requirementId}</span></p>
                <p className="text-slate-500 mb-8">您的项目需求已成功提交，研发部将基于此需求进行方案设计。</p>
                
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    打印需求单
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                  >
                    新建需求
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      </div>

      {/* 打印容器（仅在打印时显示） */}
      <div className="print-container">
        <div className="print-template">
          <PrintTemplate formData={formData} requirementId={requirementId} />
        </div>
      </div>
    </>
  );
}

// 打印模板组件
function PrintTemplate({ formData, requirementId }: { formData: FormData; requirementId: string }) {
  const getCategoryLabel = (value: string) => {
    if (value === 'Z') return formData.otherProductCategory || '-';
    const category = PRODUCT_CATEGORIES.find(c => c.value === value);
    return category?.label || '-';
  };

  const getStructureLabel = (value: string) => {
    if (value === 'other') return formData.otherProductStructure || '-';
    const structure = PRODUCT_STRUCTURE.find(s => s.value === value);
    return structure?.label || '-';
  };

  const getApplicationLabel = (value: string) => {
    if (value === 'other') return formData.otherApplication || '-';
    const app = APPLICATION_CATEGORIES.find(a => a.value === value);
    return app?.label || '-';
  };

  const getALcmComponentLabels = () => {
    return formData.aLcmComponents.map(comp => {
      const component = A_LCM_COMPONENTS.find(c => c.value === comp);
      if (comp === 'other_component') {
        return formData.aLcmOtherComponent || '其它';
      }
      return component?.label || comp;
    }).join('、');
  };

  return (
    <>
      {/* 抬头 */}
      <div className="print-header">
        <h1>项目需求表</h1>
        <div className="print-info">
          <div className="print-info-item">
            <span className="label">需求编号：</span>
            <span className="value">{requirementId}</span>
          </div>
          <div className="print-info-item">
            <span className="label">提交日期：</span>
            <span className="value">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </div>

      {/* 表单内容 */}
      <table className="print-table">
        <tbody>
          <tr>
            <td className="section-label" colSpan={4}>基础信息</td>
          </tr>
          <tr>
            <td className="field-label">业务组别</td>
            <td className="field-value">{formData.businessGroup || '-'}</td>
            <td className="field-label">客户名称</td>
            <td className="field-value">{formData.customerName || '-'}</td>
          </tr>

          <tr>
            <td className="section-label" colSpan={4}>项目需求</td>
          </tr>
          <tr>
            <td className="field-label">尺寸</td>
            <td className="field-value">{formData.size || '-'}</td>
            <td className="field-label">分辨率</td>
            <td className="field-value">{formData.resolution || '-'}</td>
          </tr>
          <tr>
            <td className="field-label">技术类别</td>
            <td className="field-value" colSpan={3}>{getCategoryLabel(formData.productCategory)}</td>
          </tr>
          <tr>
            <td className="field-label">产品结构</td>
            <td className="field-value" colSpan={3}>{getStructureLabel(formData.productStructure)}</td>
          </tr>

          {(formData.productStructure === 'a_lcm' || formData.useALcm) && formData.aLcmComponents.length > 0 && (
            <tr>
              <td className="field-label">A-LCM组件</td>
              <td className="field-value" colSpan={3}>{getALcmComponentLabels()}</td>
            </tr>
          )}
          {(formData.productStructure === 'a_lcm' || formData.useALcm) && formData.aLcmDescription && (
            <tr>
              <td className="field-label">A-LCM说明</td>
              <td className="field-value" colSpan={3}>{formData.aLcmDescription}</td>
            </tr>
          )}

          <tr>
            <td className="section-label" colSpan={4}>其他需求</td>
          </tr>
          <tr>
            <td className="field-label">项目等级</td>
            <td className="field-value">{formData.projectLevel || '-'}</td>
            <td className="field-label">出图要求</td>
            <td className="field-value">{formData.drawingRequirement || '-'}</td>
          </tr>
          <tr>
            <td className="field-label">应用类别</td>
            <td className="field-value" colSpan={3}>{getApplicationLabel(formData.applicationCategory)}</td>
          </tr>

          <tr>
            <td className="section-label" colSpan={4}>产品规格</td>
          </tr>
          <tr>
            <td className="field-label">亮度要求</td>
            <td className="field-value">{formData.brightness ? `${formData.brightness} cd/m²` : '-'}</td>
            <td className="field-label">对比度要求</td>
            <td className="field-value">{formData.contrastRatio || '-'}</td>
          </tr>
          <tr>
            <td className="field-label">工作温度</td>
            <td className="field-value">{formData.workTempLow && formData.workTempHigh ? `${formData.workTempLow}°C ~ ${formData.workTempHigh}°C` : '-'}</td>
            <td className="field-label">存储温度</td>
            <td className="field-value">{formData.storageTempLow && formData.storageTempHigh ? `${formData.storageTempLow}°C ~ ${formData.storageTempHigh}°C` : '-'}</td>
          </tr>
          <tr>
            <td className="field-label">产品应用</td>
            <td className="field-value" colSpan={3}>{formData.productApplication || '-'}</td>
          </tr>

          <tr>
            <td className="section-label" colSpan={4}>项目基本信息及要求</td>
          </tr>
          <tr>
            <td className="field-value" colSpan={4} style={{ minHeight: '150px', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
              {formData.basicInfo || '-'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 页脚 */}
      <div className="print-footer">
        <p>此文档由企业项目管理系统自动生成</p>
      </div>
    </>
  );
}
