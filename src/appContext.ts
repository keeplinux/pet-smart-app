import { createContext, useContext } from 'react'
import type { Account, Device, DeviceInput, Pet, View } from './nav'

export type AppApi = {
  view: View
  navigate: (view: View) => void
  devices: Device[]
  /** 按 sn 新增或更新设备 */
  addDevice: (input: DeviceInput) => void
  removeDevice: (deviceId: string) => void
  pets: Pet[]
  addPet: (pet: Pet) => void
  account: Account | null
  signIn: (account: Account) => void
  signOut: () => void
}

export const AppContext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider')
  }
  return ctx
}
