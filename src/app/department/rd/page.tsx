'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RDPage() {
  const [formData, setFormData] = useState({
    // 基本配置
    projectCode: '',
    productStructure: '',
    
    // 玻璃配置
    glassSize: '',
    glassThickness: '',
    
    // IC配置
    icModel: '',
    icPackage: '',
    
    // 偏光片配置
    polarizerType: '',
    polarizerBrand: '',
    
    // FPC配置
    fpcType: '',
    fpcLength: '',
    fpcConnector: '',
    
    // 背光配置
    backlightType: '',
    backlightBrightness: '',
    
    // 触控配置
    touchType: '',
    coverGlass: '',
    
    // 备注
    remarks: ''
  });

  const [modelNumber, setModelNumber] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateModelNumber = () => {
    const parts = [];
    
    // 产品结构
    if (formData.productStructure) {
      parts.push(formData.productStructure);
    }
    
    // 尺寸
    if (formData.glassSize) {
      parts.push(formData.glassSize.replace(/[^0-9.]/g, ''));
    }
    
    // IC型号
    if (formData.icModel) {
      parts.push(formData.icModel.substring(0, 3).toUpperCase());
    }
    
    // 触控类型
    if (formData.touchType) {
      const touchMap: Record<string, string> = {
        'CTP': 'C',
        'RTP': 'R',
        'NONE': 'N'
      };
      parts.push(touchMap[formData.touchType] || 'X');
    }
    
    // 随机序号
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    parts.push(random);
    
    const model = parts.length > 1 ? parts.join('-') : `MODEL-${random}`;
    setModelNumber(model);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('设计方案提交成功！\n\n产品型号：' + modelNumber + '\n\n（注意：这是静态演示版本，数据不会保存）');
  };

  return (
    <div>
      <header className="header no-print">
        <div className="container">
          <div className="header-content">
            <div className="logo">🔬</div>
            <div>
              <h1>研发部工作台</h1>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>设计方案配置</p>
            </div>
          </div>
          <nav className="nav">
            <Link href="/">返回首页</Link>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '30px' }}>
        <div className="card no-print">
          <div className="card-header">设计方案配置表</div>
          
          <form onSubmit={handleSubmit}>
            {/* 型号生成 */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginBottom: '20px', color: 'white' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>产品型号生成</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={modelNumber}
                  readOnly
                  placeholder="配置完成后点击生成"
                  style={{ background: 'rgba(255,255,255,0.9)', flex: 1 }}
                />
                <button type="button" className="btn" style={{ background: 'white', color: '#667eea' }} onClick={generateModelNumber}>
                  生成型号
                </button>
              </div>
            </div>

            {/* 产品结构 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>产品结构</div>
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
                  <label className="form-label">产品结构类型</label>
                  <select 
                    name="productStructure"
                    className="form-select" 
                    value={formData.productStructure}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="COG">COG (Chip on Glass)</option>
                    <option value="COF">COF (Chip on Film)</option>
                    <option value="COA">COA (Chip on Array)</option>
                    <option value="A-LCM">A-LCM (组合式总成)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 玻璃配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>🔧 玻璃配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">玻璃尺寸</label>
                  <input 
                    type="text" 
                    name="glassSize"
                    className="form-input" 
                    value={formData.glassSize}
                    onChange={handleChange}
                    placeholder="例如：7.0 inch"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">玻璃厚度</label>
                  <select 
                    name="glassThickness"
                    className="form-select" 
                    value={formData.glassThickness}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="0.3mm">0.3mm</option>
                    <option value="0.4mm">0.4mm</option>
                    <option value="0.5mm">0.5mm</option>
                    <option value="0.55mm">0.55mm</option>
                    <option value="0.7mm">0.7mm</option>
                    <option value="1.1mm">1.1mm</option>
                  </select>
                </div>
              </div>
            </div>

            {/* IC配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>🔌 IC配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">IC型号</label>
                  <input 
                    type="text" 
                    name="icModel"
                    className="form-input" 
                    value={formData.icModel}
                    onChange={handleChange}
                    placeholder="例如：ILI9341"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">封装类型</label>
                  <select 
                    name="icPackage"
                    className="form-select" 
                    value={formData.icPackage}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="COG">COG</option>
                    <option value="COF">COF</option>
                    <option value="TCP">TCP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 偏光片配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>🎨 偏光片配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">偏光片类型</label>
                  <select 
                    name="polarizerType"
                    className="form-select" 
                    value={formData.polarizerType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="Normal">普通</option>
                    <option value="Wide">广视角</option>
                    <option value="Narrow">窄视角</option>
                    <option value="Anti-glare">防眩光</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">品牌</label>
                  <input 
                    type="text" 
                    name="polarizerBrand"
                    className="form-input" 
                    value={formData.polarizerBrand}
                    onChange={handleChange}
                    placeholder="例如：Sumitomo"
                  />
                </div>
              </div>
            </div>

            {/* FPC配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>📶 FPC配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">FPC类型</label>
                  <select 
                    name="fpcType"
                    className="form-select" 
                    value={formData.fpcType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="Single-side">单面</option>
                    <option value="Double-side">双面</option>
                    <option value="Multi-layer">多层</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">FPC长度</label>
                  <input 
                    type="text" 
                    name="fpcLength"
                    className="form-input" 
                    value={formData.fpcLength}
                    onChange={handleChange}
                    placeholder="例如：50mm"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">连接器类型</label>
                  <input 
                    type="text" 
                    name="fpcConnector"
                    className="form-input" 
                    value={formData.fpcConnector}
                    onChange={handleChange}
                    placeholder="例如：PH 2.0"
                  />
                </div>
              </div>
            </div>

            {/* 背光配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>💡 背光配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">背光类型</label>
                  <select 
                    name="backlightType"
                    className="form-select" 
                    value={formData.backlightType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="LED">LED</option>
                    <option value="CCFL">CCFL</option>
                    <option value="EL">EL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">亮度要求</label>
                  <input 
                    type="text" 
                    name="backlightBrightness"
                    className="form-input" 
                    value={formData.backlightBrightness}
                    onChange={handleChange}
                    placeholder="例如：500 nits"
                  />
                </div>
              </div>
            </div>

            {/* 触控配置 */}
            <div className="card" style={{ background: '#f8f9fa', marginBottom: '20px' }}>
              <div style={{ fontWeight: '600', marginBottom: '16px' }}>👆 触控及盖板配置</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">触控类型</label>
                  <select 
                    name="touchType"
                    className="form-select" 
                    value={formData.touchType}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="CTP">电容触控 (CTP)</option>
                    <option value="RTP">电阻触控 (RTP)</option>
                    <option value="NONE">无触控</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">盖板玻璃</label>
                  <select 
                    name="coverGlass"
                    className="form-select" 
                    value={formData.coverGlass}
                    onChange={handleChange}
                  >
                    <option value="">请选择</option>
                    <option value="None">无盖板</option>
                    <option value="G+G">G+G (玻璃+玻璃)</option>
                    <option value="G+F">G+F (玻璃+薄膜)</option>
                    <option value="F+F">F+F (薄膜+薄膜)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 备注 */}
            <div className="form-group">
              <label className="form-label">备注说明</label>
              <textarea 
                name="remarks"
                className="form-input" 
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                placeholder="请输入其他说明..."
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px' }}>
              <button type="submit" className="btn btn-primary">
                提交方案
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
                打印配置
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
