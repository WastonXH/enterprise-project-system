import { NextRequest, NextResponse } from 'next/server';
import { projectRequirementManager } from '@/storage/database';
import { designSolutionManager } from '@/storage/database';
import { glassResourceManager } from '@/storage/database';
import { icResourceManager } from '@/storage/database';
import { qualityRecordManager } from '@/storage/database';
import { componentCodeManager } from '@/storage/database';

// GET - 获取诊断信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // 获取各表数据量
    const [requirements, solutions, glassResources, icResources, qualityRecords, componentCodes] = await Promise.all([
      projectRequirementManager.getProjectRequirements({ limit: 1000 }),
      designSolutionManager.getDesignSolutions({ limit: 1000 }),
      glassResourceManager.getGlassResources({ limit: 1000 }),
      icResourceManager.getICResources({ limit: 1000 }),
      qualityRecordManager.getQualityRecords({ limit: 1000 }),
      componentCodeManager.getComponentCodes({ limit: 1000 }),
    ]);

    const result: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      dataCount: {
        projectRequirements: requirements.length,
        designSolutions: solutions.length,
        glassResources: glassResources.length,
        icResources: icResources.length,
        qualityRecords: qualityRecords.length,
        componentCodes: componentCodes.length,
      },
      database: 'connected',
    };

    if (action === 'full') {
      result.data = {
        projectRequirements: requirements,
        designSolutions: solutions,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Diagnosis error:', error);
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// POST - 初始化示例数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'init') {
      // 检查是否已有数据
      const existing = await projectRequirementManager.getProjectRequirements({ limit: 1 });
      if (existing.length > 0) {
        return NextResponse.json({
          success: false,
          message: '数据库中已有数据，请先清理后再初始化',
          dataCount: existing.length,
        });
      }

      // 创建示例数据
      const sampleData = [
        {
          requirementId: 'RFQ-26-0001',
          businessGroup: '华东业务组',
          customerName: '测试客户A',
          size: '7.0',
          resolution: '1024x600',
          productApplication: '车载显示屏',
          productCategory: 'T',
          productStructure: 't_lcm',
          projectLevel: 'A级',
          drawingRequirement: '3D图纸',
          applicationCategory: 'vehicle',
          brightness: '500 cd/m²',
          contrastRatio: '800:1',
          workTempLow: '-20',
          workTempHigh: '70',
          storageTempLow: '-30',
          storageTempHigh: '80',
          touchTechnology: '无',
          viewingAngleTechnology: 'IPS',
          environmentalRequirements: 'ROHS,REACH',
          potentialOrderQuantity: '5000/月',
        },
        {
          requirementId: 'RFQ-26-0002',
          businessGroup: '华南业务组',
          customerName: '测试客户B',
          size: '10.1',
          resolution: '1280x800',
          productApplication: '工业平板电脑',
          productCategory: 'F',
          productStructure: 'a_lcm',
          projectLevel: 'B级',
          drawingRequirement: '2D图纸',
          applicationCategory: 'industrial',
          brightness: '400 cd/m²',
          contrastRatio: '1000:1',
          workTempLow: '-10',
          workTempHigh: '60',
          storageTempLow: '-20',
          storageTempHigh: '70',
          touchTechnology: 'INCELL',
          viewingAngleTechnology: 'IPS',
          environmentalRequirements: 'ROHS',
          potentialOrderQuantity: '3000/月',
          aLcmComponents: '盖板玻璃,触摸屏,铁框',
        },
      ];

      const created = [];
      for (const data of sampleData) {
        const result = await projectRequirementManager.createProjectRequirement(data);
        created.push(result);
      }

      return NextResponse.json({
        success: true,
        message: `已添加 ${created.length} 条示例数据`,
        data: created,
      });
    }

    return NextResponse.json({
      success: false,
      message: '未知操作',
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({
      success: false,
      message: '初始化失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE - 清理数据库
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, confirm } = body;

    if (!confirm) {
      return NextResponse.json({
        success: false,
        message: '请确认删除操作：{"table": "all", "confirm": true}',
      });
    }

    const tables: Record<string, { 
      getAll: () => Promise<{ id: number }[]>, 
      delete: (id: number) => Promise<boolean>,
      name: string 
    }> = {
      projectRequirements: { 
        getAll: () => projectRequirementManager.getProjectRequirements({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => projectRequirementManager.deleteProjectRequirement(id),
        name: 'project_requirements' 
      },
      designSolutions: { 
        getAll: () => designSolutionManager.getDesignSolutions({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => designSolutionManager.deleteDesignSolution(id),
        name: 'design_solutions' 
      },
      glassResources: { 
        getAll: () => glassResourceManager.getGlassResources({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => glassResourceManager.deleteGlassResource(id),
        name: 'glass_resources' 
      },
      icResources: { 
        getAll: () => icResourceManager.getICResources({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => icResourceManager.deleteICResource(id),
        name: 'ic_resources' 
      },
      qualityRecords: { 
        getAll: () => qualityRecordManager.getQualityRecords({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => qualityRecordManager.deleteQualityRecord(id),
        name: 'quality_records' 
      },
      componentCodes: { 
        getAll: () => componentCodeManager.getComponentCodes({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => componentCodeManager.deleteComponentCode(id),
        name: 'component_codes' 
      },
    };

    if (table === 'all') {
      for (const key of Object.keys(tables)) {
        try {
          const all = await tables[key].getAll();
          for (const item of all) {
            await tables[key].delete(item.id);
          }
        } catch (e) {
          console.error(`Error deleting ${key}:`, e);
        }
      }
      return NextResponse.json({
        success: true,
        message: '所有数据已清理',
      });
    }

    if (tables[table]) {
      const all = await tables[table].getAll();
      for (const item of all) {
        await tables[table].delete(item.id);
      }
      return NextResponse.json({
        success: true,
        message: `${tables[table].name} 数据已清理`,
        table: table,
      });
    }

    return NextResponse.json({
      success: false,
      message: `未知表: ${table}`,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({
      success: false,
      message: '清理失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
