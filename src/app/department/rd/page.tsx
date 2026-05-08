'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Cpu, Layers, Search, FileSpreadsheet, Upload, Download, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Combobox } from '@/components/ui/combobox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// 偏光片类型
const POLARIZER_TYPES = [
  '普通型',
  '广视角型',
  '高对比度型',
  '低反射型',
  '特殊应用型',
] as const;

// FPC/背光类型
const TYPE_OPTIONS = ['共用型号', '新开模具', '共用模具微调名称'] as const;

// 触摸屏模式
const TOUCHSCREEN_MODES = ['触控/盖板方案（多选）', '电阻触摸屏型号（填写）'] as const;

// 盖板材质和结构
const COVER_MATERIALS = ['GG', 'GFF', 'OGS', '其它'] as const;

// 盖板表面处理选项（可多选）
const SURFACE_TREATMENTS = ['AG', 'AR', 'AF', '抗UV'] as const;

// 项目需求接口
interface ProjectRequirement {
  id: number;
  requirementId: string | null;
  businessGroup: string;
  customerName: string;
  productCategory: string;
  productStructure: string | null;
  size: string | null;
  resolution: string | null;
  projectLevel: string;
  status: string | null;
}

// 设计方案接口
interface DesignSolution {
  id: number;
  projectId: number | null;
  productModel: string | null;
  capacitiveSurfaceTreatment: string | null;
  createdAt: string;
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

// 零部件编码接口
interface ComponentCode {
  id: number;
  componentCode: string;
  componentType: string;
  componentName: string;
  materialName: string | null;
  specification: string | null;
  supplier: string | null;
  manufacturer: string | null;
  manufacturerCode: string | null;
  serialNumber: string | null;
  packageType: string | null;
  specDescription: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function RDDepartmentPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  // 资源数据
  const [projects, setProjects] = useState<ProjectRequirement[]>([]);
  const [designSolutions, setDesignSolutions] = useState<DesignSolution[]>([]);
  const [glassResources, setGlassResources] = useState<GlassResource[]>([]);
  const [icResources, setIcResources] = useState<ICResource[]>([]);
  const [componentCodes, setComponentCodes] = useState<ComponentCode[]>([]);

  // 搜索和筛选
  const [searchRequirementId, setSearchRequirementId] = useState('');
  const [searchProductModel, setSearchProductModel] = useState('');
  const [searchComponentCode, setSearchComponentCode] = useState('');
  const [searchComponentType, setSearchComponentType] = useState('');

  // 零部件编码表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCode, setEditingCode] = useState<ComponentCode | null>(null);
  const [codeFormData, setCodeFormData] = useState({
    componentCode: '',
    componentType: '',
    componentName: '',
    materialName: '',
    specification: '',
    supplier: '',
    manufacturer: '',
    manufacturerCode: '',
    serialNumber: '',
    packageType: '',
    specDescription: '',
  });

  // 金蝶编码规则相关状态
  const [categories, setCategories] = useState<Array<{
    code: string
    name: string
    description: string
    bFormat: string
  }>>([]);
  const [codeGenerationMode, setCodeGenerationMode] = useState<'auto' | 'manual'>('auto');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('');
  const [selectedSizeCode, setSelectedSizeCode] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [codePreview, setCodePreview] = useState<{
    previewCode: string
    nextSequence: string
    categoryName: string
    bFormat: string
  } | null>(null);

  // 资源确认弹窗状态
  const [resourceDialog, setResourceDialog] = useState<{
    open: boolean;
    type: 'glass' | 'ic' | null;
    inputValue: string;
    similarResources: Array<{ id: number; modelNumber: string; manufacturer: string }>;
    isNewResource: boolean;
  }>({ open: false, type: null, inputValue: '', similarResources: [], isNewResource: false });

  // 合并资源库数据（正式库 + 待审批库）
  const [mergedGlassOptions, setMergedGlassOptions] = useState<Array<{
    id: number;
    value: string;
    label: string;
    subLabel: string;
    source: 'formal' | 'pending';
  }>>([]);
  const [mergedICOptions, setMergedICOptions] = useState<Array<{
    id: number;
    value: string;
    label: string;
    subLabel: string;
    source: 'formal' | 'pending';
  }>>([]);

  // 表单数据
  const [formData, setFormData] = useState({
    projectId: '',
    // 核心组件
    glassModelId: '',
    glassManualInput: '',
    icModelId: '',
    icManualInput: '',
    polarizerType: '',
    // FPC配置
    fpcModel: '',
    fpcType: '',
    // 背光配置
    backlightModel: '',
    backlightType: '',
    // 触摸屏配置
    touchscreenMode: 'multi-select',
    resistiveModel: '',
    capacitiveTouchIC: '',
    capacitiveCoverMaterial: '',
    capacitiveTouchPoints: '',
    capacitiveSurfaceTreatments: [] as string[], // 盖板表面处理（多选）
    capacitiveSpecialApplication: '',
  });

  // 生成的产品型号
  const [generatedModel, setGeneratedModel] = useState('');
  // 提交成功信息
  const [successInfo, setSuccessInfo] = useState<{ productModel: string; requirementId: string } | null>(null);

  // 检测相似资源函数
  const checkSimilarResources = (
    type: 'glass' | 'ic',
    inputValue: string,
    resources: Array<{ id: number; modelNumber: string; manufacturer: string | null }>
  ): Array<{ id: number; modelNumber: string; manufacturer: string }> => {
    if (!inputValue.trim()) return [];
    
    const normalizedInput = inputValue.toLowerCase().replace(/[-_\s]/g, '');
    return resources
      .filter(r => {
        const normalizedModel = r.modelNumber.toLowerCase().replace(/[-_\s]/g, '');
        // 完全匹配
        if (normalizedInput === normalizedModel) return false;
        // 前缀相似（前6位相同）
        if (normalizedInput.length >= 6 && normalizedInput.slice(0, 6) === normalizedModel.slice(0, 6)) return true;
        // 包含匹配
        if (normalizedInput.includes(normalizedModel) || normalizedModel.includes(normalizedInput)) return true;
        return false;
      })
      .map(r => ({ ...r, manufacturer: r.manufacturer || '未知' }));
  };

  // 处理手动输入资源
  const handleManualResourceInput = (
    type: 'glass' | 'ic',
    value: string,
    resources: Array<{ id: number; modelNumber: string; manufacturer: string | null }>
  ) => {
    handleInputChange(type === 'glass' ? 'glassManualInput' : 'icManualInput', value);
    
    if (!value.trim()) {
      setResourceDialog({ open: false, type: null, inputValue: '', similarResources: [], isNewResource: false });
      return;
    }

    const similarResources = checkSimilarResources(type, value, resources);
    
    // 检查是否完全匹配
    const isExactMatch = resources.some(
      r => r.modelNumber.toLowerCase().replace(/[-_\s]/g, '') === value.toLowerCase().replace(/[-_\s]/g, '')
    );

    if (isExactMatch) {
      // 如果完全匹配，提示使用数据库中的
      setResourceDialog({
        open: true,
        type,
        inputValue: value,
        similarResources: resources
          .filter(
            r => r.modelNumber.toLowerCase().replace(/[-_\s]/g, '') === value.toLowerCase().replace(/[-_\s]/g, '')
          )
          .map(r => ({ ...r, manufacturer: r.manufacturer || '未知' })),
        isNewResource: false,
      });
    } else if (similarResources.length > 0) {
      // 有相似资源，提示选择
      setResourceDialog({
        open: true,
        type,
        inputValue: value,
        similarResources,
        isNewResource: false,
      });
    } else {
      // 全新的资源，询问是否加入数据库
      setResourceDialog({
        open: true,
        type,
        inputValue: value,
        similarResources: [],
        isNewResource: true,
      });
    }
  };

  // 确认使用资源
  const confirmUseResource = (resource: { id: number; modelNumber: string } | null, addToDatabase: boolean) => {
    if (!resourceDialog.type) return;

    const fieldId = resourceDialog.type === 'glass' ? 'glassModelId' : 'icModelId';
    const fieldInput = resourceDialog.type === 'glass' ? 'glassManualInput' : 'icManualInput';

    if (resource) {
      // 使用数据库中的资源
      handleInputChange(fieldId, resource.id.toString());
      handleInputChange(fieldInput, '');
    }
    
    // 如果选择加入数据库，改为添加到临时申请库
    if (addToDatabase && resourceDialog.inputValue) {
      // 获取当前项目的产品型号
      const currentProject = projects.find(p => p.id === parseInt(formData.projectId));
      const projectName = currentProject?.requirementId || '';
      
      // 使用临时申请库 API
      const apiPath = '/api/pending-resources';
      fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: resourceDialog.type,
          modelNumber: resourceDialog.inputValue,
          manufacturer: '',
          solutionId: formData.projectId ? parseInt(formData.projectId) : undefined,
          productModel: projectName || undefined,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            toast.success(`已提交${resourceDialog.type === 'glass' ? '玻璃' : 'IC'}物料申请，待采购部审批`);
            // 刷新资源列表
            loadResources();
          } else {
            toast.error('提交申请失败: ' + (data.error || '未知错误'));
          }
        })
        .catch(() => {
          toast.error('提交申请失败');
        });
    }

    setResourceDialog({ open: false, type: null, inputValue: '', similarResources: [], isNewResource: false });
  };

  useEffect(() => {
    setMounted(true);
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      // 并行加载所有资源（包括待审批库）
      const [projRes, designRes, glassRes, icRes, codeRes, categoryRes, pendingRes] = await Promise.all([
        fetch('/api/project-requirements'),
        fetch('/api/design-solutions'),
        fetch('/api/resources/glass'),
        fetch('/api/resources/ic'),
        fetch('/api/component-codes'),
        fetch('/api/component-codes?action=categories'),
        fetch('/api/pending-resources'),
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData.data || []);
      }

      if (designRes.ok) {
        const designData = await designRes.json();
        setDesignSolutions(designData.data || []);
      }

      // 先解析待审批库数据（只解析一次）
      let pendingData: { data: unknown[] } = { data: [] };
      if (pendingRes.ok) {
        pendingData = await pendingRes.json();
      }

      if (glassRes.ok) {
        const glassData = await glassRes.json();
        const formalGlass = glassData.data || glassData.resources || [];
        setGlassResources(formalGlass);

        // 合并待审批库玻璃数据
        const pendingGlass = ((pendingData.data || []) as { type: string; id: number; modelNumber: string; manufacturer: string | null; solutionId: number | null }[]).filter(
          (r) => r.type === 'glass'
        );

        // 生成合并的玻璃选项
        const merged: Array<{ id: number; value: string; label: string; subLabel: string; source: 'formal' | 'pending' }> = [];

        // 添加正式库
        formalGlass.forEach((g: { id: number; modelNumber: string; manufacturer: string | null }) => {
          merged.push({
            id: g.id,
            value: `formal-glass-${g.id}`,
            label: g.modelNumber,
            subLabel: g.manufacturer || '未知厂商',
            source: 'formal',
          });
        });

        // 添加待审批库
        pendingGlass.forEach((g) => {
          merged.push({
            id: g.id,
            value: `pending-glass-${g.id}`,
            label: g.modelNumber + (g.solutionId ? ` (方案#${g.solutionId})` : ''),
            subLabel: g.manufacturer || '未知厂商',
            source: 'pending',
          });
        });

        setMergedGlassOptions(merged);
      }

      if (icRes.ok) {
        const icData = await icRes.json();
        const formalIC = icData.data || icData.resources || [];
        setIcResources(formalIC);

        // 合并待审批库IC数据
        const pendingIC = ((pendingData.data || []) as { type: string; id: number; modelNumber: string; manufacturer: string | null; solutionId: number | null }[]).filter(
          (r) => r.type === 'ic'
        );

        // 生成合并的IC选项
        const merged: Array<{ id: number; value: string; label: string; subLabel: string; source: 'formal' | 'pending' }> = [];

        // 添加正式库
        formalIC.forEach((i: { id: number; modelNumber: string; manufacturer: string | null }) => {
          merged.push({
            id: i.id,
            value: `formal-ic-${i.id}`,
            label: i.modelNumber,
            subLabel: i.manufacturer || '未知厂商',
            source: 'formal',
          });
        });

        // 添加待审批库
        pendingIC.forEach((i) => {
          merged.push({
            id: i.id,
            value: `pending-ic-${i.id}`,
            label: i.modelNumber + (i.solutionId ? ` (方案#${i.solutionId})` : ''),
            subLabel: i.manufacturer || '未知厂商',
            source: 'pending',
          });
        });

        setMergedICOptions(merged);
      }

      if (codeRes.ok) {
        const codeData = await codeRes.json();
        setComponentCodes(codeData.data || []);
      }

      // 加载类别列表
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategories(categoryData.data || []);
      }
    } catch (error) {
      console.error('加载资源失败:', error);
    }
  };

  // 生成产品型号（根据编码规则）
  const generateProductModel = () => {
    const project = projects.find(p => p.id === parseInt(formData.projectId));
    if (!project) return '';

    // 获取玻璃型号
    let glassCode = '';
    if (formData.glassModelId && formData.glassModelId !== 'manual') {
      const glass = glassResources.find(g => g.id === parseInt(formData.glassModelId));
      glassCode = glass?.modelNumber.split('-').pop() || '';
    } else if (formData.glassManualInput) {
      glassCode = formData.glassManualInput.replace(/-/g, '').substring(0, 6);
    }

    // 获取IC型号
    let icCode = '';
    if (formData.icModelId && formData.icModelId !== 'manual') {
      const ic = icResources.find(i => i.id === parseInt(formData.icModelId));
      icCode = ic?.modelNumber.split('-').pop() || '';
    } else if (formData.icManualInput) {
      icCode = formData.icManualInput.replace(/-/g, '').substring(0, 6);
    }

    if (!glassCode || !icCode) return '';

    // 产品型号编码规则: LCM-[技术类别]-[尺寸]-[玻璃代码]-[IC代码]-[序号]
    const categoryMap: Record<string, string> = {
      'tft_ips': 'IPS',
      'tft_tn': 'TN',
      'tft_va': 'VA',
      'oled': 'OLED',
      'stn_lcd': 'STN',
      'e_paper': 'EPD',
      'other': 'XXX',
    };
    
    const category = categoryMap[project.productCategory] || 'TFT';
    const size = (project.size || 'XX').replace(/[^0-9.]/g, '').replace('.', '');
    
    // 生成序号（基于已有设计方案数量+1）
    const sequence = (designSolutions.length + 1).toString().padStart(3, '0');
    
    const model = `LCM-${category}-${size}-${glassCode}-${icCode}-${sequence}`;
    setGeneratedModel(model);
    return model;
  };

  useEffect(() => {
    if (formData.projectId && (formData.glassModelId || formData.glassManualInput) && (formData.icModelId || formData.icManualInput)) {
      generateProductModel();
    }
  }, [formData.projectId, formData.glassModelId, formData.glassManualInput, formData.icModelId, formData.icManualInput]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 当选择 FPC 类型时自动设置型号
      if (field === 'fpcType') {
        if (value === '新开模具') {
          // 获取当前项目的 requirementId
          const selectedProject = projects.find(p => p.id === parseInt(prev.projectId));
          if (selectedProject?.requirementId) {
            newData.fpcModel = `${selectedProject.requirementId}-FPC`;
          } else {
            newData.fpcModel = 'FPC-新开';
          }
        } else if (value === '共用型号' || value === '共用模具微调名称') {
          // 共用类型时清空自动填写的名称
          if (prev.fpcModel?.startsWith(prev.projectId ? projects.find(p => p.id === parseInt(prev.projectId))?.requirementId + '-FPC' || '' : '')) {
            newData.fpcModel = '';
          }
        }
      }
      
      // 当选择背光类型时自动设置型号
      if (field === 'backlightType') {
        if (value === '新开模具') {
          const selectedProject = projects.find(p => p.id === parseInt(prev.projectId));
          if (selectedProject?.requirementId) {
            newData.backlightModel = `${selectedProject.requirementId}-BL`;
          } else {
            newData.backlightModel = 'BL-新开';
          }
        } else if (value === '共用型号' || value === '共用模具微调名称') {
          if (prev.backlightModel?.startsWith(prev.projectId ? projects.find(p => p.id === parseInt(prev.projectId))?.requirementId + '-BL' || '' : '')) {
            newData.backlightModel = '';
          }
        }
      }
      
      return newData;
    });
    setSuccessInfo(null); // 清除成功信息
  };

  // 处理盖板表面处理多选
  const handleSurfaceTreatmentChange = (treatment: string, checked: boolean) => {
    setFormData(prev => {
      const treatments = checked
        ? [...prev.capacitiveSurfaceTreatments, treatment]
        : prev.capacitiveSurfaceTreatments.filter(t => t !== treatment);
      return {
        ...prev,
        capacitiveSurfaceTreatments: treatments,
      };
    });
    setSuccessInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!formData.projectId) {
      toast.error('请选择项目需求');
      return;
    }
    if (!formData.glassModelId && !formData.glassManualInput) {
      toast.error('请选择或输入玻璃型号');
      return;
    }
    if (!formData.icModelId && !formData.icManualInput) {
      toast.error('请选择或输入IC型号');
      return;
    }

    setIsSubmitting(true);

    try {
      const productModel = generateProductModel();
      const selectedProject = projects.find(p => p.id === parseInt(formData.projectId));

      const response = await fetch('/api/design-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(formData.projectId),
          productModel,
          glassModelId: (formData.glassModelId && formData.glassModelId !== 'manual') ? parseInt(formData.glassModelId) || null : null,
          icModelId: (formData.icModelId && formData.icModelId !== 'manual') ? parseInt(formData.icModelId) || null : null,
          polarizerType: formData.polarizerType || null,
          fpcModel: formData.fpcModel || null,
          fpcType: formData.fpcType || null,
          backlightModel: formData.backlightModel || null,
          backlightType: formData.backlightType || null,
          touchscreenType: formData.touchscreenMode === 'resistive' ? 'resistive' : 'capacitive',
          resistiveModel: formData.touchscreenMode === 'resistive' ? formData.resistiveModel : null,
          capacitiveTouchIc: formData.capacitiveTouchIC || null,
          capacitiveCoverMaterial: formData.capacitiveCoverMaterial || null,
          capacitiveTouchPoints: formData.capacitiveTouchPoints ? parseInt(formData.capacitiveTouchPoints) : null,
          capacitiveSurfaceTreatment: formData.capacitiveSurfaceTreatments.length > 0 
            ? JSON.stringify(formData.capacitiveSurfaceTreatments) 
            : null,
          capacitiveSpecialApplication: formData.capacitiveSpecialApplication || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || '提交失败');
      }

      // 显示成功信息
      setSuccessInfo({
        productModel,
        requirementId: selectedProject?.requirementId || '',
      });

      toast.success('设计方案保存成功！', {
        description: `产品型号: ${productModel}`,
        duration: 5000,
      });

      // 重置表单
      setFormData({
        projectId: '',
        glassModelId: '',
        glassManualInput: '',
        icModelId: '',
        icManualInput: '',
        polarizerType: '',
        fpcModel: '',
        fpcType: '',
        backlightModel: '',
        backlightType: '',
        touchscreenMode: 'multi-select',
        resistiveModel: '',
        capacitiveTouchIC: '',
        capacitiveCoverMaterial: '',
        capacitiveTouchPoints: '',
        capacitiveSurfaceTreatments: [],
        capacitiveSpecialApplication: '',
      });
      setGeneratedModel('');

      // 重新加载数据
      loadResources();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error('提交失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 零部件编码管理相关函数
  const handleAddCodeClick = () => {
    setShowAddForm(true);
    setEditingCode(null);
    setCodeGenerationMode('auto');
    setSelectedCategoryCode('');
    setSelectedSizeCode('');
    setCustomSize('');
    setCodePreview(null);
    setCodeFormData({
      componentCode: '',
      componentType: '',
      componentName: '',
      materialName: '',
      specification: '',
      supplier: '',
      manufacturer: '',
      manufacturerCode: '',
      serialNumber: '',
      packageType: '',
      specDescription: '',
    });
  };

  // 编码预览函数
  const fetchCodePreview = async (categoryCode: string, sizeCode: string) => {
    if (!categoryCode || !sizeCode) {
      setCodePreview(null);
      return;
    }

    try {
      const res = await fetch(`/api/component-codes?action=preview&categoryCode=${categoryCode}&sizeCode=${sizeCode}`);
      if (res.ok) {
        const data = await res.json();
        setCodePreview(data.data);
      }
    } catch (error) {
      console.error('获取编码预览失败:', error);
    }
  };

  // 类别选择变更
  const handleCategoryChange = (categoryCode: string) => {
    setSelectedCategoryCode(categoryCode);
    setCodeFormData(prev => ({ ...prev, componentType: categoryCode }));
    
    const category = categories.find(c => c.code === categoryCode);
    if (category) {
      setCodeFormData(prev => ({ ...prev, componentType: category.name }));
    }
    
    if (selectedSizeCode) {
      fetchCodePreview(categoryCode, selectedSizeCode);
    }
  };

  // 尺寸选择变更
  const handleSizeChange = (size: string) => {
    setCustomSize(size);
    // 转换尺寸为三位代码（如1.77 -> 177）
    const sizeCode = size.replace('.', '').padEnd(3, '0').slice(0, 3);
    setSelectedSizeCode(sizeCode);
    
    if (selectedCategoryCode) {
      fetchCodePreview(selectedCategoryCode, sizeCode);
    }
  };

  const handleEditCodeClick = (code: ComponentCode) => {
    setShowAddForm(true);
    setEditingCode(code);
    setCodeGenerationMode('manual');
    setSelectedCategoryCode('');
    setSelectedSizeCode('');
    setCustomSize('');
    setCodePreview(null);
    setCodeFormData({
      componentCode: code.componentCode,
      componentType: code.componentType,
      componentName: code.componentName,
      materialName: code.materialName || '',
      specification: code.specification || '',
      supplier: code.supplier || '',
      manufacturer: code.manufacturer || '',
      manufacturerCode: code.manufacturerCode || '',
      serialNumber: code.serialNumber || '',
      packageType: code.packageType || '',
      specDescription: code.specDescription || '',
    });
  };

  const handleCodeFormSubmit = async () => {
    // 验证
    if (!codeFormData.componentName) {
      toast.error('请填写零部件名称');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCode) {
        // 更新
        const response = await fetch(`/api/component-codes/${editingCode.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(codeFormData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || error.details || '更新失败');
        }

        toast.success('零部件编码更新成功');
      } else {
        // 新增
        let payload: Record<string, string> = { ...codeFormData };

        if (codeGenerationMode === 'auto') {
          // 自动生成编码
          if (!selectedCategoryCode || !selectedSizeCode) {
            toast.error('请选择类别和规格尺寸');
            setIsSubmitting(false);
            return;
          }
          
          // 通过API自动生成编码
          const response = await fetch('/api/component-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              categoryCode: selectedCategoryCode,
              sizeCode: selectedSizeCode,
              componentName: codeFormData.componentName,
              specification: codeFormData.specification,
              manufacturer: codeFormData.manufacturer,
              manufacturerCode: codeFormData.manufacturerCode,
              packageType: codeFormData.packageType,
              specDescription: codeFormData.specDescription,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.details || '创建失败');
          }

          const result = await response.json();
          toast.success(`零部件编码创建成功：${result.data?.componentCode || result.generatedCode}`);
        } else {
          // 手动输入编码
          if (!codeFormData.componentCode) {
            toast.error('请填写编码');
            setIsSubmitting(false);
            return;
          }

          // 验证编码格式
          const codePattern = /^\d{3}\.\d{3}\.\d{3}$/;
          if (!codePattern.test(codeFormData.componentCode)) {
            toast.error('编码格式不正确，应为 XXX.XXX.XXX 格式');
            setIsSubmitting(false);
            return;
          }

          const response = await fetch('/api/component-codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(codeFormData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.details || '创建失败');
          }

          toast.success('零部件编码创建成功');
        }
      }

      setShowAddForm(false);
      setEditingCode(null);
      loadResources();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCodeClick = async (id: number) => {
    if (!confirm('确定要删除这个零部件编码吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/component-codes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || '删除失败');
      }

      toast.success('零部件编码删除成功');
      loadResources();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleExcelImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // 使用 xlsx 库解析 Excel 文件
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('Excel 文件为空');
          return;
        }

        // 映射字段名称（支持中英文）
        const mappedData = jsonData.map((row: any) => ({
          componentCode: row['零部件编码'] || row['componentCode'] || row['编码'] || '',
          componentType: row['零部件类别'] || row['componentType'] || row['类别'] || '',
          componentName: row['零部件名称'] || row['componentName'] || row['名称'] || '',
          specification: row['规格型号'] || row['specification'] || row['规格'] || '',
          manufacturer: row['厂商'] || row['manufacturer'] || '',
          manufacturerCode: row['厂商代码'] || row['manufacturerCode'] || '',
          serialNumber: row['序号'] || row['serialNumber'] || '',
          packageType: row['封装类型'] || row['packageType'] || row['封装'] || '',
          description: row['描述'] || row['description'] || row['备注'] || '',
        }));

        const response = await fetch('/api/component-codes/bulk-import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codes: mappedData }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.details || '导入失败');
        }

        toast.success(
          `导入完成！成功 ${result.data.success} 条，失败 ${result.data.failed} 条`
        );

        loadResources();
      } catch (error) {
        console.error('导入失败:', error);
        toast.error('导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
      }
    };

    input.click();
  };

  // 筛选查询结果
  const filteredDesigns = designSolutions.filter(design => {
    const project = projects.find(p => p.id === design.projectId);
    if (searchRequirementId && project?.requirementId && !project.requirementId.includes(searchRequirementId)) {
      return false;
    }
    if (searchProductModel && design.productModel && !design.productModel.includes(searchProductModel)) {
      return false;
    }
    return true;
  });

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
                <p className="text-sm text-slate-500">设计方案与型号管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="design" className="text-base">
              <Layers className="h-4 w-4 mr-2" />
              方案设计
            </TabsTrigger>
            <TabsTrigger value="query" className="text-base">
              <Search className="h-4 w-4 mr-2" />
              型号查询
            </TabsTrigger>
            <TabsTrigger value="components" className="text-base">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              零部件管理
            </TabsTrigger>
          </TabsList>

          {/* 方案设计 Tab */}
          <TabsContent value="design">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：项目选择 */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>选择项目需求</CardTitle>
                  <CardDescription>从业务部提交的需求中选择</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>项目需求 <span className="text-red-500">*</span></Label>
                      <Select value={formData.projectId} onValueChange={(v) => handleInputChange('projectId', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择项目需求" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.length === 0 ? (
                            <div className="p-2 text-sm text-slate-500">暂无项目需求，请先由业务部提交</div>
                          ) : (
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {project.requirementId || `ID:${project.id}`} - {project.customerName}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {project.productCategory} | {project.size || '未指定尺寸'}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedProject && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                        <h4 className="font-medium text-slate-900">项目详情</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-slate-600">需求编号:</span> <span className="font-bold text-blue-600">{selectedProject.requirementId || '-'}</span></div>
                          <div><span className="text-slate-600">客户:</span> {selectedProject.customerName}</div>
                          <div><span className="text-slate-600">技术类别:</span> {selectedProject.productCategory}</div>
                          <div><span className="text-slate-600">尺寸:</span> {selectedProject.size || '-'}</div>
                          <div><span className="text-slate-600">分辨率:</span> {selectedProject.resolution || '-'}</div>
                          <div><span className="text-slate-600">等级:</span> {selectedProject.projectLevel}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 右侧：方案设计 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>设计方案</CardTitle>
                  <CardDescription>配置核心组件生成产品型号</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 核心组件 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 玻璃型号 */}
                      <div className="space-y-2">
                        <Label>玻璃型号 <span className="text-red-500">*</span></Label>
                        <Combobox
                          options={mergedGlassOptions}
                          value={formData.glassModelId}
                          onValueChange={(value, option) => {
                            if (option) {
                              handleInputChange('glassModelId', value);
                              handleInputChange('glassManualInput', '');
                            }
                          }}
                          onCustomInput={(inputValue) => {
                            handleManualResourceInput('glass', inputValue, [
                              ...glassResources,
                              ...(mergedGlassOptions.filter(o => o.source === 'pending').map(o => ({
                                id: o.id,
                                modelNumber: o.label,
                                manufacturer: o.subLabel as string | null,
                              })))
                            ]);
                          }}
                          placeholder="搜索或输入玻璃型号..."
                          emptyMessage="没有找到匹配项，按 Enter 添加新物料"
                          allowCustomInput={true}
                        />
                      </div>

                      {/* IC型号 */}
                      <div className="space-y-2">
                        <Label>IC型号 <span className="text-red-500">*</span></Label>
                        <Combobox
                          options={mergedICOptions}
                          value={formData.icModelId}
                          onValueChange={(value, option) => {
                            if (option) {
                              handleInputChange('icModelId', value);
                              handleInputChange('icManualInput', '');
                            }
                          }}
                          onCustomInput={(inputValue) => {
                            handleManualResourceInput('ic', inputValue, [
                              ...icResources,
                              ...(mergedICOptions.filter(o => o.source === 'pending').map(o => ({
                                id: o.id,
                                modelNumber: o.label,
                                manufacturer: o.subLabel as string | null,
                              })))
                            ]);
                          }}
                          placeholder="搜索或输入IC型号..."
                          emptyMessage="没有找到匹配项，按 Enter 添加新物料"
                          allowCustomInput={true}
                        />
                      </div>
                    </div>

                    {/* 偏光片类型 */}
                    <div className="space-y-2">
                      <Label>偏光片类型</Label>
                      <Select
                        value={formData.polarizerType}
                        onValueChange={(v) => handleInputChange('polarizerType', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择偏光片类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {POLARIZER_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* FPC和背光 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>FPC型号</Label>
                        <Input
                          placeholder="输入FPC型号"
                          value={formData.fpcModel}
                          onChange={(e) => handleInputChange('fpcModel', e.target.value)}
                        />
                        <RadioGroup
                          value={formData.fpcType}
                          onValueChange={(v) => handleInputChange('fpcType', v)}
                          className="flex gap-4"
                        >
                          {TYPE_OPTIONS.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`fpc-${option}`} />
                              <Label htmlFor={`fpc-${option}`} className="text-sm">{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label>背光型号</Label>
                        <Input
                          placeholder="输入背光型号"
                          value={formData.backlightModel}
                          onChange={(e) => handleInputChange('backlightModel', e.target.value)}
                        />
                        <RadioGroup
                          value={formData.backlightType}
                          onValueChange={(v) => handleInputChange('backlightType', v)}
                          className="flex gap-4"
                        >
                          {TYPE_OPTIONS.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`backlight-${option}`} />
                              <Label htmlFor={`backlight-${option}`} className="text-sm">{option}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    {/* 触摸屏配置 */}
                    <div className="space-y-4">
                      <Label>触摸屏方案</Label>
                      <RadioGroup
                        value={formData.touchscreenMode}
                        onValueChange={(v) => handleInputChange('touchscreenMode', v)}
                        className="flex gap-6"
                      >
                        {TOUCHSCREEN_MODES.map((mode) => (
                          <div key={mode} className="flex items-center space-x-2">
                            <RadioGroupItem value={mode === '触控/盖板方案（多选）' ? 'multi-select' : 'resistive'} id={`mode-${mode}`} />
                            <Label htmlFor={`mode-${mode}`} className="text-sm">{mode}</Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {formData.touchscreenMode === 'resistive' && (
                        <Input
                          placeholder="请输入电阻触摸屏型号"
                          value={formData.resistiveModel}
                          onChange={(e) => handleInputChange('resistiveModel', e.target.value)}
                        />
                      )}

                      {formData.touchscreenMode === 'multi-select' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">触控IC</Label>
                              <Input
                                placeholder="触控IC型号"
                                value={formData.capacitiveTouchIC}
                                onChange={(e) => handleInputChange('capacitiveTouchIC', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">盖板材质</Label>
                              <Select
                                value={formData.capacitiveCoverMaterial}
                                onValueChange={(v) => handleInputChange('capacitiveCoverMaterial', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择材质" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COVER_MATERIALS.map((mat) => (
                                    <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">触控点数</Label>
                              <Input
                                type="number"
                                placeholder="如：10"
                                value={formData.capacitiveTouchPoints}
                                onChange={(e) => handleInputChange('capacitiveTouchPoints', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* 盖板表面处理（多选） */}
                          <div className="space-y-2">
                            <Label className="text-sm">盖板表面处理（可多选）</Label>
                            <div className="flex flex-wrap gap-4">
                              {SURFACE_TREATMENTS.map((treatment) => (
                                <div key={treatment} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`surface-${treatment}`}
                                    checked={formData.capacitiveSurfaceTreatments.includes(treatment)}
                                    onCheckedChange={(checked) => 
                                      handleSurfaceTreatmentChange(treatment, checked as boolean)
                                    }
                                  />
                                  <Label htmlFor={`surface-${treatment}`} className="text-sm cursor-pointer">
                                    {treatment}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 生成的产品型号 */}
                    {generatedModel && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          生成的产品型号
                        </h4>
                        <div className="text-2xl font-bold text-green-700">{generatedModel}</div>
                        <p className="text-xs text-slate-500 mt-1">编码规则: LCM-[技术类别]-[尺寸]-[玻璃代码]-[IC代码]-[序号]</p>
                      </div>
                    )}

                    {/* 成功提示 */}
                    {successInfo && (
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          保存成功！
                        </h4>
                        <div className="text-sm text-emerald-700">
                          <p>需求编号: <span className="font-bold">{successInfo.requirementId}</span></p>
                          <p>产品型号: <span className="font-bold">{successInfo.productModel}</span></p>
                        </div>
                      </div>
                    )}

                    {/* 提交按钮 */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.projectId}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            保存中...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            保存方案
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 型号查询 Tab */}
          <TabsContent value="query">
            <Card>
              <CardHeader>
                <CardTitle>需求编号与产品型号查询</CardTitle>
                <CardDescription>查询需求编号与产品型号的对应关系</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 搜索栏 */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>需求编号</Label>
                      <Input
                        placeholder="输入需求编号搜索..."
                        value={searchRequirementId}
                        onChange={(e) => setSearchRequirementId(e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>产品型号</Label>
                      <Input
                        placeholder="输入产品型号搜索..."
                        value={searchProductModel}
                        onChange={(e) => setSearchProductModel(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={() => { setSearchRequirementId(''); setSearchProductModel(''); }}>
                        清除
                      </Button>
                    </div>
                  </div>

                  {/* 查询结果表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>需求编号</TableHead>
                        <TableHead>客户名称</TableHead>
                        <TableHead>产品型号</TableHead>
                        <TableHead>表面处理</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDesigns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                            暂无数据
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDesigns.map((design) => {
                          const project = projects.find(p => p.id === design.projectId);
                          const surfaceTreatments = design.capacitiveSurfaceTreatment 
                            ? JSON.parse(design.capacitiveSurfaceTreatment).join(', ')
                            : '-';
                          return (
                            <TableRow key={design.id}>
                              <TableCell className="font-medium text-blue-600">
                                {project?.requirementId || '-'}
                              </TableCell>
                              <TableCell>{project?.customerName || '-'}</TableCell>
                              <TableCell className="font-mono">{design.productModel || '-'}</TableCell>
                              <TableCell>{surfaceTreatments}</TableCell>
                              <TableCell>
                                {new Date(design.createdAt).toLocaleDateString('zh-CN')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {project?.status || '待处理'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 零部件管理 Tab */}
          <TabsContent value="components">
            <div className="space-y-6">
              {/* 编码规则说明 */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900">金蝶编码规则（格式：XXX.XXX.XXX）</h4>
                      <div className="text-sm text-blue-700 mt-1 space-y-1">
                        <p><strong>A段（类别代码）</strong>：001-LCD、002-IC、003-FPC、004-背光、005-铁框、006-TP、009-COG、010-FOG、011-FPCBA、012-LCM等</p>
                        <p><strong>B段（规格尺寸）</strong>：模组尺寸（如177=1.77寸）或分辨率代码</p>
                        <p><strong>C段（序号）</strong>：000-999，系统自动递增</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 新增/编辑表单 */}
              {showAddForm && (
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-purple-50">
                    <CardTitle className="flex items-center justify-between">
                      <span>{editingCode ? '编辑零部件编码' : '新增零部件编码'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowAddForm(false); setEditingCode(null); }}
                      >
                        ✕
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleCodeFormSubmit(); }} className="space-y-6">
                      {/* 编码生成模式 */}
                      {!editingCode && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>编码生成方式</Label>
                            <RadioGroup
                              value={codeGenerationMode}
                              onValueChange={(v) => setCodeGenerationMode(v as 'auto' | 'manual')}
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="auto" id="mode-auto" />
                                <Label htmlFor="mode-auto" className="cursor-pointer">自动生成（推荐）</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="manual" id="mode-manual" />
                                <Label htmlFor="mode-manual" className="cursor-pointer">手动输入</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {codeGenerationMode === 'auto' ? (
                            /* 自动生成模式 */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="space-y-2">
                                <Label>零部件类别 <span className="text-red-500">*</span></Label>
                                <Select value={selectedCategoryCode} onValueChange={handleCategoryChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="请选择类别" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((cat) => (
                                      <SelectItem key={cat.code} value={cat.code}>
                                        <div className="flex flex-col">
                                          <span>{cat.name} ({cat.code})</span>
                                          <span className="text-xs text-slate-500">{cat.bFormat}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>规格尺寸 <span className="text-red-500">*</span></Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={customSize}
                                    onChange={(e) => handleSizeChange(e.target.value)}
                                    placeholder="如：1.77、2.4、240x320"
                                    className="flex-1"
                                  />
                                </div>
                                <p className="text-xs text-slate-500">
                                  {selectedCategoryCode && codePreview && (
                                    <>B段格式：{codePreview.bFormat} → 代码：{selectedSizeCode}</>
                                  )}
                                </p>
                              </div>

                              {/* 编码预览 */}
                              {codePreview && (
                                <div className="col-span-2 p-4 bg-white rounded-lg border border-green-300">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="font-medium text-green-800">编码预览</span>
                                  </div>
                                  <div className="text-2xl font-mono font-bold text-green-700">
                                    {codePreview.previewCode}
                                  </div>
                                  <div className="text-sm text-slate-500 mt-1">
                                    下一个序号：{codePreview.nextSequence}（如果编码已存在，系统会自动分配下一个可用序号）
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            /* 手动输入模式 */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="space-y-2">
                                <Label>零部件编码 <span className="text-red-500">*</span></Label>
                                <Input
                                  value={codeFormData.componentCode}
                                  onChange={(e) => setCodeFormData({ ...codeFormData, componentCode: e.target.value })}
                                  placeholder="格式：001.177.001"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>零部件类别</Label>
                                <Input
                                  value={codeFormData.componentType}
                                  onChange={(e) => setCodeFormData({ ...codeFormData, componentType: e.target.value })}
                                  placeholder="类别名称"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 基础信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-slate-800 border-b pb-2">基础信息</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>物料名称 <span className="text-red-500">*</span></Label>
                            <Input
                              value={codeFormData.materialName}
                              onChange={(e) => setCodeFormData({ ...codeFormData, materialName: e.target.value })}
                              placeholder="物料名称"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>规格型号</Label>
                            <Input
                              value={codeFormData.specification}
                              onChange={(e) => setCodeFormData({ ...codeFormData, specification: e.target.value })}
                              placeholder="如：IC型号、尺寸规格"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>供应商</Label>
                            <Input
                              value={codeFormData.supplier}
                              onChange={(e) => setCodeFormData({ ...codeFormData, supplier: e.target.value })}
                              placeholder="供应商名称"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 厂商信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-slate-800 border-b pb-2">厂商信息</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>厂商</Label>
                            <Input
                              value={codeFormData.manufacturer}
                              onChange={(e) => setCodeFormData({ ...codeFormData, manufacturer: e.target.value })}
                              placeholder="厂商名称"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>厂商代码</Label>
                            <Input
                              value={codeFormData.manufacturerCode}
                              onChange={(e) => setCodeFormData({ ...codeFormData, manufacturerCode: e.target.value })}
                              placeholder="厂商代码"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>封装类型</Label>
                            <Input
                              value={codeFormData.packageType}
                              onChange={(e) => setCodeFormData({ ...codeFormData, packageType: e.target.value })}
                              placeholder="如：QFN、BGA、CSP"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 附加信息 */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-slate-800 border-b pb-2">附加信息</h4>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label>规格说明</Label>
                            <Textarea
                              value={codeFormData.specDescription}
                              onChange={(e) => setCodeFormData({ ...codeFormData, specDescription: e.target.value })}
                              placeholder="详细规格说明"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { setShowAddForm(false); setEditingCode(null); }}
                        >
                          取消
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isSubmitting ? '保存中...' : (editingCode ? '更新' : '创建')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* 零部件编码列表 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>零部件编码列表</CardTitle>
                      <CardDescription>管理所有零部件编码，支持搜索和批量操作</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleAddCodeClick}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        新增
                      </Button>
                      <Button variant="outline" onClick={handleExcelImport}>
                        <Upload className="h-4 w-4 mr-2" />
                        导入Excel
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 搜索栏 */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="搜索编码、名称、厂商..."
                        value={searchComponentCode}
                        onChange={(e) => setSearchComponentCode(e.target.value)}
                      />
                    </div>
                    <div className="w-64">
                      <Select value={searchComponentType || 'all'} onValueChange={(val) => setSearchComponentType(val === 'all' ? '' : val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="所有类别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">所有类别</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.code} value={cat.name}>
                              {cat.name} ({cat.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 数据表格 */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">编码</TableHead>
                        <TableHead className="w-24">类别</TableHead>
                        <TableHead className="w-28">物料名称</TableHead>
                        <TableHead className="w-20">规格</TableHead>
                        <TableHead className="w-24">供应商</TableHead>
                        <TableHead className="w-20">封装</TableHead>
                        <TableHead className="w-16">状态</TableHead>
                        <TableHead className="w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {componentCodes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                            暂无数据，请点击"新增"或"导入Excel"添加零部件编码
                          </TableCell>
                        </TableRow>
                      ) : (
                        componentCodes
                          .filter(code => {
                            const matchSearch =
                              !searchComponentCode ||
                              code.componentCode.toLowerCase().includes(searchComponentCode.toLowerCase()) ||
                              code.componentName.toLowerCase().includes(searchComponentCode.toLowerCase()) ||
                              (code.materialName?.toLowerCase().includes(searchComponentCode.toLowerCase()) ?? false) ||
                              (code.supplier?.toLowerCase().includes(searchComponentCode.toLowerCase()) ?? false) ||
                              (code.manufacturer?.toLowerCase().includes(searchComponentCode.toLowerCase()) ?? false);
                            const matchType = !searchComponentType || code.componentType === searchComponentType;
                            return matchSearch && matchType;
                          })
                          .map((code) => (
                            <TableRow key={code.id}>
                              <TableCell className="font-mono font-medium text-blue-600">
                                {code.componentCode}
                              </TableCell>
                              <TableCell className="text-xs">{code.componentType}</TableCell>
                              <TableCell>{code.materialName || code.componentName}</TableCell>
                              <TableCell className="text-xs">{code.specification || '-'}</TableCell>
                              <TableCell className="text-xs">{code.supplier || '-'}</TableCell>
                              <TableCell className="text-xs">{code.packageType || '-'}</TableCell>
                              <TableCell>
                                <Badge variant={code.status === 'active' ? 'default' : 'secondary'}>
                                  {code.status === 'active' ? '启用' : '停用'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCodeClick(code)}
                                  >
                                    编辑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCodeClick(code.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    删除
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>

                  {/* 统计信息 */}
                  <div className="mt-4 text-sm text-slate-500">
                    共 {componentCodes.length} 条记录
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 资源确认弹窗 */}
      <AlertDialog open={resourceDialog.open} onOpenChange={(open) => {
        if (!open) {
          setResourceDialog({ open: false, type: null, inputValue: '', similarResources: [], isNewResource: false });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {resourceDialog.isNewResource 
                ? `添加新的${resourceDialog.type === 'glass' ? '玻璃' : 'IC'}资源` 
                : `发现相似的${resourceDialog.type === 'glass' ? '玻璃' : 'IC'}资源`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resourceDialog.isNewResource ? (
                <span>您输入的型号 "<strong>{resourceDialog.inputValue}</strong>" 在数据库中不存在，是否添加到采购库？</span>
              ) : (
                <>
                  <p className="mb-2">您输入的型号与以下已有资源相似：</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {resourceDialog.similarResources.map((r) => (
                      <li key={r.id}>
                        <strong>{r.modelNumber}</strong> ({r.manufacturer || '未知厂商'})
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3">请选择使用已有资源还是添加新资源？</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            {resourceDialog.isNewResource ? (
              <>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => confirmUseResource(null, true)}>
                  添加到数据库
                </AlertDialogAction>
              </>
            ) : (
              <>
                {resourceDialog.similarResources.map((r) => (
                  <AlertDialogAction 
                    key={r.id} 
                    onClick={() => confirmUseResource(r, false)}
                    className="flex-1"
                  >
                    使用 {r.modelNumber}
                  </AlertDialogAction>
                ))}
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={() => confirmUseResource(null, true)} className="bg-slate-500 hover:bg-slate-600">
                  添加新资源
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
