import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { designSolutions } from '@/storage/database/shared/schema';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();

    const {
      projectId,
      glassModelId,
      icModelId,
      polarizerType,
      fpcType,
      fpcModel,
      backlightType,
      backlightModel,
      touchscreenType,
      resistiveType,
      resistiveModel,
      capacitiveTouchIC,
      capacitiveCoverMaterial,
      capacitiveTouchPoints,
      capacitiveSpecialApplication,
      productModel,
    } = body;

    const result = await db.insert(designSolutions).values({
      projectId: parseInt(projectId),
      glassModelId: glassModelId ? parseInt(glassModelId) : null,
      icModelId: icModelId ? parseInt(icModelId) : null,
      polarizerType: polarizerType || null,
      fpcType: fpcType || null,
      fpcModel: fpcModel || null,
      backlightType: backlightType || null,
      backlightModel: backlightModel || null,
      touchscreenType: touchscreenType || null,
      resistiveType: resistiveType || null,
      resistiveModel: resistiveModel || null,
      capacitiveTouchIC: capacitiveTouchIC || null,
      capacitiveCoverMaterial: capacitiveCoverMaterial || null,
      capacitiveTouchPoints: capacitiveTouchPoints || null,
      capacitiveSpecialApplication: capacitiveSpecialApplication || null,
      productModel: productModel || null,
    }).returning();

    return NextResponse.json({
      message: '设计方案保存成功',
      id: result[0].id,
      productModel: result[0].productModel,
    }, { status: 201 });
  } catch (error) {
    console.error('保存设计方案失败:', error);
    return NextResponse.json(
      { error: '保存设计方案失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const solutions = await db.select().from(designSolutions).orderBy(designSolutions.createdAt);

    return NextResponse.json({
      solutions,
    }, { status: 200 });
  } catch (error) {
    console.error('获取设计方案失败:', error);
    return NextResponse.json(
      { error: '获取设计方案失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
