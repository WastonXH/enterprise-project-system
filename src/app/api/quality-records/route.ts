import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { qualityRecords, designSolutions } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const db = await getDb();
    const body = await request.json();

    const {
      designId,
      trialProductionDate,
      productionBatch,
      qualityMetrics,
      defectRate,
      testResults,
      issues,
      improvement,
      inspector,
    } = body;

    // 获取产品型号
    const design = await db.select({ productModel: designSolutions.productModel })
      .from(designSolutions)
      .where(eq(designSolutions.id, parseInt(designId)))
      .limit(1);

    const result = await db.insert(qualityRecords).values({
      designId: parseInt(designId),
      productModel: design[0]?.productModel || null,
      trialProductionDate: trialProductionDate ? new Date(trialProductionDate) : null,
      productionBatch: productionBatch || null,
      qualityMetrics: qualityMetrics || null,
      defectRate: defectRate || null,
      testResults: testResults || null,
      issues: issues || null,
      improvement: improvement || null,
      inspector: inspector || null,
    }).returning();

    return NextResponse.json({
      message: '质量记录提交成功',
      id: result[0].id,
    }, { status: 201 });
  } catch (error) {
    console.error('提交质量记录失败:', error);
    return NextResponse.json(
      { error: '提交质量记录失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const records = await db.select().from(qualityRecords).orderBy(qualityRecords.createdAt);

    return NextResponse.json({
      records,
    }, { status: 200 });
  } catch (error) {
    console.error('获取质量记录失败:', error);
    return NextResponse.json(
      { error: '获取质量记录失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
