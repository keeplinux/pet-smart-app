import { useRef, useState } from 'react'
import { Camera, Check, QrCode, ScanLine } from 'lucide-react'
import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'
import { products } from '../catalog'
import type { Product } from '../nav'

const demoProduct = products.find((product) => product.id === 'smart-feeder') ?? products[0]

export function ScanView() {
  const { navigate, devices, addDevice } = useApp()
  const cameraRef = useRef<HTMLInputElement>(null)
  const [result, setResult] = useState<Product | null>(null)
  const owned = result ? devices.some((device) => device.productId === result.id) : false

  function handleFile() {
    setResult(demoProduct)
  }

  function confirmAdd() {
    if (!result) return
    addDevice(result)
    navigate({ name: 'home' })
  }

  return (
    <>
      <TopBar title="扫码添加设备" onBack={() => navigate({ name: 'home' })} />
      <main className="flex flex-1 flex-col items-center gap-4 overflow-y-auto p-4">
        <div className="relative flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-lg bg-[#171717]">
          <QrCode size={64} className="text-white/35" />
          <span className="absolute inset-x-8 top-1/2 h-px bg-white/40" />
          {result && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[#171717]">
              已识别
            </span>
          )}
        </div>

        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium hover:bg-[#171717]/3"
          >
            <Camera size={18} /> 相机扫码
          </button>
          <button
            type="button"
            onClick={() => setResult(demoProduct)}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium hover:bg-[#171717]/3"
          >
            <ScanLine size={18} /> 模拟识别
          </button>
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleFile}
        />

        {result && (
          <section className="w-full max-w-sm rounded-lg border border-[#171717]/10 bg-white p-4">
            <p className="m-0 text-sm font-semibold">{result.name}</p>
            <p className="m-0 mt-1 text-xs text-[#171717]/45">{result.description}</p>
            <button
              type="button"
              onClick={confirmAdd}
              disabled={owned}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                owned
                  ? 'cursor-default bg-[#171717]/5 text-[#171717]/40'
                  : 'bg-[#171717] text-white hover:bg-[#171717]/85'
              }`}
            >
              {owned ? <Check size={16} /> : <QrCode size={16} />}
              {owned ? '已添加' : '添加设备'}
            </button>
          </section>
        )}
      </main>
    </>
  )
}
