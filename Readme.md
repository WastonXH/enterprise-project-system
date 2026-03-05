# 企业项目管理系统

一个用于企业内部多部门协作的项目管理系统，支持业务、研发、采购和质量部门的工作流程。

## 功能模块

- **业务部**：项目需求录入、客户信息管理、产品规格定义
- **研发部**：设计方案配置、产品型号生成
- **采购部**：资源库管理、供应链信息维护
- **质量部**：试产质量记录、缺陷追踪

## 技术栈

- Next.js 14.2.5（静态导出）
- React 18
- TypeScript 5

## 部署说明

本项目适配 Cloudflare Pages 部署，使用静态导出模式。

### Cloudflare Pages 部署步骤

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages → Create application → Pages
3. 连接 GitHub 仓库
4. 配置构建设置：
   - Build command: `npm run build`
   - Build output directory: `out`
5. 添加环境变量：`NODE_VERSION = 18`
6. 点击 Deploy

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 项目结构

```
├── src/
│   └── app/
│       ├── page.tsx              # 首页
│       ├── layout.tsx            # 布局
│       ├── globals.css           # 全局样式
│       └── department/           # 部门页面
│           ├── business/         # 业务部
│           ├── rd/               # 研发部
│           ├── purchasing/       # 采购部
│           └── quality/          # 质量部
├── package.json
├── next.config.ts
└── tsconfig.json
```

## 许可证

MIT
