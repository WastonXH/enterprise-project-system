import { NextRequest, NextResponse } from 'next/server';
import { componentCodeManager } from '@/storage/database';
import { updateComponentCodeSchema } from '@/storage/database/shared/schema';
import { z } from 'zod';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/component-codes/[id]
 * 获取单个零部件编码
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const code = await componentCodeManager.getComponentCodeById(parseInt(id));

    if (!code) {
      return NextResponse.json(
        { error: '零部件编码不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: code });
  } catch (error) {
    console.error('获取零部件编码失败:', error);
    return NextResponse.json(
      { error: '获取零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/component-codes/[id]
 * 更新零部件编码
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateComponentCodeSchema.parse(body);

    // 如果要更新编码，检查新编码是否重复
    if (validated.componentCode) {
      const existingCode = await componentCodeManager.checkCodeExists(validated.componentCode, parseInt(id));
      if (existingCode) {
        return NextResponse.json(
          { error: '零部件编码已存在', details: `编码 ${validated.componentCode} 已存在` },
          { status: 409 }
        );
      }
    }

    const code = await componentCodeManager.updateComponentCode(parseInt(id), validated);

    if (!code) {
      return NextResponse.json(
        { error: '零部件编码不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '零部件编码更新成功',
      data: code,
    });
  } catch (error) {
    console.error('更新零部件编码失败:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: '更新零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/component-codes/[id]
 * 删除零部件编码
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await componentCodeManager.deleteComponentCode(parseInt(id));

    return NextResponse.json({
      message: '零部件编码删除成功',
    });
  } catch (error) {
    console.error('删除零部件编码失败:', error);
    return NextResponse.json(
      { error: '删除零部件编码失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
