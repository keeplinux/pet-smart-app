export type WaterStatPeriod = 'day' | 'week' | 'month'

export type PetWaterSeries = {
  petId: string
  name: string
  color: string
  series: Record<WaterStatPeriod, number[]>
}

export const waterStatPets: PetWaterSeries[] = [
  {
    petId: 'p1',
    name: '糯米',
    color: '#f59e0b',
    series: {
      day: [0, 0, 8, 15, 22, 40, 52, 65, 58, 38, 28, 20, 14, 10, 12, 18, 25, 34, 46, 60, 52, 32, 14, 5],
      week: [360, 430, 410, 480, 445, 520, 500],
      month: [
        320, 355, 340, 380, 410, 395, 420, 445, 430, 460, 475, 450, 440, 465, 480, 495, 470, 460,
        485, 500, 510, 490, 480, 505, 515, 500, 510, 525, 520, 535,
      ],
    },
  },
  {
    petId: 'p2',
    name: '团子',
    color: '#0d9488',
    series: {
      day: [0, 0, 4, 10, 16, 28, 40, 48, 44, 26, 18, 14, 10, 6, 8, 14, 18, 26, 36, 46, 40, 26, 10, 3],
      week: [280, 330, 310, 360, 335, 390, 370],
      month: [
        260, 280, 270, 300, 320, 305, 330, 350, 340, 360, 370, 355, 345, 365, 380, 390, 375, 365,
        385, 395, 400, 385, 375, 395, 405, 395, 405, 415, 410, 420,
      ],
    },
  },
]

export const periodTabLabels: Record<WaterStatPeriod, string> = {
  day: '日',
  week: '周',
  month: '月',
}

export const periodTicks: Record<WaterStatPeriod, { indexes: number[]; labels: string[] }> = {
  day: {
    indexes: [0, 3, 6, 9, 12, 15, 18, 21],
    labels: ['0', '3', '6', '9', '12', '15', '18', '21'],
  },
  week: {
    indexes: [0, 1, 2, 3, 4, 5, 6],
    labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  },
  month: {
    indexes: [0, 5, 10, 15, 20, 25, 29],
    labels: ['1', '6', '11', '16', '21', '26', '30'],
  },
}
