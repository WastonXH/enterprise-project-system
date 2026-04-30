import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  designSolutions,
  insertDesignSolutionSchema,
  updateDesignSolutionSchema,
} from "./shared/schema"
import type { DesignSolution, InsertDesignSolution, UpdateDesignSolution } from "./shared/schema"
import * as schema from "./shared/schema"

export class DesignSolutionManager {
  /**
   * 创建设计方案
   */
  async createDesignSolution(data: InsertDesignSolution): Promise<DesignSolution> {
    const db = await getDb(schema)
    const validated = insertDesignSolutionSchema.parse(data)
    const [solution] = await db.insert(designSolutions).values(validated).returning()
    return solution
  }

  /**
   * 获取设计方案列表
   */
  async getDesignSolutions(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<DesignSolution, "id" | "projectId" | "productModel">>
  } = {}): Promise<DesignSolution[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(designSolutions.id, filters.id))
    }
    if (filters.projectId !== undefined && filters.projectId !== null) {
      conditions.push(eq(designSolutions.projectId, filters.projectId))
    }
    if (filters.productModel !== undefined) {
      conditions.push(like(designSolutions.productModel, `%${filters.productModel}%`))
    }

    return db.query.designSolutions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (designSolutions, { desc }) => [desc(designSolutions.createdAt)],
    })
  }

  /**
   * 根据ID获取设计方案
   */
  async getDesignSolutionById(id: number): Promise<DesignSolution | null> {
    const db = await getDb(schema)
    const solution = await db.query.designSolutions.findFirst({
      where: eq(designSolutions.id, id),
    })
    return solution || null
  }

  /**
   * 根据项目ID获取设计方案
   */
  async getDesignSolutionByProjectId(projectId: number): Promise<DesignSolution | null> {
    const db = await getDb(schema)
    const solution = await db.query.designSolutions.findFirst({
      where: eq(designSolutions.projectId, projectId),
    })
    return solution || null
  }

  /**
   * 更新设计方案
   */
  async updateDesignSolution(id: number, data: UpdateDesignSolution): Promise<DesignSolution | null> {
    const db = await getDb(schema)
    const validated = updateDesignSolutionSchema.parse(data)
    const [solution] = await db
      .update(designSolutions)
      .set({
        ...validated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(designSolutions.id, id))
      .returning()
    return solution || null
  }

  /**
   * 删除设计方案
   */
  async deleteDesignSolution(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(designSolutions).where(eq(designSolutions.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const designSolutionManager = new DesignSolutionManager()
