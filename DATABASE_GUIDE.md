# 数据库功能说明

> **更新时间**：2025年3月11日  
> **版本**：v1.0

---

## 📋 概述

本项目已成功集成 PostgreSQL 数据库功能，支持四个部门的数据管理和协作。

### 技术栈
- **数据库**：PostgreSQL
- **ORM**：Drizzle ORM
- **验证**：Zod + drizzle-zod
- **API**：Next.js API Routes

---

## 🗄️ 数据库表结构

### 1. departments（部门表）
部门基础信息管理。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| name | varchar(50) | 部门名称（唯一） |
| code | varchar(20) | 部门代码（唯一） |
| description | text | 部门描述 |
| createdAt | timestamp | 创建时间 |

### 2. project_requirements（项目需求表）
业务部填写项目需求。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| businessGroup | varchar(100) | 业务组 |
| customerName | varchar(200) | 客户名称 |
| size | varchar(50) | 尺寸 |
| resolution | varchar(50) | 分辨率 |
| productApplication | text | 产品应用 |
| productCategory | varchar(50) | 产品类别 |
| projectLevel | varchar(50) | 项目等级 |
| basicInfo | text | 基本信息 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### 3. glass_resources（玻璃资源库表）
采购部管理玻璃资源。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| modelNumber | varchar(100) | 型号（唯一） |
| manufacturer | varchar(100) | 厂商 |
| specifications | text | 规格 |
| stockStatus | varchar(20) | 库存状态 |
| remarks | text | 备注 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### 4. ic_resources（IC资源库表）
采购部管理IC资源。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| modelNumber | varchar(100) | 型号（唯一） |
| manufacturer | varchar(100) | 厂商 |
| specifications | text | 规格 |
| stockStatus | varchar(20) | 库存状态 |
| remarks | text | 备注 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### 5. design_solutions（设计方案表）
研发部填写设计方案。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| projectId | integer | 项目ID |
| productModel | varchar(100) | 产品型号 |
| glassModelId | integer | 玻璃型号ID |
| icModelId | integer | IC型号ID |
| polarizerType | varchar(50) | 偏光片类型 |
| fpcType | varchar(20) | FPC类型 |
| fpcModel | varchar(100) | FPC型号 |
| backlightType | varchar(20) | 背光类型 |
| backlightModel | varchar(100) | 背光型号 |
| touchscreenType | varchar(20) | 触摸屏类型 |
| resistiveType | varchar(20) | 电阻屏类型 |
| resistiveModel | varchar(100) | 电阻屏型号 |
| capacitiveTouchIc | varchar(100) | 电容触控IC |
| capacitiveCoverMaterial | varchar(100) | 电容盖板材质 |
| capacitiveTouchPoints | integer | 触控点数 |
| capacitiveSpecialApplication | text | 特殊应用 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

### 6. quality_records（质量记录表）
质量部填写质量记录。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | serial | 主键 |
| designId | integer | 设计方案ID |
| productModel | varchar(100) | 产品型号 |
| trialProductionDate | timestamp | 试产日期 |
| productionBatch | varchar(50) | 生产批次 |
| qualityMetrics | text | 质量指标 |
| defectRate | numeric | 不良率 |
| testResults | text | 测试结果 |
| issues | text | 问题 |
| improvement | text | 改进措施 |
| inspector | varchar(100) | 检验员 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

---

## 🔌 API 接口

### 基础URL
```
http://localhost:5000/api
```

### 1. 项目需求 API

#### 创建项目需求
```http
POST /api/project-requirements
Content-Type: application/json

{
  "businessGroup": "业务一组",
  "customerName": "测试客户",
  "projectLevel": "S"
}
```

**响应示例**：
```json
{
  "message": "项目需求创建成功",
  "data": {
    "id": 15,
    "businessGroup": "业务一组",
    "customerName": "测试客户",
    "projectLevel": "S",
    "createdAt": "2026-03-11T08:20:36.760Z"
  }
}
```

#### 获取项目需求列表
```http
GET /api/project-requirements?skip=0&limit=100&customerName=测试
```

**查询参数**：
- `skip`: 跳过记录数（默认0）
- `limit`: 返回记录数（默认100）
- `customerName`: 客户名称（模糊搜索）
- `projectLevel`: 项目等级（精确匹配）
- `businessGroup`: 业务组（精确匹配）

#### 获取单个项目需求
```http
GET /api/project-requirements/:id
```

#### 更新项目需求
```http
PUT /api/project-requirements/:id
Content-Type: application/json

{
  "projectLevel": "A"
}
```

#### 删除项目需求
```http
DELETE /api/project-requirements/:id
```

---

### 2. 玻璃资源 API

#### 创建玻璃资源
```http
POST /api/resources/glass
Content-Type: application/json

{
  "modelNumber": "GLASS-001",
  "manufacturer": "测试厂商",
  "stockStatus": "有货"
}
```

#### 获取玻璃资源列表
```http
GET /api/resources/glass?modelNumber=GLASS&stockStatus=有货
```

**查询参数**：
- `modelNumber`: 型号（模糊搜索）
- `manufacturer`: 厂商（模糊搜索）
- `stockStatus`: 库存状态（精确匹配）

#### 获取/更新/删除单个资源
```http
GET /api/resources/glass/:id
PUT /api/resources/glass/:id
DELETE /api/resources/glass/:id
```

---

### 3. IC资源 API

与玻璃资源API结构相同，路径为 `/api/resources/ic`。

---

### 4. 设计方案 API

#### 创建设计方案
```http
POST /api/design-solutions
Content-Type: application/json

{
  "projectId": 14,
  "productModel": "MODEL-001",
  "polarizerType": "圆偏"
}
```

#### 获取设计方案列表
```http
GET /api/design-solutions?projectId=14
```

**查询参数**：
- `projectId`: 项目ID（精确匹配）
- `productModel`: 产品型号（模糊搜索）

---

### 5. 质量记录 API

#### 创建质量记录
```http
POST /api/quality-records
Content-Type: application/json

{
  "designId": 1,
  "productionBatch": "BATCH-001",
  "inspector": "张三"
}
```

**注意**：如果提供 `designId`，系统会自动关联 `productModel`。

#### 获取质量记录列表
```http
GET /api/quality-records?designId=1
```

**查询参数**：
- `designId`: 设计方案ID（精确匹配）
- `productModel`: 产品型号（模糊搜索）
- `inspector`: 检验员（模糊搜索）

---

## 📝 使用示例

### 示例1：完整的业务流程

```bash
# 1. 业务部创建项目需求
curl -X POST http://localhost:5000/api/project-requirements \
  -H "Content-Type: application/json" \
  -d '{
    "businessGroup": "华东业务一组",
    "customerName": "上海兴臬",
    "size": "15.6",
    "resolution": "1920x1080",
    "projectLevel": "A级"
  }'

# 返回：{"message":"项目需求创建成功","data":{"id":14,...}}

# 2. 研发部创建设计方案（关联项目ID）
curl -X POST http://localhost:5000/api/design-solutions \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 14,
    "productModel": "LCM-TFT-LCD-15.6-001-001",
    "glassModelId": 1,
    "icModelId": 1,
    "polarizerType": "广视角型"
  }'

# 返回：{"message":"设计方案创建成功","data":{"id":1,...}}

# 3. 质量部创建质量记录（关联设计方案ID）
curl -X POST http://localhost:5000/api/quality-records \
  -H "Content-Type: application/json" \
  -d '{
    "designId": 1,
    "productionBatch": "BATCH-2025-001",
    "inspector": "李四",
    "testResults": "所有测试通过"
  }'

# 返回：{"message":"质量记录创建成功","data":{"id":1,...}}
```

### 示例2：查询和过滤

```bash
# 查询客户名称包含"上海"的项目
curl "http://localhost:5000/api/project-requirements?customerName=上海"

# 查询项目等级为S级的所有项目
curl "http://localhost:5000/api/project-requirements?projectLevel=S"

# 查询库存状态为"充足"的玻璃资源
curl "http://localhost:5000/api/resources/glass?stockStatus=充足"

# 查询某个设计方案的所有质量记录
curl "http://localhost:5000/api/quality-records?designId=1"
```

---

## 🛠️ 开发指南

### 文件结构
```
src/storage/database/
├── shared/
│   └── schema.ts           # 表结构定义、Zod验证、类型导出
├── departmentManager.ts     # 部门管理
├── projectRequirementManager.ts  # 项目需求管理
├── glassResourceManager.ts  # 玻璃资源管理
├── icResourceManager.ts     # IC资源管理
├── designSolutionManager.ts # 设计方案管理
├── qualityRecordManager.ts  # 质量记录管理
└── index.ts                 # 统一导出
```

### 添加新字段

1. 修改 `schema.ts`，添加新字段
2. 更新对应的 `insertSchema` 和 `updateSchema`
3. 运行 `coze-coding-ai db upgrade` 同步到数据库

### 添加新表

1. 在 `schema.ts` 中定义新表
2. 创建对应的 Manager 文件
3. 在 `index.ts` 中导出
4. 创建对应的 API Routes
5. 运行 `coze-coding-ai db upgrade`

---

## ⚠️ 注意事项

### 1. 数据验证
所有API都使用Zod进行数据验证，无效数据会返回400错误：
```json
{
  "error": "数据验证失败",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["customerName"],
      "message": "Required"
    }
  ]
}
```

### 2. 时间格式
所有时间字段使用ISO 8601格式：
```
2026-03-11T08:20:36.760Z
```

### 3. 必填字段
以下字段为必填（创建时必须提供）：
- **项目需求**：businessGroup, customerName
- **玻璃资源**：modelNumber
- **IC资源**：modelNumber

### 4. 唯一约束
以下字段有唯一约束，重复插入会失败：
- departments.name
- departments.code
- glass_resources.model_number
- ic_resources.model_number

---

## 📚 相关文档

- [Drizzle ORM 文档](https://orm.drizzle.team/docs/overview)
- [Zod 文档](https://zod.dev/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**维护者**：Coze AI助手  
**最后更新**：2025年3月11日
