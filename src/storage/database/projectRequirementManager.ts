import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  projectRequirements,
  insertProjectRequirementSchema,
  updateProjectRequirementSchema,
} from "./shared/schema"
import type { ProjectRequirement, InsertProjectRequirement, UpdateProjectRequirement } from "./shared/schema"
import * as schema from "./shared/schema"

export class ProjectRequirementManager {
  /**
   * 创建项目需求
   */
  async createProjectRequirement(data: InsertProjectRequirement): Promise<ProjectRequirement> {
    const db = await getDb(schema)
    const validated = insertProjectRequirementSchema.parse(data)
    const [requirement] = await db.insert(projectRequirements).values(validated).returning()
    return requirement
  }

  /**
   * 获取项目需求列表
   */
  async getProjectRequirements(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<ProjectRequirement, "id" | "customerName" | "projectLevel">> & {
      businessGroup?: string
    }
  } = {}): Promise<ProjectRequirement[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(projectRequirements.id, filters.id))
    }
    if (filters.customerName !== undefined) {
      conditions.push(like(projectRequirements.customerName, `%${filters.customerName}%`))
    }
    if (filters.projectLevel !== undefined && filters.projectLevel !== null) {
      conditions.push(eq(projectRequirements.projectLevel, filters.projectLevel))
    }
    if (filters.businessGroup !== undefined) {
      conditions.push(eq(projectRequirements.businessGroup, filters.businessGroup))
    }

    return db.query.projectRequirements.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (projectRequirements, { desc }) => [desc(projectRequirements.createdAt)],
    })
  }

  /**
   * 根据ID获取项目需求
   */
  async getProjectRequirementById(id: number): Promise<ProjectRequirement | null> {
    const db = await getDb(schema)
    const requirement = await db.query.projectRequirements.findFirst({
      where: eq(projectRequirements.id, id),
    })
    return requirement || null
  }

  /**
   * 更新项目需求
   */
  async updateProjectRequirement(
    id: number,
    data: UpdateProjectRequirement
  ): Promise<ProjectRequirement | null> {
    const db = await getDb(schema)
    const validated = updateProjectRequirementSchema.parse(data)
    const [requirement] = await db
      .update(projectRequirements)
      .set({
        ...validated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projectRequirements.id, id))
      .returning()
    return requirement || null
  }

  /**
   * 删除项目需求
   */
  async deleteProjectRequirement(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(projectRequirements).where(eq(projectRequirements.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const projectRequirementManager = new ProjectRequirementManager()
