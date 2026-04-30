'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Cpu, ShoppingCart, Shield, FileText, Database, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const departments = [
    {
      id: 'business',
      name: '业务部',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      description: '管理客户项目需求、收集产品规格信息',
      features: ['项目需求录入', '客户信息管理', '产品规格定义', '项目等级分类']
    },
    {
      id: 'rd',
      name: '研发部',
      icon: Cpu,
      color: 'from-purple-500 to-purple-600',
      description: '设计方案配置、产品型号生成',
      features: ['玻璃/IC选型', '偏光片配置', 'FPC/背光设计', '触摸屏方案', '型号自动生成']
    },
    {
      id: 'purchasing',
      name: '采购部',
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
      description: '资源库管理、供应链信息维护',
      features: ['玻璃资源库', 'IC资源库', '库存状态追踪', '供应商信息管理']
    },
    {
      id: 'quality',
      name: '质量部',
      icon: Shield,
      color: 'from-orange-500 to-orange-600',
      description: '试产质量检验、质量数据记录',
      features: ['试产质量记录', '缺陷率统计', '测试结果归档', '改进措施追踪']
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部导航 */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">企业项目管理系统</h1>
                <p className="text-sm text-slate-500">多部门协作平台</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/diagnosis">
                <Button variant="ghost" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  数据状态
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                系统设置
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            选择您的部门
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            这是一个综合性的企业项目管理系统，支持业务、研发、采购和质量部门的协作工作流程
          </p>
        </div>

        {/* 部门卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {departments.map((dept) => {
            const Icon = dept.icon;
            return (
              <Link key={dept.id} href={`/department/${dept.id}`}>
                <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-transparent overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${dept.color} text-white pb-8`}>
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                        {dept.id.toUpperCase()}
                      </div>
                    </div>
                    <CardTitle className="text-2xl mt-4">{dept.name}</CardTitle>
                    <CardDescription className="text-white/90 text-base">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {dept.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-slate-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-sm text-slate-500">点击进入工作台</span>
                      <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                        <TrendingUp className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 功能说明区 */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              工作流程说明
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">业务部录入项目需求</h4>
                  <p className="text-sm text-slate-600">收集客户信息、产品规格、项目等级等基础信息</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-lg bg-purple-50 border border-purple-100">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">采购部维护资源库</h4>
                  <p className="text-sm text-slate-600">管理玻璃、IC等核心零部件的型号和库存信息</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">研发部设计方案</h4>
                  <p className="text-sm text-slate-600">选型配置、方案设计，自动生成产品型号</p>
                </div>
              </div>
              <div className="flex gap-4 items-start p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="h-8 w-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">质量部记录试产质量</h4>
                  <p className="text-sm text-slate-600">追踪试产过程、记录质量数据、制定改进措施</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600">
          <p>© 2025 企业项目管理系统 - 多部门协作解决方案</p>
        </div>
      </footer>
    </div>
  );
}
