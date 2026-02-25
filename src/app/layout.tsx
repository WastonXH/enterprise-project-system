import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '企业项目管理系统 | 多部门协作平台',
    template: '%s | 企业项目管理系统',
  },
  description:
    '企业内部多部门协作项目管理系统，支持业务、研发、采购和质量部门的完整工作流程。',
  keywords: [
    '企业管理系统',
    '项目协作',
    '业务管理',
    '研发管理',
    '采购管理',
    '质量管理',
    '工作流程',
    '产品型号管理',
  ],
  authors: [{ name: '企业项目管理系统' }],
  generator: 'Enterprise Management System',
  openGraph: {
    title: '企业项目管理系统 | 多部门协作平台',
    description:
      '支持业务、研发、采购和质量部门的完整工作流程，实现高效的项目协作。',
    siteName: '企业项目管理系统',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
