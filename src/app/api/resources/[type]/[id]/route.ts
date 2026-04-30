import { NextRequest, NextResponse } from "next/server"
import { glassResourceManager, icResourceManager } from "@/storage/database"
import { updateGlassResourceSchema, updateICResourceSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * GET /api/resources/[type]/[id]
 * 根据ID获取资源详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const resourceId = parseInt(id)

    if (type === "glass") {
      const resource = await glassResourceManager.getGlassResourceById(resourceId)
      if (!resource) {
        return NextResponse.json({ error: "玻璃资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ data: resource })
    } else if (type === "ic") {
      const resource = await icResourceManager.getICResourceById(resourceId)
      if (!resource) {
        return NextResponse.json({ error: "IC资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ data: resource })
    } else {
      return NextResponse.json({ error: "无效的资源类型" }, { status: 400 })
    }
  } catch (error) {
    console.error("获取资源失败:", error)
    return NextResponse.json(
      { error: "获取资源失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/resources/[type]/[id]
 * 更新资源
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const resourceId = parseInt(id)
    const body = await request.json()

    if (type === "glass") {
      const validated = updateGlassResourceSchema.parse(body)
      const resource = await glassResourceManager.updateGlassResource(resourceId, validated)
      if (!resource) {
        return NextResponse.json({ error: "玻璃资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ message: "玻璃资源更新成功", data: resource })
    } else if (type === "ic") {
      const validated = updateICResourceSchema.parse(body)
      const resource = await icResourceManager.updateICResource(resourceId, validated)
      if (!resource) {
        return NextResponse.json({ error: "IC资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ message: "IC资源更新成功", data: resource })
    } else {
      return NextResponse.json({ error: "无效的资源类型" }, { status: 400 })
    }
  } catch (error) {
    console.error("更新资源失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新资源失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/resources/[type]/[id]
 * 删除资源
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const resourceId = parseInt(id)

    if (type === "glass") {
      const success = await glassResourceManager.deleteGlassResource(resourceId)
      if (!success) {
        return NextResponse.json({ error: "玻璃资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ message: "玻璃资源删除成功" })
    } else if (type === "ic") {
      const success = await icResourceManager.deleteICResource(resourceId)
      if (!success) {
        return NextResponse.json({ error: "IC资源不存在" }, { status: 404 })
      }
      return NextResponse.json({ message: "IC资源删除成功" })
    } else {
      return NextResponse.json({ error: "无效的资源类型" }, { status: 400 })
    }
  } catch (error) {
    console.error("删除资源失败:", error)
    return NextResponse.json(
      { error: "删除资源失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
