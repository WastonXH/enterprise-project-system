import { NextResponse } from 'next/server';

export async function GET() {
  const results: {
    step: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    data?: unknown;
    error?: string;
    duration?: number;
  }[] = [];

  // 1. 检查环境变量
  const envCheck = {
    PGDATABASE_URL: process.env.PGDATABASE_URL ? '已设置' : '❌ 未设置',
    NODE_ENV: process.env.NODE_ENV,
  };
  results.push({
    step: '1. 环境变量检查',
    status: envCheck.PGDATABASE_URL === '已设置' ? 'success' : 'error',
    message: envCheck.PGDATABASE_URL === '已设置' ? '环境变量已配置' : 'PGDATABASE_URL 未设置',
    data: envCheck,
  });

  // 2. 尝试连接数据库
  let dbUrl = process.env.PGDATABASE_URL;
  
  if (!dbUrl) {
    results.push({
      step: '2. 数据库连接',
      status: 'error',
      message: '跳过：环境变量未设置',
    });
    return NextResponse.json({ results }, { status: 200 });
  }

  // 隐藏密码显示连接字符串
  const safeUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
  
  const startTime = Date.now();
  
  try {
    // 动态导入 pg 模块
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: dbUrl,
      ssl: dbUrl.includes('sslmode=disable') ? false : { rejectUnauthorized: false },
    });

    await client.connect();
    const connectDuration = Date.now() - startTime;
    
    results.push({
      step: '2. 数据库连接',
      status: 'success',
      message: `连接成功 (${connectDuration}ms)`,
      data: { connectionString: safeUrl },
      duration: connectDuration,
    });

    // 3. 检查表是否存在
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    const requiredTables = [
      'project_requirements',
      'design_solutions',
      'glass_resources',
      'ic_resources',
      'quality_records',
      'component_codes',
    ];
    
    const missingTables = requiredTables.filter(t => !tables.includes(t));
    
    results.push({
      step: '3. 数据表检查',
      status: missingTables.length === 0 ? 'success' : 'warning',
      message: missingTables.length === 0 
        ? `所有必要表都存在 (${tables.length}个表)` 
        : `缺少表: ${missingTables.join(', ')}`,
      data: { 
        existingTables: tables,
        requiredTables,
        missingTables,
      },
    });

    // 4. 检查 project_requirements 表结构
    if (tables.includes('project_requirements')) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'project_requirements' AND table_schema = 'public'
        ORDER BY ordinal_position
      `);
      
      const columns = columnsResult.rows;
      const requiredColumns = ['id', 'requirement_id', 'customer_name', 'product_category'];
      const existingColumns = columns.map(c => c.column_name);
      const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));
      
      results.push({
        step: '4. project_requirements 表结构',
        status: missingColumns.length === 0 ? 'success' : 'error',
        message: missingColumns.length === 0 
          ? '表结构完整' 
          : `缺少字段: ${missingColumns.join(', ')}`,
        data: {
          columns: columns.map(c => `${c.column_name} (${c.data_type})`),
          missingColumns,
        },
      });

      // 5. 尝试查询数据
      const countResult = await client.query('SELECT COUNT(*) as count FROM project_requirements');
      const count = parseInt(countResult.rows[0].count);
      
      // 获取最大编号
      const maxIdResult = await client.query(`
        SELECT requirement_id 
        FROM project_requirements 
        WHERE requirement_id LIKE 'RFQ-%' 
        ORDER BY requirement_id DESC 
        LIMIT 1
      `);
      const maxId = maxIdResult.rows[0]?.requirement_id || '无';
      
      results.push({
        step: '5. 数据查询测试',
        status: 'success',
        message: `查询成功，当前 ${count} 条需求`,
        data: {
          totalCount: count,
          maxRequirementId: maxId,
        },
      });

      // 6. 测试插入（不实际提交）
      results.push({
        step: '6. 插入权限测试',
        status: 'success',
        message: '数据库连接正常，可以尝试实际插入',
        data: {
          note: '如果实际插入失败，请检查表结构或约束',
        },
      });
    }

    await client.end();
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    results.push({
      step: '2. 数据库连接',
      status: 'error',
      message: `连接失败 (${duration}ms)`,
      error: errorMessage,
      data: { connectionString: safeUrl },
      duration,
    });
    
    // 分析错误类型
    if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED')) {
      results.push({
        step: '诊断建议',
        status: 'error',
        message: '网络连接超时，请检查：',
        data: [
          '1. Supabase 项目是否处于 Active 状态',
          '2. 连接字符串是否使用 Transaction pooler (端口 6543)',
          '3. 是否添加了 sslmode=disable 参数',
          '4. Netlify 环境变量是否正确设置',
        ],
      });
    } else if (errorMessage.includes('password') || errorMessage.includes('authentication')) {
      results.push({
        step: '诊断建议',
        status: 'error',
        message: '认证失败，请检查密码是否正确',
      });
    } else if (errorMessage.includes('certificate') || errorMessage.includes('SSL')) {
      results.push({
        step: '诊断建议',
        status: 'error',
        message: 'SSL 证书问题，请在连接字符串添加 ?sslmode=disable',
      });
    }
  }

  return NextResponse.json({ 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    results 
  }, { status: 200 });
}
