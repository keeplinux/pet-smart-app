import { useState } from 'react'
import type { PetWaterSeries, WaterStatPeriod } from '../waterStats'
import { periodTabLabels, periodTicks, waterStatPets } from '../waterStats'

const periods: WaterStatPeriod[] = ['day', 'week', 'month']

export function WaterDataAnalysis() {
  const [period, setPeriod] = useState<WaterStatPeriod>('day')
  const [hiddenPets, setHiddenPets] = useState<Set<string>>(new Set())

  const visiblePets = waterStatPets.filter((pet) => !hiddenPets.has(pet.petId))
  const allValues = visiblePets.flatMap((pet) => pet.series[period])
  const yMax = Math.max(10, Math.ceil(Math.max(...allValues) / 50) * 50)

  function togglePet(petId: string) {
    setHiddenPets((prev) => {
      const next = new Set(prev)
      if (next.has(petId)) {
        next.delete(petId)
      } else {
        next.add(petId)
      }
      return next
    })
  }

  return (
    <section className="py-1">
      <div className="mb-3 flex items-center justify-end">
        <div className="grid grid-cols-3 rounded-lg bg-[#171717]/5 p-0.5 text-xs">
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={`rounded-md px-3 py-1 font-medium ${
                period === item ? 'bg-[#171717] text-white' : 'text-[#171717]/50'
              }`}
            >
              {periodTabLabels[item]}
            </button>
          ))}
        </div>
      </div>

      <WaterChart pets={visiblePets} period={period} yMax={yMax} />

      <div className="mt-3 flex flex-wrap gap-2">
        {waterStatPets.map((pet) => {
          const hidden = hiddenPets.has(pet.petId)
          return (
            <button
              key={pet.petId}
              type="button"
              onClick={() => togglePet(pet.petId)}
              className={`flex items-center gap-2 rounded-lg bg-[#171717]/4 px-3 py-2 text-xs transition ${
                hidden ? 'opacity-40' : ''
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pet.color }} />
              <span className="font-medium">{pet.name}</span>
              <span className="text-[#171717]/50">{formatLiters(totalFor(pet, period))} L</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function WaterChart({
  pets,
  period,
  yMax,
}: {
  pets: PetWaterSeries[]
  period: WaterStatPeriod
  yMax: number
}) {
  const width = 320
  const height = 140
  const padX = 12
  const padTop = 10
  const padBottom = 20
  const innerWidth = width - padX * 2
  const innerHeight = height - padTop - padBottom
  const pointCount = waterStatPets[0].series[period].length
  const ticks = periodTicks[period]
  const slotW = innerWidth / pointCount
  const barGap = 1.5
  const barW = Math.max(
    2,
    Math.min(7, (slotW * 0.72 - barGap * Math.max(0, pets.length - 1)) / Math.max(1, pets.length)),
  )
  const groupW = barW * pets.length + barGap * Math.max(0, pets.length - 1)
  const baseline = padTop + innerHeight

  function slotCenter(index: number) {
    return padX + index * slotW + slotW / 2
  }

  function pointY(value: number) {
    return padTop + innerHeight - (value / yMax) * innerHeight
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${periodTabLabels[period]}期饮水量条形图`}
    >
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={padX}
          x2={width - padX}
          y1={pointY(yMax * fraction)}
          y2={pointY(yMax * fraction)}
          stroke="#171717"
          strokeOpacity={0.08}
        />
      ))}

      <line
        x1={padX}
        x2={width - padX}
        y1={baseline}
        y2={baseline}
        stroke="#171717"
        strokeOpacity={0.12}
      />

      {ticks.indexes.map((index, i) => (
        <text
          key={index}
          x={slotCenter(index)}
          y={height - 6}
          textAnchor="middle"
          fontSize="9"
          fill="#171717"
          fillOpacity="0.45"
        >
          {ticks.labels[i]}
        </text>
      ))}

      {pets.map((pet, petIndex) => (
        <g key={pet.petId}>
          {pet.series[period].map((value, i) => {
            if (value <= 0) {
              return null
            }
            const barH = Math.max((value / yMax) * innerHeight, 1.5)
            const x = padX + i * slotW + (slotW - groupW) / 2 + petIndex * (barW + barGap)
            return (
              <rect
                key={i}
                x={x}
                y={baseline - barH}
                width={barW}
                height={barH}
                rx={Math.min(1.5, barW / 2)}
                fill={pet.color}
              />
            )
          })}
        </g>
      ))}
    </svg>
  )
}

function totalFor(pet: PetWaterSeries, period: WaterStatPeriod) {
  return pet.series[period].reduce((sum, value) => sum + value, 0)
}

/** 毫升转升展示：大数值保留 1 位小数，小数值保留 2 位 */
function formatLiters(ml: number) {
  const liters = ml / 1000
  return liters >= 10 ? liters.toFixed(1) : liters.toFixed(2)
}
