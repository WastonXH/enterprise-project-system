import { pgTable, unique, serial, varchar, text, timestamp, integer, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

const { createInsertSchema } = createSchemaFactory({
  coerce: { date: true },
})

// ========== 部门表 ==========
export const departments = pgTable("departments", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	code: varchar({ length: 20 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("departments_name_unique").on(table.name),
	unique("departments_code_unique").on(table.code),
])

// ========== 项目需求表（业务部） ==========
export const projectRequirements = pgTable("project_requirements", {
	id: serial().primaryKey().notNull(),
	requirementId: varchar("requirement_id", { length: 20 }).unique(), // 需求编号，如 25-00001
	businessGroup: varchar("business_group", { length: 100 }).notNull(),
	customerName: varchar("customer_name", { length: 200 }).notNull(),
	size: varchar({ length: 50 }),
	resolution: varchar({ length: 50 }),
	productApplication: text("product_application"),
	productCategory: varchar("product_category", { length: 50 }),
	productStructure: varchar("product_structure", { length: 50 }), // 产品结构
	projectLevel: varchar("project_level", { length: 50 }),
	drawingRequirement: varchar("drawing_requirement", { length: 50 }), // 出图要求
	applicationCategory: varchar("application_category", { length: 50 }), // 应用类别
	brightness: varchar("brightness", { length: 50 }), // 亮度要求
	contrastRatio: varchar("contrast_ratio", { length: 50 }), // 对比度
	workTempLow: varchar("work_temp_low", { length: 20 }), // 工作温度低温
	workTempHigh: varchar("work_temp_high", { length: 20 }), // 工作温度高温
	storageTempLow: varchar("storage_temp_low", { length: 20 }), // 存储温度低温
	storageTempHigh: varchar("storage_temp_high", { length: 20 }), // 存储温度高温
	basicInfo: text("basic_info"),
	status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

// ========== 玻璃资源库表（采购部） ==========
export const glassResources = pgTable("glass_resources", {
	id: serial().primaryKey().notNull(),
	modelNumber: varchar("model_number", { length: 100 }).notNull(),
	manufacturer: varchar({ length: 100 }),
	specifications: text(),
	stockStatus: varchar("stock_status", { length: 20 }),
	remarks: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("glass_resources_model_number_unique").on(table.modelNumber),
])

// ========== IC资源库表（采购部） ==========
export const icResources = pgTable("ic_resources", {
	id: serial().primaryKey().notNull(),
	modelNumber: varchar("model_number", { length: 100 }).notNull(),
	manufacturer: varchar({ length: 100 }),
	specifications: text(),
	stockStatus: varchar("stock_status", { length: 20 }),
	remarks: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("ic_resources_model_number_unique").on(table.modelNumber),
])

// ========== 设计方案表（研发部） ==========
export const designSolutions = pgTable("design_solutions", {
	id: serial().primaryKey().notNull(),
	projectId: integer("project_id"),
	productModel: varchar("product_model", { length: 100 }),
	glassModelId: integer("glass_model_id"),
	icModelId: integer("ic_model_id"),
	polarizerType: varchar("polarizer_type", { length: 50 }),
	fpcType: varchar("fpc_type", { length: 20 }),
	fpcModel: varchar("fpc_model", { length: 100 }),
	backlightType: varchar("backlight_type", { length: 20 }),
	backlightModel: varchar("backlight_model", { length: 100 }),
	touchscreenType: varchar("touchscreen_type", { length: 20 }),
	resistiveType: varchar("resistive_type", { length: 20 }),
	resistiveModel: varchar("resistive_model", { length: 100 }),
	capacitiveTouchIc: varchar("capacitive_touch_ic", { length: 100 }),
	capacitiveCoverMaterial: varchar("capacitive_cover_material", { length: 100 }),
	capacitiveTouchPoints: integer("capacitive_touch_points"),
	capacitiveSurfaceTreatment: text("capacitive_surface_treatment"), // 盖板表面处理（多选，JSON数组）
	capacitiveSpecialApplication: text("capacitive_special_application"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

// ========== 质量记录表（质量部） ==========
export const qualityRecords = pgTable("quality_records", {
	id: serial().primaryKey().notNull(),
	designId: integer("design_id"),
	productModel: varchar("product_model", { length: 100 }),
	trialProductionDate: timestamp("trial_production_date", { withTimezone: true, mode: 'string' }),
	productionBatch: varchar("production_batch", { length: 50 }),
	qualityMetrics: text("quality_metrics"),
	defectRate: numeric("defect_rate"),
	testResults: text("test_results"),
	issues: text(),
	improvement: text(),
	inspector: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

// ========== 零部件申请表（采购部） ==========
export const componentRequests = pgTable("component_requests", {
	id: serial().primaryKey().notNull(),
	componentType: varchar("component_type", { length: 50 }).notNull(),
	componentName: varchar("component_name", { length: 200 }).notNull(),
	modelNumber: varchar("model_number", { length: 100 }),
	quantity: integer("quantity").notNull(),
	urgency: varchar("urgency", { length: 20 }).default("一般"),
	purpose: text("purpose"),
	remarks: text("remarks"),
	status: varchar("status", { length: 20 }).default("待处理"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

// ========== 零部件编码表（研发部） ==========
export const componentCodes = pgTable("component_codes", {
	id: serial().primaryKey().notNull(),
	componentCode: varchar("component_code", { length: 100 }).unique().notNull(), // 零部件编码
	componentType: varchar("component_type", { length: 50 }).notNull(), // 零部件类别
	componentName: varchar("component_name", { length: 200 }).notNull(), // 零部件名称
	materialName: varchar("material_name", { length: 200 }), // 物料名称
	specification: varchar("specification", { length: 200 }), // 规格/型号
	supplier: varchar("supplier", { length: 200 }), // 供应商
	manufacturer: varchar("manufacturer", { length: 100 }), // 厂商
	manufacturerCode: varchar("manufacturer_code", { length: 50 }), // 厂商代码
	serialNumber: varchar("serial_number", { length: 50 }), // 序号
	packageType: varchar("package_type", { length: 100 }), // 封装类型
	specDescription: text("spec_description"), // 规格说明
	status: varchar("status", { length: 20 }).default("active"), // 状态：active/inactive
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("component_codes_code_unique").on(table.componentCode),
])

// ========== Zod Schemas for Validation ==========

// 部门
export const insertDepartmentSchema = createInsertSchema(departments).pick({
	name: true,
	code: true,
	description: true,
})

export const updateDepartmentSchema = createInsertSchema(departments)
	.pick({
		name: true,
		code: true,
		description: true,
	})
	.partial()

// 项目需求
export const insertProjectRequirementSchema = createInsertSchema(projectRequirements).pick({
	requirementId: true,
	businessGroup: true,
	customerName: true,
	size: true,
	resolution: true,
	productApplication: true,
	productCategory: true,
	productStructure: true,
	projectLevel: true,
	drawingRequirement: true,
	applicationCategory: true,
	brightness: true,
	contrastRatio: true,
	workTempLow: true,
	workTempHigh: true,
	storageTempLow: true,
	storageTempHigh: true,
	basicInfo: true,
})

export const updateProjectRequirementSchema = createInsertSchema(projectRequirements)
	.pick({
		requirementId: true,
		businessGroup: true,
		customerName: true,
		size: true,
		resolution: true,
		productApplication: true,
		productCategory: true,
		productStructure: true,
		projectLevel: true,
		drawingRequirement: true,
		applicationCategory: true,
		brightness: true,
		contrastRatio: true,
		workTempLow: true,
		workTempHigh: true,
		storageTempLow: true,
		storageTempHigh: true,
		basicInfo: true,
		status: true,
	})
	.partial()

// 玻璃资源
export const insertGlassResourceSchema = createInsertSchema(glassResources).pick({
	modelNumber: true,
	manufacturer: true,
	specifications: true,
	stockStatus: true,
	remarks: true,
})

export const updateGlassResourceSchema = createInsertSchema(glassResources)
	.pick({
		modelNumber: true,
		manufacturer: true,
		specifications: true,
		stockStatus: true,
		remarks: true,
	})
	.partial()

// IC资源
export const insertICResourceSchema = createInsertSchema(icResources).pick({
	modelNumber: true,
	manufacturer: true,
	specifications: true,
	stockStatus: true,
	remarks: true,
})

export const updateICResourceSchema = createInsertSchema(icResources)
	.pick({
		modelNumber: true,
		manufacturer: true,
		specifications: true,
		stockStatus: true,
		remarks: true,
	})
	.partial()

// 设计方案
export const insertDesignSolutionSchema = createInsertSchema(designSolutions).pick({
	projectId: true,
	productModel: true,
	glassModelId: true,
	icModelId: true,
	polarizerType: true,
	fpcType: true,
	fpcModel: true,
	backlightType: true,
	backlightModel: true,
	touchscreenType: true,
	resistiveType: true,
	resistiveModel: true,
	capacitiveTouchIc: true,
	capacitiveCoverMaterial: true,
	capacitiveTouchPoints: true,
	capacitiveSurfaceTreatment: true,
	capacitiveSpecialApplication: true,
})

export const updateDesignSolutionSchema = createInsertSchema(designSolutions)
	.pick({
		projectId: true,
		productModel: true,
		glassModelId: true,
		icModelId: true,
		polarizerType: true,
		fpcType: true,
		fpcModel: true,
		backlightType: true,
		backlightModel: true,
		touchscreenType: true,
		resistiveType: true,
		resistiveModel: true,
		capacitiveTouchIc: true,
		capacitiveCoverMaterial: true,
		capacitiveTouchPoints: true,
		capacitiveSurfaceTreatment: true,
		capacitiveSpecialApplication: true,
	})
	.partial()

// 质量记录
export const insertQualityRecordSchema = createInsertSchema(qualityRecords).pick({
	designId: true,
	productModel: true,
	trialProductionDate: true,
	productionBatch: true,
	qualityMetrics: true,
	defectRate: true,
	testResults: true,
	issues: true,
	improvement: true,
	inspector: true,
})

export const updateQualityRecordSchema = createInsertSchema(qualityRecords)
	.pick({
		designId: true,
		productModel: true,
		trialProductionDate: true,
		productionBatch: true,
		qualityMetrics: true,
		defectRate: true,
		testResults: true,
		issues: true,
		improvement: true,
		inspector: true,
	})
	.partial()

// 零部件申请
export const insertComponentRequestSchema = createInsertSchema(componentRequests).pick({
	componentType: true,
	componentName: true,
	modelNumber: true,
	quantity: true,
	urgency: true,
	purpose: true,
	remarks: true,
})

export const updateComponentRequestSchema = createInsertSchema(componentRequests)
	.pick({
		componentType: true,
		componentName: true,
		modelNumber: true,
		quantity: true,
		urgency: true,
		purpose: true,
		remarks: true,
		status: true,
	})
	.partial()

// 零部件编码
export const insertComponentCodeSchema = createInsertSchema(componentCodes).pick({
	componentCode: true,
	componentType: true,
	componentName: true,
	materialName: true,
	specification: true,
	supplier: true,
	manufacturer: true,
	manufacturerCode: true,
	serialNumber: true,
	packageType: true,
	specDescription: true,
	status: true,
})

export const updateComponentCodeSchema = createInsertSchema(componentCodes)
	.pick({
		componentCode: true,
		componentType: true,
		componentName: true,
		materialName: true,
		specification: true,
		supplier: true,
		manufacturer: true,
		manufacturerCode: true,
		serialNumber: true,
		packageType: true,
		specDescription: true,
		status: true,
	})
	.partial()

// ========== TypeScript Types ==========
export type Department = typeof departments.$inferSelect
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>
export type UpdateDepartment = z.infer<typeof updateDepartmentSchema>

export type ProjectRequirement = typeof projectRequirements.$inferSelect
export type InsertProjectRequirement = z.infer<typeof insertProjectRequirementSchema>
export type UpdateProjectRequirement = z.infer<typeof updateProjectRequirementSchema>

export type GlassResource = typeof glassResources.$inferSelect
export type InsertGlassResource = z.infer<typeof insertGlassResourceSchema>
export type UpdateGlassResource = z.infer<typeof updateGlassResourceSchema>

export type ICResource = typeof icResources.$inferSelect
export type InsertICResource = z.infer<typeof insertICResourceSchema>
export type UpdateICResource = z.infer<typeof updateICResourceSchema>

export type DesignSolution = typeof designSolutions.$inferSelect
export type InsertDesignSolution = z.infer<typeof insertDesignSolutionSchema>
export type UpdateDesignSolution = z.infer<typeof updateDesignSolutionSchema>

export type QualityRecord = typeof qualityRecords.$inferSelect
export type InsertQualityRecord = z.infer<typeof insertQualityRecordSchema>
export type UpdateQualityRecord = z.infer<typeof updateQualityRecordSchema>

export type ComponentRequest = typeof componentRequests.$inferSelect
export type InsertComponentRequest = z.infer<typeof insertComponentRequestSchema>
export type UpdateComponentRequest = z.infer<typeof updateComponentRequestSchema>

export type ComponentCode = typeof componentCodes.$inferSelect
export type InsertComponentCode = z.infer<typeof insertComponentCodeSchema>
export type UpdateComponentCode = z.infer<typeof updateComponentCodeSchema>
