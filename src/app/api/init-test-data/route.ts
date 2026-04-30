import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import * as schema from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/init-test-data
 * 初始化测试数据（仅用于开发测试）
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDb(schema);
    const results = {
      projectRequirements: [] as any[],
      glassResources: [] as any[],
      icResources: [] as any[],
      designSolutions: [] as any[],
    };

    // 1. 创建测试项目需求
    const existingProjects = await db.query.projectRequirements.findMany();
    
    if (existingProjects.length === 0) {
      const [testProject] = await db
        .insert(schema.projectRequirements)
        .values({
          requirementId: '25-00001',
          businessGroup: '华东业务组',
          customerName: '深圳某某科技有限公司',
          size: '15.6',
          resolution: '1920×1080',
          productApplication: '工业显示设备',
          productCategory: 'tft_ips',
          productStructure: 'a_lcm',
          projectLevel: 'A级',
          drawingRequirement: '需要图纸',
          applicationCategory: '工业',
          brightness: '400',
          contrastRatio: '1000:1',
          workTempLow: '-20',
          workTempHigh: '70',
          storageTempLow: '-30',
          storageTempHigh: '80',
          basicInfo: '这是一个测试项目需求，用于验证系统功能',
          status: 'pending',
        })
        .returning();
      results.projectRequirements.push(testProject);
    }

    // 2. 创建测试玻璃资源
    const existingGlass = await db.query.glassResources.findMany();
    
    if (existingGlass.length === 0) {
      const glassData = [
        {
          modelNumber: 'LCM-G-156-BOE',
          manufacturer: '京东方',
          specifications: '15.6英寸 IPS 1920×1080',
          stockStatus: '充足',
        },
        {
          modelNumber: 'LCM-G-101-AUO',
          manufacturer: '友达光电',
          specifications: '10.1英寸 IPS 1280×800',
          stockStatus: '紧张',
        },
      ];

      const insertedGlass = await db
        .insert(schema.glassResources)
        .values(glassData)
        .returning();
      results.glassResources.push(...insertedGlass);
    }

    // 3. 创建测试IC资源
    const existingIC = await db.query.icResources.findMany();
    
    if (existingIC.length === 0) {
      const icData = [
        {
          modelNumber: 'ST7701SN',
          manufacturer: 'Sitronix',
          specifications: '支持720×1280分辨率，MIPI接口',
          stockStatus: '充足',
        },
        {
          modelNumber: 'NT35510',
          manufacturer: 'Novatek',
          specifications: '支持1080p分辨率，MIPI接口',
          stockStatus: '充足',
        },
      ];

      const insertedIC = await db
        .insert(schema.icResources)
        .values(icData)
        .returning();
      results.icResources.push(...insertedIC);
    }

    // 4. 创建测试设计方案（如果项目存在）
    const projects = await db.query.projectRequirements.findMany();
    const existingDesigns = await db.query.designSolutions.findMany();

    if (projects.length > 0 && existingDesigns.length === 0) {
      const [testDesign] = await db
        .insert(schema.designSolutions)
        .values({
          projectId: projects[0].id,
          productModel: 'LCM-IPS-156-BOE-ST77-001',
          polarizerType: '广视角型',
          fpcType: '共用型号',
          fpcModel: 'FPC-156-001',
          backlightType: '新开',
          backlightModel: 'BL-156-001',
          touchscreenType: 'capacitive',
          capacitiveTouchIc: 'GT911',
          capacitiveCoverMaterial: 'GG',
          capacitiveTouchPoints: 10,
          capacitiveSurfaceTreatment: JSON.stringify(['AG', 'AF']),
        })
        .returning();
      results.designSolutions.push(testDesign);
    }

    return NextResponse.json({
      success: true,
      message: '测试数据初始化完成',
      data: results,
      summary: {
        projectRequirements: results.projectRequirements.length,
        glassResources: results.glassResources.length,
        icResources: results.icResources.length,
        designSolutions: results.designSolutions.length,
      },
    });
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    return NextResponse.json(
      { success: false, error: '初始化测试数据失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

/**
 * GET /api/init-test-data
 * 检查测试数据状态
 */
export async function GET() {
  try {
    const db = await getDb(schema);

    const [projects, glass, ic, designs] = await Promise.all([
      db.query.projectRequirements.findMany(),
      db.query.glassResources.findMany(),
      db.query.icResources.findMany(),
      db.query.designSolutions.findMany(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        projectRequirements: projects.length,
        glassResources: glass.length,
        icResources: ic.length,
        designSolutions: designs.length,
        hasTestData: projects.length > 0 || glass.length > 0 || ic.length > 0,
      },
    });
  } catch (error) {
    console.error('获取测试数据状态失败:', error);
    return NextResponse.json(
      { success: false, error: '获取测试数据状态失败' },
      { status: 500 }
    );
  }
}
