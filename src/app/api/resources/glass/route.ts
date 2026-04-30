import { NextRequest, NextResponse } from "next/server"
import { glassResourceManager } from "@/storage/database"
import { insertGlassResourceSchema } from "@/storage/database/shared/schema"
import { z } from "zod"

/**
 * POST /api/resources/glass
 * 创建玻璃资源
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = insertGlassResourceSchema.parse(body)
    const resource = await glassResourceManager.createGlassResource(validated)

    return NextResponse.json(
      {
        message: "玻璃资源创建成功",
        data: resource,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建玻璃资源失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "数据验证失败", details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "创建玻璃资源失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/resources/glass
 * 获取玻璃资源列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "100")
    const modelNumber = searchParams.get("modelNumber") || undefined
    const manufacturer = searchParams.get("manufacturer") || undefined
    const stockStatus = searchParams.get("stockStatus") || undefined

    const resources = await glassResourceManager.getGlassResources({
      skip,
      limit,
      filters: {
        modelNumber,
        manufacturer,
        stockStatus,
      },
    })

    return NextResponse.json({
      data: resources,
      total: resources.length,
    })
  } catch (error) {
    console.error("获取玻璃资源失败:", error)
    return NextResponse.json(
      { error: "获取玻璃资源失败", details: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    )
  }
}
