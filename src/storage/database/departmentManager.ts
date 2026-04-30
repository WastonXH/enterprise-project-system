import { eq, and, SQL } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  departments,
  insertDepartmentSchema,
  updateDepartmentSchema,
} from "./shared/schema"
import type { Department, InsertDepartment, UpdateDepartment } from "./shared/schema"
import * as schema from "./shared/schema"

export class DepartmentManager {
  /**
   * 创建部门
   */
  async createDepartment(data: InsertDepartment): Promise<Department> {
    const db = await getDb(schema)
    const validated = insertDepartmentSchema.parse(data)
    const [department] = await db.insert(departments).values(validated).returning()
    return department
  }

  /**
   * 获取部门列表
   */
  async getDepartments(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<Department, "id" | "name" | "code">>
  } = {}): Promise<Department[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(departments.id, filters.id))
    }
    if (filters.name !== undefined) {
      conditions.push(eq(departments.name, filters.name))
    }
    if (filters.code !== undefined) {
      conditions.push(eq(departments.code, filters.code))
    }

    return db.query.departments.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
    })
  }

  /**
   * 根据ID获取部门
   */
  async getDepartmentById(id: number): Promise<Department | null> {
    const db = await getDb(schema)
    const department = await db.query.departments.findFirst({
      where: eq(departments.id, id),
    })
    return department || null
  }

  /**
   * 更新部门
   */
  async updateDepartment(id: number, data: UpdateDepartment): Promise<Department | null> {
    const db = await getDb(schema)
    const validated = updateDepartmentSchema.parse(data)
    const [department] = await db
      .update(departments)
      .set(validated)
      .where(eq(departments.id, id))
      .returning()
    return department || null
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(departments).where(eq(departments.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const departmentManager = new DepartmentManager()
