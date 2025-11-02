# Hybrid 能力与可观测：统一 Bridge、版本兼容与 FCP 上报

面试官导向：明确端/前端边界，强调我负责的接入、协议与回退策略；给出可追问代码位与风险点处理。

## 背景与目标
- WebView 场景大量依赖端能力（相册/上传/裁剪/支付/埋点/AB/震动/键盘等）。
- 需要统一 iOS/Android 的调用方式、参数与异常处理，并在旧版 App 进行路由兼容；同时保证首屏可观测（FCP）。

## 方案与实现
- 统一 Bridge 封装
  - `clientBridge.ts` 提供 Promise 化 API：`callNativeFunction` 统一入参清洗、错误处理与 iOS WKWebView/Android Bridge 分发。
  - 支持 Mock 钩子（开发态），避免真机依赖：`src/src/utils/nativeClientMock.ts`。
  - 能力覆盖：相册/视频选择、S3 上传（图片/音频/视频）、图片/音频裁剪、分享/支付、AB 获取、键盘监听、震动、缓存读写等。
- 版本/平台兼容
  - 通过 `navigator.userAgent` 与 `compareVersions` 进行版本分支，Android 旧版路由参数降级（见 `useCreateAction.ts`）。
  - 多监听修复：`newOnPageAppear` 支持多订阅者并安全分发，避免旧实现的覆盖问题（`clientBridge.ts`）。
- 可观测与埋点
  - FCP：`reportFcp.ts` 使用 webVitals 采集 FCP，1s 后经 `clientReportFcp` 上报端侧。
  - 埋点：组件通过 `useAnalytics` 的 `track(type, params)` 下发事件字典，统一走 `sendWeblog` → 端侧投递。
  - AB：`getABTest` 先取 Native `abInfos`，超时/缺失回落到接口，统一 camelCase 输出供前端开关控制（`dataSource/index/api.ts`）。

## 成果（口径）
- Bridge 调用一致性：前端 API 统一、容错一致；发生端能力变更时仅在封装层改动。
- 兼容性：旧版 Android 在 I2V 路由上保持可用，减少回退/闪退；键盘与页面可见事件多订阅安全。
- 可观测：FCP 建立统一上报口径，便于版本对比与优化评估。

## 常见追问与回答建议
- Q：为什么要自己封装 Bridge？
  - A：端侧协议多、差异大；统一参数校验与错误处理后，业务代码解耦，降低回归成本。
- Q：端能力失败如何兜底？
  - A：Promise 化 + 超时/异常捕获 + 开发态 mock；必要时 UI 给出可重试提示，不影响关键流程。
- Q：FCP 上报是否影响性能？
  - A：webVitals 监听开销极低；我们延时 1s 上报并通过端侧链路投递，不阻塞渲染线程。
- Q：AB 信息来自哪里？
  - A：Native 优先（低延迟、一致分流），失败再取服务端接口，且统一 camelCase，避免业务方关心来源差异。

## 代码证据点
- Bridge 封装：`src/src/utils/clientBridge.ts`
- FCP 注入：`src/vue.config.js`, `src/src/utils/reportFcp.ts`
- 埋点/事件字典：`src/src/composables/useAnalytics.ts`
- AB 获取与降级：`src/src/dataSource/index/api.ts`

