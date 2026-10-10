import { useEffect } from 'react'
import { LogoMark } from '../components/LogoMark'
import { useApp } from '../appContext'

export function Splash() {
  const { navigate } = useApp()

  useEffect(() => {
    const timer = setTimeout(() => navigate({ name: 'home' }), 1800)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <button
      type="button"
      onClick={() => navigate({ name: 'home' })}
      className="flex flex-1 flex-col items-center justify-center gap-5 bg-white px-6 text-center"
    >
      <LogoMark size="lg" />
      <div className="space-y-1">
        <h1 className="m-0 text-2xl font-semibold tracking-wide">硅宠场域</h1>
        <p className="m-0 text-sm uppercase tracking-[0.25em] text-[#171717]/50">silifield</p>
      </div>
      <p className="m-0 text-xs text-[#171717]/40">上海硅宠场域科技有限公司</p>
    </button>
  )
}
