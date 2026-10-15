import { Check } from 'lucide-react'
import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'
import { avatarPresets, getAvatarPreset } from '../avatars'

export function AvatarPickerView() {
  const { navigate, account, updateAccount } = useApp()
  const currentId = account?.avatarId

  function select(id: string) {
    updateAccount({ avatarId: id })
  }

  const preset = getAvatarPreset(currentId)
  const CurrentIcon = preset.icon

  return (
    <>
      <TopBar title="自定义头像" onBack={() => navigate({ name: 'settings' })} />
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 safe-bottom">
        <section className="flex flex-col items-center gap-3 pt-4">
          <span
            className="grid h-24 w-24 place-items-center rounded-full"
            style={{ backgroundColor: preset.bg, color: preset.fg }}
          >
            <CurrentIcon size={44} strokeWidth={1.8} />
          </span>
          <p className="m-0 text-sm font-medium">{preset.label}</p>
          <p className="m-0 text-xs text-[#171717]/45">当前头像 · 点击下方形象立即更换</p>
        </section>

        <section>
          <p className="m-0 px-1 pb-2 text-xs text-[#171717]/45">选择形象</p>
          <div className="grid grid-cols-4 gap-3">
            {avatarPresets.map((item) => {
              const Icon = item.icon
              const selected = item.id === currentId
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => select(item.id)}
                  aria-pressed={selected}
                  aria-label={item.label}
                  className="relative flex flex-col items-center gap-1.5 rounded-lg py-2 hover:bg-[#171717]/4"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full transition ${
                      selected ? 'ring-2 ring-[#171717] ring-offset-2 ring-offset-[#f7f7f8]' : ''
                    }`}
                    style={{ backgroundColor: item.bg, color: item.fg }}
                  >
                    <Icon size={26} strokeWidth={1.8} />
                  </span>
                  <span className="text-[11px] text-[#171717]/60">{item.label}</span>
                  {selected && (
                    <span className="absolute right-1.5 top-1 grid h-4.5 w-4.5 place-items-center rounded-full bg-[#171717] text-white">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <p className="m-0 px-1 text-[11px] leading-5 text-[#171717]/40">
          头像与账号一起保存在本机；选择后立即生效，无需额外确认。
        </p>
      </main>
    </>
  )
}
