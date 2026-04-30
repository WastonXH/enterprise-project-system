import { NextRequest, NextResponse } from "next/server"
import { qualityRecordManager, designSolutionManager } from "@/storage/database"
import { insertQualityRecordSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * POST /api/quality-records
 * 创建质量记录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 如果提供了designId，自动获取productModel
    if (body.designId && !body.productModel) {
      const design = await designSolutionManager.getDesignSolutionById(parseInt(body.designId))
      if (design) {
        body.productModel = design.productModel
      }
    }
    
    const validated = insertQualityRecordSchema.parse(body)
    const record = await qualityRecordManager.createQualityRecord(validated)

    return NextResponse.json(
      {
        message: "质量记录创建成功",
        data: record,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建质量记录失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建质量记录失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quality-records
 * 获取质量记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "100")
    const designId = searchParams.get("designId")
    const productModel = searchParams.get("productModel") || undefined
    const inspector = searchParams.get("inspector") || undefined

    const records = await qualityRecordManager.getQualityRecords({
      skip,
      limit,
      filters: {
        designId: designId ? parseInt(designId) : undefined,
        productModel,
        inspector,
      },
    })

    return NextResponse.json({
      data: records,
      total: records.length,
    })
  } catch (error) {
    console.error("获取质量记录失败:", error)
    return NextResponse.json(
      { error: "获取质量记录失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
