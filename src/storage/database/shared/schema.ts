import { pgTable, serial, text, timestamp, integer, varchar, numeric, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"

// 部门表
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 项目需求表 - 业务部填写
export const projectRequirements = pgTable('project_requirements', {
  id: serial('id').primaryKey(),
  businessGroup: varchar('business_group', { length: 100 }).notNull(),
  customerName: varchar('customer_name', { length: 200 }).notNull(),
  size: varchar('size', { length: 50 }),
  resolution: varchar('resolution', { length: 50 }),
  productApplication: text('product_application'),
  productCategory: varchar('product_category', { length: 50 }),
  projectLevel: varchar('project_level', { length: 50 }),
  basicInfo: text('basic_info'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 玻璃资源库表 - 采购部管理
export const glassResources = pgTable('glass_resources', {
  id: serial('id').primaryKey(),
  modelNumber: varchar('model_number', { length: 100 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 100 }),
  specifications: text('specifications'),
  stockStatus: varchar('stock_status', { length: 20 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// IC资源库表 - 采购部管理
export const icResources = pgTable('ic_resources', {
  id: serial('id').primaryKey(),
  modelNumber: varchar('model_number', { length: 100 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 100 }),
  specifications: text('specifications'),
  stockStatus: varchar('stock_status', { length: 20 }),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 设计方案表 - 研发部填写
export const designSolutions = pgTable('design_solutions', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id'),
  productModel: varchar('product_model', { length: 100 }),
  glassModelId: integer('glass_model_id'),
  icModelId: integer('ic_model_id'),
  polarizerType: varchar('polarizer_type', { length: 50 }),
  fpcType: varchar('fpc_type', { length: 20 }),
  fpcModel: varchar('fpc_model', { length: 100 }),
  backlightType: varchar('backlight_type', { length: 20 }),
  backlightModel: varchar('backlight_model', { length: 100 }),
  touchscreenType: varchar('touchscreen_type', { length: 20 }),
  resistiveType: varchar('resistive_type', { length: 20 }),
  resistiveModel: varchar('resistive_model', { length: 100 }),
  capacitiveTouchIC: varchar('capacitive_touch_ic', { length: 100 }),
  capacitiveCoverMaterial: varchar('capacitive_cover_material', { length: 100 }),
  capacitiveTouchPoints: integer('capacitive_touch_points'),
  capacitiveSpecialApplication: text('capacitive_special_application'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 质量记录表 - 质量部填写
export const qualityRecords = pgTable('quality_records', {
  id: serial('id').primaryKey(),
  designId: integer('design_id'),
  productModel: varchar('product_model', { length: 100 }),
  trialProductionDate: timestamp('trial_production_date'),
  productionBatch: varchar('production_batch', { length: 50 }),
  qualityMetrics: text('quality_metrics'),
  defectRate: numeric('defect_rate'),
  testResults: text('test_results'),
  issues: text('issues'),
  improvement: text('improvement'),
  inspector: varchar('inspector', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Zod schemas for validation
const { createInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

export const insertDepartmentSchema = createInsertSchema(departments)
export const insertProjectRequirementSchema = createInsertSchema(projectRequirements)
export const insertGlassResourceSchema = createInsertSchema(glassResources)
export const insertICResourceSchema = createInsertSchema(icResources)
export const insertDesignSolutionSchema = createInsertSchema(designSolutions)
export const insertQualityRecordSchema = createInsertSchema(qualityRecords)




