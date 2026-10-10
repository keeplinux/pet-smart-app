import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AppContext } from './appContext'
import type { AppApi } from './appContext'
import { kindForProduct } from './catalog'
import type { Device, Pet, Product, View } from './nav'
import { DeviceView } from './views/Device'
import { Home } from './views/Home'
import { Mall } from './views/Mall'
import { PetCapture } from './views/PetCapture'
import { PurchaseView } from './views/Purchase'
import { ScanView } from './views/Scan'
import { SettingsView } from './views/Settings'
import { Splash } from './views/Splash'

const initialDevices: Device[] = [
  { id: 'water-1', kind: 'water', productId: 'smart-water', name: '宠物暖泉', online: true },
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
  const [view, setView] = useState<View>({ name: 'splash' })
  const [devices, setDevices] = useState<Device[]>(initialDevices)
  const [pets, setPets] = useState<Pet[]>([])

  const navigate = useCallback((next: View) => setView(next), [])

  const addDevice = useCallback((product: Product) => {
    setDevices((prev) => {
      if (prev.some((device) => device.productId === product.id)) {
        return prev
      }
      const device: Device = {
        id: `${product.id}-${Date.now()}`,
        kind: kindForProduct(product.id),
        productId: product.id,
        name: product.name,
        online: true,
      }
      return [...prev, device]
    })
  }, [])

  const removeDevice = useCallback((deviceId: string) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId))
  }, [])

  const addPet = useCallback((next: Pet) => {
    setPets((prev) => [...prev, next])
  }, [])

  const api = useMemo<AppApi>(
    () => ({ view, navigate, devices, addDevice, removeDevice, pets, addPet }),
    [view, navigate, devices, addDevice, removeDevice, pets, addPet],
  )

  return (
    <AppContext.Provider value={api}>
      <div className="flex h-dvh flex-col bg-[#f7f7f8] text-[#171717]">
        {renderView(view)}
      </div>
    </AppContext.Provider>
  )
}

export default App
