import { createContext, useContext } from 'react'
import type { Device, Pet, Product, View } from './nav'

export type AppApi = {
  view: View
  navigate: (view: View) => void
  devices: Device[]
  addDevice: (product: Product) => void
  removeDevice: (deviceId: string) => void
  pets: Pet[]
  addPet: (pet: Pet) => void
}

export const AppContext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider')
  }
  return ctx
}
