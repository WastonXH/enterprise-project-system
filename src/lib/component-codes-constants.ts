/**
 * 零部件编码规则常量
 * 基于金蝶编码规则文档 RZW-WI-D-005
 * 编码格式：XXX.XXX.XXX（类别代码.规格尺寸代码.序号）
 */

// ========== 零部件类别代码 ==========
export const COMPONENT_CATEGORIES = {
  LCD: {
    code: '001',
    name: 'LCD(玻璃)',
    description: 'LCD液晶显示屏玻璃',
    bFormat: '模组规格尺寸（如177表示1.77寸）',
  },
  IC: {
    code: '002',
    name: 'IC(集成电路)',
    description: '集成电路芯片',
    bFormat: 'LCD分辨率',
  },
  FPC: {
    code: '003',
    name: 'FPC(软性电路板)',
    description: '柔性印刷电路板',
    bFormat: '模组规格尺寸',
  },
  BL: {
    code: '004',
    name: 'BL(背光)',
    description: '背光源组件',
    bFormat: '模组规格尺寸',
  },
  BZ: {
    code: '005',
    name: 'BZ(铁框)',
    description: '铁框/金属框架',
    bFormat: '规格尺寸',
  },
  TP: {
    code: '006',
    name: 'TP(触摸屏)',
    description: '触摸屏组件',
    bFormat: '规格尺寸',
  },
  // 007, 008 预留
  COG: {
    code: '009',
    name: 'COG',
    description: 'Chip On Glass 芯片贴装',
    bFormat: '规格尺寸',
  },
  FOG: {
    code: '010',
    name: 'FOG',
    description: 'FPC On Glass',
    bFormat: '规格尺寸',
  },
  FPCBA: {
    code: '011',
    name: 'FPCBA(带元件)',
    description: '带元件的柔性电路板',
    bFormat: '规格尺寸',
  },
  LCM: {
    code: '012',
    name: 'LCM(成品)',
    description: 'LCM液晶显示模组成品',
    bFormat: '规格尺寸',
  },
  ELECTRONIC: {
    code: '013',
    name: '电子料',
    description: '电容、电阻等电子元器件',
    bFormat: '种类代码',
  },
  SST: {
    code: '014',
    name: 'SST(胶纸)',
    description: '导电布、绝缘胶等胶纸材料',
    bFormat: '胶纸种类',
  },
  BT: {
    code: '015',
    name: 'BT(托盘)',
    description: '包装托盘',
    bFormat: '规格尺寸',
  },
  PET: {
    code: '016',
    name: 'PET(保护膜)',
    description: '屏幕保护膜',
    bFormat: '规格尺寸',
  },
  UBZ: {
    code: '017',
    name: 'UBZ(上铁框)',
    description: '上铁框/上金属框',
    bFormat: '模组规格尺寸',
  },
  DBZ: {
    code: '018',
    name: 'DBZ(下铁框)',
    description: '下铁框/下金属框',
    bFormat: '模组规格尺寸',
  },
  POG: {
    code: '019',
    name: 'POG',
    description: 'Pin On Glass',
    bFormat: '模组规格尺寸',
  },
  MATERIAL: {
    code: '020',
    name: '辅料',
    description: '纸箱、ACF等辅料',
    bFormat: '辅料种类',
  },
  PCB: {
    code: '021',
    name: 'PCB(空版)',
    description: '空PCB板',
    bFormat: '规格尺寸',
  },
  PCBA: {
    code: '022',
    name: 'PCBA(贴件板)',
    description: '贴装元件后的PCB板',
    bFormat: '规格尺寸',
  },
  LCM_CTP: {
    code: '023',
    name: 'LCM+CTP(总成)',
    description: 'LCM与CTP总成模组',
    bFormat: '规格尺寸',
  },
} as const

// ========== 规格尺寸代码映射 ==========
// 常用LCD/模组尺寸代码
export const SIZE_CODES = {
  // 尺寸代码映射（去掉小数点后的数字）
  '1.44': '144',
  '1.5': '150',
  '1.54': '154',
  '1.77': '177',
  '1.8': '180',
  '2.0': '200',
  '2.2': '220',
  '2.31': '231',
  '2.4': '240',
  '2.6': '260',
  '2.8': '280',
  '3.0': '300',
  '3.2': '320',
  '3.5': '350',
  '4.0': '400',
  '4.3': '430',
  '5.0': '500',
  '7.0': '700',
  '9.0': '900',
  '10.1': '101',
  '10.2': '102',
  '10.4': '104',
  '12.1': '121',
  '15.0': '150',
  '15.6': '156',
  '18.5': '185',
  '21.5': '215',
  '23.8': '238',
  '27.0': '270',
  '32.0': '320',
  '43.0': '430',
  '49.0': '490',
  '55.0': '550',
  '65.0': '650',
  '75.0': '750',
  '86.0': '860',
  '98.0': '980',
} as const

// 常用分辨率代码
export const RESOLUTION_CODES = {
  '128x160': '128160',
  '176x220': '176220',
  '240x320': '240320',
  '320x240': '320240',
  '480x272': '480272',
  '480x320': '480320',
  '480x480': '480480',
  '480x800': '480800',
  '640x480': '640480',
  '720x720': '720720',
  '800x480': '800480',
  '800x600': '800600',
  '854x480': '854480',
  '960x540': '960540',
  '1024x600': '102600',
  '1024x768': '102768',
  '1280x720': '128720',
  '1280x800': '128800',
  '1280x1024': '1281024',
  '1366x768': '136768',
  '1440x900': '144900',
  '1600x900': '160900',
  '1600x1200': '1601200',
  '1920x1080': '1921080',
  '1920x1200': '1921200',
  '2048x1536': '2041536',
  '2560x1440': '2561440',
  '2560x1600': '2561600',
  '3840x2160': '3842160',
} as const

// 电子料种类代码
export const ELECTRONIC_TYPES = {
  '电容': '000',
  '电阻': '001',
  '电感': '002',
  '二极管': '003',
  '三极管': '004',
  '晶振': '005',
  '磁珠': '006',
  '保险丝': '007',
  '连接器': '008',
  '其他': '009',
} as const

// 胶纸种类代码
export const ADHESIVE_TYPES = {
  '导电布': '000',
  '绝缘胶': '001',
  '双面胶': '002',
  '高温胶': '003',
  '保护膜': '004',
  '填充胶': '005',
  '导热硅胶': '006',
  '其他': '007',
} as const

// 辅料种类代码
export const MATERIAL_TYPES = {
  'ACF': '000',
  'ACF清洗剂': '001',
  'UV胶': '002',
  '填充胶': '003',
  '包材': '004',
  '纸箱': '005',
  '气泡袋': '006',
  '说明书': '007',
  '标签': '008',
  '工装夹具': '009',
  '其他': '010',
} as const

// ========== 辅助函数 ==========

/**
 * 根据类别代码获取类别信息
 */
export function getCategoryByCode(code: string): typeof COMPONENT_CATEGORIES[keyof typeof COMPONENT_CATEGORIES] | null {
  const entry = Object.entries(COMPONENT_CATEGORIES).find(([, value]) => value.code === code)
  return entry ? entry[1] : null
}

/**
 * 根据类别名称获取类别代码
 */
export function getCategoryCodeByName(name: string): string | null {
  const entry = Object.entries(COMPONENT_CATEGORIES).find(([, value]) => value.name.includes(name) || name.includes(value.name))
  return entry ? entry[1].code : null
}

/**
 * 转换尺寸为三位代码
 * @param size 尺寸字符串，如 "1.77"、"2.4"
 */
export function convertSizeToCode(size: string): string {
  // 去掉小数点
  const cleaned = size.replace('.', '')
  // 不足三位补零，超长截断
  return cleaned.padEnd(3, '0').slice(0, 3)
}

/**
 * 转换分辨率为三位代码
 * @param resolution 分辨率字符串，如 "240x320"
 */
export function convertResolutionToCode(resolution: string): string {
  // 去掉x和小数点
  const cleaned = resolution.replace(/[x×]/gi, '').replace('.', '')
  // 取前三位
  return cleaned.padEnd(3, '0').slice(0, 3)
}

/**
 * 验证编码格式
 * @param code 编码字符串，格式 XXX.XXX.XXX
 */
export function validateCodeFormat(code: string): boolean {
  const pattern = /^\d{3}\.\d{3}\.\d{3}$/
  return pattern.test(code)
}

/**
 * 获取所有类别列表
 */
export function getCategoryList(): Array<{
  code: string
  name: string
  description: string
  bFormat: string
}> {
  return Object.entries(COMPONENT_CATEGORIES).map(([, value]) => ({
    code: value.code,
    name: value.name,
    description: value.description,
    bFormat: value.bFormat,
  }))
}

/**
 * 获取特定类别的B段说明
 */
export function getBFieldDescription(categoryCode: string): string {
  const category = getCategoryByCode(categoryCode)
  if (!category) return '规格尺寸'
  return category.bFormat
}
