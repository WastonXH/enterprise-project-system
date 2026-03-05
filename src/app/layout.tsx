import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '企业项目管理系统',
  description: '多部门协作项目管理平台',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
