import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  icResources,
  insertICResourceSchema,
  updateICResourceSchema,
} from "./shared/schema"
import type { ICResource, InsertICResource, UpdateICResource } from "./shared/schema"
import * as schema from "./shared/schema"

export class ICResourceManager {
  /**
   * 创建IC资源
   */
  async createICResource(data: InsertICResource): Promise<ICResource> {
    const db = await getDb(schema)
    const validated = insertICResourceSchema.parse(data)
    const [resource] = await db.insert(icResources).values(validated).returning()
    return resource
  }

  /**
   * 获取IC资源列表
   */
  async getICResources(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<ICResource, "id" | "modelNumber" | "stockStatus">> & {
      manufacturer?: string
    }
  } = {}): Promise<ICResource[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(icResources.id, filters.id))
    }
    if (filters.modelNumber !== undefined) {
      conditions.push(like(icResources.modelNumber, `%${filters.modelNumber}%`))
    }
    if (filters.stockStatus !== undefined && filters.stockStatus !== null) {
      conditions.push(eq(icResources.stockStatus, filters.stockStatus))
    }
    if (filters.manufacturer !== undefined) {
      conditions.push(like(icResources.manufacturer, `%${filters.manufacturer}%`))
    }

    return db.query.icResources.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (icResources, { desc }) => [desc(icResources.createdAt)],
    })
  }

  /**
   * 根据ID获取IC资源
   */
  async getICResourceById(id: number): Promise<ICResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.icResources.findFirst({
      where: eq(icResources.id, id),
    })
    return resource || null
  }

  /**
   * 根据型号获取IC资源
   */
  async getICResourceByModelNumber(modelNumber: string): Promise<ICResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.icResources.findFirst({
      where: eq(icResources.modelNumber, modelNumber),
    })
    return resource || null
  }

  /**
   * 更新IC资源
   */
  async updateICResource(id: number, data: UpdateICResource): Promise<ICResource | null> {
    const db = await getDb(schema)
    const validated = updateICResourceSchema.parse(data)
    const [resource] = await db
      .update(icResources)
      .set({
        ...validated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(icResources.id, id))
      .returning()
    return resource || null
  }

  /**
   * 删除IC资源
   */
  async deleteICResource(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(icResources).where(eq(icResources.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const icResourceManager = new ICResourceManager()
