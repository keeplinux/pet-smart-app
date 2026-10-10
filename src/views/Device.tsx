import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Camera, Pause, Play, Video } from 'lucide-react'
import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'
import { WaterDataAnalysis } from '../components/WaterDataAnalysis'
import { smartWaterDeviceData as data } from '../deviceData'

type CameraClip = {
  id: string
  title: string
  time: string
  duration: number
}

const cameraClips: CameraClip[] = [
  { id: 'c1', title: '早餐饮水', time: '今天 08:12', duration: 24 },
  { id: 'c2', title: '清晨饮水', time: '今天 06:47', duration: 18 },
  { id: 'c3', title: '晚间饮水', time: '昨天 21:05', duration: 31 },
  { id: 'c4', title: '午后饮水', time: '昨天 15:30', duration: 22 },
]

export function DeviceView({ deviceId }: { deviceId: string }) {
  const { navigate, devices } = useApp()
  const device = devices.find((item) => item.id === deviceId)
  const [flowMode, setFlowMode] = useState(data.flowMode)

  if (!device) {
    return (
      <>
        <TopBar title="设备" onBack={() => navigate({ name: 'home' })} />
        <main className="flex flex-1 items-center justify-center p-4">
          <p className="m-0 text-sm text-[#171717]/45">设备不存在</p>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar title={device.name} onBack={() => navigate({ name: 'home' })} />
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            device.online ? 'bg-[#171717] text-white' : 'bg-[#171717]/10'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${device.online ? 'bg-emerald-400' : 'bg-[#171717]/30'}`} />
          {device.online
            ? device.kind === 'water'
              ? `在线 · ${data.probeStatus}`
              : '在线'
            : '离线'}
        </div>

        {device.kind === 'water' ? (
          <>
            <WaterDataAnalysis />

            <div className="grid grid-cols-4 gap-2">
              <Metric label="今日饮水量" value={`${data.todayWaterMl}`} sub="ml" />
              <Metric label="水量" value={`${data.waterLevelPercent}%`} sub={data.waterLevelText} />
              <Metric
                label="水温"
                value={`${data.waterTemperatureC}°C`}
                sub={data.waterTemperatureText}
              />
              <Metric
                label="水质健康度"
                value={`${data.waterQualityPercent}%`}
                sub={data.waterQualityText}
              />
            </div>

            <section className="rounded-lg border border-[#171717]/10 bg-white p-2">
              <InfoRow label="探针运行状态" value={data.probeStatus} />
              <FlowModeRow value={flowMode} onChange={setFlowMode} />
              <InfoRow label="灯光" value={data.lightMode} />
            </section>

            <CameraSection />
          </>
        ) : (
          <section className="rounded-lg border border-[#171717]/10 bg-white p-4">
            <p className="m-0 text-sm font-medium">控制界面待接入</p>
            <p className="m-0 mt-1 text-xs text-[#171717]/45">
              {device.name} 的控制功能将在后续版本提供
            </p>
          </section>
        )}
      </main>
    </>
  )
}

function CameraSection() {
  const [tab, setTab] = useState<'live' | 'history'>('live')
  const [selectedClip, setSelectedClip] = useState<CameraClip | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!playing || !selectedClip) return
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1
        if (next >= selectedClip.duration) {
          setPlaying(false)
          return selectedClip.duration
        }
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [playing, selectedClip])

  function togglePlayback() {
    if (!selectedClip) return
    if (progress >= selectedClip.duration) {
      setProgress(0)
      setPlaying(true)
      return
    }
    setPlaying((value) => !value)
  }

  return (
    <section className="rounded-lg border border-[#171717]/10 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-sm font-semibold">摄像头</h2>
        <div className="grid grid-cols-2 rounded-lg border border-[#171717]/10 p-0.5 text-xs">
          <TabButton active={tab === 'live'} onClick={() => setTab('live')}>
            实时
          </TabButton>
          <TabButton active={tab === 'history'} onClick={() => setTab('history')}>
            回放
          </TabButton>
        </div>
      </div>

      {tab === 'live' ? (
        <LiveView />
      ) : (
        <HistoryView
          clips={cameraClips}
          selectedClip={selectedClip}
          playing={playing}
          progress={progress}
          onSelect={(clip) => {
            setSelectedClip(clip)
            setProgress(0)
            setPlaying(false)
          }}
          onTogglePlay={togglePlayback}
        />
      )}
    </section>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 font-medium ${
        active ? 'bg-[#171717] text-white' : 'text-[#171717]/50'
      }`}
    >
      {children}
    </button>
  )
}

function LiveView() {
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[#171717]">
      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#171717]">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> 实时
      </span>
      <Camera size={38} className="text-white/60" />
    </div>
  )
}

function HistoryView({
  clips,
  selectedClip,
  playing,
  progress,
  onSelect,
  onTogglePlay,
}: {
  clips: CameraClip[]
  selectedClip: CameraClip | null
  playing: boolean
  progress: number
  onSelect: (clip: CameraClip) => void
  onTogglePlay: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-[#171717]">
        {selectedClip ? (
          <>
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#171717]">
              {selectedClip.title}
            </span>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={playing ? '暂停' : '播放'}
              className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#171717]"
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            <div className="absolute inset-x-3 bottom-3">
              <div className="h-1 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${selectedClip.duration ? (progress / selectedClip.duration) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-white/80">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(selectedClip.duration)}</span>
              </div>
            </div>
          </>
        ) : (
          <Video size={32} className="text-white/50" />
        )}
      </div>

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {clips.map((clip) => (
          <li key={clip.id}>
            <button
              type="button"
              onClick={() => onSelect(clip)}
              className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                selectedClip?.id === clip.id
                  ? 'border-[#171717] bg-[#171717]/3'
                  : 'border-[#171717]/10 bg-white'
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#171717]/5">
                <Play size={15} fill="currentColor" className="ml-0.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{clip.title}</span>
                <span className="block text-xs text-[#171717]/45">
                  {clip.time} · {clip.duration} 秒
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const rest = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${rest}`
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[#171717]/10 bg-white p-2.5">
      <p className="m-0 text-[10px] text-[#171717]/45">{label}</p>
      <p className="m-0 mt-1 text-sm font-semibold leading-none">{value}</p>
      {sub && <p className="m-0 mt-1 text-[10px] text-[#171717]/50">{sub}</p>}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-3">
      <span className="text-sm text-[#171717]/60">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

const flowModes = ['持续流动', '感应流动', '不流动']

function FlowModeRow({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-3">
      <span className="shrink-0 text-sm text-[#171717]/60">出水方式</span>
      <div className="grid grid-cols-3 rounded-lg border border-[#171717]/10 p-0.5 text-xs">
        {flowModes.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`rounded-md px-2 py-1 font-medium ${
              value === mode ? 'bg-[#171717] text-white' : 'text-[#171717]/50'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  )
}
