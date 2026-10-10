import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Camera, Image as ImageIcon, Sparkles, Upload } from 'lucide-react'
import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'

export function PetCapture() {
  const { navigate, addPet } = useApp()
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  function submit() {
    addPet({ name: '我的宠物', imageUrl: preview })
    navigate({ name: 'home' })
  }

  function demoAdd() {
    addPet({ name: '演示宠物', imageUrl: null })
    navigate({ name: 'home' })
  }

  return (
    <>
      <TopBar title="录入宠物数字形象" onBack={() => navigate({ name: 'home' })} />
      <main className="flex flex-1 flex-col items-center gap-4 overflow-y-auto p-4">
        <div className="flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#171717]/20 bg-white">
          {preview ? (
            <img src={preview} alt="宠物预览" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-[#171717]/45">暂无预览</span>
          )}
        </div>

        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium hover:bg-[#171717]/3"
          >
            <Camera size={18} /> 拍照
          </button>
          <button
            type="button"
            onClick={() => albumRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium hover:bg-[#171717]/3"
          >
            <ImageIcon size={18} /> 相册
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
        <input ref={albumRef} type="file" accept="image/*" hidden onChange={handleFile} />

        <button
          type="button"
          disabled={!preview}
          onClick={submit}
          className={`flex w-full max-w-sm items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition ${
            preview
              ? 'bg-[#171717] text-white hover:bg-[#171717]/85'
              : 'cursor-not-allowed bg-[#171717]/10 text-[#171717]/40'
          }`}
        >
          <Upload size={18} /> 上传并开始构建
        </button>

        <button
          type="button"
          onClick={demoAdd}
          className="flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium hover:bg-[#171717]/3"
        >
          <Sparkles size={18} /> Demo 录入
        </button>
      </main>
    </>
  )
}
