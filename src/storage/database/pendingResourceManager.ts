import { eq, and, SQL, like, desc } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  pendingGlassResources,
  pendingIcResources,
} from "./shared/schema"
import type { PendingGlassResource, PendingIcResource } from "./shared/schema"
import * as schema from "./shared/schema"

// ========== 待审批玻璃资源管理器 ==========
export class PendingGlassResourceManager {
  /**
   * 创建待审批玻璃资源申请
   */
  async createPendingGlassResource(data: {
    modelNumber: string
    manufacturer?: string
    resolution?: string
    interfaceType?: string
    thickness?: string
    solutionId?: number
    productModel?: string
  }): Promise<PendingGlassResource> {
    const db = await getDb(schema)
    const [resource] = await db.insert(pendingGlassResources).values({
      modelNumber: data.modelNumber,
      manufacturer: data.manufacturer || null,
      resolution: data.resolution || null,
      interfaceType: data.interfaceType || null,
      thickness: data.thickness || null,
      solutionId: data.solutionId || null,
      productModel: data.productModel || null,
      status: "pending",
      submittedBy: "研发部",
    }).returning()
    return resource
  }

  /**
   * 获取待审批玻璃资源列表
   */
  async getPendingGlassResources(options: {
    skip?: number
    limit?: number
    status?: string
  } = {}): Promise<PendingGlassResource[]> {
    const { skip = 0, limit = 100, status } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (status) {
      conditions.push(eq(pendingGlassResources.status, status))
    }

    return db.query.pendingGlassResources.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: [desc(pendingGlassResources.createdAt)],
    })
  }

  /**
   * 根据ID获取待审批玻璃资源
   */
  async getPendingGlassResourceById(id: number): Promise<PendingGlassResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.pendingGlassResources.findFirst({
      where: eq(pendingGlassResources.id, id),
    })
    return resource || null
  }

  /**
   * 审批通过：将资源转入正式库
   */
  async approvePendingGlassResource(id: number, finalModelNumber: string, remarks?: string): Promise<{ pending: PendingGlassResource | null; approved: PendingGlassResource | null }> {
    const db = await getDb(schema)
    
    // 1. 更新待审批记录状态
    const [updated] = await db
      .update(pendingGlassResources)
      .set({
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "采购部",
        finalModelNumber,
        remarks: remarks || null,
      })
      .where(eq(pendingGlassResources.id, id))
      .returning()
    
    return { pending: updated || null, approved: updated || null }
  }

  /**
   * 审批拒绝
   */
  async rejectPendingGlassResource(id: number, remarks?: string): Promise<PendingGlassResource | null> {
    const db = await getDb(schema)
    const [resource] = await db
      .update(pendingGlassResources)
      .set({
        status: "rejected",
        approvedAt: new Date().toISOString(),
        approvedBy: "采购部",
        remarks: remarks || null,
      })
      .where(eq(pendingGlassResources.id, id))
      .returning()
    return resource || null
  }

  /**
   * 删除待审批记录
   */
  async deletePendingGlassResource(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(pendingGlassResources).where(eq(pendingGlassResources.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const pendingGlassResourceManager = new PendingGlassResourceManager()

// ========== 待审批IC资源管理器 ==========
export class PendingIcResourceManager {
  /**
   * 创建待审批IC资源申请
   */
  async createPendingIcResource(data: {
    modelNumber: string
    manufacturer?: string
    resolution?: string
    packageType?: string
    solutionId?: number
    productModel?: string
  }): Promise<PendingIcResource> {
    const db = await getDb(schema)
    const [resource] = await db.insert(pendingIcResources).values({
      modelNumber: data.modelNumber,
      manufacturer: data.manufacturer || null,
      resolution: data.resolution || null,
      packageType: data.packageType || null,
      solutionId: data.solutionId || null,
      productModel: data.productModel || null,
      status: "pending",
      submittedBy: "研发部",
    }).returning()
    return resource
  }

  /**
   * 获取待审批IC资源列表
   */
  async getPendingIcResources(options: {
    skip?: number
    limit?: number
    status?: string
  } = {}): Promise<PendingIcResource[]> {
    const { skip = 0, limit = 100, status } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (status) {
      conditions.push(eq(pendingIcResources.status, status))
    }

    return db.query.pendingIcResources.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: [desc(pendingIcResources.createdAt)],
    })
  }

  /**
   * 根据ID获取待审批IC资源
   */
  async getPendingIcResourceById(id: number): Promise<PendingIcResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.pendingIcResources.findFirst({
      where: eq(pendingIcResources.id, id),
    })
    return resource || null
  }

  /**
   * 审批通过：将资源转入正式库
   */
  async approvePendingIcResource(id: number, finalModelNumber: string, remarks?: string): Promise<{ pending: PendingIcResource | null; approved: PendingIcResource | null }> {
    const db = await getDb(schema)
    
    // 1. 更新待审批记录状态
    const [updated] = await db
      .update(pendingIcResources)
      .set({
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "采购部",
        finalModelNumber,
        remarks: remarks || null,
      })
      .where(eq(pendingIcResources.id, id))
      .returning()
    
    return { pending: updated || null, approved: updated || null }
  }

  /**
   * 审批拒绝
   */
  async rejectPendingIcResource(id: number, remarks?: string): Promise<PendingIcResource | null> {
    const db = await getDb(schema)
    const [resource] = await db
      .update(pendingIcResources)
      .set({
        status: "rejected",
        approvedAt: new Date().toISOString(),
        approvedBy: "采购部",
        remarks: remarks || null,
      })
      .where(eq(pendingIcResources.id, id))
      .returning()
    return resource || null
  }

  /**
   * 删除待审批记录
   */
  async deletePendingIcResource(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(pendingIcResources).where(eq(pendingIcResources.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const pendingIcResourceManager = new PendingIcResourceManager()
