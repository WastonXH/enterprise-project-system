import { NextRequest, NextResponse } from "next/server"
import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import * as schema from "@/storage/database/shared/schema"

/**
 * GET /api/diagnosis
 * 诊断数据库连接和数据状态
 */
export async function GET(request: NextRequest) {
  try {
    const db = await getDb(schema)
    
    // 检查各表数据量
    const projectRequirements = await db.query.projectRequirements.findMany()
    const designSolutions = await db.query.designSolutions.findMany()
    const glassResources = await db.query.glassResources.findMany()
    const icResources = await db.query.icResources.findMany()
    const componentCodes = await db.query.componentCodes?.findMany?.() || []
    
    // 检查数据库表是否存在
    const tableCheck = {
      projectRequirements: projectRequirements.length >= 0 ? 'OK' : 'ERROR',
      designSolutions: designSolutions.length >= 0 ? 'OK' : 'ERROR',
      glassResources: glassResources.length >= 0 ? 'OK' : 'ERROR',
      icResources: icResources.length >= 0 ? 'OK' : 'ERROR',
      componentCodes: Array.isArray(componentCodes) ? 'OK' : 'MISSING',
    }
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      tables: tableCheck,
      dataCount: {
        projectRequirements: projectRequirements.length,
        designSolutions: designSolutions.length,
        glassResources: glassResources.length,
        icResources: icResources.length,
        componentCodes: componentCodes.length,
      },
      sampleData: {
        projectRequirements: projectRequirements.slice(0, 3),
        designSolutions: designSolutions.slice(0, 3),
      },
    })
  } catch (error) {
    console.error('Diagnosis error:', error)
    return NextResponse.json({
      success: false,
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

/**
 * POST /api/diagnosis
 * 初始化示例数据
 */
export async function POST(request: NextRequest) {
  try {
    const db = await getDb(schema)
    const { action } = await request.json().catch(() => ({ action: 'init' }))
    
    if (action === 'init') {
      // 初始化示例数据
      const now = new Date()
      const year = now.getFullYear().toString().slice(-2)
      
      // 先删除非 RFQ 开头的旧数据
      const existingRequirements = await db.query.projectRequirements.findMany()
      for (const req of existingRequirements) {
        if (req.requirementId && !req.requirementId.startsWith('RFQ-')) {
          await db.delete(schema.projectRequirements).where(eq(schema.projectRequirements.id, req.id))
        }
      }
      
      // 只插入 RFQ 开头的示例数据
      const sampleRequirements = [
        {
          requirementId: `RFQ-${year}-0001`,
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
          basicInfo: '车载中控屏，需要高亮度',
          status: 'pending',
        },
        {
          requirementId: `RFQ-${year}-0002`,
          businessGroup: '华南业务组',
          customerName: '测试客户B',
          size: '10.1',
          resolution: '1920x1200',
          productApplication: '工业平板',
          productCategory: 'T',
          productStructure: 't_lcm',
          projectLevel: 'B级',
          drawingRequirement: '2D图纸',
          applicationCategory: 'industrial',
          brightness: '400 cd/m²',
          contrastRatio: '1000:1',
          workTempLow: '-20',
          workTempHigh: '70',
          storageTempLow: '-30',
          storageTempHigh: '80',
          basicInfo: '工业用途，需要宽温工作',
          status: 'pending',
        },
      ]
      
      // 插入示例数据
      const inserted = []
      for (const req of sampleRequirements) {
        const existing = await db.query.projectRequirements.findFirst({
          where: eq(schema.projectRequirements.requirementId, req.requirementId)
        })
        if (!existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await db.insert(schema.projectRequirements).values(req).returning()
          if (result && result.length > 0) {
            inserted.push(result[0])
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `已添加 ${inserted.length} 条示例数据`,
        data: inserted,
      })
    }
    
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * DELETE /api/diagnosis
 * 清理数据库（删除指定表的数据）
 */
export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb(schema)
    const { table, confirm } = await request.json().catch(() => ({ table: null, confirm: false }))
    
    if (!confirm) {
      return NextResponse.json({
        success: false,
        error: '请确认操作：设置 confirm: true',
        tables: ['projectRequirements', 'designSolutions', 'glassResources', 'icResources', 'componentCodes', 'all'],
      })
    }
    
    let deletedCount = 0
    
    if (table === 'all' || table === 'projectRequirements') {
      await db.delete(schema.projectRequirements)
      const result = await db.query.projectRequirements.findMany()
      deletedCount += result.length
    }
    
    if (table === 'all' || table === 'designSolutions') {
      await db.delete(schema.designSolutions)
      const result = await db.query.designSolutions.findMany()
      deletedCount += result.length
    }
    
    if (table === 'all' || table === 'glassResources') {
      await db.delete(schema.glassResources)
      const result = await db.query.glassResources.findMany()
      deletedCount += result.length
    }
    
    if (table === 'all' || table === 'icResources') {
      await db.delete(schema.icResources)
      const result = await db.query.icResources.findMany()
      deletedCount += result.length
    }
    
    if (table === 'all' || table === 'componentCodes') {
      await db.delete(schema.componentCodes)
      const result = await db.query.componentCodes?.findMany?.()
      deletedCount += result?.length || 0
    }
    
    return NextResponse.json({
      success: true,
      message: `数据库清理完成`,
      table: table,
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * PUT /api/diagnosis
 * 修改数据编号
 */
export async function PUT(request: NextRequest) {
  try {
    const db = await getDb(schema)
    const { action, data } = await request.json().catch(() => ({ action: null, data: null }))
    
    if (action === 'updateRequirementId') {
      const { id, newRequirementId } = data || {}
      if (!id || !newRequirementId) {
        return NextResponse.json({ success: false, error: '缺少 id 或 newRequirementId' }, { status: 400 })
      }
      
      await db.update(schema.projectRequirements)
        .set({ requirementId: newRequirementId })
        .where(eq(schema.projectRequirements.id, id))
      
      return NextResponse.json({
        success: true,
        message: `已将 ID ${id} 的编号更新为 ${newRequirementId}`,
      })
    }
    
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
