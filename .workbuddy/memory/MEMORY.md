# Pet Smart App · 项目约定

## 宇宙叙事（核心产品设定，用户要求牢记）
硅宠场域（silifield）的宇宙世界观：**猫咪是宇航员、星球探索者**；宠物饮水机是**「饮水舱」**
（产品名已改，旧名「智能饮水机」「宠物暖泉」不得再出现在 UI 文案里）。
首页 3D 星球场景即此叙事的载体；设备、功能、文案命名向太空舱/星航隐喻靠拢
（如录像片段命名「清晨巡航饮水」「夜间巡航饮水」）。
**领域事实：真实猫咪单次饮水时长不超过 3 分钟**——演示数据、播放速度、片段时长字段都必须遵守。

## Android 签名与打包
- **正式签名密钥**（本地，不进 git）：`android/silifield-release.keystore`，密码 `silifield-petwater-2026`，
  别名 `silifield`；完整调用说明见 `android/SIGNING.local.md`（同样不入库）。**keystore 丢失无法补发，需备份**。
- 打包链：`npm run build` → `npx cap sync android` → `cd android && JAVA_HOME=<jdk21> ./gradlew assembleRelease`。
  JDK 21 在 `catwater/android-build-tools/jdk21/jdk-21.0.11+10`，SDK 在 `catwater/android-sdk`。
- 版本号两处同步改：`package.json` 与 `android/app/build.gradle`（versionCode 递增）；APK 复制到根目录命名 `silifield-v<版本>.apk`。
- 商标 logo 素材：`素材/硅宠场域商标logo.png`（1024 白底，图形深墨绿 #153C2A 区域）；App 图标由
  `AppData/Local/Temp/logo-work/gen_icons.py` 脚本生成（mipmap 全密度 + splash 全方向 + `public/brand/logo.png`）。

## 首页 3D 星球（HomeScene.tsx 关键机制）
- **拖动 = 直接操纵转球**（v1.1.2 起，用户要求方向一致手感）：星空是背景幕不转；planet+内容在
  `planetGroup`，拖拽按**屏幕轴**旋转（相机 right/up 世界向量），内容移动方向与手指滑动方向严格一致，
  无斜向漂移。OrbitControls `enableRotate=false` 只管缩放（zoomSpeed 0.6 / min 4.6 / max 9.6）；
  自写 pointer 拖拽 + 惯性滑行（×0.92/帧）；灵敏度 `PLANET_DRAG_SPEED=0.35`（拖满屏高约 126°）。
- **构图用 `camera.setViewOffset` 动态偏移**：`factor = 0.192 × clamp((9.6 - dist)/(9.6 - anchor), 0, 1)`，
  默认距离保持海平面构图（星空约 30%），拉远到 MAX_DISTANCE=9.6 时星球完全居中。
- **视角+姿态自动记忆**：`VIEW_STORAGE_KEY`；存 `{camera, planet: quaternion}`（旧格式 {x,y,z} 兼容）；
  拖拽/缩放结束 800ms 防抖保存；启动恢复相机位置与星球姿态。
- 饮水舱固定在海平面轮廓 `[4.3, 0.6]`，猫 `[4.55, 0.52]` 在旁；新增设备落位改 `deviceSpherical` 表。

## 项目定位
硅宠场域（silifield）智能宠物设备用户端 App 原型。Vite 8 + React 19 + TS 6 + Tailwind 4，
Capacitor 8 打包 Android（appId `com.pawlink.petwater`，appName `silifield`）。

## 架构约定
- **无路由库、无状态库**。`App.tsx` 是唯一状态容器，`renderView(view)` 按 `nav.ts` 里的 `View`
  联合类型 switch 分发。新增页面 = 加 View 变体 + 加 case + 加视图组件。
- `nav.ts` 是**类型根**，只放类型不放运行时代码。领域模块从它导入类型。
- `src/` 下用**扁平单文件模块**（auth / catalog / provisioning / hotspot / demoState / storage），
  不要新建子目录分包。`views/` 与 `components/` 才用目录。
- 视图统一结构：`<TopBar title onBack />` + `<main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">`。
- 配色固定浅色系：底色 `#f7f7f8`、文字 `#171717`、卡片白底 + `border-[#171717]/10`。
- **核心字体：汇文明朝体（Huiwen Mincho）**（与灵宠官网 keeplinux/petsoul_html_v1.0.0 品牌一致）。
  自托管 `public/fonts/huiwen-mincho.woff2`（2.4MB 子集 = App 文案 + GB2312 一级字，3912 字符），
  许可 CC0 留档同目录。全局栈见 `src/index.css`：明朝体优先 + 思源宋/宋体衬线回退。
  新文案出现缺字时用 fonttools 重新子集化（完整 TTF 下载走 gh-proxy.com 镜像，raw 直连失败）。
- 设备模型以 **sn 为唯一键**做 upsert，不用 productId 去重。

## 配网设计
- 双通道：主通道 扫码+BLE；保底通道 设备 AP 热点（SSID/密码 = `silifield`，网关 `192.168.4.1`）。
- 两条通道**共用**同一套 WiFi 表单、分步状态机与绑定写入逻辑，只在下发链路上不同。
- 失败一律用**错误码**（`FailureCode`）驱动文案与可用动作，不要直接散字符串。
- 设备状态：`pending`（保底发现待配网）→ `bound`（已配网）。已 bound 的设备不会被保底轮询降级。
- demo 阶段 BLE 只做模拟器 + 预留接口；`probeHotspotGateway` 与 BLE 传输层均为占位实现。

## 演示相关
- **界面上一律不放 demo 元素**（用户明确要求 App 要像真实产品）：没有调试面板、没有悬浮球、
  没有「模拟扫码」按钮、没有手输二维码、没有演示网络快填。
- 设备侧能力（相机解码 / BLE 传输 / AP 探测）统一收在 `src/config.ts` 的 `simulateHardware` 开关后，
  接入真机时关掉即可，页面与状态机不动。
- 保底配网入口**唯一**：**配网失败后自动弹出的提示层**（仅 scan 通道，FallbackSheet）。
  设置页「配网遇到问题」模块已删除（用户明确：保底只在配网失败后自动出现，不做常驻入口）。
  首页头部不得出现保底配网按钮。
- 原型阶段唯一能自然走到的失败：WiFi 名称以 `5G` 结尾 → `WIFI_UNSUPPORTED_BAND`（`isFiveGhzSsid()`）。

## 安全区与适配
- `index.html` 已加 `viewport-fit=cover`。
- `index.css` 里的 `.safe-top` / `.safe-bottom` / `.safe-bottom-lg` / `.banner-top` 是**非分层样式**，
  优先级高于 Tailwind utilities 层，可直接覆盖 `py-3` / `p-4` 的对应方向。
  新增全屏弹层或跨页顶栏时应复用这几个类。
- 页面根用 `h-dvh`，`html/body/#root` 设 `height:100%`。

## 常用命令
```bash
npm run dev             # 开发
npx tsc -b              # 类型检查（tsconfig.app.json 开了 noUnusedLocals/Parameters）
npx eslint .            # lint（react-hooks/set-state-in-effect 会拦 effect 内同步 setState）
npm run build           # tsc -b && vite build
```

## 文档与辅助页
- `docs/architecture.html`：分层架构图 + 模块职责 + 保底配网方案评估。
- `docs/app-features.html`：功能清单 + 操作场景手册 + 失败分支对照表。
- `preview-phone.html`（根目录）：手机外壳 iframe 预览页，仅开发期使用，非构建入口。

## 已知约束
- eslint `react-hooks/set-state-in-effect` 会报错：effect 体内不能同步调用 setState，
  需要把 setState 挪进回调函数，或改为派生值。
- 无浏览器自动化依赖（无 puppeteer / playwright / agent-browser），无法做端到端运行时验证。
