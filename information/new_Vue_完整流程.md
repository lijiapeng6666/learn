# new Vue 的全过程详解

## 概述

`new Vue()` 是创建 Vue 实例的核心过程。这个过程涉及实例初始化、选项合并、数据响应式化、模板编译、挂载等多个重要阶段。理解这个过程有助于深入理解 Vue 的工作原理。

---

## 完整流程图

```
用户代码: new Vue({...})
    ↓
1️⃣  Vue 构造函数 (new Vue)
    ↓
2️⃣  _init() 方法执行
    ├─ 初始化事件系统
    ├─ 初始化生命周期钩子
    ├─ 初始化数据 (data/computed/methods)
    ├─ 初始化监听 (watch)
    └─ 初始化提供者 (provide/inject)
    ↓
3️⃣  beforeCreate 钩子
    ↓
4️⃣  处理 inject (依赖注入)
    ↓
5️⃣  设置响应式数据
    ├─ data: Object.defineProperty()
    ├─ computed: getter/setter
    └─ methods: 绑定 this
    ↓
6️⃣  处理 provide (提供者)
    ↓
7️⃣  created 钩子
    ↓
8️⃣  $mount() 方法 (挂载)
    ├─ 编译模板 (template → render function)
    ├─ 创建虚拟 DOM (VNode)
    └─ 进行初始化渲染
    ↓
9️⃣  beforeMount 钩子
    ↓
🔟  创建 DOM 树
    ├─ 执行 render() 函数
    ├─ 生成虚拟 DOM
    └─ 转换为真实 DOM
    ↓
1️⃣1️⃣  mounted 钩子
    ↓
✅  Vue 实例完全就绪
```

---

## 详细过程分析

### 1️⃣ Vue 构造函数调用

```javascript
function Vue(options) {
  // 检查是否通过 new 调用
  if (!(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 _init 方法
  this._init(options)
}
```

**执行操作**：
- ✅ 验证实例化方式（必须使用 `new`）
- ✅ 调用 `_init()` 方法进行初始化

---

### 2️⃣ _init() 方法执行

`_init()` 是整个初始化流程的核心方法。

```javascript
Vue.prototype._init = function(options) {
  const vm = this

  // 保存选项
  vm.$options = mergeOptions(
    resolveConstructorOptions(vm.constructor),
    options || {},
    vm
  )

  // 设置内部属性
  vm._uid = uid++                    // 唯一标识符
  vm._isVue = true                   // 标记为 Vue 实例
  vm._events = Object.create(null)   // 事件系统
  vm._watchers = []                  // 监听者列表

  // 初始化 refs
  vm.$refs = {}

  // 执行生命周期初始化
  initLifecycle(vm)    // ← 初始化生命周期属性
  initEvents(vm)       // ← 初始化事件系统
  initRender(vm)       // ← 初始化渲染

  // 调用 beforeCreate 钩子
  callHook(vm, 'beforeCreate')

  // 初始化数据
  initInjections(vm)   // ← 处理 inject（在 data 前）
  initState(vm)        // ← 初始化 data/computed/methods/watch
  initProvide(vm)      // ← 处理 provide（在 data 后）

  // 调用 created 钩子
  callHook(vm, 'created')

  // 如果有 el 选项，自动挂载
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```

**执行顺序**：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 选项合并 | 将用户选项与 Vue 默认选项合并 |
| 2 | 初始化内部属性 | 设置 `_uid`、`_isVue`、`_events` 等 |
| 3 | initLifecycle() | 初始化 `$parent`、`$children`、`$refs` |
| 4 | initEvents() | 初始化事件系统（处理 on/once 等） |
| 5 | initRender() | 初始化 `$createElement`、`$slots` |
| 6 | **beforeCreate** 🎯 | 触发钩子，此时 data 还未初始化 |
| 7 | initInjections() | 处理 `inject` 依赖注入 |
| 8 | initState() | 初始化响应式数据系统 |
| 9 | initProvide() | 处理 `provide` 提供者 |
| 10 | **created** 🎯 | 触发钩子，此时 data 已初始化 |

---

### 3️⃣ beforeCreate 钩子

此时的实例状态：

```javascript
new Vue({
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  },
  beforeCreate() {
    console.log(this.count)        // ❌ undefined (还未初始化)
    console.log(this.increment)    // ❌ undefined
    console.log(this.$el)          // ❌ undefined (还未挂载)
    console.log(this._uid)         // ✅ 123 (内部属性已初始化)
  }
})
```

**特点**：
- ❌ 无法访问 `data`、`computed`、`methods`
- ✅ 可以访问生命周期钩子
- ✅ 可以访问内部属性（`_uid` 等）
- 🎯 用途：全局初始化，不依赖实例数据

---

### 4️⃣ 处理 Inject（依赖注入）

```javascript
function initInjections(vm) {
  // 从父级获取 provide 数据
  const result = resolveInject(vm.$options.inject, vm)

  if (result) {
    // 设置为非响应式的
    Object.keys(result).forEach(key => {
      Object.defineProperty(vm, key, {
        value: result[key],
        enumerable: true,
        configurable: true
      })
    })
  }
}
```

**过程**：
1. 从最近的父级中查找 `provide` 的值
2. 将查找到的值添加到实例上
3. 这些值不是响应式的

**示例**：

```javascript
// 父组件
const Parent = {
  provide: {
    message: 'Hello from parent'
  }
}

// 子组件
const Child = {
  inject: ['message'],
  created() {
    console.log(this.message)  // "Hello from parent"
  }
}
```

---

### 5️⃣ 初始化响应式数据 (initState)

这是最重要的一步，处理 `data`、`computed`、`methods`、`watch`。

#### 5.1 初始化 Data

```javascript
function initData(vm) {
  let data = vm.$options.data

  // 执行 data 函数
  data = typeof data === 'function' ? data.call(vm, vm) : data || {}

  // 遍历 data 中的所有属性
  Object.keys(data).forEach(key => {
    // 代理访问
    proxy(vm, `_data`, key)

    // 转换为响应式
    Object.defineProperty(vm._data, key, {
      get() { return this._data[key] },
      set(newVal) {
        // 触发依赖更新
        this._data[key] = newVal
      }
    })
  })
}

// 代理访问：vm.count → vm._data.count
function proxy(vm, sourceKey, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[sourceKey][key]
    },
    set(val) {
      vm[sourceKey][key] = val
    }
  })
}
```

**执行操作**：

1. **执行 data 函数**
   ```javascript
   // data 必须是函数（避免多个实例共享同一对象）
   data() {
     return { count: 0 }  // 每次创建新对象
   }
   ```

2. **代理访问**
   ```javascript
   // 允许直接访问：this.count
   // 而不需要：this._data.count
   ```

3. **转换为响应式**
   ```javascript
   // 使用 Object.defineProperty 劫持 getter/setter
   Object.defineProperty(vm, 'count', {
     get() { return vm._data.count },
     set(newVal) { vm._data.count = newVal }  // 触发更新
   })
   ```

**响应式原理**：

```javascript
// 当设置属性时：
vm.count = 5
    ↓
// 触发 setter
    ↓
// 依赖追踪系统记录这个改变
    ↓
// 通知所有依赖这个属性的视图更新
    ↓
// 重新渲染组件
```

#### 5.2 初始化 Methods

```javascript
function initMethods(vm, methods) {
  for (const key in methods) {
    // 将方法绑定到实例上
    vm[key] = typeof methods[key] !== 'function'
      ? methods[key].bind(vm)  // 绑定 this
      : methods[key].bind(vm)
  }
}
```

**执行操作**：
- ✅ 将所有方法复制到 Vue 实例
- ✅ 使用 `.bind(vm)` 绑定 `this` 上下文

#### 5.3 初始化 Computed

```javascript
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get

    // 创建计算属性观察者
    watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)

    // 定义计算属性的 getter/setter
    Object.defineProperty(vm, key, {
      get: createComputedGetter(key),  // 返回计算结果
      set: userDef.set || noop         // 如果有 setter
    })
  }
}
```

**执行操作**：

1. **为每个计算属性创建 Watcher**
   ```javascript
   // Watcher 追踪计算属性依赖的响应式属性
   computed: {
     doubled() {
       return this.count * 2  // 依赖 this.count
     }
   }
   // 当 count 改变时，Watcher 知道需要重新计算 doubled
   ```

2. **创建 getter**
   ```javascript
   // 访问计算属性时触发 getter
   console.log(vm.doubled)  // 调用 getter，返回计算结果
   ```

3. **支持 setter**
   ```javascript
   computed: {
     fullName: {
       get() { return this.firstName + ' ' + this.lastName },
       set(val) { /* 自定义 setter */ }
     }
   }
   ```

#### 5.4 初始化 Watch

```javascript
function initWatch(vm, watch) {
  for (const key in watch) {
    const handler = watch[key]

    if (Array.isArray(handler)) {
      // 支持多个回调
      handler.forEach(h => createWatcher(vm, key, h))
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, expOrFn, handler, options) {
  // 创建观察者
  return vm.$watch(expOrFn, handler, options)
}
```

**执行操作**：

1. **创建 Watcher 实例**
   ```javascript
   watch: {
     count(newVal, oldVal) {
       console.log(`count 从 ${oldVal} 改变为 ${newVal}`)
     }
   }
   ```

2. **支持多种形式**
   ```javascript
   watch: {
     // 方法名
     count: 'handleCountChange',

     // 函数
     count: function(newVal, oldVal) {},

     // 对象形式
     count: {
       handler(newVal, oldVal) {},
       immediate: true,  // 立即执行
       deep: true        // 深度监听
     },

     // 多个回调
     count: [
       'handleCountChange1',
       'handleCountChange2'
     ]
   }
   ```

---

### 6️⃣ 处理 Provide（提供者）

```javascript
function initProvide(vm) {
  const provide = vm.$options.provide

  if (provide) {
    // 可以是函数或对象
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}
```

**执行操作**：

1. **存储 provide 对象**
   ```javascript
   provide: {
     message: 'Hello',
     user: { name: 'John' }
   }
   ```

2. **支持函数形式**
   ```javascript
   provide() {
     return {
       message: this.message  // 可以访问实例的响应式属性
     }
   }
   ```

3. **子组件通过 inject 获取**
   ```javascript
   inject: ['message']
   // 现在可以使用 this.message
   ```

---

### 7️⃣ created 钩子

此时的实例状态：

```javascript
new Vue({
  data() {
    return { count: 0 }
  },
  computed: {
    doubled() { return this.count * 2 }
  },
  methods: {
    increment() { this.count++ }
  },
  created() {
    console.log(this.count)        // ✅ 0 (已初始化)
    console.log(this.doubled)      // ✅ 0 (计算属性已初始化)
    console.log(this.increment)    // ✅ [Function] (方法已初始化)
    console.log(this.$el)          // ❌ undefined (还未挂载)
    console.log(this.$data)        // ✅ { count: 0 }
  }
})
```

**特点**：
- ✅ 可以访问响应式数据、计算属性、方法
- ❌ 无法访问 `$el`（还未挂载）
- 🎯 用途：初始化数据、发送 AJAX 请求、设置定时器

---

### 8️⃣ $mount() 方法

`$mount()` 开始挂载流程。

```javascript
Vue.prototype.$mount = function(el) {
  el = el && query(el)  // 获取 DOM 元素

  // 检查不能挂载到 html/body
  if (el === document.body || el === document.documentElement) {
    warn('Do not mount Vue to <html> or <body>')
    return this
  }

  const options = this.$options

  // 如果没有 render 函数，尝试编译模板
  if (!options.render) {
    let template = options.template

    if (template) {
      // 模板字符串或 selector
      template = idToTemplate(template)
    } else if (el) {
      // 使用 el 的 innerHTML 作为模板
      template = el.innerHTML
    }

    // 编译模板为 render 函数
    const { render, staticRenderFns } = compileToFunctions(
      template,
      options,
      this
    )

    options.render = render
    options.staticRenderFns = staticRenderFns
  }

  // 执行真正的挂载
  return mountComponent(this, el, hydrating)
}
```

**执行操作**：

1. **获取挂载点**
   ```javascript
   vm.$mount('#app')  // 获取 id="app" 的元素
   // 或
   vm.$mount(document.querySelector('#app'))
   ```

2. **获取模板**
   ```javascript
   // 优先级顺序：
   // 1. render 函数（最高优先级）
   // 2. template 选项
   // 3. el 的 innerHTML

   new Vue({
     el: '#app',
     template: '<div>Hello</div>'  // 使用这个
   })
   ```

3. **编译模板**
   ```javascript
   // template 字符串转换为 render 函数
   '<div>{{ message }}</div>'
   ↓
   function render() {
     return createElement('div', [createTextVNode(this.message)])
   }
   ```

---

### 9️⃣ 模板编译过程

```javascript
// 编译过程的三个阶段：

// 第一阶段：Parse（解析）
const ast = parse(template)
// 输出：Abstract Syntax Tree（抽象语法树）
// 例如：
{
  type: 'element',
  tag: 'div',
  children: [
    {
      type: 'interpolation',
      expression: 'message'
    }
  ]
}

// 第二阶段：Optimize（优化）
optimize(ast)
// 标记静态节点和静态属性
// 以便后续渲染时跳过这些节点

// 第三阶段：CodeGen（代码生成）
const code = generate(ast)
// 输出：render 函数的代码字符串
// 例如：
`
with(this) {
  return _c('div', [
    _v(_s(message))
  ])
}
`

// 第四步：编译为可执行函数
const render = new Function(code)
```

**执行操作**：

| 阶段 | 输入 | 输出 | 说明 |
|------|------|------|------|
| Parse | HTML 字符串 | AST | 词法和语法分析 |
| Optimize | AST | 标记后的 AST | 标记静态内容 |
| CodeGen | AST | 代码字符串 | 生成 render 函数代码 |
| 编译 | 代码字符串 | 可执行函数 | 转换为 JavaScript 函数 |

**编译结果示例**：

```javascript
// 原始模板
template: `
  <div id="app">
    <p class="text">{{ message }}</p>
    <button @click="increment">点击</button>
  </div>
`

// 生成的 render 函数
function render() {
  return _c('div', {attrs:{id:"app"}}, [
    _c('p', {staticClass:"text"}, [
      _v(_s(this.message))
    ]),
    _c('button', {on:{click:this.increment}}, [
      _v("点击")
    ])
  ])
}

// 其中：
// _c = createElement
// _v = createTextVNode
// _s = toString
```

---

### 🔟 mountComponent 函数

```javascript
function mountComponent(vm, el, hydrating) {
  vm.$el = el

  // 如果没有 render 函数，创建空的 render
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
  }

  // 触发 beforeMount 钩子
  callHook(vm, 'beforeMount')

  // 定义更新函数
  let updateComponent
  updateComponent = () => {
    // 执行 render 函数，获得虚拟 DOM
    const vnode = vm._render()

    // 用虚拟 DOM 更新真实 DOM
    vm._update(vnode, hydrating)
  }

  // 创建渲染 Watcher
  new Watcher(vm, updateComponent, noop, {
    before() {
      // beforeUpdate 钩子
      callHook(vm, 'beforeUpdate')
    }
  }, true)

  // 触发 mounted 钩子
  callHook(vm, 'mounted')

  return vm
}
```

**执行操作**：

1. **存储 $el**
   ```javascript
   vm.$el = el  // 保存对 DOM 元素的引用
   ```

2. **触发 beforeMount**
   ```javascript
   // 此时 DOM 还未创建
   beforeMount() {
     console.log(this.$el)  // 存在但为空
   }
   ```

3. **创建渲染 Watcher**
   ```javascript
   // 这是一个特殊的 Watcher，用来监听数据变化
   // 当数据改变时自动调用 updateComponent 重新渲染
   ```

4. **执行初始渲染**
   ```javascript
   updateComponent()  // 首次调用
   ```

---

### 1️⃣1️⃣ 虚拟 DOM 创建和更新

#### 虚拟 DOM 结构

```javascript
// 虚拟 DOM（VNode）的结构
{
  tag: 'div',           // 标签名
  data: {               // 属性、事件、样式等
    attrs: { id: 'app' },
    class: ['container'],
    on: { click: handler }
  },
  children: [           // 子节点
    {
      tag: 'p',
      data: { staticClass: 'text' },
      text: 'Hello'
    }
  ],
  elm: <DOM Element>,   // 对应的真实 DOM 元素
  key: undefined,       // 用于 diff 的 key
  component: undefined  // 所属组件实例
}
```

#### _render 过程

```javascript
Vue.prototype._render = function() {
  const vm = this
  const { render, _parentVnode } = vm.$options

  // 执行 render 函数
  let vnode = render.call(vm, vm.$createElement)

  // 错误处理
  if (vnode instanceof VNode) {
    return vnode
  } else if (Array.isArray(vnode)) {
    // 返回 Fragment
    return createFragment(vnode)
  } else {
    return createEmptyVNode()
  }
}
```

**执行操作**：
- ✅ 调用 `render()` 函数
- ✅ 返回虚拟 DOM 树

#### _update 过程

```javascript
Vue.prototype._update = function(vnode, hydrating) {
  const vm = this
  const prevVnode = vm._vnode
  vm._vnode = vnode

  if (!prevVnode) {
    // 首次渲染：创建真实 DOM
    vm.$el = vm.__patch__(vm.$el, vnode)
  } else {
    // 更新渲染：Diff 并更新 DOM
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
}
```

**执行操作**：
- ✅ 执行 Patch（Diff）算法
- ✅ 比较旧的虚拟 DOM 和新的虚拟 DOM
- ✅ 计算出最小的 DOM 改动
- ✅ 将改动应用到真实 DOM

#### Patch（Diff）算法

```javascript
function patch(oldVnode, newVnode) {
  if (!oldVnode) {
    // 创建新元素
    createElm(newVnode)
  } else if (!newVnode) {
    // 删除旧元素
    removeVnode(oldVnode)
  } else if (sameVnode(oldVnode, newVnode)) {
    // 相同的节点：更新属性和子元素
    patchVnode(oldVnode, newVnode)
  } else {
    // 完全不同：替换
    replaceVnode(oldVnode, newVnode)
  }
}

function patchVnode(oldVnode, newVnode) {
  // 1. 更新属性
  updateAttrs(oldVnode.data, newVnode.data)

  // 2. 更新子节点
  if (oldVnode.children && newVnode.children) {
    updateChildren(oldVnode.children, newVnode.children)
  } else if (newVnode.children) {
    addChildren(oldVnode.elm, newVnode.children)
  } else if (oldVnode.children) {
    removeChildren(oldVnode.elm)
  }
}
```

**Diff 算法的核心**：

```
比较新旧虚拟 DOM 树
    ↓
逐层对比
    ↓
相同的部分直接复用
    ↓
不同的部分更新或替换
    ↓
生成最小的 DOM 改动操作
    ↓
应用到真实 DOM
```

---

### 1️⃣2️⃣ mounted 钩子

此时的实例状态：

```javascript
new Vue({
  el: '#app',
  template: '<div id="app">{{ message }}</div>',
  data() {
    return { message: 'Hello Vue' }
  },
  mounted() {
    console.log(this.$el)          // ✅ <div id="app">...</div>
    console.log(this.$el.innerHTML) // ✅ 'Hello Vue'
    console.log(this.message)      // ✅ 'Hello Vue'

    // 现在可以访问真实 DOM
    const elem = this.$el.querySelector('p')
    elem.style.color = 'red'
  }
})
```

**特点**：
- ✅ 真实 DOM 已经创建并插入页面
- ✅ 可以访问 `$el` 和操作 DOM
- ✅ 所有数据、计算属性、方法都已初始化
- 🎯 用途：操作 DOM、初始化第三方库（jQuery 插件等）

---

## 响应式系统的工作原理

### 响应式属性的三个阶段

```javascript
// 第一阶段：定义 getter/setter
Object.defineProperty(vm, 'count', {
  get() {
    // 收集依赖
    Dep.target && dep.addSub(Dep.target)
    return vm._data.count
  },
  set(newVal) {
    vm._data.count = newVal
    // 通知所有依赖者更新
    dep.notify()
  }
})

// 第二阶段：访问属性（收集依赖）
vm.count  // 触发 getter，Watcher 被添加到订阅列表

// 第三阶段：修改属性（通知更新）
vm.count = 5  // 触发 setter，所有 Watchers 被通知
```

### 依赖追踪流程

```
访问响应式属性 (getter)
    ↓
Dep.target 不为空（表示有 Watcher 正在执行）
    ↓
收集 Watcher 作为依赖
    ↓
修改响应式属性 (setter)
    ↓
触发 dep.notify()
    ↓
通知所有收集的 Watchers
    ↓
执行 Watcher 的更新回调
    ↓
触发视图更新或其他响应
```

### 观察者模式

```javascript
// Dep（发布者）：一个属性对应一个 Dep
class Dep {
  constructor() {
    this.subs = []  // 订阅者列表
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    // 通知所有订阅者更新
    this.subs.forEach(sub => sub.update())
  }
}

// Watcher（订阅者）：监听属性变化
class Watcher {
  constructor(vm, expOrFn, callback) {
    this.vm = vm
    this.expOrFn = expOrFn
    this.callback = callback

    // 访问属性，触发 getter，添加自己到 Dep.subs
    this.value = this.get()
  }

  get() {
    Dep.target = this  // 标记当前 Watcher
    const value = this.vm[this.expOrFn]
    Dep.target = null  // 取消标记
    return value
  }

  update() {
    // 属性改变时调用
    const oldValue = this.value
    const newValue = this.get()
    this.callback.call(this.vm, newValue, oldValue)
  }
}
```

---

## 完整 new Vue 流程时间轴

```
├─ new Vue({...})
│
├─ Vue 构造函数
│  └─ 调用 _init()
│
├─ _init() 方法
│  ├─ 选项合并
│  ├─ 初始化内部属性
│  ├─ initLifecycle()
│  ├─ initEvents()
│  ├─ initRender()
│  │
│  ├─ 【beforeCreate 钩子】🎯
│  │  ❌ data 不可用
│  │  ❌ methods 不可用
│  │  ✅ 内部属性可用
│  │
│  ├─ initInjections()      (inject 依赖注入)
│  │
│  ├─ initState()
│  │  ├─ initData()           (响应式 data)
│  │  ├─ initComputed()       (计算属性)
│  │  ├─ initMethods()        (方法)
│  │  └─ initWatch()          (监听)
│  │
│  ├─ initProvide()          (provide 提供者)
│  │
│  ├─ 【created 钩子】🎯
│  │  ✅ data 可用
│  │  ✅ methods 可用
│  │  ✅ computed 可用
│  │  ❌ $el 不可用
│  │
│  └─ 自动调用 $mount()（如果有 el）
│
├─ $mount() 方法
│  ├─ 获取挂载点 DOM
│  ├─ 获取/编译模板
│  │  ├─ Parse（解析 HTML）
│  │  ├─ Optimize（优化 AST）
│  │  ├─ CodeGen（生成代码）
│  │  └─ 编译为 render 函数
│  │
│  └─ mountComponent()
│
├─ mountComponent() 方法
│  ├─ 【beforeMount 钩子】🎯
│  │  ✅ $el 存在但为空
│  │  ❌ 真实 DOM 未创建
│  │
│  ├─ 创建渲染 Watcher
│  │
│  ├─ 执行 updateComponent()
│  │  ├─ _render()            (创建虚拟 DOM)
│  │  │  └─ 调用 render 函数
│  │  │
│  │  └─ _update()            (更新真实 DOM)
│  │     ├─ __patch__()       (Diff 算法)
│  │     └─ 创建真实 DOM
│  │
│  ├─ 【mounted 钩子】🎯
│  │  ✅ 真实 DOM 创建完成
│  │  ✅ $el 包含完整内容
│  │  ✅ 可以操作 DOM
│  │
│  └─ 返回 Vue 实例
│
└─ Vue 实例完全就绪 ✅
   现在可以响应用户交互和数据变化
```

---

## 关键概念总结

### 生命周期钩子顺序

| 钩子 | 时机 | 可用 | 用途 |
|------|------|------|------|
| beforeCreate | 初始化前 | 无 data | 全局初始化 |
| created | 初始化后 | 有 data | AJAX 请求 |
| beforeMount | 挂载前 | 无 DOM | - |
| mounted | 挂载完成 | 有 DOM | 操作 DOM |
| beforeUpdate | 更新前 | 新 data | - |
| updated | 更新完成 | 新 data | - |
| beforeUnmount | 销毁前 | 有数据 | 清理资源 |
| unmounted | 销毁完成 | - | - |

### 响应式数据的本质

```javascript
// Vue 的响应式就是：
// ① 用 Object.defineProperty 监听属性变化
// ② 用 Watcher 收集依赖
// ③ 当属性改变时通知 Watcher
// ④ Watcher 触发重新渲染

// 简化的实现：
class VueInstance {
  constructor(data) {
    this._data = data
    this._watchers = []

    // 为每个属性设置 getter/setter
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get: () => this._data[key],
        set: (val) => {
          this._data[key] = val
          // 触发所有依赖更新
          this._watchers.forEach(w => w.update())
        }
      })
    })
  }
}
```

### 虚拟 DOM 的作用

```javascript
// 虚拟 DOM 的三个作用：

// 1️⃣ 抽象：
// 不直接操作真实 DOM（性能差）
// 而是操作虚拟 DOM（快速）
this.count++  // 只修改虚拟 DOM
              // 然后批量更新真实 DOM

// 2️⃣ Diff：
// 比较新旧虚拟 DOM
// 找出最小改动集合
// 减少 DOM 操作

// 3️⃣ 跨平台：
// 虚拟 DOM 可以转换为任何平台的代码
// Web、Native、小程序等
```

---

## 常见问题解答

### Q: 为什么 data 必须是函数？

```javascript
// ❌ 错误：所有实例共享同一个对象
const vm1 = new Vue({
  el: '#app1',
  data: { count: 0 }
})
const vm2 = new Vue({
  el: '#app2',
  data: { count: 0 }
})
vm1.count = 5
console.log(vm2.count)  // 也是 5！

// ✅ 正确：每个实例有独立的对象
const vm1 = new Vue({
  el: '#app1',
  data() { return { count: 0 } }
})
const vm2 = new Vue({
  el: '#app2',
  data() { return { count: 0 } }
})
vm1.count = 5
console.log(vm2.count)  // 0
```

### Q: computed 和 methods 的区别？

```javascript
// computed：基于依赖缓存，依赖不变不重新计算
// ✅ 性能好，用于计算结果
computed: {
  doubled() {
    console.log('计算一次')
    return this.count * 2
  }
}

// methods：每次调用都执行
// ✅ 用于执行函数、发送请求等
methods: {
  getDoubled() {
    console.log('执行一次')
    return this.count * 2
  }
}

// 使用：
this.doubled     // 访问属性
this.getDoubled()  // 调用函数
```

### Q: 为什么要监听数据而不是直接修改 DOM？

```javascript
// ❌ 手动操作 DOM（命令式）
const elem = document.querySelector('#count')
elem.textContent = 0

button.addEventListener('click', () => {
  count++
  elem.textContent = count  // 每次都要手动更新
})

// ✅ Vue 的方式（声明式）
new Vue({
  data: { count: 0 },
  template: '<div>{{ count }}</div>',
  methods: {
    increment() {
      this.count++  // Vue 自动更新 DOM
    }
  }
})

// 声明式的优势：
// 1. 代码简洁
// 2. 自动关联 DOM 和数据
// 3. 易于维护
// 4. 性能优化（Vue 可以批量更新）
```

---

## 性能优化建议

### 1. 避免在 beforeCreate 中进行繁重操作

```javascript
// ❌ 不推荐
beforeCreate() {
  // 此时 data 不可用
  // 但可能会导致内存泄漏
}

// ✅ 推荐
created() {
  // data 已初始化，安全操作
}
```

### 2. 使用计算属性而非方法

```javascript
// ❌ 低效：每次都重新计算
template: '<div>{{ getDoubled() }}</div>',
methods: {
  getDoubled() { return this.count * 2 }
}

// ✅ 高效：有缓存
template: '<div>{{ doubled }}</div>',
computed: {
  doubled() { return this.count * 2 }
}
```

### 3. 避免在模板中进行复杂计算

```javascript
// ❌ 低效
template: '<div>{{ count * 2 + 10 + name.split('').length }}</div>',

// ✅ 高效
computed: {
  result() { return this.count * 2 + 10 + this.name.split('').length }
},
template: '<div>{{ result }}</div>'
```

### 4. 在 mounted 中初始化 DOM 相关操作

```javascript
// ✅ 推荐
mounted() {
  // 初始化第三方库
  new Swiper(this.$el, options)
  // 添加事件监听
  window.addEventListener('scroll', this.handleScroll)
}

beforeUnmount() {
  // 清理事件
  window.removeEventListener('scroll', this.handleScroll)
}
```

---

## 总结

`new Vue` 的完整流程包括：

1. **初始化阶段**：设置内部属性、事件系统、生命周期
2. **响应式化阶段**：将 data 转换为响应式属性
3. **钩子阶段**：执行 `beforeCreate` 和 `created` 钩子
4. **挂载阶段**：编译模板、创建虚拟 DOM
5. **渲染阶段**：将虚拟 DOM 转换为真实 DOM
6. **完成阶段**：执行 `mounted` 钩子，实例就绪

理解这个流程对于深入理解 Vue 的工作原理至关重要！

---

## 面试满分回答框架

### 第一层：高层概述（30秒）

> 新建一个 Vue 实例可以分为三个核心阶段：**初始化** → **数据响应式化** → **挂载渲染**。其中 `_init()` 方法是整个流程的核心，它会依次执行选项合并、初始化内部属性、触发生命周期钩子、处理数据、然后最终调用 `$mount()` 进行挂载。

---

### 第二层：生命周期钩子的关键时点（1分钟）

#### beforeCreate
```javascript
beforeCreate() {
  // ❌ data/methods/computed 都不可用
  // ❌ $el 不存在
  // ✅ 内部属性可用（_uid, _isVue）
  // 🎯 用途：全局初始化，不依赖实例数据
}
```

#### created ⭐ 重点
```javascript
created() {
  // ✅ data 可用
  // ✅ methods 可用
  // ✅ computed 可用
  // ✅ watch 可用
  // ❌ $el 不存在，真实 DOM 还未创建

  // 🎯 最佳实践位置：
  // - 发送 AJAX 请求获取数据
  // - 初始化定时器
  // - 处理路由参数
  // - 订阅事件
}
```

#### beforeMount
```javascript
beforeMount() {
  // ✅ $el 存在但为空（占位符）
  // ❌ 真实 DOM 还未创建
  // ✅ 即将开始挂载过程
}
```

#### mounted ⭐ 重点
```javascript
mounted() {
  // ✅ 真实 DOM 已创建并插入页面
  // ✅ 可以访问和操作 $el
  // ✅ 所有数据、计算属性、方法都已初始化

  // 🎯 最佳实践位置：
  // - DOM 操作（获取元素、修改样式）
  // - 初始化第三方库（jQuery 插件、Swiper 等）
  // - 绑定全局事件监听
  // - 获取子组件的引用
}
```

---

### 第三层：核心数据处理细节（2-3分钟）

#### 选项合并（Option Merge）

```javascript
// Vue 会进行三层选项合并：

// 1️⃣ 组件的默认选项 + 用户传入的选项
const mergedOptions = mergeOptions(
  resolveConstructorOptions(vm.constructor),  // Vue 默认选项
  options || {},                               // 用户选项
  vm
)

// 2️⃣ 合并策略（不同选项有不同的合并方式）
// - data: 用户的覆盖默认的
// - methods: 合并，同名时用户的优先
// - computed: 合并，同名时用户的优先
// - watch: 数组拼接
// - created、mounted 等钩子：都会执行（数组形式）

// 3️⃣ 高级特性（mixin 和 extend）
// - mixin 选项会被提前合并
// - 父类选项会被继承和合并
```

#### initState 的完整流程

```javascript
function initState(vm) {
  // 执行顺序很关键！

  // 1️⃣ initData：初始化数据
  if (opts.data) {
    initData(vm)
    // 现在 vm.count 可以访问了
  }

  // 2️⃣ initComputed：初始化计算属性
  if (opts.computed) {
    initComputed(vm, opts.computed)
    // 现在 vm.doubled 可以访问了
  }

  // 3️⃣ initMethods：初始化方法
  if (opts.methods) {
    initMethods(vm, opts.methods)
    // 现在 vm.increment() 可以调用了
  }

  // 4️⃣ initWatch：初始化监听
  if (opts.watch) {
    initWatch(vm, opts.watch)
    // 现在监听器已激活
  }
}
```

#### 数据代理的工作机制

```javascript
// Vue 做的不仅仅是响应式化，还有数据代理！

// 原始存储位置
vm._data = {
  count: 0
}

// 代理访问（让用户可以直接访问 vm.count）
Object.defineProperty(vm, 'count', {
  get() {
    // 每当访问 vm.count 时
    // 实际访问的是 vm._data.count
    return vm._data.count
  },
  set(newVal) {
    // 每当设置 vm.count 时
    // 实际设置的是 vm._data.count
    vm._data.count = newVal
    // 然后触发依赖更新
  }
})

// 这样就可以直接写：this.count，而不是 this._data.count
```

#### inject/provide 执行顺序详解

```javascript
// ⚠️ 关键点：inject 和 provide 的执行位置决定了它们的能力

// 流程图：
// 1️⃣ beforeCreate 钩子 ← 此时 data 还未初始化
//    ↓
// 2️⃣ initInjections(vm) ← 处理 inject
//    - 从父级查找 provide 值
//    - 添加到实例上（非响应式）
//    ↓
// 3️⃣ initState(vm) ← 处理 data/computed/methods
//    ↓
// 4️⃣ initProvide(vm) ← 处理 provide
//    - 如果 provide 是函数，可以访问 this.data
//    ↓
// 5️⃣ created 钩子 ← 此时所有都已初始化

// 示例：
// 父组件
const Parent = {
  data() {
    return { message: 'Hello' }
  },
  provide() {
    // ✅ 这里可以访问 this.message
    // 因为此时 initState 已经执行过了
    return {
      message: this.message
    }
  }
}

// 子组件
const Child = {
  inject: ['message'],
  created() {
    console.log(this.message)  // "Hello"
  }
}
```

---

### 第四层：虚拟 DOM 和渲染过程（2分钟）

#### $mount() 的完整过程

```javascript
// 当调用 $mount() 时：

// 1️⃣ 获取挂载点
el = document.querySelector('#app')

// 2️⃣ 获取模板（优先级从高到低）
//    优先级 1️⃣ : render 函数
if (options.render) {
  // 已经有 render 函数，跳过编译
}

//    优先级 2️⃣ : template 选项
else if (options.template) {
  const template = options.template
  // template 可以是字符串或 DOM 选择器
}

//    优先级 3️⃣ : el 的 innerHTML
else if (el) {
  const template = el.innerHTML
  // 例：<div id="app"><p>Hello</p></div>
  // 会使用 '<p>Hello</p>' 作为模板
}

// 3️⃣ 编译模板成 render 函数
const { render, staticRenderFns } = compileToFunctions(template)
options.render = render

// 4️⃣ 调用 mountComponent 开始挂载
```

#### 模板编译的三个阶段

```javascript
// 编译器的三个阶段（Compiler）

// 📝 第一阶段：Parse（解析）
// 输入：HTML 字符串
// 输出：AST（抽象语法树）
const ast = parse('<div>{{ message }}</div>')
// 结果：
{
  type: 1,  // type: 1 表示 element
  tag: 'div',
  children: [
    {
      type: 2,  // type: 2 表示 text
      expression: '_v(_s(message))'  // 绑定表达式
    }
  ]
}

// 🎯 第二阶段：Optimize（优化）
// 识别哪些节点是静态的，可以跳过重新渲染
optimize(ast)
// 现在 AST 节点被标记：
// - 静态节点（static: true）：不会改变，可以一直复用
// - 动态节点（static: false）：可能改变，需要重新渲染

// 💻 第三阶段：CodeGen（代码生成）
// 将 AST 转换为 render 函数代码
const code = generate(ast)
// 输出字符串形式的代码：
`
with(this) {
  return _c('div', [
    _v(_s(message))
  ])
}
`

// 🔧 第四步：转换为可执行函数
const render = new Function(code)

// 其中：
// _c = createElement
// _v = createTextVNode
// _s = toString
```

#### _render 和 _update 过程

```javascript
// updateComponent 函数是渲染的核心：
let updateComponent = () => {
  // 步骤 1️⃣ : _render() 生成虚拟 DOM
  const vnode = vm._render()
  // 执行 render 函数，返回虚拟 DOM 树
  // 虚拟 DOM 就是一个普通的 JavaScript 对象

  // 步骤 2️⃣ : _update() 更新真实 DOM
  vm._update(vnode, hydrating)
  // 比较新旧虚拟 DOM（Diff 算法）
  // 计算最小改动
  // 应用到真实 DOM
}

// 这个 updateComponent 函数由 Watcher 管理
// 当任何响应式属性改变时，Watcher 会自动调用它
```

#### Diff 算法的核心原理

```javascript
// Diff 算法是 Virtual DOM 的灵魂，它决定了性能

// 🎯 目标：找出最小的 DOM 改动集合

// 📊 对比策略（同层对比，从不跨层对比）
//
// 旧树：                新树：
//   div                   div
//   /\                    /\
//  p  span      vs      p  span
//
// ✅ div 和 div 对比 → 更新属性
// ✅ p 和 p 对比 → 更新内容
// ✅ span 和 span 对比 → 更新内容

// ❌ 不会这样做：
//   div                   div
//   /\                    /\
//  p  span      vs      span p  ← 跨层对比（太复杂）

// 🔑 核心判断函数：sameVnode()
function sameVnode(oldVnode, newVnode) {
  return (
    oldVnode.key === newVnode.key &&           // key 相同
    oldVnode.tag === newVnode.tag &&           // 标签名相同
    oldVnode.elm.nodeType === newVnode.elm.nodeType  // 节点类型相同
  )
}

// 📝 如果 sameVnode() 返回 true，执行 patchVnode()
function patchVnode(oldVnode, newVnode) {
  // 1️⃣ 更新属性
  updateAttrs(oldVnode.data, newVnode.data)
  updateClass(oldVnode, newVnode)
  updateStyle(oldVnode, newVnode)

  // 2️⃣ 更新子节点（最复杂的部分）
  updateChildren(oldVnode.children, newVnode.children)
}

// 🎪 updateChildren 使用双指针算法：
//
// 旧节点列表：[A, B, C, D]
// 新节点列表：[A, C, B, D]
//
// 指针位置：
//  oldStart=0, oldEnd=3
//  newStart=0, newEnd=3
//
// 对比顺序：
// 1️⃣ oldStart(A) vs newStart(A) → 相同，跳过
// 2️⃣ oldEnd(D) vs newEnd(D) → 相同，跳过
// 3️⃣ oldStart(B) vs newStart(C) → 不同
//    搜索 C 在旧列表中的位置 → index=2
//    移动 C 到正确位置
// ... 继续对比
//
// 结果：最小化 DOM 操作，只需要移动一次

// ⚡ 使用 key 属性的重要性：
//
// ❌ 没有 key：Vue 无法追踪每个节点
// 列表重新排序时，Vue 会重新渲染所有节点
//
// ✅ 有 key：Vue 可以精确追踪每个节点
// 列表重新排序时，Vue 只移动节点，不重新渲染
//
// 示例：
items: [
  { id: 1, text: 'A' },
  { id: 2, text: 'B' },
  { id: 3, text: 'C' }
]

// ✅ 推荐写法
<div v-for="item in items" :key="item.id">{{ item.text }}</div>

// ❌ 不推荐写法
<div v-for="item in items" :key="index">{{ item.text }}</div>
// 原因：当列表重新排序时，index 虽然没变，但对应的数据已经改变了
```

---

### 第五层：响应式系统的本质（高级，2分钟）

#### 响应式工作流完整版

```javascript
// 💡 Vue 响应式的三个核心机制：

// 机制 1️⃣ : 数据劫持（Data Hijacking）
// 使用 Object.defineProperty 拦截属性访问
Object.defineProperty(vm._data, 'count', {
  get() {
    // 这里会触发依赖收集
    return value
  },
  set(newVal) {
    // 这里会通知所有依赖者
    value = newVal
  }
})

// 机制 2️⃣ : 依赖收集（Dependency Collection）
// 当访问属性时，记录哪个 Watcher 依赖这个属性
class Dep {
  constructor() {
    this.subs = []  // 存储所有依赖这个属性的 Watcher
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  notify() {
    // 当属性改变时，通知所有 Watcher
    this.subs.forEach(watcher => watcher.update())
  }
}

// 机制 3️⃣ : 通知更新（Notification）
// 当属性改变时，触发 Watcher 的 update 方法
// Watcher 会重新执行它的回调（比如重新渲染）

// 完整流程演示：
console.log('=== 初始化 ===')
const vm = new Vue({
  data: { count: 0 },
  watch: {
    count(newVal, oldVal) {
      console.log(`count 从 ${oldVal} 改变为 ${newVal}`)
    }
  }
})
// 此时：
// 1. count 被转换为响应式属性
// 2. 监听器创建了一个 Watcher
// 3. Watcher 的 get() 方法触发，记录自己为 count 的依赖

console.log('=== 访问属性 ===')
console.log(vm.count)  // 触发 getter，Watcher 被记录在 count 的依赖列表中

console.log('=== 修改属性 ===')
vm.count = 1
// 触发流程：
// 1. 触发 setter
// 2. count 对应的 Dep 调用 notify()
// 3. 通知所有依赖的 Watcher
// 4. Watcher 执行 update() 方法
// 5. 如果是渲染 Watcher，会重新调用 updateComponent()
// 6. updateComponent 重新渲染组件
// 输出：count 从 0 改变为 1
```

#### Watcher 的三种类型

```javascript
// Vue 中的 Watcher 分为三种，各有不同的用途：

// 🎨 类型 1️⃣ : 渲染 Watcher（最重要）
// 在 mountComponent 时创建
new Watcher(vm, updateComponent, noop, {
  before() {
    callHook(vm, 'beforeUpdate')
  }
}, true)
// 作用：当任何响应式属性改变时，重新执行 updateComponent
// 触发：beforeUpdate → _render → _update → 视图更新

// 👁️ 类型 2️⃣ : 计算属性 Watcher
// 在 initComputed 时创建
new Watcher(vm, () => this.count * 2, noop, {
  lazy: true  // 延迟执行（只在访问时计算）
})
// 作用：追踪计算属性的依赖，实现缓存机制

// 👁️ 类型 3️⃣ : 用户 Watcher
// 用户在 watch 选项中定义的
new Watcher(vm, 'count', callback, {
  deep: true,     // 深度监听
  immediate: true // 立即执行
})
// 作用：监听用户指定的属性变化

// 优先级对比：
// 当同一属性被多个 Watcher 依赖时，更新顺序是：
// 1️⃣ 计算属性 Watcher（因为渲染可能依赖它）
// 2️⃣ 用户 Watcher（可能需要更新数据）
// 3️⃣ 渲染 Watcher（最后更新视图）
```

---

### 加分项：能讲出的细节（5个核心细节）

#### 1️⃣ 为什么 data 必须是函数？

```javascript
// ❌ 错误做法（组件中）
const MyComponent = {
  data: {  // 这是一个对象
    count: 0
  }
}

// 问题：
const vm1 = new Vue(MyComponent)
const vm2 = new Vue(MyComponent)
vm1.count = 5
console.log(vm2.count)  // 5（应该是 0！）
// 原因：两个实例共享同一个 data 对象

// ✅ 正确做法
const MyComponent = {
  data() {  // 这是一个函数
    return {
      count: 0
    }
  }
}

// 现在：
const vm1 = new Vue(MyComponent)
const vm2 = new Vue(MyComponent)
vm1.count = 5
console.log(vm2.count)  // 0（正确！）
// 原因：每个实例都调用 data() 获得一个新对象

// 规则：
// - 在组件中：data 必须是函数
// - 在根实例中：data 可以是对象（但最好也用函数）
```

#### 2️⃣ computed 和 methods 的区别

```javascript
// 📊 对比表格
//
// 特性        | computed        | methods
// ------------|-----------------|------------------
// 调用方式    | 属性访问        | 函数调用
// 执行时机    | 延迟（访问时）  | 立即（手动调用）
// 结果缓存    | ✅ 有（基于依赖）| ❌ 无（每次重新计算）
// this 上下文 | ✅ 正确          | ✅ 正确
// 性能        | ✅ 优（缓存）   | ❌ 差（每次计算）
// 副作用      | ❌ 不应该有      | ✅ 可以有

// 📌 何时使用 computed：
// - 属性依赖其他响应式属性
// - 结果需要缓存
// - 获取 getter、setter

computed: {
  fullName() {
    return this.firstName + ' ' + this.lastName
  },
  // 支持 setter
  fullName: {
    get() { return this.firstName + ' ' + this.lastName },
    set(val) { /* ... */ }
  }
}

// 📌 何时使用 methods：
// - 需要传参
// - 有副作用（修改数据、发送请求）
// - 每次都需要重新执行

methods: {
  increment(step = 1) {
    this.count += step
  },
  async fetchData() {
    const response = await fetch('/api/data')
    this.data = await response.json()
  }
}

// ⚠️ 常见误区：
// ❌ 不要在 computed 中发送请求
computed: {
  users() {
    // ❌ 这会导致无限请求！
    fetch('/api/users').then(data => this.users = data)
    return this.users
  }
}

// ✅ 应该在 created 或 watch 中
created() {
  this.fetchUsers()
},
methods: {
  async fetchUsers() {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }
}
```

#### 3️⃣ 为什么要用虚拟 DOM？

```javascript
// 问题：直接操作真实 DOM 为什么慢？

// ❌ 命令式（直接 DOM 操作）
document.querySelector('#count').textContent = 0
button.addEventListener('click', () => {
  count++
  document.querySelector('#count').textContent = count  // 每次都改一次
})

// 性能问题：
// 1️⃣ 频繁的 DOM 操作（最慢）
// 2️⃣ 无法批量更新（导致多次重排/重绘）
// 3️⃣ 难以维护（命令式代码复杂）
// 4️⃣ 容易出 bug（手动同步数据和 DOM）

// ✅ 声明式（虚拟 DOM）
new Vue({
  data: { count: 0 },
  template: '<div>{{ count }}</div>',
  methods: {
    increment() {
      this.count++  // 只修改数据
      // Vue 自动：
      // 1. 更新虚拟 DOM
      // 2. Diff 算法找出改动
      // 3. 批量更新真实 DOM（只改一次）
    }
  }
})

// 虚拟 DOM 的三个优势：

// 💡 优势 1️⃣ : 性能优化
// 虚拟 DOM 是纯 JavaScript 对象，操作很快
// 真实 DOM 是浏览器 API，操作慢
// 虚拟 DOM 可以批量更新，减少真实 DOM 操作

// 💡 优势 2️⃣ : 跨平台
// 虚拟 DOM 可以被转换为任何平台的代码
// 例如：转换为原生 App、小程序、甚至 3D

// 💡 优势 3️⃣ : 易于维护
// 声明式编程比命令式更易读易维护
// 数据变化时，视图自动更新（无需手动同步）

// 📊 性能对比：
//
// 场景：更新列表中的 1 个元素（列表有 100 个元素）
//
// 直接 DOM：100 次 DOM 操作
// 虚拟 DOM：
//   1. 更新虚拟 DOM（毫秒级，JavaScript 操作）
//   2. Diff 找出 1 处改动
//   3. 只更新 1 个 DOM 元素
```

#### 4️⃣ Diff 算法的关键：key 属性

```javascript
// 🎯 为什么 key 这么重要？

// ❌ 没有 key 的问题：

// 原始列表：
items: [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]

template: '<input :value="item.name" />'

// 假设输入框已经输入了内容（没有绑定 v-model）
// 第一个输入框内容："A已编辑"
// 第二个输入框内容："B已编辑"
// 第三个输入框内容："C已编辑"

// 现在删除第一个元素（id=1）：
items: [
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]

// 🔴 问题发生了！
// Vue 看到还有 2 个输入框，更新内容：
// 第一个输入框显示：B已编辑（但应该清空）
// 第二个输入框显示：C已编辑（但应该清空）
//
// 原因：没有 key，Vue 只是按位置复用 DOM
// 虽然数据改变了，但 DOM 节点还是原来的那些

// ✅ 有 key 的解决方案：

template: '<input :key="item.id" :value="item.name" />'

// 现在 Vue 知道：
// - id=2 的项对应的输入框需要显示"B已编辑"
// - id=3 的项对应的输入框需要显示"C已编辑"
// - 旧的 id=1 的输入框应该被删除

// 所以显示会正确：
// 第一个输入框：B已编辑
// 第二个输入框：C已编辑

// 📌 key 的最佳实践：

// ✅ 推荐：使用稳定的唯一标识符
<div v-for="item in items" :key="item.id">{{ item.name }}</div>

// ❌ 不推荐：使用索引
<div v-for="(item, index) in items" :key="index">{{ item.name }}</div>
// 原因：当列表重新排序或删除项时，索引会变化，无法正确追踪

// ❌ 非常不推荐：没有 key
<div v-for="item in items">{{ item.name }}</div>

// 🔑 key 的工作原理：
// 1. Vue 用 key 作为虚拟 DOM 的唯一标识
// 2. 当列表更新时，Vue 用 key 来追踪节点
// 3. 相同 key 的节点会复用 DOM（包括状态，如输入框内容）
// 4. 不同 key 的节点会创建新 DOM 或删除旧 DOM
```

#### 5️⃣ $mount() 的自动调用时机

```javascript
// Vue 什么时候会自动调用 $mount()？

// ✅ 自动挂载：有 el 选项
const vm = new Vue({
  el: '#app',        // ← 有 el 选项
  template: '<div>Hello</div>'
})
// 等价于：
// const vm = new Vue({...})
// vm.$mount('#app')  // 自动调用

// ❌ 不自动挂载：没有 el 选项
const vm = new Vue({
  // 没有 el 选项
  template: '<div>Hello</div>'
})
// 现在 vm 没有被挂载到任何元素上
// 必须手动调用：vm.$mount('#app')

// 📌 使用场景：

// 场景 1️⃣ : 普通使用（自动挂载）
new Vue({
  el: '#app',
  template: '<App></App>'
})

// 场景 2️⃣ : 动态创建组件（手动挂载）
const MyComponent = Vue.extend({
  template: '<div>Dynamic</div>'
})
const instance = new MyComponent()
instance.$mount()  // 创建 DOM 但不插入页面
document.body.appendChild(instance.$el)  // 手动插入

// 场景 3️⃣ : 延迟挂载
const vm = new Vue({
  template: '<div>{{ message }}</div>',
  data: { message: 'Hello' }
})
// 等待某个条件后再挂载
setTimeout(() => {
  vm.$mount('#app')
}, 1000)
```

---

### 易扣分的地方（面试中要避免）

❌ **混淆生命周期时的数据可用性**
- 说"beforeCreate 时 data 可用"（错！data 在 created 才可用）
- 说"beforeMount 时真实 DOM 已创建"（错！真实 DOM 在 mounted 才创建）

❌ **响应式系统理解不清**
- 只能说"用 Object.defineProperty"，但说不出为什么要用
- 不知道 Dep 和 Watcher 的关系
- 混淆"数据劫持"和"依赖收集"的概念

❌ **模板编译过程说不清**
- 不知道 template 怎么变成 render 函数的
- 不知道编译的三个阶段（parse、optimize、codegen）

❌ **虚拟 DOM 和 Diff 算法**
- 不知道为什么要用虚拟 DOM
- 不知道 key 属性的作用
- 不知道 Diff 算法的同层对比策略

❌ **选项合并机制**
- 不知道 mixin 和 extend 中的选项怎么合并
- 不知道钩子为什么可以是数组（都会执行）

❌ **性能优化认识不足**
- 认为"虚拟 DOM 总是比直接 DOM 快"（错，简单场景不一定快）
- 不知道计算属性为什么要用而不是方法
