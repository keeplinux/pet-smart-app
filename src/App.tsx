import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AppContext } from './appContext'
import type { AppApi } from './appContext'
import { clearStoredAccount, readStoredAccount, storeAccount } from './auth'
import type { Account, Device, DeviceInput, Pet, View } from './nav'
import { buildDevice } from './provisioning'
import { clearStoredDevices, readStoredDevices, storeDevices } from './storage'
import { DeviceView } from './views/Device'
import { Home } from './views/Home'
import { HotspotBindView } from './views/HotspotBind'
import { Mall } from './views/Mall'
import { PetCapture } from './views/PetCapture'
import { PurchaseView } from './views/Purchase'
import { ScanView } from './views/Scan'
import { SettingsView } from './views/Settings'
import { Splash } from './views/Splash'

const initialDevices: Device[] = [
  buildDevice({
    productId: 'smart-water',
    sn: 'PF24050007',
    mac: 'A4:C1:38:2B:71:0C',
    wifiSsid: 'Silifield-Office',
    status: 'bound',
    source: 'scan',
  }),
]

function renderView(view: View): ReactNode {
  switch (view.name) {
    case 'splash':
      return <Splash />
    case 'home':
      return <Home />
    case 'mall':
      return <Mall />
    case 'purchase':
      return <PurchaseView productId={view.productId} />
    case 'scan':
      return <ScanView />
    case 'hotspot':
      return <HotspotBindView />
    case 'provision':
      return <ScanView initialPayload={view.payload} source={view.source} />
    case 'settings':
      return <SettingsView />
    case 'device':
      return <DeviceView deviceId={view.deviceId} />
    case 'petCapture':
      return <PetCapture />
    default:
      return <Home />
  }
}

function App() {
  const [account, setAccount] = useState<Account | null>(() => readStoredAccount())
  const [view, setView] = useState<View>(() => (readStoredAccount() ? { name: 'home' } : { name: 'splash' }))
  const [devices, setDevices] = useState<Device[]>(() => readStoredDevices(initialDevices))
  const [pets, setPets] = useState<Pet[]>([])

  const navigate = useCallback((next: View) => setView(next), [])

  const addDevice = useCallback((input: DeviceInput) => {
    setDevices((prev) => {
      const index = prev.findIndex((device) => device.sn === input.sn)
      if (index === -1) {
        return [...prev, buildDevice(input)]
      }
      const current = prev[index]
      // 已配网设备不会被保底探测降级为待配网
      if (current.status === 'bound' && input.status === 'pending') {
        return prev
      }
      if (
        current.status === input.status &&
        current.wifiSsid === input.wifiSsid &&
        current.source === input.source
      ) {
        return prev
      }
      const next = [...prev]
      next[index] = { ...buildDevice(input), boundAt: current.boundAt }
      return next
    })
  }, [])

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId))
  }, [])

  const addPet = useCallback((next: Pet) => {
    setPets((prev) => [...prev, next])
  }, [])

  const signIn = useCallback((next: Account) => {
    storeAccount(next)
    setAccount(next)
    setView({ name: 'home' })
  }, [])

  const signOut = useCallback(() => {
    clearStoredAccount()
    clearStoredDevices()
    setAccount(null)
    setView({ name: 'splash' })
  }, [])

  // 配网结果持久化，刷新后绑定关系不丢失
  useEffect(() => {
    storeDevices(devices)
  }, [devices])

  const api = useMemo<AppApi>(
    () => ({
      view,
      navigate,
      devices,
      addDevice,
      removeDevice,
      pets,
      addPet,
      account,
      signIn,
      signOut,
    }),
    [view, navigate, devices, addDevice, removeDevice, pets, addPet, account, signIn, signOut],
  )

  return (
    <AppContext.Provider value={api}>
      <div className="relative flex h-dvh flex-col bg-[#f7f7f8] text-[#171717]">
        {renderView(view)}
      </div>
    </AppContext.Provider>
  )
}

export default App
