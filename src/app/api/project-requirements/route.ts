import { NextRequest, NextResponse } from "next/server"
import { projectRequirementManager } from "@/storage/database"
import { insertProjectRequirementSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * POST /api/project-requirements
 * 创建项目需求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 调试：检查环境变量
    const dbUrl = process.env.PGDATABASE_URL
    if (!dbUrl) {
      return NextResponse.json(
        { error: "PGDATABASE_URL 环境变量未设置", step: "env_check" },
        { status: 500 }
      )
    }
    
    const validated = insertProjectRequirementSchema.parse(body)
    
    // 检查编号是否已存在
    if (validated.requirementId) {
      let existing
      try {
        existing = await projectRequirementManager.getProjectRequirements({
          limit: 1000
        })
      } catch (dbError) {
        console.error("查询已有需求失败:", dbError)
        return NextResponse.json(
          { 
            error: "查询已有需求失败", 
            step: "check_duplicate",
            details: dbError instanceof Error ? dbError.message : "未知错误"
          },
          { status: 500 }
        )
      }
      
      const duplicate = existing.find((r: { requirementId: string | null }) => 
        r.requirementId === validated.requirementId
      )
      if (duplicate) {
        return NextResponse.json(
          { error: `需求编号 ${validated.requirementId} 已存在，请使用其他编号` },
          { status: 400 }
        )
      }
    }
    
    let requirement
    try {
      requirement = await projectRequirementManager.createProjectRequirement(validated)
    } catch (dbError) {
      console.error("创建需求失败:", dbError)
      return NextResponse.json(
        { 
          error: "创建需求失败", 
          step: "create_requirement",
          details: dbError instanceof Error ? dbError.message : "未知错误",
          stack: dbError instanceof Error ? dbError.stack?.split('\n').slice(0, 3).join('\n') : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: "项目需求创建成功",
        data: requirement,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建项目需求失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建项目需求失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/project-requirements
 * 获取项目需求列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "100")
    const customerName = searchParams.get("customerName") || undefined
    const projectLevel = searchParams.get("projectLevel") || undefined
    const businessGroup = searchParams.get("businessGroup") || undefined

    // 调试：检查环境变量
    const dbUrl = process.env.PGDATABASE_URL
    if (!dbUrl) {
      return NextResponse.json(
        { error: "PGDATABASE_URL 环境变量未设置", step: "env_check" },
        { status: 500 }
      )
    }

    let requirements
    try {
      requirements = await projectRequirementManager.getProjectRequirements({
        skip,
        limit,
        filters: {
          customerName,
          projectLevel,
          businessGroup,
        },
      })
    } catch (dbError) {
      console.error("数据库操作失败:", dbError)
      return NextResponse.json(
        { 
          error: "数据库操作失败", 
          step: "db_operation",
          details: dbError instanceof Error ? dbError.message : "未知错误",
          stack: dbError instanceof Error ? dbError.stack?.split('\n').slice(0, 3).join('\n') : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: requirements,
      total: requirements.length,
    })
  } catch (error) {
    console.error("获取项目需求失败:", error)
    return NextResponse.json(
      { error: "获取项目需求失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
