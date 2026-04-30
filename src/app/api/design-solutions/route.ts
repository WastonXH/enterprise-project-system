import { NextRequest, NextResponse } from "next/server"
import { designSolutionManager, projectRequirementManager } from "@/storage/database"
import { insertDesignSolutionSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * POST /api/design-solutions
 * 创建设计方案
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = insertDesignSolutionSchema.parse(body)
    const solution = await designSolutionManager.createDesignSolution(validated)

    return NextResponse.json(
      {
        message: "设计方案创建成功",
        data: solution,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建设计方案失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建设计方案失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/design-solutions
 * 获取设计方案列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "100")
    const projectId = searchParams.get("projectId")
    const productModel = searchParams.get("productModel") || undefined

    const solutions = await designSolutionManager.getDesignSolutions({
      skip,
      limit,
      filters: {
        projectId: projectId ? parseInt(projectId) : undefined,
        productModel,
      },
    })

    return NextResponse.json({
      data: solutions,
      total: solutions.length,
    })
  } catch (error) {
    console.error("获取设计方案失败:", error)
    return NextResponse.json(
      { error: "获取设计方案失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
