import { NextRequest, NextResponse } from "next/server"
import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import * as schema from "@/storage/database/shared/schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "init") {
      // 初始化示例数据
      const db = await getDb(schema)

      // 检查是否已有数据
      const existingData = await db.query.projectRequirements.findMany({
        limit: 1
      })

      if (existingData.length > 0) {
        return NextResponse.json({
          success: false,
          message: "数据库中已有数据，请先清理后再初始化"
        })
      }

      // 创建示例数据
      const sampleData = [
        {
          requirementId: "RFQ-26-0001",
          businessGroup: "华东业务组",
          customerName: "测试客户A",
          size: "7.0",
          resolution: "1024x600",
          productApplication: "车载显示屏",
          productCategory: "T",
          productStructure: "t_lcm",
          projectLevel: "A级",
          drawingRequirement: "3D图纸",
          applicationCategory: "vehicle",
          brightness: "500 cd/m²",
          contrastRatio: "800:1",
          workTempLow: "-20",
          workTempHigh: "70",
          storageTempLow: "-30",
          storageTempHigh: "80",
          workStabilityRequirement: "industrial",
          status: "pending"
        },
        {
          requirementId: "RFQ-26-0002",
          businessGroup: "华南业务组",
          customerName: "测试客户B",
          size: "10.1",
          resolution: "1280x800",
          productApplication: "工业平板电脑",
          productCategory: "R",
          productStructure: "t_lcm",
          projectLevel: "B级",
          drawingRequirement: "2D图纸",
          applicationCategory: "industrial",
          brightness: "400 cd/m²",
          contrastRatio: "1000:1",
          workTempLow: "-20",
          workTempHigh: "70",
          storageTempLow: "-30",
          storageTempHigh: "80",
          workStabilityRequirement: "industrial",
          status: "pending"
        }
      ]

      // 插入数据
      for (const data of sampleData) {
        await db.insert(schema.projectRequirements).values(data)
      }

      return NextResponse.json({
        success: true,
        message: "已添加 2 条示例数据",
        data: sampleData
      })
    }

    if (action === "createTables") {
      // 创建数据库表
      const db = await getDb(schema)
      
      try {
        // 尝试创建项目需求表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS project_requirements (
          id SERIAL PRIMARY KEY,
          requirement_id VARCHAR(50),
          business_group VARCHAR(100),
          customer_name VARCHAR(200),
          size VARCHAR(50),
          resolution VARCHAR(50),
          product_application TEXT,
          product_category VARCHAR(50),
          product_structure VARCHAR(50),
          project_level VARCHAR(50),
          drawing_requirement VARCHAR(100),
          application_category VARCHAR(50),
          other_application TEXT,
          potential_order_quantity VARCHAR(100),
          brightness VARCHAR(100),
          contrast_ratio VARCHAR(50),
          work_temp_low VARCHAR(20),
          work_temp_high VARCHAR(20),
          storage_temp_low VARCHAR(20),
          storage_temp_high VARCHAR(20),
          a_lcm_components TEXT,
          a_lcm_description TEXT,
          environmental_requirements TEXT,
          environmental_other TEXT,
          touch_technology VARCHAR(50),
          viewing_angle_technology VARCHAR(50),
          work_stability_requirement VARCHAR(50),
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        // 表可能已存在，忽略错误
        if (!e.message.includes("already exists")) {
          console.log("创建 project_requirements 表:", e.message)
        }
      }

      try {
        // 尝试创建设计方案表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS design_solutions (
          id SERIAL PRIMARY KEY,
          solution_id VARCHAR(50),
          requirement_id VARCHAR(50),
          solution_name VARCHAR(200),
          product_model VARCHAR(100),
          technical_specs TEXT,
          component_config TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        if (!e.message.includes("already exists")) {
          console.log("创建 design_solutions 表:", e.message)
        }
      }

      try {
        // 尝试创建玻璃资源表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS glass_resources (
          id SERIAL PRIMARY KEY,
          glass_id VARCHAR(50),
          glass_name VARCHAR(200),
          size VARCHAR(50),
          resolution VARCHAR(50),
          supplier VARCHAR(100),
          stock_quantity INTEGER DEFAULT 0,
          unit_price DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        if (!e.message.includes("already exists")) {
          console.log("创建 glass_resources 表:", e.message)
        }
      }

      try {
        // 尝试创建 IC 资源表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS ic_resources (
          id SERIAL PRIMARY KEY,
          ic_id VARCHAR(50),
          ic_name VARCHAR(200),
          resolution VARCHAR(50),
          supplier VARCHAR(100),
          stock_quantity INTEGER DEFAULT 0,
          unit_price DECIMAL(10,2),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        if (!e.message.includes("already exists")) {
          console.log("创建 ic_resources 表:", e.message)
        }
      }

      try {
        // 尝试创建质量记录表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS quality_records (
          id SERIAL PRIMARY KEY,
          record_id VARCHAR(50),
          requirement_id VARCHAR(50),
          inspection_date DATE,
          inspector VARCHAR(100),
          inspection_result VARCHAR(50),
          defect_count INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        if (!e.message.includes("already exists")) {
          console.log("创建 quality_records 表:", e.message)
        }
      }

      try {
        // 尝试创建零部件编码表
        await db.execute(SQL`CREATE TABLE IF NOT EXISTS component_codes (
          id SERIAL PRIMARY KEY,
          component_code VARCHAR(50) UNIQUE,
          component_type VARCHAR(50),
          component_name VARCHAR(200),
          material_name VARCHAR(200),
          specification VARCHAR(200),
          supplier VARCHAR(100),
          manufacturer VARCHAR(100),
          manufacturer_code VARCHAR(100),
          serial_number VARCHAR(50),
          package_type VARCHAR(50),
          spec_description TEXT,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`)
      } catch (e: any) {
        if (!e.message.includes("already exists")) {
          console.log("创建 component_codes 表:", e.message)
        }
      }

      return NextResponse.json({
        success: true,
        message: "数据库表创建完成"
      })
    }

    return NextResponse.json({
      success: false,
      message: "未知的操作类型"
    })
  } catch (error: any) {
    console.error("诊断 API 错误:", error)
    return NextResponse.json({
      success: false,
      message: error.message || "操作失败",
      error: error.toString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const db = await getDb(schema)

    if (action === "status") {
      // 获取数据库状态
      try {
        const projectRequirements = await db.query.projectRequirements.findMany()
        const designSolutions = await db.query.designSolutions.findMany()
        const glassResources = await db.query.glassResources.findMany()
        const icResources = await db.query.icResources.findMany()
        const qualityRecords = await db.query.qualityRecords.findMany()
        const componentCodes = await db.query.componentCodes.findMany()

        return NextResponse.json({
          success: true,
          data: {
            projectRequirements: projectRequirements.length,
            designSolutions: designSolutions.length,
            glassResources: glassResources.length,
            icResources: icResources.length,
            qualityRecords: qualityRecords.length,
            componentCodes: componentCodes.length
          }
        })
      } catch (e: any) {
        // 表可能不存在
        return NextResponse.json({
          success: false,
          message: "数据库表不存在，请先创建表",
          error: e.message,
          hint: "调用 POST /api/diagnosis with action=createTables 来创建表"
        }, { status: 400 })
      }
    }

    if (action === "list") {
      try {
        const projectRequirements = await db.query.projectRequirements.findMany({
          orderBy: (table: any, { desc }: any) => [desc(table.createdAt)]
        })

        return NextResponse.json({
          success: true,
          data: projectRequirements
        })
      } catch (e: any) {
        return NextResponse.json({
          success: false,
          message: "数据库表不存在",
          error: e.message
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "诊断 API 正常工作"
    })
  } catch (error: any) {
    console.error("诊断 API 错误:", error)
    return NextResponse.json({
      success: false,
      message: error.message || "获取数据失败",
      error: error.toString()
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { table, confirm } = body

    if (!confirm) {
      return NextResponse.json({
        success: false,
        message: "请确认删除操作"
      })
    }

    const db = await getDb(schema)

    // 定义可删除的表
    const tables: Record<string, any> = {
      projectRequirements: schema.projectRequirements,
      designSolutions: schema.designSolutions,
      glassResources: schema.glassResources,
      icResources: schema.icResources,
      qualityRecords: schema.qualityRecords,
      componentCodes: schema.componentCodes
    }

    if (table === "all") {
      // 删除所有表的数据
      for (const tableName of Object.keys(tables)) {
        try {
          await db.delete(tables[tableName])
        } catch (e: any) {
          console.log(`清空 ${tableName}:`, e.message)
        }
      }
      return NextResponse.json({
        success: true,
        message: "已清空所有数据表"
      })
    }

    if (tables[table]) {
      await db.delete(tables[table])
      return NextResponse.json({
        success: true,
        message: `已清空 ${table} 表`,
        table
      })
    }

    return NextResponse.json({
      success: false,
      message: `未知的表: ${table}`
    })
  } catch (error: any) {
    console.error("诊断 API 错误:", error)
    return NextResponse.json({
      success: false,
      message: error.message || "删除失败",
      error: error.toString()
    }, { status: 500 })
  }
}
