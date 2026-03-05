'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState('glass');

  // 玻璃资源数据
  const glassData = [
    { id: 'G001', size: '7.0 inch', thickness: '0.7mm', supplier: '供应商A', stock: 500, status: '充足' },
    { id: 'G002', size: '10.1 inch', thickness: '1.1mm', supplier: '供应商B', stock: 200, status: '正常' },
    { id: 'G003', size: '5.0 inch', thickness: '0.5mm', supplier: '供应商A', stock: 50, status: '不足' },
    { id: 'G004', size: '3.5 inch', thickness: '0.4mm', supplier: '供应商C', stock: 800, status: '充足' },
  ];

  // IC资源数据
  const icData = [
    { id: 'IC001', model: 'ILI9341', package: 'COG', supplier: '供应商X', stock: 1000, status: '充足' },
    { id: 'IC002', model: 'ST7789', package: 'COG', supplier: '供应商Y', stock: 500, status: '正常' },
    { id: 'IC003', model: 'NT35510', package: 'COF', supplier: '供应商X', stock: 100, status: '不足' },
    { id: 'IC004', model: 'GC9A01', package: 'COG', supplier: '供应商Z', stock: 2000, status: '充足' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '充足': return '#10b981';
      case '正常': return '#3b82f6';
      case '不足': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">🛒</div>
            <div>
              <h1>采购部工作台</h1>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>资源库管理</p>
            </div>
          </div>
          <nav className="nav">
            <Link href="/">返回首页</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '30px' }}>
        {/* 标签切换 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeTab === 'glass' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('glass')}
          >
            玻璃资源库
          </button>
          <button 
            className={`btn ${activeTab === 'ic' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('ic')}
          >
            IC资源库
          </button>
        </div>

        {/* 玻璃资源库 */}
        {activeTab === 'glass' && (
          <div className="card">
            <div className="card-header">玻璃资源库</div>
            <table className="table">
              <thead>
                <tr>
                  <th>编号</th>
                  <th>尺寸</th>
                  <th>厚度</th>
                  <th>供应商</th>
                  <th>库存</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {glassData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.size}</td>
                    <td>{item.thickness}</td>
                    <td>{item.supplier}</td>
                    <td>{item.stock} PCS</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        background: getStatusColor(item.status),
                        color: 'white'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* IC资源库 */}
        {activeTab === 'ic' && (
          <div className="card">
            <div className="card-header">IC资源库</div>
            <table className="table">
              <thead>
                <tr>
                  <th>编号</th>
                  <th>型号</th>
                  <th>封装</th>
                  <th>供应商</th>
                  <th>库存</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {icData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.model}</td>
                    <td>{item.package}</td>
                    <td>{item.supplier}</td>
                    <td>{item.stock} PCS</td>
                    <td>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        background: getStatusColor(item.status),
                        color: 'white'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 说明 */}
        <div className="card" style={{ marginTop: '20px', background: '#fffbeb' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>📢 说明</div>
          <p style={{ color: '#92400e', fontSize: '14px' }}>
            这是静态演示版本，数据仅供展示。完整版本将支持资源的新增、编辑、删除和库存管理功能。
          </p>
        </div>
      </main>
    </div>
  );
}
