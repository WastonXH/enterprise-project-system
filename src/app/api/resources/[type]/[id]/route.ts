import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { glassResources, icResources } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const db = await getDb();
    const { type, id } = await params;

    if (type === 'glass') {
      await db.delete(glassResources).where(eq(glassResources.id, parseInt(id)));
      return NextResponse.json({ message: '玻璃资源删除成功' }, { status: 200 });
    } else if (type === 'ic') {
      await db.delete(icResources).where(eq(icResources.id, parseInt(id)));
      return NextResponse.json({ message: 'IC资源删除成功' }, { status: 200 });
    } else {
      return NextResponse.json({ error: '无效的资源类型' }, { status: 400 });
    }
  } catch (error) {
    console.error('删除资源失败:', error);
    return NextResponse.json(
      { error: '删除资源失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
