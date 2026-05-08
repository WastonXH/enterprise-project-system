// 导出所有 Manager 实例
export { departmentManager } from "./departmentManager"
export { projectRequirementManager } from "./projectRequirementManager"
export { glassResourceManager } from "./glassResourceManager"
export { pendingGlassResourceManager } from "./pendingResourceManager"
export { icResourceManager } from "./icResourceManager"
export { pendingIcResourceManager } from "./pendingResourceManager"
export { designSolutionManager } from "./designSolutionManager"
export { qualityRecordManager } from "./qualityRecordManager"
export { componentCodeManager } from "./componentCodeManager"

// 导出所有类型（统一从 schema 导出）
export * from "./shared/schema"
