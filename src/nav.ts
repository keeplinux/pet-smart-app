export type View =
  | { name: 'splash' }
  | { name: 'home' }
  | { name: 'mall' }
  | { name: 'purchase'; productId: string }
  | { name: 'scan' }
  | { name: 'hotspot' }
  | { name: 'provision'; payload: QrPayload; source: ProvisionSource }
  | { name: 'settings' }
  | { name: 'avatarPicker' }
  | { name: 'device'; deviceId: string }
  | { name: 'petCapture' }

export type AccountMethod = 'phone' | 'wechat'

export type Account = {
  id: string
  method: AccountMethod
  identifier: string
  /** 用户资料头像（预设形象 id），见 src/avatars.ts */
  avatarId?: string
}

export type DeviceKind = 'water' | 'feeder' | 'litter' | 'camera' | 'tracker' | 'generic'

/** 设备绑定来源：scan 扫码配网；hotspot 保底热点配网 */
export type ProvisionSource = 'scan' | 'hotspot'

/**
 * bound：已完成配网并绑定
 * pending：通过保底热点发现，等待用户手动配网
 */
export type DeviceStatus = 'bound' | 'pending'

export type Device = {
  id: string
  kind: DeviceKind
  productId: string
  name: string
  online: boolean
  /** 设备序列号，绑定的唯一键 */
  sn: string
  /** 设备 BLE MAC，用于在扫描结果中精确定位这一台 */
  mac: string
  /** 配网成功后设备接入的 WiFi 名称 */
  wifiSsid: string | null
  source: ProvisionSource
  status: DeviceStatus
  /** 绑定时间戳 */
  boundAt: number
}

/** 新增 / 更新设备的输入，按 sn 去重 */
export type DeviceInput = {
  productId: string
  sn: string
  mac: string
  wifiSsid: string | null
  status: DeviceStatus
  source: ProvisionSource
}

/** 产品机身二维码中携带的设备信息 */
export type QrPayload = {
  productId: string
  sn: string
  mac: string
  /** 设备绑定令牌，同时用于 BLE 会话与热点会话的设备鉴权 */
  token: string
}

export type Product = {
  id: string
  name: string
  category: string
  description: string
  image: string
}

export type Pet = {
  name: string
  imageUrl: string | null
}
