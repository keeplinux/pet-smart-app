import type { ReactNode } from 'react'
import { Globe, QrCode, Radar } from 'lucide-react'
import { useApp } from '../appContext'
import { HomeScene } from '../components/HomeScene'
import { LogoMark } from '../components/LogoMark'

export function Home() {
  const { navigate, devices, pets } = useApp()

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0">
        <HomeScene
          petCount={pets.length > 0 ? pets.length : 1}
          devices={devices}
          onCatClick={() => navigate({ name: 'petCapture' })}
          onDeviceClick={(deviceId) => navigate({ name: 'device', deviceId })}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-linear-to-b from-black/40 to-transparent" />
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="text-sm font-semibold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
            硅宠场域
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate({ name: 'scan' })}
          className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
        >
          <QrCode size={16} /> 扫码
        </button>
      </header>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28 bg-linear-to-t from-black/50 to-transparent" />
      <BottomNav />
    </div>
  )
}

function BottomNav() {
  const { navigate } = useApp()
  return (
    <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-10 grid grid-cols-2">
      <NavButton
        icon={<Radar size={20} />}
        title="探针"
        onClick={() => navigate({ name: 'mall' })}
      />
      <NavButton
        icon={<Globe size={20} strokeWidth={1.8} />}
        title="母舰"
        onClick={() => navigate({ name: 'settings' })}
      />
    </nav>
  )
}

function NavButton({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode
  title: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pointer-events-auto flex flex-col items-center gap-1.5 py-4 text-white hover:bg-white/10"
    >
      <span className="text-white">{icon}</span>
      <span className="text-sm font-medium">{title}</span>
    </button>
  )
}
