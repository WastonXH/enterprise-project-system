import { NextRequest, NextResponse } from "next/server"
import { pendingGlassResourceManager, pendingIcResourceManager, glassResourceManager, icResourceManager } from "@/storage/database"

/**
 * GET /api/pending-resources
 * 获取待审批资源列表
 * Query: type=glass|ic, status=pending|approved|rejected (可选)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "glass"
    const status = searchParams.get("status") || undefined

    if (type === "glass") {
      const resources = await pendingGlassResourceManager.getPendingGlassResources({ status })
      // 添加 type 属性
      const dataWithType = resources.map(r => ({ ...r, type: 'glass' as const }))
      return NextResponse.json({ success: true, data: dataWithType })
    } else {
      const resources = await pendingIcResourceManager.getPendingIcResources({ status })
      // 添加 type 属性
      const dataWithType = resources.map(r => ({ ...r, type: 'ic' as const }))
      return NextResponse.json({ success: true, data: dataWithType })
    }
  } catch (error) {
    console.error("获取待审批资源失败:", error)
    return NextResponse.json({ success: false, error: "获取失败" }, { status: 500 })
  }
}

/**
 * POST /api/pending-resources
 * 创建待审批资源申请
 * Body: { type: "glass"|"ic", modelNumber, manufacturer?, resolution?, solutionId?, productModel? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, modelNumber, manufacturer, resolution, interfaceType, thickness, packageType, solutionId, productModel } = body

    if (!type || !modelNumber) {
      return NextResponse.json({ success: false, error: "缺少必要参数" }, { status: 400 })
    }

    let resource
    if (type === "glass") {
      resource = await pendingGlassResourceManager.createPendingGlassResource({
        modelNumber,
        manufacturer,
        resolution,
        interfaceType,
        thickness,
        solutionId,
        productModel,
      })
    } else {
      resource = await pendingIcResourceManager.createPendingIcResource({
        modelNumber,
        manufacturer,
        resolution,
        packageType,
        solutionId,
        productModel,
      })
    }

    return NextResponse.json({ success: true, data: resource })
  } catch (error) {
    console.error("创建待审批资源失败:", error)
    return NextResponse.json({ success: false, error: "创建失败" }, { status: 500 })
  }
}

/**
 * PUT /api/pending-resources
 * 审批操作：批准或拒绝
 * Body: { type: "glass"|"ic", action: "approve"|"reject", id, finalModelNumber?, remarks? }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, id, finalModelNumber, remarks } = body

    if (!type || !action || !id) {
      return NextResponse.json({ success: false, error: "缺少必要参数" }, { status: 400 })
    }

    let result
    if (action === "approve") {
      if (!finalModelNumber) {
        return NextResponse.json({ success: false, error: "批准时需要提供正式型号编码" }, { status: 400 })
      }

      if (type === "glass") {
        // 1. 将资源转入正式库
        await glassResourceManager.createGlassResource({
          modelNumber: finalModelNumber,
          manufacturer: undefined,
          stockStatus: "active",
        })
        // 2. 更新待审批记录状态
        result = await pendingGlassResourceManager.approvePendingGlassResource(id, finalModelNumber, remarks)
      } else {
        // 1. 将资源转入正式库
        await icResourceManager.createICResource({
          modelNumber: finalModelNumber,
          manufacturer: undefined,
          stockStatus: "active",
        })
        // 2. 更新待审批记录状态
        result = await pendingIcResourceManager.approvePendingIcResource(id, finalModelNumber, remarks)
      }
    } else if (action === "reject") {
      if (type === "glass") {
        result = await pendingGlassResourceManager.rejectPendingGlassResource(id, remarks)
      } else {
        result = await pendingIcResourceManager.rejectPendingIcResource(id, remarks)
      }
    } else {
      return NextResponse.json({ success: false, error: "无效的操作类型" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("审批操作失败:", error)
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 })
  }
}

/**
 * DELETE /api/pending-resources
 * 删除待审批资源记录
 * Body: { type: "glass"|"ic", id }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, id } = body

    if (!type || !id) {
      return NextResponse.json({ success: false, error: "缺少必要参数" }, { status: 400 })
    }

    let deleted
    if (type === "glass") {
      deleted = await pendingGlassResourceManager.deletePendingGlassResource(id)
    } else {
      deleted = await pendingIcResourceManager.deletePendingIcResource(id)
    }

    return NextResponse.json({ success: deleted, message: deleted ? "删除成功" : "删除失败" })
  } catch (error) {
    console.error("删除待审批资源失败:", error)
    return NextResponse.json({ success: false, error: "删除失败" }, { status: 500 })
  }
}
