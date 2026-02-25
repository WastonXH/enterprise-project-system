import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { glassResources } from '@/storage/database/shared/schema';
import { sql } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();

    const { modelNumber, manufacturer, specifications, stockStatus, remarks } = body;

    const result = await db.insert(glassResources).values({
      modelNumber,
      manufacturer: manufacturer || null,
      specifications: specifications || null,
      stockStatus: stockStatus || null,
      remarks: remarks || null,
    }).returning();

    return NextResponse.json({
      message: '玻璃资源添加成功',
      id: result[0].id,
    }, { status: 201 });
  } catch (error) {
    console.error('添加玻璃资源失败:', error);
    return NextResponse.json(
      { error: '添加玻璃资源失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const resources = await db.select().from(glassResources).orderBy(glassResources.createdAt);

    return NextResponse.json({
      resources,
    }, { status: 200 });
  } catch (error) {
    console.error('获取玻璃资源失败:', error);
    return NextResponse.json(
      { error: '获取玻璃资源失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
