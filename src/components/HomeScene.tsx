import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Device, DeviceKind } from '../nav'

const PLANET_RADIUS = 2.4
const UP_VECTOR = new THREE.Vector3(0, 1, 0)

/** 初始默认视角：45° 斜俯视，海平面构图（用户可用拖动/缩放覆盖并自动记忆） */
const DEFAULT_CAMERA = { x: 0, y: 5.6, z: 5.6 }
const VIEW_STORAGE_KEY = 'pet-smart-app:home-view'
const MAX_DISTANCE = 9.6
const COMPOSE_FACTOR = 0.192

const catColors = ['#e08a4e', '#7f9cf5', '#b47ad4', '#5bb5a0']

const catStart: [number, number][] = [
  [4.55, 0.52],
  [2.2, 1.7],
  [3.8, 1.1],
  [4.9, 1.9],
]

// 设备落位（球面角 theta/phi）。饮水舱固定在星球轮廓线（海平面）上，
// 初始 45° 视角下恰好处在画面 30% 高度处的地平线附近；其余设备围绕分布。
const deviceSpherical: Record<DeviceKind, [number, number]> = {
  water: [4.3, 0.6],
  feeder: [2.8, 1.6],
  litter: [4.3, 1.4],
  camera: [5.6, 1.55],
  tracker: [0.7, 1.75],
  generic: [3.5, 1.2],
}

const drinkTheta = 4.3
const drinkPhi = 0.6

type BehaviorMode = 'idle' | 'walk' | 'run' | 'drink' | 'sleep'

type Behavior = {
  mode: BehaviorMode
  timer: number
  targetTheta: number
  targetPhi: number
  arriveMode: BehaviorMode | null
}

type CatRig = {
  group: THREE.Group
  head: THREE.Object3D
  behavior: Behavior
  index: number
  theta: number
  phi: number
  yaw: number
  tilt: number
}

type SceneState = {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  contentGroup: THREE.Group
  cats: CatRig[]
  deviceGroups: THREE.Object3D[]
  hasWater: boolean
}

export function HomeScene({
  petCount,
  devices,
  onCatClick,
  onDeviceClick,
}: {
  petCount: number
  devices: Device[]
  onCatClick: () => void
  onDeviceClick: (deviceId: string) => void
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneState | null>(null)
  const onCatClickRef = useRef(onCatClick)
  const onDeviceClickRef = useRef(onDeviceClick)

  useEffect(() => {
    onCatClickRef.current = onCatClick
    onDeviceClickRef.current = onDeviceClick
  }, [onCatClick, onDeviceClick])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      45,
      (mount.clientWidth || 320) / (mount.clientHeight || 480),
      0.1,
      100,
    )
    // 45° 斜俯视看向星球中心；若用户此前调整过视角（自动记忆），直接恢复其最优视角
    const savedView = readSavedView()
    if (savedView) {
      camera.position.set(savedView.x, savedView.y, savedView.z)
    } else {
      camera.position.set(DEFAULT_CAMERA.x, DEFAULT_CAMERA.y, DEFAULT_CAMERA.z)
    }
    // 构图锚定距离：默认视角或恢复视角下的相机到球心距离
    const composeAnchor = camera.position.length()

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(8, 6, 5)
    scene.add(sun)

    const staticGroup = new THREE.Group()
    staticGroup.add(createStars())
    staticGroup.add(createPlanet())
    scene.add(staticGroup)

    const contentGroup = new THREE.Group()
    scene.add(contentGroup)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    controls.enablePan = false
    // 灵敏度收紧：轻滑不会一下转到很远的视角
    controls.rotateSpeed = 0.45
    controls.zoomSpeed = 0.6
    controls.minDistance = 4.6
    controls.maxDistance = MAX_DISTANCE

    // 用户调整结束后（等阻尼惯性动画稳定）自动记忆视角，
    // 之后每次打开 App 都以其最优视角作为默认视角
    let saveViewTimer = 0
    controls.addEventListener('end', () => {
      window.clearTimeout(saveViewTimer)
      saveViewTimer = window.setTimeout(() => {
        saveView(camera.position)
      }, 800)
    })

    const raycaster = new THREE.Raycaster()
    let downX = 0
    let downY = 0

    function handlePointerDown(event: PointerEvent) {
      downX = event.clientX
      downY = event.clientY
    }

    function handleClick(event: MouseEvent) {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(pointer, camera)
      const state = sceneRef.current
      if (!state) return
      const targets = [...state.cats.map((cat) => cat.group), ...state.deviceGroups]
      const hits = raycaster.intersectObjects(targets, true)
      if (hits.length === 0) return
      const deviceId = findDeviceId(hits[0].object)
      if (deviceId) {
        onDeviceClickRef.current(deviceId)
        return
      }
      if (findCat(hits[0].object)) {
        onCatClickRef.current()
      }
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)
    renderer.domElement.addEventListener('click', handleClick)

    // 动态构图：默认距离下视口向上取景约 19%（顶部星空约占 30%、海平面构图），
    // 拉远时 offset 随距离线性衰减，缩到 MAX_DISTANCE（最远）时星球完全居中；
    // 旋转轴（OrbitControls target）始终锚定星球中心，与取景偏移互不干扰
    const applyCompose = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      const dist = camera.position.distanceTo(controls.target)
      const span = Math.max(0.001, MAX_DISTANCE - composeAnchor)
      const ratio = THREE.MathUtils.clamp((MAX_DISTANCE - dist) / span, 0, 1)
      camera.setViewOffset(width, height, 0, -height * COMPOSE_FACTOR * ratio, width, height)
    }

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      applyCompose()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    requestAnimationFrame(resize)

    let lastTime = performance.now()
    renderer.setAnimationLoop(() => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - lastTime) / 1000)
      lastTime = now
      const state = sceneRef.current
      if (state) {
        const time = now / 1000
        state.cats.forEach((cat) => updateCat(cat, dt, time, state.hasWater))
      }
      controls.update()
      applyCompose()
      renderer.render(scene, camera)
    })

    sceneRef.current = {
      renderer,
      scene,
      camera,
      controls,
      contentGroup,
      cats: [],
      deviceGroups: [],
      hasWater: false,
    }

    return () => {
      renderer.setAnimationLoop(null)
      window.clearTimeout(saveViewTimer)
      controls.dispose()
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      renderer.domElement.removeEventListener('click', handleClick)
      disposeObject(staticGroup)
      disposeObject(contentGroup)
      renderer.dispose()
      sceneRef.current = null
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    const state = sceneRef.current
    if (!state) return

    disposeObject(state.contentGroup)
    state.contentGroup.clear()

    const cats: CatRig[] = []
    const catCount = Math.max(1, petCount)
    for (let i = 0; i < catCount; i++) {
      const cat = createCat(catColors[i % catColors.length], i)
      cats.push(cat)
      state.contentGroup.add(cat.group)
    }

    const deviceGroups: THREE.Object3D[] = []
    // 同型号多台设备时按顺序错开角度，避免模型完全重叠
    const kindCounters = new Map<DeviceKind, number>()
    devices.forEach((device) => {
      const model = createDeviceModel(device.kind)
      const [baseTheta, basePhi] = deviceSpherical[device.kind] ?? [3.5, 1.2]
      const offset = kindCounters.get(device.kind) ?? 0
      kindCounters.set(device.kind, offset + 1)
      placeOnPlanet(model, baseTheta + offset * 0.42, basePhi + (offset % 2) * 0.2)
      model.userData.deviceId = device.id
      deviceGroups.push(model)
      state.contentGroup.add(model)
    })

    state.cats = cats
    state.deviceGroups = deviceGroups
    state.hasWater = devices.some((device) => device.kind === 'water')
  }, [petCount, devices])

  return <div ref={mountRef} className="h-full w-full" />
}

function updateCat(cat: CatRig, dt: number, time: number, hasWater: boolean) {
  const behavior = cat.behavior
  behavior.timer -= dt

  if (behavior.mode === 'idle' && behavior.timer <= 0) {
    beginAction(cat, pickBehavior(hasWater), hasWater)
  }

  if (behavior.mode === 'walk' || behavior.mode === 'run') {
    const dTheta = behavior.targetTheta - cat.theta
    const dPhi = behavior.targetPhi - cat.phi
    const angularDistance = Math.hypot(dTheta, dPhi)
    const speed = behavior.mode === 'run' ? 1.1 : 0.42
    const step = (speed / PLANET_RADIUS) * dt

    if (angularDistance <= step) {
      cat.theta = behavior.targetTheta
      cat.phi = behavior.targetPhi
      if (behavior.arriveMode === 'drink') {
        behavior.mode = 'drink'
        behavior.timer = 3 + Math.random() * 3
      } else {
        beginAction(cat, 'idle', hasWater)
      }
    } else {
      cat.theta += (dTheta / angularDistance) * step
      cat.phi += (dPhi / angularDistance) * step
      cat.yaw = approachAngle(cat.yaw, Math.atan2(dTheta, dPhi), dt, 5)
    }
  }

  if (behavior.mode === 'drink' && behavior.timer <= 0) {
    beginAction(cat, 'idle', hasWater)
  }

  if (behavior.mode === 'sleep' && behavior.timer <= 0) {
    beginAction(cat, 'idle', hasWater)
  }

  const targetTilt = behavior.mode === 'sleep' ? -1.35 : 0
  cat.tilt = approach(cat.tilt, targetTilt, dt, 3)

  if (behavior.mode === 'drink') {
    cat.head.rotation.x = approach(cat.head.rotation.x, -0.55, dt, 6) + Math.sin(time * 3) * 0.05
  } else if (behavior.mode === 'sleep') {
    cat.head.rotation.x = approach(cat.head.rotation.x, -0.25, dt, 3)
  } else {
    cat.head.rotation.x = approach(cat.head.rotation.x, 0, dt, 6)
  }

  if (behavior.mode === 'idle') {
    cat.yaw = approachAngle(cat.yaw, cat.index * 0.5 + Math.sin(time * 0.7 + cat.index) * 0.25, dt, 2)
  }

  placeOnPlanet(cat.group, cat.theta, cat.phi)
  cat.group.rotateY(cat.yaw)
  cat.group.rotateX(cat.tilt)
}

function beginAction(cat: CatRig, mode: BehaviorMode, hasWater: boolean) {
  const behavior = cat.behavior

  if (mode === 'drink') {
    if (hasWater) {
      behavior.mode = 'walk'
      behavior.targetTheta = drinkTheta + 0.18
      behavior.targetPhi = drinkPhi + 0.1
      behavior.arriveMode = 'drink'
      behavior.timer = 0
    } else {
      mode = 'walk'
    }
  }

  if (mode === 'walk' || mode === 'run') {
    behavior.mode = mode
    behavior.targetTheta = Math.random() * Math.PI * 2
    behavior.targetPhi = 0.25 + Math.random() * (Math.PI - 0.5)
    behavior.arriveMode = 'idle'
    behavior.timer = 0
    return
  }

  behavior.mode = mode
  behavior.arriveMode = null
  behavior.timer =
    mode === 'idle' ? 1.5 + Math.random() * 3 : mode === 'sleep' ? 5 + Math.random() * 4 : 0
}

function pickBehavior(hasWater: boolean): BehaviorMode {
  const roll = Math.random()
  if (hasWater && roll < 0.22) return 'drink'
  if (roll < 0.42) return 'walk'
  if (roll < 0.58) return 'run'
  if (roll < 0.78) return 'sleep'
  return 'idle'
}

function approach(current: number, target: number, dt: number, speed: number) {
  return current + (target - current) * Math.min(1, dt * speed)
}

function approachAngle(current: number, target: number, dt: number, speed: number) {
  let diff = target - current
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  return current + diff * Math.min(1, dt * speed)
}

function findDeviceId(object: THREE.Object3D): string | null {
  let current: THREE.Object3D | null = object
  while (current) {
    if (typeof current.userData.deviceId === 'string') return current.userData.deviceId
    current = current.parent
  }
  return null
}

function findCat(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object
  while (current) {
    if (current.userData.cat) return true
    current = current.parent
  }
  return false
}

function placeOnPlanet(object: THREE.Object3D, theta: number, phi: number) {
  const sinPhi = Math.sin(phi)
  object.position.set(
    PLANET_RADIUS * sinPhi * Math.cos(theta),
    PLANET_RADIUS * Math.cos(phi),
    PLANET_RADIUS * sinPhi * Math.sin(theta),
  )
  object.quaternion.setFromUnitVectors(UP_VECTOR, object.position.clone().normalize())
}

function createStars(): THREE.Points {
  const count = 900
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const radius = 30 + Math.random() * 20
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
  })
  return new THREE.Points(geometry, material)
}

function createPlanet(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(PLANET_RADIUS, 48, 32)
  const material = new THREE.MeshStandardMaterial({
    color: 0x5f9e8c,
    roughness: 0.95,
    metalness: 0.05,
  })
  return new THREE.Mesh(geometry, material)
}

function createCat(color: string, index: number): CatRig {
  const group = new THREE.Group()
  const bodyMaterial = new THREE.MeshStandardMaterial({ color })
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x171717 })

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), bodyMaterial)
  body.scale.set(1.15, 0.85, 1.25)
  body.position.y = 0.3
  group.add(body)

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 16), bodyMaterial)
  head.position.set(0, 0.54, 0.2)
  group.add(head)

  const earGeometry = new THREE.ConeGeometry(0.07, 0.12, 4)
  const earLeft = new THREE.Mesh(earGeometry, bodyMaterial)
  earLeft.position.set(-0.1, 0.68, 0.18)
  earLeft.rotation.z = -0.25
  const earRight = earLeft.clone()
  earRight.position.x = 0.1
  earRight.rotation.z = 0.25
  group.add(earLeft, earRight)

  const eyeGeometry = new THREE.SphereGeometry(0.028, 10, 8)
  const eyeLeft = new THREE.Mesh(eyeGeometry, darkMaterial)
  eyeLeft.position.set(-0.07, 0.56, 0.34)
  const eyeRight = eyeLeft.clone()
  eyeRight.position.x = 0.07
  group.add(eyeLeft, eyeRight)

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.38, 8), bodyMaterial)
  tail.position.set(-0.2, 0.4, -0.2)
  tail.rotation.x = 1.1
  tail.rotation.z = 0.4
  group.add(tail)

  group.userData.cat = true
  const [theta, phi] = catStart[index % catStart.length]

  return {
    group,
    head,
    behavior: {
      mode: 'idle',
      timer: 1 + Math.random() * 2,
      targetTheta: theta,
      targetPhi: phi,
      arriveMode: null,
    },
    index,
    theta,
    phi,
    yaw: 0,
    tilt: 0,
  }
}

function createDeviceModel(kind: DeviceKind): THREE.Group {
  const group = new THREE.Group()
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x171717 })

  switch (kind) {
    case 'water': {
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24),
        new THREE.MeshStandardMaterial({ color: 0xe6f2f7 }),
      )
      base.position.y = 0.06
      const tank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.34, 20),
        new THREE.MeshStandardMaterial({ color: 0x7cc4e8 }),
      )
      tank.position.y = 0.3
      group.add(base, tank)
      break
    }
    case 'feeder': {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.22, 0.36),
        new THREE.MeshStandardMaterial({ color: 0xf4c77e }),
      )
      base.position.y = 0.11
      const hopper = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.24, 0.26, 4),
        new THREE.MeshStandardMaterial({ color: 0xe0a95f }),
      )
      hopper.position.y = 0.35
      hopper.rotation.y = Math.PI / 4
      group.add(base, hopper)
      break
    }
    case 'litter': {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.14, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xd8ebe6 }),
      )
      base.position.y = 0.07
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xbcddd6 }),
      )
      dome.position.y = 0.3
      group.add(base, dome)
      break
    }
    case 'camera': {
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.32, 12),
        new THREE.MeshStandardMaterial({ color: 0xc9c4bb }),
      )
      stand.position.y = 0.16
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.14, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xefe9f4 }),
      )
      body.position.y = 0.4
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), darkMaterial)
      lens.position.set(0, 0.4, 0.09)
      group.add(stand, body, lens)
      break
    }
    case 'tracker': {
      const tag = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.18, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xf2e4c8 }),
      )
      tag.position.y = 0.12
      group.add(tag)
      break
    }
    default: {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.3, 0.36),
        new THREE.MeshStandardMaterial({ color: 0xc9c4bb }),
      )
      box.position.y = 0.15
      group.add(box)
    }
  }

  return group
}

/** 读取用户上次调整并固化的最优视角（localStorage），无记录或数据损坏时返回 null */
function readSavedView(): { x: number; y: number; z: number } | null {
  try {
    const raw = window.localStorage.getItem(VIEW_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { x?: unknown; y?: unknown; z?: unknown }
    if (
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.z !== 'number'
    ) {
      return null
    }
    return parsed as { x: number; y: number; z: number }
  } catch {
    return null
  }
}

/** 固化当前相机位置为下次启动的默认视角；存储不可用时静默忽略 */
function saveView(position: THREE.Vector3) {
  try {
    window.localStorage.setItem(
      VIEW_STORAGE_KEY,
      JSON.stringify({ x: position.x, y: position.y, z: position.z }),
    )
  } catch {
    // localStorage 不可用（如隐私模式）时忽略，不影响交互
  }
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh && !(object as THREE.Points).isPoints) return
    const geometry = (object as THREE.Mesh | THREE.Points).geometry
    if (geometry) geometry.dispose()
    const material = (object as THREE.Mesh | THREE.Points).material
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else if (material) {
      material.dispose()
    }
  })
}
