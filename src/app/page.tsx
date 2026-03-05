import Link from 'next/link';

export default function Home() {
  const departments = [
    { 
      id: 'business', 
      name: '业务部', 
      icon: '📋',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: '管理客户项目需求、收集产品规格信息'
    },
    { 
      id: 'rd', 
      name: '研发部', 
      icon: '🔬',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: '设计方案配置、产品型号生成'
    },
    { 
      id: 'purchasing', 
      name: '采购部', 
      icon: '🛒',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: '资源库管理、供应链信息维护'
    },
    { 
      id: 'quality', 
      name: '质量部', 
      icon: '✅',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: '试产质量检验、质量数据记录'
    },
  ];

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">企</div>
            <h1>企业项目管理系统</h1>
          </div>
          <p style={{ marginTop: '8px', opacity: 0.9 }}>多部门协作工作平台</p>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
            选择您的部门
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            点击下方卡片进入对应部门的工作台
          </p>
        </div>

        <div className="department-grid">
          {departments.map((dept) => (
            <Link key={dept.id} href={`/department/${dept.id}/`} className="department-card">
              <div className="department-icon" style={{ background: dept.color, color: 'white' }}>
                {dept.icon}
              </div>
              <h3>{dept.name}</h3>
              <p>{dept.description}</p>
            </Link>
          ))}
        </div>

        <div className="card" style={{ marginTop: '50px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>工作流程说明</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#667eea', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>业务部录入项目需求</div>
                <div style={{ fontSize: '14px', color: '#666' }}>收集客户信息、产品规格、项目等级等基础信息</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#f5576c', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>研发部设计方案</div>
                <div style={{ fontSize: '14px', color: '#666' }}>选型配置、方案设计，生成产品型号</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#4facfe', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>采购部维护资源库</div>
                <div style={{ fontSize: '14px', color: '#666' }}>管理玻璃、IC等核心零部件的型号和库存信息</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ width: '28px', height: '28px', background: '#43e97b', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>质量部记录试产质量</div>
                <div style={{ fontSize: '14px', color: '#666' }}>追踪试产过程、记录质量数据、制定改进措施</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '14px', marginTop: '50px' }}>
        <p>© 2025 企业项目管理系统 - 多部门协作解决方案</p>
      </footer>
    </div>
  );
}
