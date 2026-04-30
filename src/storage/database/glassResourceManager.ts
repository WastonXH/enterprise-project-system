import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  glassResources,
  insertGlassResourceSchema,
  updateGlassResourceSchema,
} from "./shared/schema"
import type { GlassResource, InsertGlassResource, UpdateGlassResource } from "./shared/schema"
import * as schema from "./shared/schema"

export class GlassResourceManager {
  /**
   * 创建玻璃资源
   */
  async createGlassResource(data: InsertGlassResource): Promise<GlassResource> {
    const db = await getDb(schema)
    const validated = insertGlassResourceSchema.parse(data)
    const [resource] = await db.insert(glassResources).values(validated).returning()
    return resource
  }

  /**
   * 获取玻璃资源列表
   */
  async getGlassResources(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<GlassResource, "id" | "modelNumber" | "stockStatus">> & {
      manufacturer?: string
    }
  } = {}): Promise<GlassResource[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(glassResources.id, filters.id))
    }
    if (filters.modelNumber !== undefined) {
      conditions.push(like(glassResources.modelNumber, `%${filters.modelNumber}%`))
    }
    if (filters.stockStatus !== undefined && filters.stockStatus !== null) {
      conditions.push(eq(glassResources.stockStatus, filters.stockStatus))
    }
    if (filters.manufacturer !== undefined) {
      conditions.push(like(glassResources.manufacturer, `%${filters.manufacturer}%`))
    }

    return db.query.glassResources.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (glassResources, { desc }) => [desc(glassResources.createdAt)],
    })
  }

  /**
   * 根据ID获取玻璃资源
   */
  async getGlassResourceById(id: number): Promise<GlassResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.glassResources.findFirst({
      where: eq(glassResources.id, id),
    })
    return resource || null
  }

  /**
   * 根据型号获取玻璃资源
   */
  async getGlassResourceByModelNumber(modelNumber: string): Promise<GlassResource | null> {
    const db = await getDb(schema)
    const resource = await db.query.glassResources.findFirst({
      where: eq(glassResources.modelNumber, modelNumber),
    })
    return resource || null
  }

  /**
   * 更新玻璃资源
   */
  async updateGlassResource(id: number, data: UpdateGlassResource): Promise<GlassResource | null> {
    const db = await getDb(schema)
    const validated = updateGlassResourceSchema.parse(data)
    const [resource] = await db
      .update(glassResources)
      .set({
        ...validated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(glassResources.id, id))
      .returning()
    return resource || null
  }

  /**
   * 删除玻璃资源
   */
  async deleteGlassResource(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(glassResources).where(eq(glassResources.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const glassResourceManager = new GlassResourceManager()
