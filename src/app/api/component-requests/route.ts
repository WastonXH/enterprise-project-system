import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { desc, eq } from 'drizzle-orm';
import * as schema from '@/storage/database/shared/schema';

// GET - 获取所有零部件申请
export async function GET() {
  try {
    const db = await getDb(schema);
    
    const requests = await db
      .select()
      .from(schema.componentRequests)
      .orderBy(desc(schema.componentRequests.createdAt));

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('获取零部件申请失败:', error);
    return NextResponse.json(
      { success: false, error: '获取零部件申请失败' },
      { status: 500 }
    );
  }
}

// POST - 创建零部件申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb(schema);

    // 验证数据
    const validatedData = schema.insertComponentRequestSchema.parse(body);

    // 插入数据库
    const result = await db
      .insert(schema.componentRequests)
      .values({
        ...validatedData,
        status: '待处理',
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: '零部件申请提交成功',
    });
  } catch (error) {
    console.error('创建零部件申请失败:', error);
    return NextResponse.json(
      { success: false, error: '创建零部件申请失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
