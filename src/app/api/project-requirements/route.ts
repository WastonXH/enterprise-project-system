import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { projectRequirements } from '@/storage/database/shared/schema';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();

    const {
      businessGroup,
      customerName,
      size,
      resolution,
      productApplication,
      productCategory,
      projectLevel,
      basicInfo,
    } = body;

    // 插入项目需求数据
    const result = await db.insert(projectRequirements).values({
      businessGroup,
      customerName,
      size: size || null,
      resolution: resolution || null,
      productApplication: productApplication || null,
      productCategory,
      projectLevel,
      basicInfo: basicInfo || null,
    }).returning();

    return NextResponse.json({
      message: '项目需求创建成功',
      id: result[0].id,
    }, { status: 201 });
  } catch (error) {
    console.error('创建项目需求失败:', error);
    return NextResponse.json(
      { error: '创建项目需求失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    // 获取所有项目需求
    const requirements = await db.select().from(projectRequirements).orderBy(projectRequirements.createdAt);

    return NextResponse.json({
      requirements,
    }, { status: 200 });
  } catch (error) {
    console.error('获取项目需求失败:', error);
    return NextResponse.json(
      { error: '获取项目需求失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
