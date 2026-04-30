import { NextRequest, NextResponse } from "next/server"
import { projectRequirementManager } from "@/storage/database"
import { updateProjectRequirementSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * GET /api/project-requirements/[id]
 * 根据ID获取项目需求详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requirementId = parseInt(id)
    const requirement = await projectRequirementManager.getProjectRequirementById(requirementId)

    if (!requirement) {
      return NextResponse.json({ error: "项目需求不存在" }, { status: 404 })
    }

    return NextResponse.json({ data: requirement })
  } catch (error) {
    console.error("获取项目需求失败:", error)
    return NextResponse.json(
      { error: "获取项目需求失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/project-requirements/[id]
 * 更新项目需求
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requirementId = parseInt(id)
    const body = await request.json()
    const validated = updateProjectRequirementSchema.parse(body)

    const requirement = await projectRequirementManager.updateProjectRequirement(requirementId, validated)
    if (!requirement) {
      return NextResponse.json({ error: "项目需求不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "项目需求更新成功", data: requirement })
  } catch (error) {
    console.error("更新项目需求失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新项目需求失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/project-requirements/[id]
 * 删除项目需求
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const requirementId = parseInt(id)
    const success = await projectRequirementManager.deleteProjectRequirement(requirementId)

    if (!success) {
      return NextResponse.json({ error: "项目需求不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "项目需求删除成功" })
  } catch (error) {
    console.error("删除项目需求失败:", error)
    return NextResponse.json(
      { error: "删除项目需求失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
