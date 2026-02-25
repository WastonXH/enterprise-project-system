# 🚀 Git 推送指南

## ⚠️ 重要说明

由于沙箱环境无法直接推送到您的 GitHub（需要认证），您需要：

1. 在本地电脑上执行以下命令
2. 从沙箱下载代码包（或使用下面提供的文件内容）

---

## 📦 方法一：使用打包文件（推荐）

### 步骤1：下载代码包

沙箱中已生成打包文件：`/workspace/enterprise-project-full.tar.gz`（450KB）

**注意**：您需要通过沙箱的文件管理界面下载这个文件。

### 步骤2：解压并覆盖

下载后，将文件解压到您克隆的仓库目录中，覆盖所有文件。

### 步骤3：推送

```bash
git add .
git commit -m "feat: 升级为 Next.js 项目，支持数据库功能"
git push origin main
```

---

## 📝 方法二：手动创建关键文件

如果无法下载打包文件，可以手动创建以下文件：

### 1. package.json（必须）

在项目根目录创建 `package.json`，内容如下：

```json
{
  "name": "enterprise-project-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-tooltip": "^1.2.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.468.0",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.70.0",
    "tailwind-merge": "^2.6.0",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 2. next.config.ts（必须）

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### 3. tsconfig.json（必须）

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. postcss.config.mjs（必须）

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

### 5. 创建目录结构

```bash
mkdir -p src/app/department/business
mkdir -p src/app/department/rd
mkdir -p src/app/department/purchasing
mkdir -p src/app/department/quality
mkdir -p public
mkdir -p src/components/ui
mkdir -p src/lib
```

---

## 🔧 方法三：简化版（快速测试）

如果上述方法都不可行，可以使用简化版本，只创建最小必要文件：

### 只需创建以下 4 个文件：

1. `package.json`
2. `next.config.ts`
3. `tsconfig.json`
4. `postcss.config.mjs`

然后在 GitHub 上创建 `vercel.json`：

```json
{
  "version": 2
}
```

这样 Vercel 至少可以识别项目类型，然后我们可以逐步添加其他文件。

---

## 📞 下一步

执行完上述任一方法后：

1. 提交更改：
   ```bash
   git add .
   git commit -m "feat: 升级为 Next.js 项目"
   git push origin main
   ```

2. 返回 Vercel，等待自动部署

3. 验证部署成功
