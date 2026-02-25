# 部署到 Vercel（推荐）

## 前提条件
- GitHub 账号（您已经有了：WastonXH）
- Vercel 账号（可以用 GitHub 账号登录）

## 步骤1：推送代码到 GitHub

1. 在您的 GitHub 创建一个新仓库，比如叫 `enterprise-project-system`

2. 在项目目录执行以下命令：

```bash
# 初始化 git（如果还没初始化）
cd /workspace/projects
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 企业项目管理系统初始版本"

# 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/WastonXH/enterprise-project-system.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 步骤2：在 Vercel 部署

1. 访问 https://vercel.com
2. 点击 "Sign Up"，使用 GitHub 账号登录
3. 点击 "Add New" -> "Project"
4. 选择您的 GitHub 仓库 `enterprise-project-system`
5. 点击 "Import"
6. 配置环境变量（重要！）：

在 "Environment Variables" 部分添加：
```
Name: DATABASE_URL
Value: [需要配置数据库，见下方说明]
```

7. 点击 "Deploy" 按钮

## 步骤3：配置数据库（重要）

由于项目使用了 PostgreSQL 数据库，您需要：

**选项A：使用免费云数据库**
- 注册 https://neon.tech（免费额度）
- 创建数据库项目
- 获取 Connection String
- 在 Vercel 的环境变量中设置 `DATABASE_URL`

**选项B：暂时使用 Supabase**
- 注册 https://supabase.com（免费）
- 创建新项目
- 获取 PostgreSQL 连接字符串
- 在 Vercel 中设置环境变量

## 步骤4：访问网站

部署成功后，Vercel 会给您一个类似这样的网址：
```
https://enterprise-project-system.vercel.app
```

任何人都可以通过这个网址访问！

## 注意事项

1. **数据库初始化**：部署后需要访问 `/api/init-db` 来初始化数据库
2. **环境变量**：必须配置 `DATABASE_URL`，否则后端无法工作
3. **自动部署**：每次推送代码到 GitHub，Vercel 会自动重新部署

## 替代方案（如果数据库配置太复杂）

如果觉得配置数据库太复杂，可以考虑：
1. 先部署前端界面（静态部署）
2. 使用本地开发环境查看完整功能
3. 或者我可以帮您简化项目，改为使用本地存储而非数据库
