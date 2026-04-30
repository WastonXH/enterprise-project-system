import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  componentCodes,
  insertComponentCodeSchema,
  updateComponentCodeSchema,
} from "./shared/schema"
import type { ComponentCode, InsertComponentCode, UpdateComponentCode } from "./shared/schema"
import * as schema from "./shared/schema"
import {
  COMPONENT_CATEGORIES,
  getCategoryByCode,
  convertSizeToCode,
  convertResolutionToCode,
  validateCodeFormat,
  getCategoryList,
} from "@/lib/component-codes-constants"

export class ComponentCodeManager {
  /**
   * 根据类别代码和规格尺寸生成下一个序号
   */
  async generateNextSequence(categoryCode: string, sizeCode: string): Promise<string> {
    const db = await getDb(schema)
    
    // 查询该类别+规格尺寸下的最大序号
    // 使用前缀匹配来查找所有以 categoryCode.sizeCode. 开头的编码
    const pattern = `${categoryCode}.${sizeCode}.%`
    
    const existingCodes = await db.query.componentCodes.findMany({
      where: and(
        like(componentCodes.componentCode, pattern)
      ),
    })
    
    let maxSeq = 0
    for (const code of existingCodes) {
      const parts = code.componentCode.split('.')
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10)
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq
        }
      }
    }
    
    // 返回下一个序号（三位数字）
    return String(maxSeq + 1).padStart(3, '0')
  }

  /**
   * 生成完整的零部件编码
   * @param categoryCode 类别代码（如 001）
   * @param sizeCode 规格尺寸代码（如 177）
   * @param customSequence 自定义序号（可选）
   */
  async generateComponentCode(
    categoryCode: string,
    sizeCode: string,
    customSequence?: string
  ): Promise<string> {
    const sequence = customSequence || await this.generateNextSequence(categoryCode, sizeCode)
    return `${categoryCode}.${sizeCode}.${sequence}`
  }

  /**
   * 根据类别获取B段格式说明
   */
  getBFieldDescription(categoryCode: string): string {
    const category = getCategoryByCode(categoryCode)
    if (!category) return '规格尺寸'
    return category.bFormat
  }

  /**
   * 获取类别列表
   */
  getCategoryList(): Array<{
    code: string
    name: string
    description: string
    bFormat: string
  }> {
    return getCategoryList()
  }

  /**
   * 转换尺寸为三位代码
   */
  convertSizeToCode(size: string): string {
    return convertSizeToCode(size)
  }

  /**
   * 转换分辨率为三位代码
   */
  convertResolutionToCode(resolution: string): string {
    return convertResolutionToCode(resolution)
  }

  /**
   * 验证编码格式
   */
  validateCodeFormat(code: string): boolean {
    return validateCodeFormat(code)
  }

  /**
   * 创建零部件编码
   */
  async createComponentCode(data: InsertComponentCode): Promise<ComponentCode> {
    const db = await getDb(schema)
    const validated = insertComponentCodeSchema.parse(data)
    const [code] = await db.insert(componentCodes).values(validated).returning()
    return code
  }

  /**
   * 批量创建零部件编码
   */
  async bulkCreateComponentCodes(data: InsertComponentCode[]): Promise<ComponentCode[]> {
    const db = await getDb(schema)
    const validated = data.map(item => insertComponentCodeSchema.parse(item))
    const codes = await db.insert(componentCodes).values(validated).returning()
    return codes
  }

  /**
   * 获取零部件编码列表
   */
  async getComponentCodes(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<ComponentCode, "id" | "componentCode" | "componentType" | "status">> & {
      componentName?: string
      manufacturer?: string
    }
  } = {}): Promise<ComponentCode[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(componentCodes.id, filters.id))
    }
    if (filters.componentCode !== undefined) {
      conditions.push(like(componentCodes.componentCode, `%${filters.componentCode}%`))
    }
    if (filters.componentType !== undefined && filters.componentType !== null) {
      conditions.push(eq(componentCodes.componentType, filters.componentType))
    }
    if (filters.status !== undefined && filters.status !== null) {
      conditions.push(eq(componentCodes.status, filters.status))
    }
    if (filters.componentName !== undefined) {
      conditions.push(like(componentCodes.componentName, `%${filters.componentName}%`))
    }
    if (filters.manufacturer !== undefined) {
      conditions.push(like(componentCodes.manufacturer, `%${filters.manufacturer}%`))
    }

    return db.query.componentCodes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (componentCodes, { desc }) => [desc(componentCodes.createdAt)],
    })
  }

  /**
   * 根据ID获取零部件编码
   */
  async getComponentCodeById(id: number): Promise<ComponentCode | null> {
    const db = await getDb(schema)
    const code = await db.query.componentCodes.findFirst({
      where: eq(componentCodes.id, id),
    })
    return code || null
  }

  /**
   * 根据编码获取零部件
   */
  async getComponentCodeByCode(componentCode: string): Promise<ComponentCode | null> {
    const db = await getDb(schema)
    const code = await db.query.componentCodes.findFirst({
      where: eq(componentCodes.componentCode, componentCode),
    })
    return code || null
  }

  /**
   * 检查零部件编码是否存在
   */
  async checkCodeExists(componentCode: string, excludeId?: number): Promise<boolean> {
    const db = await getDb(schema)
    const conditions: SQL[] = [eq(componentCodes.componentCode, componentCode)]
    
    if (excludeId !== undefined) {
      conditions.push(eq(componentCodes.id, excludeId))
    }

    const code = await db.query.componentCodes.findFirst({
      where: and(...conditions),
    })
    return code !== null
  }

  /**
   * 更新零部件编码
   */
  async updateComponentCode(id: number, data: UpdateComponentCode): Promise<ComponentCode | null> {
    const db = await getDb(schema)
    const validated = updateComponentCodeSchema.parse(data)
    const [code] = await db
      .update(componentCodes)
      .set({ ...validated, updatedAt: new Date().toISOString() })
      .where(eq(componentCodes.id, id))
      .returning()
    return code || null
  }

  /**
   * 删除零部件编码
   */
  async deleteComponentCode(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(componentCodes).where(eq(componentCodes.id, id))
    return true
  }

  /**
   * 获取零部件编码总数
   */
  async count(options: {
    filters?: Partial<Pick<ComponentCode, "componentType" | "status">>
  } = {}): Promise<number> {
    const { filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.componentType !== undefined && filters.componentType !== null) {
      conditions.push(eq(componentCodes.componentType, filters.componentType))
    }
    if (filters.status !== undefined && filters.status !== null) {
      conditions.push(eq(componentCodes.status, filters.status))
    }

    const codes = await db.query.componentCodes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
    })
    return codes.length
  }
}

export const componentCodeManager = new ComponentCodeManager()
