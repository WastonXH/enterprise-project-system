import { eq, and, SQL, like } from "drizzle-orm"
import { getDb } from "coze-coding-dev-sdk"
import {
  qualityRecords,
  insertQualityRecordSchema,
  updateQualityRecordSchema,
} from "./shared/schema"
import type { QualityRecord, InsertQualityRecord, UpdateQualityRecord } from "./shared/schema"
import * as schema from "./shared/schema"

export class QualityRecordManager {
  /**
   * 创建质量记录
   */
  async createQualityRecord(data: InsertQualityRecord): Promise<QualityRecord> {
    const db = await getDb(schema)
    const validated = insertQualityRecordSchema.parse(data)
    const [record] = await db.insert(qualityRecords).values(validated).returning()
    return record
  }

  /**
   * 获取质量记录列表
   */
  async getQualityRecords(options: {
    skip?: number
    limit?: number
    filters?: Partial<Pick<QualityRecord, "id" | "designId" | "productModel" | "inspector">>
  } = {}): Promise<QualityRecord[]> {
    const { skip = 0, limit = 100, filters = {} } = options
    const db = await getDb(schema)

    const conditions: SQL[] = []
    if (filters.id !== undefined) {
      conditions.push(eq(qualityRecords.id, filters.id))
    }
    if (filters.designId !== undefined && filters.designId !== null) {
      conditions.push(eq(qualityRecords.designId, filters.designId))
    }
    if (filters.productModel !== undefined) {
      conditions.push(like(qualityRecords.productModel, `%${filters.productModel}%`))
    }
    if (filters.inspector !== undefined) {
      conditions.push(like(qualityRecords.inspector, `%${filters.inspector}%`))
    }

    return db.query.qualityRecords.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset: skip,
      orderBy: (qualityRecords, { desc }) => [desc(qualityRecords.createdAt)],
    })
  }

  /**
   * 根据ID获取质量记录
   */
  async getQualityRecordById(id: number): Promise<QualityRecord | null> {
    const db = await getDb(schema)
    const record = await db.query.qualityRecords.findFirst({
      where: eq(qualityRecords.id, id),
    })
    return record || null
  }

  /**
   * 根据设计方案ID获取质量记录
   */
  async getQualityRecordByDesignId(designId: number): Promise<QualityRecord | null> {
    const db = await getDb(schema)
    const record = await db.query.qualityRecords.findFirst({
      where: eq(qualityRecords.designId, designId),
    })
    return record || null
  }

  /**
   * 更新质量记录
   */
  async updateQualityRecord(id: number, data: UpdateQualityRecord): Promise<QualityRecord | null> {
    const db = await getDb(schema)
    const validated = updateQualityRecordSchema.parse(data)
    const [record] = await db
      .update(qualityRecords)
      .set({
        ...validated,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(qualityRecords.id, id))
      .returning()
    return record || null
  }

  /**
   * 删除质量记录
   */
  async deleteQualityRecord(id: number): Promise<boolean> {
    const db = await getDb(schema)
    const result = await db.delete(qualityRecords).where(eq(qualityRecords.id, id))
    return (result.rowCount ?? 0) > 0
  }
}

export const qualityRecordManager = new QualityRecordManager()
