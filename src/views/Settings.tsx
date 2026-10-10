import { useState } from 'react'
import { Bell, Info, LogOut, Trash2, User } from 'lucide-react'
import { useApp } from '../appContext'
import { TopBar } from '../components/TopBar'

export function SettingsView() {
  const { navigate, devices, removeDevice, pets } = useApp()
  const [notifications, setNotifications] = useState(true)

  return (
    <>
      <TopBar title="设置" onBack={() => navigate({ name: 'home' })} />
      <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <section className="flex items-center gap-3 rounded-lg border border-[#171717]/10 bg-white p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#171717]/5">
            <User size={20} />
          </span>
          <div>
            <p className="m-0 text-sm font-medium">用户账号</p>
            <p className="m-0 text-xs text-[#171717]/45">
              {pets.length > 0 ? `已录入宠物：${pets.length} 只` : '未录入宠物数字形象'}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-[#171717]/10 bg-white p-2">
          <button
            type="button"
            role="switch"
            aria-checked={notifications}
            onClick={() => setNotifications((value) => !value)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-[#171717]/3"
          >
            <span className="flex items-center gap-3">
              <Bell size={18} />
              <span className="text-sm font-medium">消息通知</span>
            </span>
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                notifications ? 'bg-[#171717]' : 'bg-[#171717]/20'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  notifications ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>
        </section>

        <section className="rounded-lg border border-[#171717]/10 bg-white p-2">
          <p className="px-3 pt-2 text-xs text-[#171717]/45">设备管理</p>
          {devices.length === 0 ? (
            <p className="px-3 pb-3 text-sm text-[#171717]/45">暂无设备</p>
          ) : (
            devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between rounded-lg px-3 py-3"
              >
                <span className="text-sm font-medium">{device.name}</span>
                <button
                  type="button"
                  onClick={() => removeDevice(device.id)}
                  aria-label={`移除 ${device.name}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-[#171717]/50 hover:bg-[#171717]/8 hover:text-[#171717]"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </section>

        <section className="rounded-lg border border-[#171717]/10 bg-white p-4">
          <p className="m-0 flex items-center gap-2 text-sm font-medium">
            <Info size={18} /> 关于
          </p>
          <p className="m-0 mt-2 text-xs leading-5 text-[#171717]/50">
            品牌：硅宠场域 silifield
          </p>
          <p className="m-0 text-xs leading-5 text-[#171717]/50">
            公司：上海硅宠场域科技有限公司
          </p>
        </section>

        <button
          type="button"
          onClick={() => navigate({ name: 'splash' })}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-[#171717]/15 bg-white py-3 text-sm font-medium text-[#b3261e] hover:bg-[#b3261e]/5"
        >
          <LogOut size={17} /> 退出登录
        </button>
      </main>
    </>
  )
}
