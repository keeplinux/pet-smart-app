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

export const smartWaterDeviceData: SmartWaterDeviceData = {
  name: '饮水舱',
  online: true,
  location: '客厅',
  todayWaterMl: 850,
  bottleEquivalent: 3.4,
  waterLevelPercent: 85,
  waterLevelText: '充足',
  waterTemperatureC: 26.5,
  waterTemperatureText: '适宜',
  waterQualityPercent: 96,
  waterQualityText: '健康',
  flowEnabled: true,
  lightEnabled: true,
}
