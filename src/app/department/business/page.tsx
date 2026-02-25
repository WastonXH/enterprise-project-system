'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, FileText, CheckCircle2, Info, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

// 生成需求编号
function generateRequirementId(): string {
  const year = new Date().getFullYear().toString().slice(-2); // 获取年份后两位
  const storageKey = 'requirementSequenceNumber';
  let sequence = parseInt(localStorage.getItem(storageKey) || '0');
  
  sequence = (sequence + 1) % 100000; // 确保在00000-99999范围内
  localStorage.setItem(storageKey, sequence.toString());
  
  const sequenceStr = sequence.toString().padStart(5, '0');
  return `${year}-${sequenceStr}`;
}

// 技术类别选项
const PRODUCT_CATEGORIES = [
  { value: 'tft_ips', label: 'TFT-LCD（IPS）' },
  { value: 'tft_tn', label: 'TFT-LCD(TN)' },
  { value: 'tft_va', label: 'TFT-LCD(VA,MVA,PLS)' },
  { value: 'oled', label: 'OLED' },
  { value: 'stn_lcd', label: 'S/TN_LCD(被动型液晶显示)' },
  { value: 'e_paper', label: 'E-PAPER' },
  { value: 'other', label: '其它' },
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

// 产品结构选项（常见结构）
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
  workTempLow: string;
  workTempHigh: string;
  storageTempLow: string;
  storageTempHigh: string;
  useALcm: boolean;
  aLcmComponents: string[];
  aLcmOtherComponent: string;
  aLcmDescription: string;
}

export default function BusinessDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirementId, setRequirementId] = useState('');
  const [showPrintOptions, setShowPrintOptions] = useState(false);
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
    workTempLow: '',
    workTempHigh: '',
    storageTempLow: '',
    storageTempHigh: '',
    useALcm: false,
    aLcmComponents: [],
    aLcmOtherComponent: '',
    aLcmDescription: '',
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

      // 当选择A-LCM时，自动启用组合式总成
      if (field === 'productStructure' && value === 'a_lcm') {
        newData.useALcm = true;
      }

      // 当切换到其他产品结构时，禁用A-LCM
      if (field === 'productStructure' && value !== 'a_lcm' && typeof value === 'string') {
        newData.useALcm = false;
        newData.aLcmComponents = [];
        newData.aLcmOtherComponent = '';
        newData.aLcmDescription = '';
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 基本验证
    if (!formData.businessGroup || !formData.customerName || !formData.productCategory || !formData.projectLevel) {
      toast.error('请填写所有必填项');
      return;
    }

    setIsSubmitting(true);

    try {
      // 生成需求编号
      const newRequirementId = generateRequirementId();
      setRequirementId(newRequirementId);
      
      const response = await fetch('/api/project-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requirementId: newRequirementId,
        }),
      });

      if (!response.ok) {
        throw new Error('提交失败');
      }

      const result = await response.json();
      toast.success('项目需求提交成功！', {
        description: `需求编号: ${newRequirementId}`,
      });

      // 显示打印选项
      setShowPrintOptions(true);
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打印功能
  const handlePrint = () => {
    window.print();
  };

  // 重置表单（包括打印状态）
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
      workTempLow: '',
      workTempHigh: '',
      storageTempLow: '',
      storageTempHigh: '',
      useALcm: false,
      aLcmComponents: [],
      aLcmOtherComponent: '',
      aLcmDescription: '',
    });
    setRequirementId('');
    setShowPrintOptions(false);
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
          /* 隐藏不需要打印的元素 */
          .no-print {
            display: none !important;
          }

          /* 仅在打印时显示打印模板 */
          .print-only {
            display: block !important;
          }

          /* 隐藏主界面内容 */
          body > div:first-child {
            display: none !important;
          }

          /* 打印模板样式 */
          .print-template {
            display: block !important;
            position: relative;
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

          /* 打印抬头 */
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

          .print-info-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .print-info-item .label {
            font-weight: bold;
          }

          .print-info-item .value {
            font-weight: normal;
          }

          /* 打印表格 */
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

          /* 打印页脚 */
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10pt;
            color: #666;
          }

          /* 页面设置 */
          @page {
            size: A4;
            margin: 20mm 15mm;
          }

          body {
            margin: 0;
            padding: 0;
          }

          /* 强制打印背景色 */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        /* 正常浏览时隐藏打印模板 */
        .print-only {
          display: none;
        }
      `}</style>

      {/* 主界面内容 */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
            <form onSubmit={handleSubmit} className="space-y-8">
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
                  </div>
                </div>

                {/* 项目需求 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-blue-500 rounded"></div>
                    项目需求
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="size" className="text-base font-medium">尺寸</Label>
                      <Input
                        id="size"
                        placeholder="例如：15.6英寸"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resolution" className="text-base font-medium">分辨率</Label>
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
                    {/* 当选择"其它"技术类别时显示的输入框 */}
                    {formData.productCategory === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="otherProductCategory" className="text-base font-medium">
                          请填写具体技术类别 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="otherProductCategory"
                          placeholder="请输入具体技术类别"
                          value={formData.otherProductCategory}
                          onChange={(e) => handleInputChange('otherProductCategory', e.target.value)}
                          required={formData.productCategory === 'other'}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="productStructure" className="text-base font-medium">
                        常见产品结构 <span className="text-red-500">*</span>
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
                    {/* 当选择"其它"产品结构时显示的输入框 */}
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
                  </div>
                  {/* 组合式总成A-LCM */}
                  {(formData.productStructure === 'a_lcm' || formData.useALcm) && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            组合式总成A-LCM
                          </h4>
                          <p className="text-sm text-slate-600 mt-1">
                            {formData.productStructure === 'a_lcm' 
                              ? "您已选择A-LCM，请勾选相关组件并填写说明"
                              : "如需组合式总成，请勾选相关组件并填写说明"}
                          </p>
                        </div>
                        {formData.productStructure !== 'a_lcm' && (
                          <Button
                            type="button"
                            variant={formData.useALcm ? "default" : "outline"}
                            onClick={() => handleInputChange('useALcm', !formData.useALcm)}
                            className={formData.useALcm ? "bg-blue-600 hover:bg-blue-700" : ""}
                          >
                            {formData.useALcm ? "已启用" : "启用A-LCM"}
                          </Button>
                        )}
                      </div>

                      {formData.useALcm && (
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
                                <Label
                                  htmlFor={component.value}
                                  className="cursor-pointer font-medium text-slate-700"
                                >
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
                              required={formData.aLcmComponents.includes('other_component')}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="aLcmDescription" className="text-base font-medium">
                            A-LCM组合说明 <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="aLcmDescription"
                            placeholder="请详细描述A-LCM的组合方式、规格要求、特殊要求等..."
                            value={formData.aLcmDescription}
                            onChange={(e) => handleInputChange('aLcmDescription', e.target.value)}
                            rows={4}
                            required={formData.useALcm}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>

                {/* 项目等级、应用类别、出图要求 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-blue-500 rounded"></div>
                    其他需求
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="space-y-2 md:col-span-2">
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
                  </div>
                  {/* 当选择"其它"应用类别时显示的输入框 */}
                  {formData.applicationCategory === 'other' && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="otherApplication" className="text-base font-medium">
                        请填写具体应用 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="otherApplication"
                        placeholder="请输入具体应用内容"
                        value={formData.otherApplication}
                        onChange={(e) => handleInputChange('otherApplication', e.target.value)}
                        required={formData.applicationCategory === 'other'}
                      />
                    </div>
                  )}
                </div>

                {/* 产品应用 */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-1 w-6 bg-blue-500 rounded"></div>
                    产品规格
                  </h3>
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
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        工作温度要求 <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="低温"
                            value={formData.workTempLow}
                            onChange={(e) => handleInputChange('workTempLow', e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-slate-500">°C</span>
                        <span className="text-slate-400">~</span>
                        <div className="flex-1">
                          <Input
                            placeholder="高温"
                            value={formData.workTempHigh}
                            onChange={(e) => handleInputChange('workTempHigh', e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-slate-500">°C</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">
                        存储温度要求 <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            placeholder="低温"
                            value={formData.storageTempLow}
                            onChange={(e) => handleInputChange('storageTempLow', e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-slate-500">°C</span>
                        <span className="text-slate-400">~</span>
                        <div className="flex-1">
                          <Input
                            placeholder="高温"
                            value={formData.storageTempHigh}
                            onChange={(e) => handleInputChange('storageTempHigh', e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-slate-500">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 产品应用 */}
                <div className="mt-6 space-y-2">
                  <Label htmlFor="productApplication" className="text-base font-medium">产品应用</Label>
                  <Textarea
                    id="productApplication"
                    placeholder="请描述产品的应用场景，例如：智能手机、平板电脑、车载显示器等"
                    value={formData.productApplication}
                    onChange={(e) => handleInputChange('productApplication', e.target.value)}
                    rows={3}
                  />
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
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      提交中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      提交项目需求
                    </>
                  )}
                </Button>
              </div>

              {/* 打印选项 */}
              {showPrintOptions && (
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">提交成功！</h4>
                        <p className="text-sm text-slate-600">需求编号：<span className="font-bold text-green-600">{requirementId}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        打印/预览
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                      >
                        新建需求
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    💡 提示：点击"打印/预览"按钮，在打印对话框中选择"另存为PDF"即可保存为PDF文档
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>

      {/* 打印模板（仅在打印时显示） */}
      <div className="print-only">
        <PrintTemplate formData={formData} requirementId={requirementId} />
      </div>
      </div>
    </>
  );
}

// 打印模板组件
function PrintTemplate({ formData, requirementId }: { formData: FormData; requirementId: string }) {
  const getCategoryLabel = (value: string) => {
    const category = PRODUCT_CATEGORIES.find(c => c.value === value);
    return category?.label || formData.otherProductCategory || '-';
  };

  const getStructureLabel = (value: string) => {
    const structure = PRODUCT_STRUCTURE.find(s => s.value === value);
    return structure?.label || formData.otherProductStructure || '-';
  };

  const getApplicationLabel = (value: string) => {
    const app = APPLICATION_CATEGORIES.find(a => a.value === value);
    return app?.label || formData.otherApplication || '-';
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
    <div className="print-template">
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
          {/* 基础信息 */}
          <tr>
            <td className="section-label" colSpan={4}>基础信息</td>
          </tr>
          <tr>
            <td className="field-label">业务组别</td>
            <td className="field-value">{formData.businessGroup || '-'}</td>
            <td className="field-label">客户名称</td>
            <td className="field-value">{formData.customerName || '-'}</td>
          </tr>

          {/* 项目需求 */}
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

          {/* A-LCM信息 */}
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

          {/* 其他需求 */}
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

          {/* 产品规格 */}
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

          {/* 项目基本信息及要求 */}
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
    </div>
  );
}
