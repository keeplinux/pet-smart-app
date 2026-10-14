import type { DeviceKind, Product } from './nav'

export const products: Product[] = [
  {
    id: 'smart-feeder',
    name: '智能投食机',
    category: '喂食',
    description: '定时定量投喂、远程控制',
    image: '/products/smart-feeder.svg',
  },
  {
    id: 'auto-litter',
    name: '自动猫砂盆',
    category: '清洁',
    description: '自动清洁、除臭抑菌',
    image: '/products/auto-litter.svg',
  },
  {
    id: 'smart-water',
    name: '饮水舱',
    category: '饮水',
    description: '流动活水、滤芯提醒',
    image: '/products/smart-water.svg',
  },
  {
    id: 'pet-camera',
    name: '宠物摄像头',
    category: '看护',
    description: '高清监控、双向语音',
    image: '/products/pet-camera.svg',
  },
  {
    id: 'pet-tracker',
    name: '宠物定位器',
    category: '安全',
    description: '实时定位、防走失',
    image: '/products/pet-tracker.svg',
  },
]

export function kindForProduct(productId: string): DeviceKind {
  switch (productId) {
    case 'smart-feeder':
      return 'feeder'
    case 'auto-litter':
      return 'litter'
    case 'smart-water':
      return 'water'
    case 'pet-camera':
      return 'camera'
    case 'pet-tracker':
      return 'tracker'
    default:
      return 'generic'
  }
}
