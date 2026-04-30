import { NextRequest, NextResponse } from 'next/server';
import { componentCodeManager } from '@/storage/database';

/**
 * POST /api/component-codes/bulk-import
 * 批量导入零部件编码
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codes } = body;

    if (!Array.isArray(codes)) {
      return NextResponse.json(
        { error: '参数错误', details: 'codes 必须是数组' },
        { status: 400 }
      );
    }

    if (codes.length === 0) {
      return NextResponse.json(
        { error: '参数错误', details: 'codes 数组不能为空' },
        { status: 400 }
      );
    }

    // 验证并过滤数据
    const validCodes: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];

      // 基本验证
      if (!code.componentCode || !code.componentType || !code.componentName) {
        errors.push({
          index: i,
          error: '缺少必填字段',
          data: code,
        });
        continue;
      }

      // 检查编码是否重复
      const existingCode = await componentCodeManager.getComponentCodeByCode(code.componentCode);
      if (existingCode) {
        errors.push({
          index: i,
          error: '编码已存在',
          data: code,
        });
        continue;
      }

      validCodes.push({
        componentCode: code.componentCode,
        componentType: code.componentType,
        componentName: code.componentName,
        specification: code.specification || null,
        manufacturer: code.manufacturer || null,
        manufacturerCode: code.manufacturerCode || null,
        serialNumber: code.serialNumber || null,
        packageType: code.packageType || null,
        description: code.description || null,
        status: 'active',
      });
    }

    // 批量创建
    let createdCodes: any[] = [];
    if (validCodes.length > 0) {
      createdCodes = await componentCodeManager.bulkCreateComponentCodes(validCodes);
    }

    return NextResponse.json({
      message: '批量导入完成',
      data: {
        total: codes.length,
        success: validCodes.length,
        failed: errors.length,
        created: createdCodes.length,
        errors: errors,
      },
    });
  } catch (error) {
    console.error('批量导入零部件编码失败:', error);
    return NextResponse.json(
      { error: '批量导入零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
