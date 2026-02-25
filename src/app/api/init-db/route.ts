import { NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { departments } from '@/storage/database/shared/schema';

export async function POST() {
  try {
    const db = await getDb();
    // 检查是否已初始化（通过检查部门表是否存在）
    const existingDepartments = await db.select().from(departments).limit(1);

    if (existingDepartments.length > 0) {
      return NextResponse.json({ message: '数据库已初始化' }, { status: 200 });
    }

    // 插入部门初始数据
    await db.insert(departments).values([
      { name: '业务部', code: 'BUSINESS', description: '负责客户项目需求收集' },
      { name: '研发部', code: 'RD', description: '负责产品方案设计和型号生成' },
      { name: '采购部', code: 'PURCHASING', description: '负责资源库管理（玻璃、IC等）' },
      { name: '质量部', code: 'QUALITY', description: '负责试产质量检验和记录' },
    ]);

    return NextResponse.json({
      message: '数据库初始化成功',
      departments: ['业务部', '研发部', '采购部', '质量部']
    }, { status: 200 });
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return NextResponse.json(
      { error: '数据库初始化失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
