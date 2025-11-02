# 微前端架构完全指南 - Qiankun详解

## 一句话总结
**微前端 = 一个主应用 + 多个子应用，通过 Qiankun 框架实现应用间的隔离、通信和动态加载**

---

## 什么是微前端（Micro Frontend）？

### 定义
微前端是一种将前端应用分解成若干个小的、半独立的"前端应用"的架构风格，这些应用可以：
- ✅ 独立开发、测试、部署
- ✅ 使用不同的技术栈
- ✅ 由不同团队维护
- ✅ 在运行时动态加载
- ✅ 共享全局状态

### vs. 其他架构的对比

```
┌─────────────────┬──────────────┬───────────────┬─────────────┬──────────────┐
│ 指标            │ 单体应用SPA  │ 多页面MPA     │ 模块联邦    │ 微前端Qiankun│
├─────────────────┼──────────────┼───────────────┼─────────────┼──────────────┤
│ 应用隔离        │ ❌ 否        │ ✅ 是        │ ⚠️ 部分     │ ✅ 完全     │
│ 独立部署        │ ❌ 否        │ ✅ 是        │ ✅ 是       │ ✅ 是       │
│ 团队独立        │ ❌ 否        │ ✅ 是        │ ✅ 是       │ ✅ 是       │
│ 状态共享        │ ✅ 容易      │ ⚠️ 困难      │ ⚠️ 困难     │ ✅ 容易     │
│ 通信便利        │ ✅ 原生      │ ❌ 困难      │ ⚠️ 有缺陷   │ ✅ 完善     │
│ 应用启动速度    │ ❌ 慢        │ ✅ 快        │ ✅ 快       │ ✅ 快       │
└─────────────────┴──────────────┴───────────────┴─────────────┴──────────────┘
```

---

## 微前端架构演变

```
阶段1: 单体应用 (早期)
┌─────────────────────────────┐
│        单一SPA应用          │
│  ├─ 用户模块                │
│  ├─ 订单模块                │
│  ├─ 支付模块                │
│  └─ 报表模块                │
└─────────────────────────────┘
问题：无法独立开发、部署困难

            ↓↓↓

阶段2: 多页面应用 (MPA)
┌──────────┬───────────┬──────────┬────────────┐
│  用户页  │  订单页   │  支付页  │  报表页    │
│  (独立)  │  (独立)   │  (独立)  │  (独立)    │
└──────────┴───────────┴──────────┴────────────┘
问题：应用间通信困难、状态共享复杂

            ↓↓↓

阶段3: 微前端 + Qiankun (现代)
┌──────────────────────────────────────────────┐
│           主应用 (Base App)                   │
│  ├─ 全局状态管理 (Pinia/Vuex)                │
│  ├─ 全局通信 (Event Bus)                     │
│  └─ 路由管理和应用切换                       │
├──────────────────────────────────────────────┤
│ 子应用1    │ 子应用2    │ 子应用3   │ 子应用N │
│ (用户管理) │ (订单管理) │ (支付)    │ (报表)  │
│ (独立开发) │ (独立开发) │ (独立开发)│(独立开发)
└──────────────────────────────────────────────┘
优势：隔离完全、通信便利、独立部署
```

---

## Qiankun 框架详解

### 什么是 Qiankun？

Qiankun 是由蚂蚁金服开源的一个微前端框架，提供：

```
核心能力：
├─ 应用注册和生命周期管理
├─ 应用隔离（JS隔离、CSS隔离）
├─ 应用通信（Emit/Listen）
├─ 资源加载（动态加载子应用资源）
└─ 样式沙箱（防止样式污染）
```

### 基础架构

```
┌─────────────────────────────────────────────────┐
│              Qiankun 应用生态                    │
├─────────────────────────────────────────────────┤
│  主应用 (Master App)                            │
│  ├─ 注册子应用                                   │
│  ├─ 监听子应用生命周期                           │
│  ├─ 全局通信通道                                 │
│  └─ 公共资源（样式、常量等）                     │
├─────────────────────────────────────────────────┤
│  子应用1         │  子应用2         │  子应用N   │
│  ┌──────────────┬──────────────┬────────────┐  │
│  │ 独立打包     │ 独立打包      │ 独立打包   │  │
│  │ 独立部署     │ 独立部署      │ 独立部署   │  │
│  │ 生命周期接口 │ 生命周期接口  │ 生命周期接口 │  │
│  └──────────────┴──────────────┴────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 核心概念

### 1️⃣ 主应用 (Master/Base App)

**职责**：
- 提供整体布局框架（导航、侧边栏等）
- 注册和管理所有子应用
- 维护全局状态
- 处理应用间通信

**示例代码**：
```typescript
// main.ts - 主应用入口
import { registerMicroApps, start } from 'qiankun'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 1. 定义子应用列表
const apps = [
  {
    name: '@org/user-app',              // 子应用名称
    entry: 'http://localhost:8081',     // 子应用入口地址
    container: '#user-container',       // 挂载容器
    activeRule: '/user'                 // 激活规则（路由匹配）
  },
  {
    name: '@org/order-app',
    entry: 'http://localhost:8082',
    container: '#order-container',
    activeRule: '/order'
  },
  {
    name: '@org/payment-app',
    entry: 'http://localhost:8083',
    container: '#payment-container',
    activeRule: '/payment'
  }
]

// 2. 注册子应用
registerMicroApps(apps, {
  beforeLoad: async (app) => {
    console.log('应用加载前：', app.name)
  },
  beforeMount: async (app) => {
    console.log('应用挂载前：', app.name)
  },
  afterMount: async (app) => {
    console.log('应用挂载后：', app.name)
  },
  beforeUnmount: async (app) => {
    console.log('应用卸载前：', app.name)
  },
  afterUnmount: async (app) => {
    console.log('应用卸载后：', app.name)
  }
})

// 3. 启动 Qiankun
start()

app.mount('#app')
```

### 2️⃣ 子应用 (Micro App)

**职责**：
- 导出生命周期函数
- 独立的业务逻辑
- 可选的全局通信

**示例代码**：
```typescript
// src/main.ts - 子应用入口
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

let instance = null
let router = null
const baseName = window.__POWERED_BY_QIANKUN__ ? '/user' : '/'

function createInstance() {
  const app = createApp(App)

  router = createRouter({
    history: createWebHistory(baseName),
    routes: [
      { path: '/', component: () => import('./pages/Home.vue') },
      { path: '/list', component: () => import('./pages/List.vue') }
    ]
  })

  app.use(router)
  return app
}

// ⭐ Qiankun 生命周期接口（必须导出）
export async function bootstrap() {
  console.log('[user-app] 应用初始化')
}

export async function mount(props) {
  console.log('[user-app] 应用挂载', props)

  // 接收主应用传入的参数
  if (props.onGlobalStateChange) {
    // 监听全局状态变化
    props.onGlobalStateChange((state) => {
      console.log('全局状态变化：', state)
    }, true)
  }

  const app = createInstance()
  app.mount('#app')
  instance = app
}

export async function unmount() {
  console.log('[user-app] 应用卸载')
  instance?.unmount()
  instance = null
}

export async function update(props) {
  console.log('[user-app] 应用更新', props)
}

// 开发环境（不通过 Qiankun 加载）独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  createInstance().mount('#app')
}
```

### 3️⃣ 应用通信

#### 方式1: 全局状态管理

```typescript
// 主应用：src/stores/globalState.ts
import { initGlobalState } from 'qiankun'

const initialState = {
  user: null,
  theme: 'light',
  language: 'zh'
}

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState(initialState)

// 监听全局状态变化
onGlobalStateChange((state) => {
  console.log('全局状态已变化：', state)
})

// 设置全局状态
export function updateUserInfo(userInfo) {
  setGlobalState({ user: userInfo })
}

export { onGlobalStateChange, setGlobalState }
```

```typescript
// 子应用：src/composables/useGlobalState.ts
import { ref } from 'vue'

export function useGlobalState(props) {
  const globalState = ref(null)

  if (props?.onGlobalStateChange) {
    props.onGlobalStateChange((state) => {
      globalState.value = state
      console.log('子应用收到全局状态：', state)
    }, true)
  }

  const setGlobalState = (state) => {
    if (props?.setGlobalState) {
      props.setGlobalState(state)
    }
  }

  return { globalState, setGlobalState }
}
```

#### 方式2: Event Bus 通信

```typescript
// 主应用：src/utils/eventBus.ts
type Listener = (...args: any[]) => void

class EventBus {
  private events = new Map<string, Listener[]>()

  on(event: string, listener: Listener) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  emit(event: string, ...args: any[]) {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach(listener => listener(...args))
    }
  }

  off(event: string, listener: Listener) {
    if (this.events.has(event)) {
      const listeners = this.events.get(event)!
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }
}

export default new EventBus()
```

```typescript
// 子应用中使用
import eventBus from '@parent/utils/eventBus'

export function useEventBus() {
  const emit = (event: string, data: any) => {
    eventBus.emit(event, data)
  }

  const on = (event: string, callback: Function) => {
    eventBus.on(event, callback)
  }

  return { emit, on }
}
```

---

## 应用隔离机制

### JS 隔离

Qiankun 提供两种隔离方式：

```typescript
// 1. SnapshotSandbox（快照沙箱）- 性能一般
// 方式：保存加载前后的window对象快照，对比差异

// 2. ProxySandbox（代理沙箱）- 推荐使用
// 方式：使用 Proxy 代理 window 对象，防止污染全局变量

// 配置示例：
registerMicroApps(apps, {
  sandbox: {
    strictStyleIsolation: false,    // CSS严格隔离
    experimentalStyleIsolation: true // 实验性CSS隔离
  }
})
```

### CSS 隔离

```css
/* 样式冲突问题示例 */

/* 主应用的 global.css */
button {
  background: blue;
  color: white;
}

/* 子应用的 style.css */
button {
  background: red;        /* 会覆盖主应用样式！ */
  color: black;
}

/* 解决方案：使用 BEM 命名规范 */
.user-app__button {
  background: red;
  color: black;
}

.order-app__input {
  border: 1px solid #ccc;
}

/* 或使用 CSS Modules */
// UserApp.module.css
.button {
  background: red;
}

// 使用时：
import styles from './UserApp.module.css'
<button :class="styles.button">Click</button>
```

---

## 路由设计

### 路由规划最佳实践

```
主应用路由：
/                          ← 首页
/user/*                    ← 用户应用的所有路由
/order/*                   ← 订单应用的所有路由
/payment/*                 ← 支付应用的所有路由

子应用内部路由：
/user/profile              ← 用户个人中心
/user/settings             ← 用户设置
/order/list                ← 订单列表
/order/detail/:id          ← 订单详情
```

### 实现示例

```typescript
// 主应用：src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/BaseLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/Home.vue') },
      // 子应用路由由 Qiankun 管理，这里只定义容器
      { path: 'user/:pathMatch(.*)*', component: () => import('@/layouts/MicroAppContainer.vue') },
      { path: 'order/:pathMatch(.*)*', component: () => import('@/layouts/MicroAppContainer.vue') },
      { path: 'payment/:pathMatch(.*)*', component: () => import('@/layouts/MicroAppContainer.vue') }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory('/'),
  routes
})
```

```vue
<!-- MicroAppContainer.vue -->
<template>
  <div id="micro-app-container"></div>
</template>

<script setup lang="ts">
// 这个容器中会动态挂载不同的子应用
</script>

<style scoped>
#micro-app-container {
  width: 100%;
  min-height: calc(100vh - 60px);
}
</style>
```

---

## 完整工作流程

### 应用加载流程

```
1️⃣ 用户访问主应用
   ↓
2️⃣ 主应用初始化，Qiankun 开始
   ↓
3️⃣ 用户点击导航到 /user
   ↓
4️⃣ 路由激活，匹配到 /user 子应用
   ↓
5️⃣ Qiankun 加载子应用资源（HTML/CSS/JS）
   ↓
6️⃣ 执行子应用 bootstrap() 生命周期
   ↓
7️⃣ 执行子应用 mount(props) 生命周期
   ↓
8️⃣ 子应用挂载到主应用容器中 (#user-container)
   ↓
9️⃣ 用户与子应用交互
   ↓
🔟 用户离开该路由
   ↓
1️⃣1️⃣ 执行子应用 unmount() 生命周期
   ↓
1️⃣2️⃣ 子应用卸载，资源释放
```

---

## 实际项目示例

### 文件结构

```
micro-frontend-app/
├── master-app/                     # 主应用
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── stores/
│   │   │   └── globalState.ts
│   │   ├── layouts/
│   │   │   ├── BaseLayout.vue
│   │   │   └── MicroAppContainer.vue
│   │   ├── components/
│   │   │   └── Navigation.vue
│   │   └── utils/
│   │       └── eventBus.ts
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── user-app/                       # 子应用1
│   ├── src/
│   │   ├── main.ts                 ⭐ 生命周期导出
│   │   ├── App.vue
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── Home.vue
│   │   │   └── Profile.vue
│   │   └── components/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── order-app/                      # 子应用2
│   └── ...（结构同上）
│
└── payment-app/                    # 子应用3
    └── ...（结构同上）
```

### 打包和部署配置

```typescript
// 子应用 Vite 配置：vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*'  // ⭐ 允许跨域
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    lib: {
      entry: 'src/main.ts',
      name: 'userApp',
      fileName: 'userApp'
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],    // ⭐ 外部化依赖
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    }
  }
})
```

---

## 性能优化策略

### 1️⃣ 预加载 (Prefetch)

```typescript
registerMicroApps(
  apps,
  {
    beforeLoad: async (app) => {
      console.log('预加载应用：', app.name)
    }
  },
  {
    'beforeLoad.@org/order-app': async () => {
      console.log('预加载订单应用资源...')
    }
  }
)

// 手动预加载
import { addGlobalUncaughtErrorHandler } from 'qiankun'

setTimeout(() => {
  // 在用户闲时预加载子应用
  fetch('http://localhost:8082/index.html')
}, 2000)
```

### 2️⃣ 动态加载 & 懒加载

```typescript
// 动态注册子应用
function registerSubApp(name, entry, activeRule) {
  registerMicroApps([
    {
      name,
      entry,
      container: '#micro-app',
      activeRule
    }
  ])
}

// 使用时
import { loadMicroApp } from 'qiankun'

// 手动加载（不走路由激活）
const app = loadMicroApp({
  name: '@org/payment-app',
  entry: 'http://localhost:8083',
  container: '#payment-dialog'
})

// 卸载
app.unmount()
```

### 3️⃣ 资源优化

```typescript
// 使用 CDN 加速
const apps = [
  {
    name: '@org/user-app',
    entry: 'https://cdn.example.com/user-app/index.html',  // 使用 CDN
    container: '#user-container',
    activeRule: '/user'
  }
]

// 代码分割
// 在子应用中使用动态 import
const routes = [
  {
    path: '/profile',
    component: () => import('./pages/Profile.vue')  // 异步加载
  },
  {
    path: '/settings',
    component: () => import('./pages/Settings.vue')
  }
]
```

---

## 常见问题 & 解决方案

### Q1: 子应用之间如何共享依赖？

```typescript
// 方案1: 使用 External（共享库）
// 主应用注入全局变量
window.Vue = Vue
window.VueRouter = VueRouter
window.Pinia = Pinia

// 子应用 vite.config.ts
export default {
  build: {
    rollupOptions: {
      external: ['vue', 'vue-router', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia'
        }
      }
    }
  }
}

// 方案2: 使用 Import Map（推荐）
// 主应用 index.html
<script type="importmap">
{
  "imports": {
    "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js",
    "vue-router": "https://cdn.jsdelivr.net/npm/vue-router@4/dist/vue-router.esm-browser.js"
  }
}
</script>
```

### Q2: 如何处理 CSS 样式污染？

```typescript
// 方案1: CSS 模块化
import styles from './App.module.css'
<div :class="styles.container">...</div>

// 方案2: BEM 命名规范
<div class="user-app__container">
  <button class="user-app__button">点击</button>
</div>

// 方案3: CSS-in-JS
import styled from 'styled-components'
const Container = styled.div`
  padding: 20px;
  background: #fff;
`

// 方案4: Qiankun 内置隔离
registerMicroApps(apps, {
  sandbox: {
    experimentalStyleIsolation: true  // 实验性 CSS 隔离
  }
})
```

### Q3: 如何调试子应用？

```bash
# 方案1: 独立运行子应用
cd user-app
npm run dev
# 访问 http://localhost:8081

# 方案2: 修改主应用配置，加载本地子应用
// 开发时，将子应用入口改为本地 URL
const apps = [
  {
    name: '@org/user-app',
    entry: 'http://localhost:8081',  // 本地开发地址
    container: '#user-container',
    activeRule: '/user'
  }
]

# 方案3: 使用浏览器开发者工具
// 子应用代码在 iframe 中运行时使用 Console 调试
```

### Q4: 子应用如何访问主应用的方法？

```typescript
// 方案: 通过 props 传递
// 主应用：mount 时传入 props
export async function mount(props) {
  // props 中包含主应用的方法和数据
  const { onGlobalStateChange, setGlobalState } = props

  // 使用主应用的方法
  onGlobalStateChange((state) => {
    console.log('全局状态变化：', state)
  })
}
```

---

## vs. 其他微前端方案对比

```
┌──────────────┬────────────┬──────────────┬─────────────┬──────────────┐
│ 方案         │ Qiankun    │ Module       │ EMP         │ Micro App    │
│              │ (蚂蚁金服) │ Federation   │ (字节跳动)  │ (乾坤改进版) │
├──────────────┼────────────┼──────────────┼─────────────┼──────────────┤
│ 学习曲线     │ ⭐⭐⭐     │ ⭐⭐        │ ⭐⭐⭐      │ ⭐⭐⭐      │
│ 隔离能力     │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐       │ ⭐⭐⭐⭐   │ ⭐⭐⭐⭐⭐ │
│ 通信便利度   │ ⭐⭐⭐⭐   │ ⭐⭐⭐       │ ⭐⭐⭐⭐   │ ⭐⭐⭐⭐   │
│ 生态完善度   │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐     │ ⭐⭐⭐      │ ⭐⭐⭐⭐   │
│ 使用广泛度   │ ⭐⭐⭐⭐⭐ │ ⭐⭐⭐⭐⭐   │ ⭐⭐⭐      │ ⭐⭐⭐     │
│ 打包体积     │ 中等       │ 较小         │ 中等        │ 中等         │
│ 运行时性能   │ 好         │ 很好         │ 好          │ 很好         │
└──────────────┴────────────┴──────────────┴─────────────┴──────────────┘

推荐场景：
✅ Qiankun       → 企业级应用、完整微前端方案
✅ Module Fed    → 构建时共享、轻量级方案
✅ EMP           → 跨域加载、多技术栈混合
✅ Micro App     → 强隔离需求、生产级应用
```

---

## 最佳实践总结

### ✅ DO（要做）

```typescript
// 1. 完整的生命周期函数
export async function bootstrap() { }
export async function mount(props) { }
export async function unmount() { }

// 2. 使用全局状态管理
const { onGlobalStateChange, setGlobalState } = props
onGlobalStateChange((state) => {
  // 响应状态变化
})

// 3. 样式隔离（BEM 或 CSS Modules）
<div class="app-name__component">...</div>

// 4. 独立的路由配置
const router = createRouter({
  history: createWebHistory('/app-name')
})

// 5. 错误处理
try {
  // 应用逻辑
} catch (error) {
  console.error('子应用错误：', error)
}
```

### ❌ DON'T（不要做）

```typescript
// 1. 直接修改全局对象
❌ window.globalVar = 'xxx'   // 污染全局

// 2. 使用共享的全局样式
❌ <style>
  button { color: red; }      // 会影响所有应用
</style>

// 3. 忽视跨域问题
❌ <script src="/child-app.js"></script>

// 4. 在 unmount 时不清理
❌ export async function unmount() {
  // ❌ 缺少清理代码
}

// 5. 过度依赖主应用的私有方法
❌ props.mainAppPrivateMethod()
```

---

## 学习路径

### 初级：基础概念和 Qiankun 搭建
- [ ] 理解微前端定义和优缺点
- [ ] 了解 Qiankun 核心概念
- [ ] 搭建一个简单的主应用 + 子应用
- [ ] 实现子应用的生命周期

### 中级：应用隔离和通信
- [ ] 理解 JS 隔离（ProxySandbox）
- [ ] 理解 CSS 隔离机制
- [ ] 实现全局状态管理
- [ ] 实现应用间通信（Event Bus）
- [ ] 处理路由和导航

### 高级：性能优化和生产部署
- [ ] 实现子应用预加载和懒加载
- [ ] 优化应用加载性能
- [ ] 处理错误和异常
- [ ] 部署到生产环境
- [ ] 灰度发布策略

---

## 实用资源

### 官方文档
- Qiankun 官网：https://qiankun.umijs.org/
- 蚂蚁金服分享：https://zhuanlan.zhihu.com/p/78362028

### 开源项目参考
- qiankun-main：官方示例
- micro-app：字节跳动微应用方案
- emp：字节跳动微前端方案

### 在线编辑器
- Codesandbox：快速验证 Qiankun 概念
- StackBlitz：实时编辑和调试

---

## 一句话总结

**Qiankun 通过应用隔离、生命周期管理和灵活通信，让大型前端应用可以像拼乐高一样，由多个独立团队并行开发、测试和部署不同的功能模块，最后无缝整合在一起。**

它是构建现代化、高效能企业级前端应用的核心方案。
