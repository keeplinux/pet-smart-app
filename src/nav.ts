export type View =
  | { name: 'splash' }
  | { name: 'home' }
  | { name: 'mall' }
  | { name: 'purchase'; productId: string }
  | { name: 'scan' }
  | { name: 'settings' }
  | { name: 'device'; deviceId: string }
  | { name: 'petCapture' }

export type DeviceKind = 'water' | 'feeder' | 'litter' | 'camera' | 'tracker' | 'generic'

export type Device = {
  id: string
  kind: DeviceKind
  productId: string
  name: string
  online: boolean
}

export type Product = {
  id: string
  name: string
  category: string
  description: string
  image: string
}

export type Pet = {
  name: string
  imageUrl: string | null
}
