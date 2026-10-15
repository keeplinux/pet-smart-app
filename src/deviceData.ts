import type { Pet } from './nav'
import { buildWaterStatPets, dayTotal } from './waterStats'

export type SmartWaterDeviceData = {
  name: string
  online: boolean
  location: string
  todayWaterMl: number
  bottleEquivalent: number
  waterLevelPercent: number
  waterLevelText: string
  waterTemperatureC: number
  waterTemperatureText: string
  waterQualityPercent: number
  waterQualityText: string
  flowEnabled: boolean
  lightEnabled: boolean
}

/**
 * 按实际录入的宠物生成饮水舱数据：
 * 当日饮水量 = 各宠物日序列合计（与图表数据同源，0 只宠物时为 0）；
 * 水量/水温/水质为设备侧读数，与宠物无关。
 */
export function buildSmartWaterData(pets: Pet[]): SmartWaterDeviceData {
  const statPets = buildWaterStatPets(pets)
  const todayWaterMl = statPets.reduce((sum, pet) => sum + dayTotal(pet), 0)
  return {
    name: '饮水舱',
    online: true,
    location: '客厅',
    todayWaterMl,
    bottleEquivalent: Math.round((todayWaterMl / 250) * 10) / 10,
    waterLevelPercent: 85,
    waterLevelText: '充足',
    waterTemperatureC: 26.5,
    waterTemperatureText: '适宜',
    waterQualityPercent: 96,
    waterQualityText: '健康',
    flowEnabled: true,
    lightEnabled: true,
  }
}
