# 企业项目管理系统 - AGENTS.md

## 项目概览

企业内部多部门协作项目管理系统，支持业务、研发、采购和质量部门的完整工作流程。

- **当前版本**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **数据库**: PostgreSQL (Drizzle ORM)
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **样式**: Tailwind CSS 4

## 技术栈

### 前端
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui 组件库

### 后端
- Next.js API Routes
- PostgreSQL 数据库
- Drizzle ORM

### 部署
- **开发环境**: 端口 5000，支持热更新
- **生产环境**: Netlify (main 分支)，Cloudflare Pages (cloudflare 分支)

### 新增依赖
- xlsx: Excel 文件解析库

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── api/                  # API 路由
│   │   │   ├── project-requirements/  # 业务部项目需求 API
│   │   │   ├── design-solutions/      # 研发部设计方案 API
│   │   │   ├── glass-resources/       # 采购部玻璃资源 API
│   │   │   ├── quality-records/       # 质量部质量记录 API
│   │   │   ├── component-codes/       # 零部件编码管理 API
│   │   │   └── init-test-data/        # 初始化测试数据 API
│   │   ├── department/           # 各部门页面
│   │   │   ├── business/         # 业务部工作台
│   │   │   ├── rd/               # 研发部工作台
│   │   │   ├── purchasing/       # 采购部工作台
│   │   │   └── quality/          # 质量部工作台
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 首页
│   ├── components/
│   │   └── ui/                   # shadcn/ui 组件
│   └── storage/
│       └── database/             # 数据库相关
│           ├── shared/
│           │   ├── schema.ts     # 数据库 schema
│           │   └── relations.ts  # 表关系
│           ├── componentCodeManager.ts  # 零部件编码数据管理器
│           └── index.ts          # 数据库管理器
├── src/
│   └── lib/
│       └── component-codes-constants.ts  # 金蝶编码规则常量
├── public/                       # 静态资源
├── .coze                         # 项目配置
└── package.json                  # 依赖配置
```

## 数据库 Schema

### 主要数据表

1. **project_requirements** (业务部项目需求)
   - requirementId: 需求编号（格式：RFQ-YY-NNNN，如 RFQ-26-0001）
   - businessGroup: 业务组别
   - customerName: 客户名称
   - productCategory: 技术类别
   - productStructure: 产品结构
   - projectLevel: 项目等级
   - workTempLow/High: 工作温度
   - storageTempLow/High: 存储温度
   - 等...

2. **design_solutions** (研发部设计方案)
   - solutionId: 方案编号
   - requirementId: 关联的需求编号
   - 等...

3. **glass_resources** (采购部玻璃资源)
   - glassId: 玻璃编号
   - 等...

4. **quality_records** (质量部质量记录)
   - recordId: 质量记录编号
   - requirementId: 关联的需求编号
   - 等...

5. **component_codes** (零部件编码管理)
   - componentCode: 零部件编码（唯一，格式 XXX.XXX.XXX）
   - componentType: 零部件类别（如 LCD(玻璃)、IC等）
   - componentName: 零部件名称
   - materialName: 物料名称
   - specification: 规格型号
   - supplier: 供应商
   - manufacturer: 厂商
   - manufacturerCode: 厂商代码
   - serialNumber: 序号
   - packageType: 封装类型
   - specDescription: 规格说明
   - status: 状态（active/inactive）
   - createdAt/updatedAt: 创建/更新时间

## 核心功能

### 业务部工作台 (`/department/business`)

**功能**: 项目需求录入

**关键字段**:
- 业务组别、客户名称（必填）
- 技术类别、产品结构（必填）
- 项目等级（必填）
- 工作温度要求（二选一：工控/其它）
  - 工控：自动填充温度（工作温度 -20°C~70°C，存储温度 -30°C~80°C）
  - 其它：手动填写温度
- A-LCM 组件选择（当产品结构为 A-LCM 时显示）

**需求编号生成规则**:
- 格式：`RFQ-YY-NNNN`
- `YY`: 年份末两位（如 2026 年为 26）
- `NNNN`: 四位流水号（0001-9999）
- 示例：`RFQ-26-0001`, `RFQ-26-0002`

**工作温度要求逻辑**:
- 用户在表单中选择"工控标准"或"其它标准"（单选框）
- 选择"工控标准"时：
  - 自动填充工作温度：-20°C ~ 70°C
  - 自动填充存储温度：-30°C ~ 80°C
  - 温度输入框变为禁用状态
- 选择"其它标准"时：
  - 清空温度输入框
  - 温度输入框变为可用状态
  - 用户手动填写温度要求

### 研发部工作台 (`/department/rd`)

**功能**: 方案设计与产品型号生成

**关键功能**:
- 查看业务部提交的项目需求
- 创建设计方案
- 生成产品型号（基于项目等级和技术类别）

#### 零部件编码管理 (金蝶编码规则)

**位置**: 研发部工作台 - "零部件管理" Tab

**功能**: 零部件编码的增删改查及 Excel 批量导入

##### 编码规则（基于 RZW-WI-D-005 文档）

**编码格式**: `XXX.XXX.XXX`（类别代码.规格尺寸代码.序号）

**A段 - 类别代码**:
| 代码 | 类别名称 | B段说明 |
|------|----------|---------|
| 001 | LCD(玻璃) | 模组规格尺寸（如177表示1.77寸） |
| 002 | IC(集成电路) | LCD分辨率 |
| 003 | FPC(软性电路板) | 模组规格尺寸 |
| 004 | BL(背光) | 模组规格尺寸 |
| 005 | BZ(铁框) | 规格尺寸 |
| 006 | TP(触摸屏) | 规格尺寸 |
| 009 | COG | 规格尺寸 |
| 010 | FOG | 规格尺寸 |
| 011 | FPCBA(带元件) | 规格尺寸 |
| 012 | LCM(成品) | 规格尺寸 |
| 013 | 电子料 | 种类代码（电容、电阻等） |
| 014 | SST(胶纸) | 胶纸种类 |
| 015 | BT(托盘) | 规格尺寸 |
| 016 | PET(保护膜) | 规格尺寸 |
| 017 | UBZ(上铁框) | 模组规格尺寸 |
| 018 | DBZ(下铁框) | 模组规格尺寸 |
| 019 | POG | 模组规格尺寸 |
| 020 | 辅料 | 辅料种类 |
| 021 | PCB(空版) | 规格尺寸 |
| 022 | PCBA(贴件板) | 规格尺寸 |
| 023 | LCM+CTP(总成) | 规格尺寸 |

**B段 - 规格尺寸代码**:
- 尺寸类：去掉小数点，不足三位补零（如 1.77 → 177）
- 分辨率类：去掉"x"，不足三位补零（如 240x320 → 240320 前三位为 240）

**C段 - 序号**:
- 000-999，系统自动递增
- 同一类别+规格尺寸下的序号自动管理

**编码示例**:
- `001.177.001`: 1.77寸LCD玻璃，第1个型号
- `001.220.002`: 2.2寸LCD玻璃，第2个型号
- `002.176.001`: 176x220分辨率IC，第1个型号
- `004.177.003`: 1.77寸背光，第3个型号

##### 关键特性
- **编码生成方式**:
  - **自动生成（推荐）**: 选择类别和规格尺寸，系统自动生成完整编码和序号
  - **手动输入**: 支持手动输入符合格式的编码
- **编码预览**: 选择类别和尺寸后，实时预览将要生成的编码
- **序号管理**: 系统自动管理同一类别+规格下的序号，避免冲突
- **列表展示**: 分页展示所有零部件编码，支持按编码、类别、名称、厂商搜索
- **编辑/删除**: 支持单个零部件编码的编辑和删除
- **Excel 批量导入**: 
  - 支持 Excel 文件批量导入零部件编码
  - 自动识别中英文字段（编码/code、类别/category、名称/name、规格/specification、厂商/manufacturer、备注/remark）
  - 导入前可预览导入数据
  - 显示导入成功/失败数量
  - 失败时会显示详细错误信息

**Excel 文件格式要求**:
- 支持 `.xlsx` 和 `.xls` 格式
- 第一行为标题行，支持中英文字段：
  - 编码 / code
  - 类别 / category
  - 名称 / name
  - 规格 / specification
  - 厂商 / manufacturer
  - 备注 / remark
- 从第二行开始为数据行
- 编码字段不能重复

### 采购部工作台 (`/department/purchasing`)

**功能**: 玻璃资源管理

**关键功能**:
- 添加玻璃资源
- 查看资源列表
- 搜索资源

### 质量部工作台 (`/department/quality`)

**功能**: 质量记录管理

**关键功能**:
- 查看项目需求
- 创建质量记录
- 关联需求编号

## 开发规范

### 代码风格

- 使用 TypeScript 5 进行类型检查
- 使用 ESLint 进行代码检查
- 遵循 React Hooks 规范
- 使用 shadcn/ui 组件库

### 提交规范

使用 Conventional Commits 格式：
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构
- `docs`: 文档更新
- `test`: 测试相关

### 测试要求

- 修改代码前先运行类型检查：`pnpm ts-check`
- 修改代码前先运行 lint：`pnpm lint`
- 修改代码后必须测试相关功能

## 构建和运行

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器（支持热更新）
pnpm dev
# 或使用 coze 命令
coze dev

# 服务运行在 5000 端口
```

### 生产环境

```bash
# 构建项目
pnpm build

# 启动生产服务器
pnpm start
# 或使用 coze 命令
coze start
```

### 代码检查

```bash
# TypeScript 类型检查
pnpm ts-check

# ESLint 检查
pnpm lint
```

## 常见问题

### 1. 需求编号生成规则

需求编号格式为 `RFQ-YY-NNNN`，其中：
- `RFQ`: 固定前缀
- `YY`: 当前年份末两位
- `NNNN`: 四位流水号（0001-9999）

**注意**: 流水号存储在浏览器的 localStorage 中，刷新页面后会继续递增。

### 2. 工作温度要求

业务部表单中有一个"工作温度要求"字段，提供两个单选选项：
- **工控标准**: 自动填充工控标准温度（工作温度 -20°C~70°C，存储温度 -30°C~80°C）
- **其它标准**: 清空温度输入框，让用户手动填写

**实现方式**:
- 前端通过 `workStabilityRequirement` 字段控制
- 选择"工控标准"时，自动设置 `workTempLow`, `workTempHigh`, `storageTempLow`, `storageTempHigh` 字段
- 选择"其它标准"时，清空这些字段
- 温度值会被存储到数据库中，但工作温度要求的选择不会存储

### 3. A-LCM 组件选择

当产品结构选择"A-LCM"时，会显示一个多选框，让用户选择组合组件：
- 盖板玻璃、触摸屏（TP）、铁框、PCBA、背光、S-LCM、FOG、FOB、其它

### 4. 部门间数据串联

业务部提交的需求会生成一个唯一的 `requirementId`，其他部门通过这个 ID 关联数据：
- 研发部设计方案关联 `requirementId`
- 质量部质量记录关联 `requirementId`

## 部署策略

### 分支策略

- **main 分支**: 完整 Next.js 项目（含 API Routes 和数据库配置），用于 Netlify 部署
- **cloudflare 分支**: Next.js Static Export 模式（`output: 'export'`），用于 Cloudflare Pages 部署

### 部署流程

1. **Netlify 部署**:
   - 推送到 main 分支
   - Netlify 自动构建和部署
   - 部署成功后需手动点击 "Publish deploy" 发布到主域名

2. **Cloudflare Pages 部署**:
   - 推送到 cloudflare 分支
   - Cloudflare Pages 自动构建和部署
   - 仅支持静态页面功能（无数据库功能）

## 环境变量

项目使用以下环境变量（通过沙箱环境提供）：

- `COZE_WORKSPACE_PATH`: 项目工作目录
- `COZE_PROJECT_DOMAIN_DEFAULT`: 对外访问域名
- `DEPLOY_RUN_PORT`: 服务监听端口（5000）
- `COZE_PROJECT_ENV`: 环境标识（DEV 或 PROD）

### 数据库配置

**沙箱环境**：
- 使用系统预置的 PostgreSQL 数据库（Volces 云数据库）
- 数据库连接通过环境变量 `PGDATABASE_URL` 自动配置

**Netlify 部署**：
需要在 Netlify 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PGDATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:password@host:port/db?sslmode=require` |

**注意**：
- 沙箱环境使用 Volces 数据库，部署到 Netlify 时需配置自己的 Supabase 或其他 PostgreSQL 数据库
- 数据库表结构通过 `/api/diagnosis?action=init` 初始化或手动执行 SQL 创建

## 诊断管理页面

**位置**: `/diagnosis`

**功能**:
- 查看各表数据量统计
- 初始化示例数据
- 清理指定表或全部数据
- **需求-方案关联视图**：查看项目需求及其设计方案
- **单条数据编辑**：编辑项目需求或设计方案的字段
- **单条数据删除**：删除单个项目需求或设计方案

**API 接口**:
- `GET /api/diagnosis?action=relation`: 获取需求-方案关联视图
- `GET /api/diagnosis?action=getOne&type=requirement&id=1`: 获取单个记录
- `PUT /api/diagnosis`: 更新单条数据（需传 type, id, data）
- `DELETE /api/diagnosis`: 删除单条数据（需传 type, id）或清理表数据（需传 table, confirm）

## 已知问题

1. **ESLint 警告**:
   - 存在一些未使用的导入和变量警告
   - 部分文件使用 `any` 类型
   - 这些问题不影响功能，但需要逐步优化

2. **Next.js 工作区警告**:
   - Next.js 检测到多个 lockfiles
   - 可以通过配置 `outputFileTracingRoot` 来消除警告

## 更新日志

### 2026-05-07 (下午)

**诊断页面增强**：

1. **清空数据自动重置编号**：清空所有数据时自动清除 localStorage 中的需求编号，使编号从 RFQ-26-0001 重新开始
2. **需求管理 Tab**：将"初始化数据"改为"需求管理"，支持查看和删除需求
3. **删除需求功能**：删除需求时会一并删除关联的设计方案

### 2026-05-07 (新增功能)

**玻璃和IC自动补全功能**：

研发部工作台中玻璃型号和IC型号使用 Combobox 组件实现自动补全，支持从正式库和临时库中选择。

**功能特性**：
- 下拉选择：从正式采购库和临时申请库中选择已有物料
- 自动补全：输入时实时过滤匹配的选项
- 来源标识：选项显示来源（正式库/待审批库）
- 回车确认：输入新型号后按回车，提示是否加入资源库

**新增组件**：
- `src/components/ui/combobox.tsx`: Combobox 自动补全组件

**修改文件**：
- `src/app/department/rd/page.tsx`: 使用 Combobox 组件

### 2026-05-06 (新增功能)

**物料申请审批流程**：

研发部在设计方案中使用临时物料时，系统会将物料存入临时申请库。采购部可以在采购工作台查看待审批物料列表，对物料进行编码审批（批准/拒绝）。

**新增数据库表**：
- `pending_glass_resources`: 待审批玻璃资源
- `pending_ic_resources`: 待审批IC资源

**新增API**：
- `GET /api/pending-resources`: 获取待审批物料列表
- `POST /api/pending-resources`: 添加待审批物料
- `PUT /api/pending-resources`: 审批操作（approve/reject）

**业务流程**：
1. 研发部在方案设计时选择"手动输入"玻璃/IC型号并申请入库
2. 物料存入 `pending_*_resources` 表（status: pending）
3. 采购部登录采购工作台，查看"待审批物料" Tab
4. 采购人员审核后输入正式编码，点击"批准"或"拒绝"
5. 批准后物料自动转入正式采购库（`glass_resources` / `ic_resources`）

**修改文件**：
- `src/storage/database/shared/schema.ts`: 新增 PendingGlassResource/PendingIcResource 类型
- `src/storage/database/pendingResourceManager.ts`: 新建文件
- `src/app/api/pending-resources/route.ts`: 新建文件
- `src/app/department/rd/page.tsx`: 临时物料申请逻辑
- `src/app/department/purchasing/page.tsx`: 待审批物料 Tab

### 2026-05-06 (下午)

**Bug 修复与功能优化**:

**业务部**:
1. 修复需求编号预览时错误递增问题
   - 需求编号仅在确认提交成功后递增
   - 预览和返回修改不会导致编号浪费
2. 添加提交日期可修改功能
   - 在基础信息区域添加日期选择器
   - 支持补录历史数据
3. 修复打印需求表最后一页空白页问题

**研发部**:
1. FPC 型号自动命名逻辑
   - 选择"新开"时：自动按 `RFQ编号-FPC` 命名
   - 选择"共用"时：允许手动填写
2. 背光型号选项调整
   - "新开" → "新开模具"
   - 新增"共用模具微调名称"选项
3. 保存方案添加成功/失败 Toast 提示

**影响范围**:
- `src/app/department/business/page.tsx`
- `src/app/department/rd/page.tsx`

**测试结果**:
- TypeScript 类型检查通过
- 业务部页面正常运行
- 研发部页面正常运行

### 2026-05-06

**新增功能**: 诊断管理页面增强

**修改内容**:
1. 扩展 `/api/diagnosis` API：
   - 新增 `action=relation` 获取需求-方案关联视图
   - 新增 `action=getOne` 获取单个记录详情
   - 新增 PUT 方法支持单条数据编辑
   - 增强 DELETE 方法支持单条数据删除
2. 重构诊断页面 (`/diagnosis`)：
   - 添加 Tab 切换（数据状态 / 需求-方案关联视图）
   - 关联视图展示项目需求及其设计方案列表
   - 每条需求/方案支持"编辑"和"删除"操作
   - 编辑对话框支持编辑常用字段

**影响范围**:
- `src/app/api/diagnosis/route.ts`: 扩展 API 接口
- `src/app/diagnosis/page.tsx`: 重构诊断页面

**测试结果**:
- ✅ TypeScript 类型检查通过
- ✅ 服务运行正常（5000 端口）
- ✅ 关联视图 API 正常
- ✅ 单条数据编辑功能正常
- ✅ 单条数据删除功能正常

### 2026-04-22

**Bug 修复**: 研发部零部件管理页面运行时错误

**问题描述**:
- 页面加载时报错 "A <Select.Item /> must have a value prop that is not an empty string"
- 原因是"所有类别"筛选器的 SelectItem 使用了空字符串作为 value

**修复内容**:
- 将空字符串 value 改为 "all"
- 在 onValueChange 中处理 "all" 值映射回空字符串

**影响范围**:
- `src/app/department/rd/page.tsx`: 修复类别筛选 Select 组件

**测试结果**:
- ✅ TypeScript 类型检查通过
- ✅ Fast Refresh 成功完成（无错误）
- ✅ 服务运行正常（5000 端口）

### 2026-04-21

**新增功能**: 金蝶编码规则（RZW-WI-D-005）

**修改内容**:
1. 创建金蝶编码规则常量文件 `component-codes-constants.ts`，定义21类产品的编码规则
2. 更新 `componentCodeManager`，新增序号管理和编码自动生成功能
3. 更新 API 接口：
   - `GET /api/component-codes?action=categories`: 获取所有类别列表
   - `GET /api/component-codes?action=preview`: 预览将要生成的编码
   - `POST /api/component-codes`: 支持自动生成编码模式
4. 更新前端表单：
   - 添加编码生成模式选择（自动生成/手动输入）
   - 添加类别和规格尺寸选择器
   - 实时预览生成的编码
   - 自动管理序号递增
5. 更新数据库表 `component_codes`：创建表结构支持新编码规则
6. 增加字段"供应商"、"物料名称"；将"说明"改名为"规格说明"

**编码规则**:
- 格式：`XXX.XXX.XXX`（类别代码.规格尺寸代码.序号）
- 21个类别代码：001-LCD、002-IC、003-FPC、004-BL、005-BZ、006-TP、009-COG、010-FOG、011-FPCBA、012-LCM、013-电子料、014-胶纸、015-BT、016-PET、017-UBZ、018-DBZ、019-POG、020-辅料、021-PCB、022-PCBA、023-LCM+CTP

**影响范围**:
- `src/lib/component-codes-constants.ts`: 新建文件
- `src/storage/database/componentCodeManager.ts`: 更新序号管理和编码生成功能
- `src/app/api/component-codes/route.ts`: 新增 categories 和 preview 接口
- `src/app/department/rd/page.tsx`: 更新零部件管理表单
- `src/storage/database/shared/schema.ts`: 更新 componentCodes 表字段

**测试结果**:
- ✅ TypeScript 类型检查通过
- ✅ 服务运行正常（5000 端口）
- ✅ 类别列表 API 正常
- ✅ 编码预览 API 正常
- ✅ 编码自动生成和序号递增正常

### 2026-04-07

**新增功能**: 零部件编码管理模块

**修改内容**:
1. 新增零部件编码数据库表 `componentCodes`，支持零部件编码、类别、名称、规格、厂商等字段
2. 创建零部件编码数据管理器 `componentCodeManager`
3. 创建零部件编码 CRUD API 接口：
   - `GET/POST /api/component-codes`: 获取列表和创建单个零部件编码
   - `GET/PUT/DELETE /api/component-codes/[id]`: 获取、更新、删除单个零部件编码
   - `POST /api/component-codes/bulk-import`: 批量导入零部件编码
4. 在研发部工作台添加"零部件管理" Tab，实现完整的零部件编码管理界面
5. 实现 Excel 批量导入功能：
   - 使用 `xlsx` 库在前端解析 Excel 文件
   - 支持中英文字段映射
   - 支持导入前预览和错误提示

**影响范围**:
- `src/storage/database/shared/schema.ts`: 新增 componentCodes 表
- `src/storage/database/componentCodeManager.ts`: 新建文件
- `src/storage/database/index.ts`: 导出 componentCodeManager
- `src/app/api/component-codes/`: 新建 API 路由目录
- `src/app/department/rd/page.tsx`: 添加零部件管理功能
- `package.json`: 新增 xlsx 依赖

**测试结果**:
- ✅ TypeScript 类型检查通过
- ✅ 页面正常加载
- ✅ 服务运行正常（5000 端口）
- ✅ 零部件编码 CRUD 功能正常
- ✅ Excel 批量导入功能正常

**注意事项**:
- Excel 文件支持中英文字段，会自动映射
- 编码字段必须唯一，重复会导致导入失败
- 导入前会预览数据，用户确认后才真正导入

### 2026-04-07 (之前更新)

**修改内容**:
1. 更新需求编号生成规则：从 `年份-五位流水号` 改为 `RFQ-年份末两位-四位流水号`
2. 在业务部表单中添加工作温度要求字段（单选框：工控标准/其它标准）
3. 实现工控时自动填充温度标准的逻辑

**影响范围**:
- `src/app/department/business/page.tsx`

**测试结果**:
- ✅ TypeScript 类型检查通过
- ✅ 页面正常加载
- ✅ 服务运行正常（5000 端口）
