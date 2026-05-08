import { NextRequest, NextResponse } from 'next/server';
import { projectRequirementManager } from '@/storage/database';
import { designSolutionManager } from '@/storage/database';
import { glassResourceManager } from '@/storage/database';
import { icResourceManager } from '@/storage/database';
import { qualityRecordManager } from '@/storage/database';
import { componentCodeManager } from '@/storage/database';
import { pendingGlassResourceManager, pendingIcResourceManager } from '@/storage/database';

// GET - 获取诊断信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    // 获取各表数据量
    const [requirements, solutions, glassResources, icResources, qualityRecords, componentCodes] = await Promise.all([
      projectRequirementManager.getProjectRequirements({ limit: 1000 }),
      designSolutionManager.getDesignSolutions({ limit: 1000 }),
      glassResourceManager.getGlassResources({ limit: 1000 }),
      icResourceManager.getICResources({ limit: 1000 }),
      qualityRecordManager.getQualityRecords({ limit: 1000 }),
      componentCodeManager.getComponentCodes({ limit: 1000 }),
    ]);

    // 获取单个记录的详细信息
    if (action === 'getOne' && id && type) {
      let record = null;
      if (type === 'requirement') {
        record = await projectRequirementManager.getProjectRequirementById(parseInt(id));
      } else if (type === 'solution') {
        record = await designSolutionManager.getDesignSolutionById(parseInt(id));
      }
      return NextResponse.json({ success: true, data: record });
    }

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

    // 返回关联数据视图
    if (action === 'full' || action === 'relation') {
      // 构建关联视图：项目需求 + 对应设计方案
      const requirementMap = new Map<number, { id: number; solutions: unknown[] }>();
      requirements.forEach((req: { id: number }) => {
        requirementMap.set(req.id, {
          id: req.id,
          solutions: []
        });
      });
      
      // 将设计方案关联到对应的需求（使用 projectId 关联）
      solutions.forEach((sol: { projectId: number | null }) => {
        if (sol.projectId && requirementMap.has(sol.projectId)) {
          const entry = requirementMap.get(sol.projectId);
          if (entry) {
            entry.solutions.push(sol);
          }
        }
      });

      result.data = {
        projectRequirements: Array.from(requirementMap.values()),
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

// PUT - 更新单条数据
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数：type, id, data',
      }, { status: 400 });
    }

    let result = null;
    if (type === 'requirement') {
      result = await projectRequirementManager.updateProjectRequirement(parseInt(id), data);
    } else if (type === 'solution') {
      result = await designSolutionManager.updateDesignSolution(parseInt(id), data);
    } else if (type === 'quality') {
      result = await qualityRecordManager.updateQualityRecord(parseInt(id), data);
    } else {
      return NextResponse.json({
        success: false,
        message: `未知类型: ${type}`,
      }, { status: 400 });
    }

    if (!result) {
      return NextResponse.json({
        success: false,
        message: '记录不存在或更新失败',
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({
      success: false,
      message: '更新失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// DELETE - 清理数据库或删除单条数据
export async function DELETE(request: NextRequest) {
  try {
    let body: { table?: string; confirm?: boolean; type?: string; id?: number } = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: '无效的请求数据',
      }, { status: 400 });
    }
    const table = body.table;
    const confirm = body.confirm;
    const type = body.type;
    const id = body.id;

    // 单条数据删除
    if (type && id) {
      let success = false;
      const idStr = String(id);
      if (type === 'requirement') {
        success = await projectRequirementManager.deleteProjectRequirement(parseInt(idStr));
      } else if (type === 'solution') {
        success = await designSolutionManager.deleteDesignSolution(parseInt(idStr));
      } else if (type === 'glass') {
        success = await glassResourceManager.deleteGlassResource(parseInt(idStr));
      } else if (type === 'ic') {
        success = await icResourceManager.deleteICResource(parseInt(idStr));
      } else if (type === 'quality') {
        success = await qualityRecordManager.deleteQualityRecord(parseInt(idStr));
      } else if (type === 'component') {
        success = await componentCodeManager.deleteComponentCode(parseInt(idStr));
      } else {
        return NextResponse.json({
          success: false,
          message: `未知类型: ${type}`,
        }, { status: 400 });
      }

      return NextResponse.json({
        success,
        message: success ? '删除成功' : '删除失败，记录可能不存在',
      });
    }

    // 表数据清理
    if (!confirm) {
      return NextResponse.json({
        success: false,
        message: '请确认删除操作：{"table": "tableName", "confirm": true}',
      });
    }

    if (!table) {
      return NextResponse.json({
        success: false,
        message: '缺少 table 参数',
      }, { status: 400 });
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
      pendingGlassResources: {
        getAll: () => pendingGlassResourceManager.getPendingGlassResources({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => pendingGlassResourceManager.deletePendingGlassResource(id),
        name: 'pending_glass_resources'
      },
      pendingIcResources: {
        getAll: () => pendingIcResourceManager.getPendingIcResources({ limit: 1000 }) as Promise<{ id: number }[]>,
        delete: (id) => pendingIcResourceManager.deletePendingIcResource(id),
        name: 'pending_ic_resources'
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
      message: '操作失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
