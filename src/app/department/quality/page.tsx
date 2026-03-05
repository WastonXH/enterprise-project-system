'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QualityPage() {
  const [formData, setFormData] = useState({
    projectCode: '',
    productModel: '',
    testDate: '',
    testQuantity: '',
    passQuantity: '',
    failQuantity: '',
    defectType: '',
    defectDescription: '',
    improvement: '',
    tester: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const passRate = formData.testQuantity && formData.passQuantity 
      ? ((parseInt(formData.passQuantity) / parseInt(formData.testQuantity)) * 100).toFixed(1)
      : 0;
    alert(`质量记录提交成功！\n\n合格率：${passRate}%\n\n（注意：这是静态演示版本，数据不会保存）`);
  };

  const recentRecords = [
    { id: 'QC001', project: 'YW-2401-00123', model: 'COG-7.0-ILI-C-001', passRate: '98.5%', date: '2025-01-15' },
    { id: 'QC002', project: 'YW-2401-00124', model: 'COF-10.1-NT3-C-002', passRate: '96.2%', date: '2025-01-14' },
    { id: 'QC003', project: 'YW-2401-00125', model: 'COG-5.0-ST7-C-003', passRate: '99.1%', date: '2025-01-13' },
  ];

  return (
    <div>
      <header className="header no-print">
        <div className="container">
          <div className="header-content">
            <div className="logo">✅</div>
            <div>
              <h1>质量部工作台</h1>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>试产质量记录</p>
            </div>
          </div>
          <nav className="nav">
            <Link href="/">返回首页</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '30px' }}>
        {/* 最近记录 */}
        <div className="card">
          <div className="card-header">最近质量记录</div>
          <table className="table">
            <thead>
              <tr>
                <th>记录编号</th>
                <th>项目编号</th>
                <th>产品型号</th>
                <th>合格率</th>
                <th>测试日期</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.project}</td>
                  <td>{record.model}</td>
                  <td>
                    <span style={{ 
                      color: parseFloat(record.passRate) >= 98 ? '#10b981' : 
                             parseFloat(record.passRate) >= 95 ? '#3b82f6' : '#ef4444',
                      fontWeight: '600'
                    }}>
                      {record.passRate}
                    </span>
                  </td>
                  <td>{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 质量记录表单 */}
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">新建质量记录</div>
          
          <form onSubmit={handleSubmit}>
            {/* 基本信息 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">项目编号</label>
                <input 
                  type="text" 
                  name="projectCode"
                  className="form-input" 
                  value={formData.projectCode}
                  onChange={handleChange}
                  placeholder="请输入项目编号"
                />
              </div>
              <div className="form-group">
                <label className="form-label">产品型号</label>
                <input 
                  type="text" 
                  name="productModel"
                  className="form-input" 
                  value={formData.productModel}
                  onChange={handleChange}
                  placeholder="请输入产品型号"
                />
              </div>
              <div className="form-group">
                <label className="form-label">测试日期</label>
                <input 
                  type="date" 
                  name="testDate"
                  className="form-input" 
                  value={formData.testDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 测试数据 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>测试数据</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">测试数量</label>
                  <input 
                    type="number" 
                    name="testQuantity"
                    className="form-input" 
                    value={formData.testQuantity}
                    onChange={handleChange}
                    placeholder="请输入测试数量"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">合格数量</label>
                  <input 
                    type="number" 
                    name="passQuantity"
                    className="form-input" 
                    value={formData.passQuantity}
                    onChange={handleChange}
                    placeholder="请输入合格数量"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">不合格数量</label>
                  <input 
                    type="number" 
                    name="failQuantity"
                    className="form-input" 
                    value={formData.failQuantity}
                    onChange={handleChange}
                    placeholder="请输入不合格数量"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* 缺陷信息 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>缺陷信息</div>
              <div className="form-group">
                <label className="form-label">缺陷类型</label>
                <select 
                  name="defectType"
                  className="form-select" 
                  value={formData.defectType}
                  onChange={handleChange}
                >
                  <option value="">请选择</option>
                  <option value="外观缺陷">外观缺陷</option>
                  <option value="功能缺陷">功能缺陷</option>
                  <option value="尺寸偏差">尺寸偏差</option>
                  <option value="显示异常">显示异常</option>
                  <option value="触控异常">触控异常</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">缺陷描述</label>
                <textarea 
                  name="defectDescription"
                  className="form-input" 
                  value={formData.defectDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="请详细描述缺陷情况..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">改进措施</label>
                <textarea 
                  name="improvement"
                  className="form-input" 
                  value={formData.improvement}
                  onChange={handleChange}
                  rows={3}
                  placeholder="请填写改进措施..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">测试人员</label>
                <input 
                  type="text" 
                  name="tester"
                  className="form-input" 
                  value={formData.tester}
                  onChange={handleChange}
                  placeholder="请输入测试人员姓名"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
              <button type="submit" className="btn btn-primary">
                提交记录
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                打印报告
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
