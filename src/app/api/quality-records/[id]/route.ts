import { NextRequest, NextResponse } from "next/server"
import { qualityRecordManager } from "@/storage/database"
import { updateQualityRecordSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * GET /api/quality-records/[id]
 * 根据ID获取质量记录详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recordId = parseInt(id)
    const record = await qualityRecordManager.getQualityRecordById(recordId)

    if (!record) {
      return NextResponse.json({ error: "质量记录不存在" }, { status: 404 })
    }

    return NextResponse.json({ data: record })
  } catch (error) {
    console.error("获取质量记录失败:", error)
    return NextResponse.json(
      { error: "获取质量记录失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/quality-records/[id]
 * 更新质量记录
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recordId = parseInt(id)
    const body = await request.json()
    const validated = updateQualityRecordSchema.parse(body)

    const record = await qualityRecordManager.updateQualityRecord(recordId, validated)
    if (!record) {
      return NextResponse.json({ error: "质量记录不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "质量记录更新成功", data: record })
  } catch (error) {
    console.error("更新质量记录失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "更新质量记录失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/quality-records/[id]
 * 删除质量记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const recordId = parseInt(id)
    const success = await qualityRecordManager.deleteQualityRecord(recordId)

    if (!success) {
      return NextResponse.json({ error: "质量记录不存在" }, { status: 404 })
    }

    return NextResponse.json({ message: "质量记录删除成功" })
  } catch (error) {
    console.error("删除质量记录失败:", error)
    return NextResponse.json(
      { error: "删除质量记录失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
