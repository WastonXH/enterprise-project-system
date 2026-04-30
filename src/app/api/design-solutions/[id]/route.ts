import { NextRequest, NextResponse } from "next/server"
import { designSolutionManager } from "@/storage/database"
import { updateDesignSolutionSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * GET /api/design-solutions/[id]
 * 根据ID获取设计方案详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solutionId = parseInt(id)
    const solution = await designSolutionManager.getDesignSolutionById(solutionId)

    if (!solution) {
      return NextResponse.json({ error: "设计方案不存在" }, { status: 404 })
    }

    return NextResponse.json({ data: solution })
  } catch (error) {
    console.error("获取设计方案失败:", error)
    return NextResponse.json(
      { error: "获取设计方案失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/design-solutions/[id]
 * 更新设计方案
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solutionId = parseInt(id)
    const body = await request.json()
    const validated = updateDesignSolutionSchema.parse(body)

    const solution = await designSolutionManager.updateDesignSolution(solutionId, validated)
    if (!solution) {
      return NextResponse.json({ error: "设计方案不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "设计方案更新成功", data: solution })
  } catch (error) {
    console.error("更新设计方案失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新设计方案失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/design-solutions/[id]
 * 删除设计方案
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const solutionId = parseInt(id)
    const success = await designSolutionManager.deleteDesignSolution(solutionId)

    if (!success) {
      return NextResponse.json({ error: "设计方案不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "设计方案删除成功" })
  } catch (error) {
    console.error("删除设计方案失败:", error)
    return NextResponse.json(
      { error: "删除设计方案失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
