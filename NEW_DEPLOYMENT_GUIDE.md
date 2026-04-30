# 企业项目管理系统 - 新手部署指南

## 🎯 您的情况
- 您是网络编程小白
- 您想在网上查看网站效果
- 您有 GitHub 账号：https://github.com/WastonXH

## 🌐 当前问题

网站目前运行在**远程服务器**（Coze 沙箱环境）中，不在您的本地电脑。要从您的浏览器访问，有几种方案：

---

## 方案对比

| 方案 | 难度 | 是否免费 | 适合人群 |
|------|------|---------|---------|
| **方案1：Vercel 部署** | ⭐⭐ | ✅ 是 | 想要公开访问 |
| **方案2：本地运行** | ⭐⭐⭐ | ✅ 是 | 想在自己电脑上运行 |
| **方案3：图片预览** | ⭐ | ✅ 是 | 只想看界面效果 |

---

## 📸 方案3：图片预览（最简单，推荐先看这个）

如果您只是想看网站的**外观和功能**，我可以为您生成几张截图，展示：
- 首页（部门选择）
- 业务部页面
- 采购部页面
- 研发部页面
- 质量部页面

**优点**：无需任何配置，立即看到效果
**缺点**：无法实际操作功能

---

## 🚀 方案1：部署到 Vercel（推荐）

### 步骤1：在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 仓库名称：输入 `enterprise-project-system`
3. 选择 "Public" 或 "Private" 都可以
4. 点击 "Create repository"

### 步骤2：推送代码

创建仓库后，GitHub 会显示命令，复制执行：

```bash
# 在项目目录执行
cd /workspace/projects

# 添加远程仓库
git remote add origin https://github.com/WastonXH/enterprise-project-system.git

# 推送代码
git branch -M main
git push -u origin main
```

**注意**：如果推送时要求输入用户名和密码：
- 用户名：WastonXH
- 密码：使用 GitHub Personal Access Token（不是登录密码）

### 步骤3：在 Vercel 部署

1. 访问 https://vercel.com/signup
2. 点击 "Continue with GitHub"
3. 授权 Vercel 访问您的 GitHub
4. 点击 "Add New Project"
5. 选择 `enterprise-project-system` 仓库
6. 点击 "Import"
7. 直接点击 "Deploy"（Vercel 会自动检测 Next.js）

**等待几分钟**，部署完成后会得到网址：
```
https://enterprise-project-system-xxxxx.vercel.app
```

### ⚠️ 重要说明

由于项目使用了数据库，部署到 Vercel 后：
- ✅ **前端界面**：可以正常访问和查看
- ❌ **后端功能**：需要额外配置数据库才能工作

**如果您只是想看看界面，部署到 Vercel 就足够了！**

---

## 💻 方案2：本地运行（需要一些技术基础）

如果您想在自己的电脑上完整运行项目，需要：

### 前提条件
1. 安装 Node.js（推荐 18+ 版本）
2. 安装 Git
3. 安装 PostgreSQL 数据库（或使用 Docker）

### 步骤
1. 克隆代码到本地
2. 安装依赖：`pnpm install`
3. 配置数据库
4. 启动服务：`pnpm run dev`

**预计耗时**：2-3 小时（如果没用过这些工具）

---

## 🤔 我的建议

**作为新手，我建议您：**

1. **先看图片预览** - 了解网站长什么样
2. **部署到 Vercel** - 在线查看前端界面（无需配置数据库）
3. **如果真的需要完整功能** - 再考虑配置数据库

---

## ❓ 下一步

请告诉我您选择哪个方案：
- **选择方案3**：我立即为您生成截图
- **选择方案1**：我指导您完成部署
- **选择方案2**：我提供详细的本地运行指南
