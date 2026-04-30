import { NextRequest, NextResponse } from 'next/server';
import { componentCodeManager } from '@/storage/database';
import { insertComponentCodeSchema } from '@/storage/database/shared/schema';
import { z } from 'zod';

/**
 * POST /api/component-codes
 * 创建零部件编码
 * 
 * 支持两种创建方式：
 * 1. 手动指定编码：传入完整的 componentCode
 * 2. 自动生成：传入 categoryCode 和 sizeCode，系统自动生成编码
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 如果传入了 categoryCode 和 sizeCode，自动生成编码
    if (body.categoryCode && body.sizeCode && !body.componentCode) {
      const categoryCode = body.categoryCode;
      const sizeCode = body.sizeCode;
      const customSequence = body.sequence || undefined;
      
      // 验证类别代码是否有效
      const categoryList = componentCodeManager.getCategoryList();
      const isValidCategory = categoryList.some(c => c.code === categoryCode);
      if (!isValidCategory) {
        return NextResponse.json(
          { error: '无效的类别代码', details: `类别代码 ${categoryCode} 不存在` },
          { status: 400 }
        );
      }
      
      // 生成编码
      const generatedCode = await componentCodeManager.generateComponentCode(
        categoryCode,
        sizeCode,
        customSequence
      );
      
      // 构建完整的数据
      const fullData = {
        componentCode: generatedCode,
        componentType: body.componentType || categoryCode,
        componentName: body.componentName || '',
        materialName: body.materialName || '',
        specification: body.specification || sizeCode,
        supplier: body.supplier || '',
        manufacturer: body.manufacturer || '',
        manufacturerCode: body.manufacturerCode || '',
        serialNumber: customSequence || await componentCodeManager.generateNextSequence(categoryCode, sizeCode),
        packageType: body.packageType || '',
        specDescription: body.specDescription || '',
        status: body.status || 'active',
      };
      
      const validated = insertComponentCodeSchema.parse(fullData);
      
      // 检查编码是否重复
      const existingCode = await componentCodeManager.getComponentCodeByCode(generatedCode);
      if (existingCode) {
        return NextResponse.json(
          { error: '编码冲突', details: `编码 ${generatedCode} 已存在，请使用新的规格尺寸` },
          { status: 409 }
        );
      }
      
      const code = await componentCodeManager.createComponentCode(validated);
      
      return NextResponse.json(
        {
          message: '零部件编码创建成功（自动生成）',
          data: code,
          generatedCode,
        },
        { status: 201 }
      );
    }
    
    // 手动指定编码的创建方式
    const validated = insertComponentCodeSchema.parse(body);

    // 检查编码是否重复
    const existingCode = await componentCodeManager.getComponentCodeByCode(validated.componentCode);
    if (existingCode) {
      return NextResponse.json(
        { error: '零部件编码已存在', details: `编码 ${validated.componentCode} 已存在` },
        { status: 409 }
      );
    }

    const code = await componentCodeManager.createComponentCode(validated);

    return NextResponse.json(
      {
        message: '零部件编码创建成功',
        data: code,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建零部件编码失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '创建零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/component-codes
 * 获取零部件编码列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // 获取类别列表
    if (action === 'categories') {
      const categories = componentCodeManager.getCategoryList();
      return NextResponse.json({
        data: categories,
      });
    }
    
    // 获取编码预览（预览生成后的编码）
    if (action === 'preview') {
      const categoryCode = searchParams.get('categoryCode');
      const sizeCode = searchParams.get('sizeCode');
      
      if (!categoryCode || !sizeCode) {
        return NextResponse.json(
          { error: '缺少参数', details: '需要提供 categoryCode 和 sizeCode' },
          { status: 400 }
        );
      }
      
      // 验证类别代码
      const categoryList = componentCodeManager.getCategoryList();
      const category = categoryList.find(c => c.code === categoryCode);
      if (!category) {
        return NextResponse.json(
          { error: '无效的类别代码', details: `类别代码 ${categoryCode} 不存在` },
          { status: 400 }
        );
      }
      
      // 获取下一个序号
      const nextSequence = await componentCodeManager.generateNextSequence(categoryCode, sizeCode);
      const previewCode = `${categoryCode}.${sizeCode}.${nextSequence}`;
      
      return NextResponse.json({
        data: {
          categoryCode,
          sizeCode,
          nextSequence,
          previewCode,
          categoryName: category.name,
          bFormat: category.bFormat,
        },
      });
    }
    
    // 默认：获取编码列表
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');
    const componentCode = searchParams.get('componentCode') || undefined;
    const componentType = searchParams.get('componentType') || undefined;
    const componentName = searchParams.get('componentName') || undefined;
    const manufacturer = searchParams.get('manufacturer') || undefined;
    const status = searchParams.get('status') || undefined;

    const codes = await componentCodeManager.getComponentCodes({
      skip,
      limit,
      filters: {
        componentCode,
        componentType,
        componentName,
        manufacturer,
        status,
      },
    });

    const total = await componentCodeManager.count({
      filters: {
        componentType,
        status,
      },
    });

    return NextResponse.json({
      data: codes,
      total,
      skip,
      limit,
    });
  } catch (error) {
    console.error('获取零部件编码失败:', error);
    return NextResponse.json(
      { error: '获取零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
