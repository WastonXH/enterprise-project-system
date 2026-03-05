'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BusinessPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    customer: '',
    productType: '',
    displaySize: '',
    resolution: '',
    interface: '',
    brightness: '',
    projectLevel: '',
    quantity: '',
    deliveryDate: '',
    requirements: ''
  });

  const [serialNumber, setSerialNumber] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSerialNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const sn = `YW-${year}${month}-${random}`;
    setSerialNumber(sn);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('表单提交成功！\n\n流水编号：' + serialNumber + '\n\n（注意：这是静态演示版本，数据不会保存）');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <header className="header no-print">
        <div className="container">
          <div className="header-content">
            <div className="logo">📋</div>
            <div>
              <h1>业务部工作台</h1>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>项目需求录入</p>
            </div>
          </div>
          <nav className="nav">
            <Link href="/">返回首页</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '30px' }}>
        <div className="card no-print">
          <div className="card-header">项目需求表</div>
          
          <form onSubmit={handleSubmit}>
            {/* 基本信息 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>基本信息</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">流水编号</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={serialNumber}
                      readOnly
                      placeholder="点击生成"
                      style={{ background: '#fff' }}
                    />
                    <button type="button" className="btn btn-secondary" onClick={generateSerialNumber}>
                      生成
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">项目名称 *</label>
                  <input 
                    type="text" 
                    name="projectName"
                    className="form-input" 
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="请输入项目名称"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">客户名称 *</label>
                  <input 
                    type="text" 
                    name="customer"
                    className="form-input" 
                    value={formData.customer}
                    onChange={handleChange}
                    placeholder="请输入客户名称"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 产品规格 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>产品规格</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">产品类型</label>
                  <select 
                    name="productType"
                    className="form-select" 
                    value={formData.productType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="TFT-LCD">TFT-LCD</option>
                    <option value="OLED">OLED</option>
                    <option value="S/TN LCD">S/TN LCD</option>
                    <option value="E-PAPER">E-PAPER</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">显示屏尺寸</label>
                  <input 
                    type="text" 
                    name="displaySize"
                    className="form-input" 
                    value={formData.displaySize}
                    onChange={handleChange}
                    placeholder="例如：7.0 inch"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">分辨率</label>
                  <input 
                    type="text" 
                    name="resolution"
                    className="form-input" 
                    value={formData.resolution}
                    onChange={handleChange}
                    placeholder="例如：1024×600"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">接口类型</label>
                  <input 
                    type="text" 
                    name="interface"
                    className="form-input" 
                    value={formData.interface}
                    onChange={handleChange}
                    placeholder="例如：LVDS / MIPI"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">亮度要求</label>
                  <input 
                    type="text" 
                    name="brightness"
                    className="form-input" 
                    value={formData.brightness}
                    onChange={handleChange}
                    placeholder="例如：500 nits"
                  />
                </div>
              </div>
            </div>

            {/* 项目信息 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>项目信息</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">项目等级</label>
                  <select 
                    name="projectLevel"
                    className="form-select" 
                    value={formData.projectLevel}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="A">A级（高优先级）</option>
                    <option value="B">B级（中优先级）</option>
                    <option value="C">C级（低优先级）</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">需求数量</label>
                  <input 
                    type="text" 
                    name="quantity"
                    className="form-input" 
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="例如：10000 PCS"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">期望交期</label>
                  <input 
                    type="date" 
                    name="deliveryDate"
                    className="form-input" 
                    value={formData.deliveryDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">特殊要求</label>
                <textarea 
                  name="requirements"
                  className="form-input" 
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  placeholder="请输入特殊要求或备注信息..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
              <button type="submit" className="btn btn-primary">
                提交需求
              </button>
              <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                打印表单
              </button>
            </div>
          </form>
        </div>

        {/* 打印模板 */}
        <div className="card print-only" style={{ display: 'none' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>项目需求表</h2>
          <table className="table">
            <tbody>
              <tr><th style={{ width: '120px' }}>流水编号</th><td>{serialNumber}</td></tr>
              <tr><th>项目名称</th><td>{formData.projectName}</td></tr>
              <tr><th>客户名称</th><td>{formData.customer}</td></tr>
              <tr><th>产品类型</th><td>{formData.productType}</td></tr>
              <tr><th>显示屏尺寸</th><td>{formData.displaySize}</td></tr>
              <tr><th>分辨率</th><td>{formData.resolution}</td></tr>
              <tr><th>接口类型</th><td>{formData.interface}</td></tr>
              <tr><th>亮度要求</th><td>{formData.brightness}</td></tr>
              <tr><th>项目等级</th><td>{formData.projectLevel}</td></tr>
              <tr><th>需求数量</th><td>{formData.quantity}</td></tr>
              <tr><th>期望交期</th><td>{formData.deliveryDate}</td></tr>
              <tr><th>特殊要求</th><td>{formData.requirements}</td></tr>
            </tbody>
          </table>
          <p style={{ textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '12px' }}>
            打印时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </main>
    </div>
  );
}
