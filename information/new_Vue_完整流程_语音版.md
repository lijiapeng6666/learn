# new Vue 完整流程 - 语音版（通俗易懂）

## 开场白

大家好，今天我要给你讲解一个前端面试中最常问的问题：当你写下 new Vue 的时候，Vue 做了什么？

这个问题看似简单，但要讲清楚需要理解 Vue 的核心机制。我会用最通俗的语言和生活中的比喻，帮你彻底理解这个过程。

---

## 第一部分：高层概述（3分钟）

### 核心思想

当你创建一个 Vue 实例时，Vue 要做三件大事：

第一，初始化。这就像给你的房子装上各种系统，比如电气系统、水管系统、通风系统。Vue 也要初始化事件系统、生命周期钩子、内部属性等等。

第二，数据响应式化。这是 Vue 的灵魂。Vue 会把你定义的数据转换成特殊的对象，这样当数据改变时，Vue 就能立刻知道，然后自动更新页面。这就像给数据装上了监控摄像头，一旦有变化就会触发警报。

第三，挂载和渲染。最后 Vue 会把你的模板编译成真实的 DOM，插入到页面中。这就像把房子的设计图纸变成真实的房子。

### 完整的时间线

整个过程是这样的：

首先，你写 new Vue，Vue 的构造函数会被调用。

然后，Vue 会执行一个叫 _init 的方法，这是整个初始化流程的心脏。

接着，Vue 会依次触发四个钩子：beforeCreate、created、beforeMount、mounted。这四个钩子就像是房子装修中的四个检查点，每个检查点都可以做不同的事情。

最后，Vue 实例就完全就绪了，可以响应用户的交互和数据的变化。

---

## 第二部分：生命周期钩子详解（5分钟）

### beforeCreate 钩子

beforeCreate 的意思是在实例创建之前。在这个阶段，Vue 刚刚初始化了一些内部属性和事件系统，但是你在 data 选项中定义的数据还完全不可用。

比如说，如果你在 beforeCreate 中尝试访问 this.count 或者 this.increment 方法，你会得到 undefined。

那 beforeCreate 有什么用呢？它适合做一些全局的初始化工作，不需要依赖实例的数据。比如说，你可能想要全局地修改一些配置，或者初始化一些全局插件。

### created 钩子 - 最重要的钩子之一

created 的意思是在实例创建之后。这是一个非常重要的钩子，因为在这个阶段，Vue 已经初始化好了所有的数据。

此时，你可以访问 this.count、this.increment 方法、this.doubled 计算属性，一切都可用了。但是，真实的 DOM 还没有创建，所以你还不能访问 this.$el。

created 是最常用的钩子，因为这是发送 AJAX 请求的最好时机。为什么？因为此时数据已经初始化好了，你可以在拿到数据之后直接赋值给 this，Vue 会自动更新视图。

### beforeMount 钩子

beforeMount 的意思是在挂载之前。此时 this.$el 是存在的，但是它还是空的，没有真实的 DOM 内容。Vue 即将开始把虚拟 DOM 转换成真实 DOM。

beforeMount 不是很常用，因为大部分时候 DOM 操作应该放在 mounted 之后。

### mounted 钩子 - 最重要的钩子之二

mounted 的意思是挂载完成了。此时真实的 DOM 已经创建好了，并且插入到了页面中。

在这个阶段，你可以访问 this.$el，可以看到真实的 DOM 内容。所有的数据、计算属性、方法都已经初始化好了。

mounted 适合做三件事：

第一，操作 DOM。比如说，你可能需要获取某个元素，然后修改它的样式或者内容。

第二，初始化第三方库。比如说，你可能需要使用 jQuery 插件、Swiper 轮播图、ECharts 图表等等，这些库通常需要在 DOM 存在的时候才能初始化。

第三，绑定全局事件。比如说，你可能需要监听窗口的 resize 事件或者 scroll 事件。

---

## 第三部分：数据处理详解（8分钟）

### 选项合并

当你创建一个 Vue 实例时，Vue 不仅要使用你传入的选项，还要和 Vue 自身的默认选项进行合并。

想象一下，你去餐厅点菜。餐厅有默认的菜单，上面有默认的菜。你可能想要添加一些特殊要求，或者修改某些菜。Vue 的选项合并就是这样一个过程。

对于不同的选项，合并的方式是不同的。比如说：

对于 data 选项，用户定义的会覆盖默认的。

对于 methods 和 computed，如果有同名的，用户定义的会优先。

对于钩子，比如 created 和 mounted，所有的钩子都会被执行。这很重要，意味着如果你用了 mixin 或者 extend，多个 created 钩子都会被执行。

### initState - 数据初始化的心脏

initState 是一个函数，它负责初始化所有的响应式数据。它的执行顺序是这样的：

第一步，初始化 data。Vue 会执行你的 data 函数，获得一个数据对象。然后，Vue 会为这个对象中的每一个属性都设置一个特殊的监控，这样当数据改变时，Vue 就能知道。这个监控使用的技术叫做 Object.defineProperty。

第二步，初始化 computed。对于每一个计算属性，Vue 会创建一个特殊的监控器，叫做 Watcher。这个 Watcher 会记住计算属性依赖的其他属性。当依赖的属性改变时，计算属性会被重新计算。这就是计算属性的缓存机制。

第三步，初始化 methods。Vue 会把所有的方法复制到实例上，并且确保方法中的 this 指向正确的实例。

第四步，初始化 watch。如果你定义了监听器，Vue 会为每一个监听器创建一个 Watcher，这样当被监听的属性改变时，你定义的回调函数就会被执行。

### 数据代理的神奇之处

这是一个很容易被忽视但又很重要的概念。

当你定义一个 data 时，比如说：

```
data() {
  return {
    count: 0
  }
}
```

Vue 实际上会把这个数据存储在一个叫做 _data 的内部属性中。所以你的数据其实是存储在 vm._data.count 中。

但是，Vue 不想让你直接访问 _data，所以 Vue 设置了一个代理。这个代理允许你直接写 this.count，Vue 会自动帮你转换成 this._data.count。

这就像是你住在一个公寓里，你不用知道电表在哪里，只需要支付电费。代理就是这个管理员，帮你处理所有的细节。

### inject 和 provide 的执行顺序

这是一个很常被问到的细节问题。

inject 和 provide 是 Vue 中用来传递数据给深层子组件的机制。

执行顺序是这样的：

首先，beforeCreate 钩子被执行。

然后，initInjections 被执行。这一步会从父组件中查找 provide 的值，然后把它们添加到当前实例中。重要的是，这些值是非响应式的，就是说，即使父组件的 provide 改变了，子组件也不会自动更新。

接着，initState 被执行。这时 data、computed、methods 都被初始化了。

然后，initProvide 被执行。这一步会处理当前组件的 provide。特别的是，如果 provide 是一个函数，这个函数可以访问 this，也就是可以访问当前组件已经初始化好的数据。这是一个很有用的特性，因为有时候你想要 provide 一些依赖于本组件数据的值。

最后，created 钩子被执行。

---

## 第四部分：模板编译详解（8分钟）

### 什么是模板编译

当你写一个 Vue 的模板时，比如说：

```
<div id="app">
  <p>{{ message }}</p>
  <button @click="increment">点击</button>
</div>
```

Vue 需要把这个 HTML 字符串转换成一个 JavaScript 函数，这个函数叫做 render 函数。render 函数会创建虚拟 DOM。

为什么需要这一步呢？因为浏览器不能直接执行 HTML 字符串，但是可以执行 JavaScript 函数。所以 Vue 需要做这个转换。

### 编译的三个阶段

编译过程分为三个阶段：

#### 第一阶段：Parse，就是解析

在这个阶段，Vue 会读取你的 HTML 字符串，从左到右逐个字符地分析它。Vue 会识别出哪些是标签，哪些是文本，哪些是绑定表达式。

Parse 的结果是一个叫做 AST 的东西。AST 的意思是抽象语法树，就是说，把你的 HTML 用一个树形的结构来表示。

比如说，你的 HTML 是：

```
<div>
  <p>{{ message }}</p>
</div>
```

Parse 的结果大概是这样：

```
{
  tag: 'div',
  children: [
    {
      tag: 'p',
      children: [
        {
          type: 'text with expression',
          expression: 'message'
        }
      ]
    }
  ]
}
```

#### 第二阶段：Optimize，就是优化

在这个阶段，Vue 会看你的 AST，然后标记哪些节点是静态的，永远不会改变。

为什么要这样做呢？因为如果一个节点是静态的，Vue 可以跳过它，不用每次都重新渲染它。这可以优化性能。

比如说，你的模板中有一个 HTML 注释，它永远不会改变。Vue 就会把它标记为静态节点。

#### 第三阶段：CodeGen，就是代码生成

在这个阶段，Vue 会看着你的 AST，然后生成一个 JavaScript 函数的代码字符串。

生成的代码看起来像这样：

```
with(this) {
  return _c('div', [
    _c('p', [
      _v(_s(message))
    ]),
    _c('button', {on: {click: increment}}, [
      _v('点击')
    ])
  ])
}
```

其中：

_c 表示 createElement，就是创建一个虚拟 DOM 元素。

_v 表示 createTextVNode，就是创建一个文本节点。

_s 表示 toString，就是把表达式的值转换成字符串。

#### 第四步：转换为可执行函数

最后，Vue 会把这个代码字符串转换成一个真正的 JavaScript 函数。这通常使用 new Function 来完成。

这样，当组件渲染时，这个 render 函数就可以被执行，返回虚拟 DOM。

---

## 第五部分：虚拟 DOM 和渲染（8分钟）

### 虚拟 DOM 是什么

虚拟 DOM 是一个普通的 JavaScript 对象。它用来描述一个真实的 DOM 元素长什么样。

比如说，一个真实的 DOM 元素：

```
<div id="app" class="container" style="color: red;">
  Hello
</div>
```

对应的虚拟 DOM 对象看起来像这样：

```
{
  tag: 'div',
  data: {
    attrs: { id: 'app' },
    class: 'container',
    style: { color: 'red' }
  },
  children: [
    { text: 'Hello' }
  ],
  elm: <真实的 DOM 元素>
}
```

### 为什么要用虚拟 DOM

这是很多初学者想不明白的一个问题。既然我们要转换成真实的 DOM，为什么不直接操作真实的 DOM 呢？

答案是性能。真实的 DOM 操作很慢，虚拟 DOM 操作很快。

想象一下，你要在一个房间里重新布置家具。如果你每次都亲自去房间里搬家具，这会很累很慢。但如果你先在纸上画画，计划好怎么布置，然后才去搬家具，效率就高多了。

虚拟 DOM 就是这张纸。Vue 先在虚拟 DOM 上做改变，然后一次性地把所有改变应用到真实的 DOM。

这样做有三个好处：

第一，性能好。虚拟 DOM 是 JavaScript 对象，操作很快。真实的 DOM 是浏览器 API，操作很慢。如果你修改十个数据，Vue 会批量更新虚拟 DOM，然后一次性地更新真实的 DOM，而不是更新十次。

第二，跨平台。虚拟 DOM 可以被转换成任何平台的代码。可以转换成原生 App，可以转换成小程序，甚至可以转换成 3D 图形。

第三，易于维护。你只需要写声明式的模板，Vue 会自动处理 DOM 的更新，你不用手动操作 DOM。这样代码更清晰，更容易维护。

### mountComponent - 挂载的核心

当你调用 $mount 方法时，Vue 会执行一个叫做 mountComponent 的函数。

首先，Vue 会设置 $el，也就是把你要挂载到的 DOM 元素保存下来。

然后，Vue 会触发 beforeMount 钩子。

接着，Vue 会创建一个特殊的 Watcher，叫做渲染 Watcher。这个 Watcher 会监视所有的响应式属性。一旦有响应式属性改变，这个 Watcher 就会执行一个更新函数。

这个更新函数做两件事：

第一件事，执行 _render 方法，调用 render 函数，得到虚拟 DOM。

第二件事，执行 _update 方法，比较新旧虚拟 DOM，然后更新真实的 DOM。

最后，Vue 会触发 mounted 钩子。

### Diff 算法 - 虚拟 DOM 的灵魂

Diff 算法是虚拟 DOM 最精妙的地方。它的目的是找出新旧虚拟 DOM 之间的最小改动。

想象一下，你有一个很长的清单，需要和新的清单进行对比，找出有哪些不同。Diff 算法就是这样一个过程。

Diff 算法有几个关键的原则：

第一个原则，同层对比。Diff 算法不会跨层对比。也就是说，第一层的节点只会和第一层的节点对比，不会和第二层的节点对比。为什么呢？因为跨层对比会导致算法变得非常复杂，而在实际应用中，跨层改变很少见。

第二个原则，节点对比。当对比两个节点时，Vue 会看三个东西：key、tag（标签名）、节点类型。如果这三个东西都相同，Vue 就认为这两个节点是同一个节点，可以更新。否则，Vue 就认为这是两个不同的节点，会删除旧的，创建新的。

第三个原则，子节点对比。如果两个节点是同一个节点，Vue 会继续对比它们的子节点。如果子节点的顺序改变了，Vue 会使用一个非常聪明的双指针算法来找出最少的移动次数。

key 属性的重要性就体现在这里。key 是用来标识虚拟 DOM 的唯一标识。如果你有一个列表，列表中的每一项都有一个 key，那么当列表重新排序时，Vue 可以根据 key 来追踪每一项。

比如说，你有一个列表：

```
[
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]
```

现在你删除了第一项，列表变成了：

```
[
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]
```

如果没有 key，Vue 会看到，原来有三项，现在有两项。Vue 会更新前两项的内容，删除第三项。这样就会导致不必要的重新渲染。

但如果有 key，Vue 会看到，id=1 的项被删除了，id=2 和 id=3 的项还在。Vue 只需要删除 id=1 的项就可以了。

---

## 第六部分：响应式系统（8分钟）

### 响应式系统的三个核心机制

Vue 的响应式系统是它最强大的地方。它让你可以声明式地写代码，而不用手动去更新 DOM。

响应式系统有三个核心机制：

#### 机制一：数据劫持

数据劫持使用的是 Object.defineProperty。这是一个 JavaScript 的内置方法，允许你拦截对对象属性的访问和修改。

当 Vue 初始化一个响应式属性时，比如说 count，Vue 会为这个属性设置一个特殊的 getter 和 setter。

当你访问 this.count 时，getter 会被执行。getter 会干两件事：一是返回属性的值，二是收集依赖。

当你修改 this.count 时，setter 会被执行。setter 会干两件事：一是设置新的值，二是通知所有依赖这个属性的观察者。

#### 机制二：依赖收集

依赖收集是一个很神奇的过程。它允许 Vue 知道哪些代码依赖于哪个属性。

Vue 使用一个叫做 Watcher 的对象来代表一个依赖。每当有一个 Watcher 需要访问一个属性时，Vue 就会把这个 Watcher 记录下来。

Vue 还使用一个叫做 Dep 的对象来管理所有依赖于一个属性的 Watcher。每个属性都有一个 Dep，这个 Dep 里面存储了所有依赖这个属性的 Watcher。

#### 机制三：通知更新

当一个属性改变时，它对应的 Dep 会通知所有的 Watcher，告诉它们这个属性改变了。

每个 Watcher 都会调用自己的 update 方法。对于渲染 Watcher，update 方法会重新执行 updateComponent，这样就会重新渲染组件。

### 完整的响应式流程

让我用一个完整的例子来说明这个过程：

假设你有一个 Vue 实例：

```
const vm = new Vue({
  data: { count: 0 },
  watch: {
    count(newVal, oldVal) {
      console.log('count 改变了')
    }
  }
})
```

当 Vue 初始化时，会为 count 设置 getter 和 setter。同时，watch 中定义的回调会被包装成一个 Watcher。这个 Watcher 会立刻执行一次，去访问 count，这样 count 就知道自己被这个 Watcher 依赖了。

现在，当你执行 vm.count = 1 时：

第一步，setter 被执行。count 的值被更新为 1。

第二步，count 对应的 Dep 调用 notify 方法，通知所有的 Watcher。

第三步，watch 中的 Watcher 被通知了。Watcher 调用自己的 update 方法。

第四步，update 方法会重新获取 count 的新值，然后调用你定义的回调函数。

第五步，你的回调函数被执行，打印出"count 改变了"。

### 三种 Watcher

Vue 中有三种 Watcher，各有不同的用途：

#### Watcher 类型一：渲染 Watcher

这是最重要的 Watcher。它在 mountComponent 时创建，负责监视所有的响应式属性。

当任何响应式属性改变时，渲染 Watcher 就会执行 updateComponent，重新渲染组件。

#### Watcher 类型二：计算属性 Watcher

这个 Watcher 在 initComputed 时创建，负责追踪计算属性的依赖。

计算属性 Watcher 有一个特殊的特性，叫做 lazy，也就是延迟执行。计算属性不是立刻执行的，而是等到你访问它时才执行。这样就实现了缓存的效果。

#### Watcher 类型三：用户 Watcher

这是用户在 watch 选项中定义的 Watcher。

用户可以指定一个属性名，然后提供一个回调函数。当属性改变时，回调函数就会被执行。

用户 Watcher 支持一些选项，比如 immediate（立即执行）、deep（深度监听）等。

### computed 和 methods 的区别

这是面试中一个经典的问题。computed 和 methods 看起来很像，但实际上有很大的区别。

#### computed 的特点

computed 是计算属性。你定义一个 getter 函数，Vue 会根据这个函数的返回值来创建一个属性。

computed 的最大特点是有缓存。如果依赖的属性没有改变，computed 就不会重新执行，而是返回上一次计算的结果。这可以提高性能。

比如说，你定义一个计算属性：

```
computed: {
  doubled() {
    console.log('计算一次')
    return this.count * 2
  }
}
```

如果 count 没有改变，即使你多次访问 doubled，console.log 也只会执行一次。

#### methods 的特点

methods 是方法。你定义一个函数，可以在模板或者代码中调用它。

methods 没有缓存。每次你调用一个方法，它都会重新执行。

比如说，你定义一个方法：

```
methods: {
  getDoubled() {
    console.log('执行一次')
    return this.count * 2
  }
}
```

每次你调用 getDoubled，console.log 都会执行。

#### 什么时候用 computed，什么时候用 methods

如果你的计算依赖于其他响应式属性，而且计算的结果需要缓存，就用 computed。最常见的场景是计算派生数据。

如果你需要传参，或者有副作用（比如修改数据、发送请求），就用 methods。

一个常见的误区是在 computed 中发送 AJAX 请求。这是错的，因为 computed 是用来计算派生数据的，不是用来发送请求的。如果你需要在数据改变时发送请求，应该用 watch 或者在 created 钩子中做。

---

## 第七部分：常见问题和陷阱（6分钟）

### 问题一：为什么 data 必须是函数

这是初学者经常犯的错误。

如果你在组件中写：

```
const MyComponent = {
  data: {
    count: 0
  }
}
```

当你创建两个这个组件的实例时：

```
const vm1 = new Vue(MyComponent)
const vm2 = new Vue(MyComponent)
```

vm1 和 vm2 会共享同一个 data 对象。这样的话，修改 vm1.count 也会影响 vm2.count。这不是你想要的。

但如果你写：

```
const MyComponent = {
  data() {
    return {
      count: 0
    }
  }
}
```

现在，每个实例都会调用 data 函数，获得一个全新的对象。vm1 和 vm2 的 count 是独立的。

原因很简单：函数会在每次调用时创建一个新的返回值，而对象是引用类型，多个变量可以指向同一个对象。

规则是：在组件中，data 必须是函数。在根实例中，data 可以是对象，但最好也用函数。

### 问题二：$mount 什么时候自动调用

当你创建一个 Vue 实例时，如果你提供了 el 选项：

```
const vm = new Vue({
  el: '#app',
  template: '<div>Hello</div>'
})
```

Vue 会自动调用 vm.$mount('#app')。

但如果你没有提供 el：

```
const vm = new Vue({
  template: '<div>Hello</div>'
})
```

Vue 不会自动挂载。你需要手动调用 vm.$mount('#app')。

这在某些场景下很有用，比如说，你想要动态地创建一个组件，先初始化它，然后再决定在哪里挂载它。

### 问题三：key 属性为什么这么重要

在列表渲染中，key 属性是很重要的。

比如说，你有一个列表，列表中的每一项都有一个输入框：

```
<div v-for="item in items" :key="item.id">
  <input :value="item.name" />
</div>
```

用户在输入框中输入了一些内容。现在你删除了列表中的第一项。

如果没有 key，Vue 会看到列表长度从三变成了二。Vue 会更新前两项的内容，删除第三项。这样的话，用户的输入会被保留，但是关联的数据已经改变了，这会很困惑。

但如果有 key，Vue 会根据 key 来追踪每一项。当你删除第一项时，Vue 知道第一项被删除了，其他项的顺序没有改变。所以 Vue 只会删除第一项，不会动其他项。

所以，key 应该是一个稳定的唯一标识符，通常是数据的 id。不要用索引作为 key，因为当列表重新排序时，索引会改变，这样 key 就失去了作用。

### 问题四：为什么 provide 必须在 initState 之后初始化

这是一个很细节的问题，但很重要。

imagine 你有一个父组件，它想要提供一些基于自身数据的值给子组件：

```
const Parent = {
  data() {
    return { message: 'Hello' }
  },
  provide() {
    return {
      message: this.message
    }
  }
}
```

这里，provide 函数访问了 this.message。但是，如果 initProvide 在 initState 之前执行，this.message 还不存在，就会报错。

所以，Vue 的设计是这样的：inject 在 initState 之前执行（因为 inject 不依赖 data），provide 在 initState 之后执行（因为 provide 可能依赖 data）。

### 问题五：为什么要用虚拟 DOM 而不是直接操作 DOM

初学者有时会问这个问题，想不明白既然最后还是要转换成真实的 DOM，为什么不直接操作 DOM。

答案是性能和可维护性。

从性能角度，虚拟 DOM 允许 Vue 批量更新真实的 DOM。如果你直接操作 DOM，每次修改数据都要更新 DOM，会导致很多次的重排和重绘。虚拟 DOM 可以把多次修改合并成一次 DOM 更新。

从可维护性角度，如果你直接操作 DOM，你的代码会混杂 DOM 操作和业务逻辑，很难维护。使用虚拟 DOM 和声明式模板，你的代码更清晰。

但是，虚拟 DOM 也不是万能的。对于一些简单的、静态的情况，直接操作 DOM 反而更快。但 Vue 对大多数场景都是优化的。

---

## 第八部分：面试答题技巧（4分钟）

### 如何分层次地回答

当面试官问你"描述一下 new Vue 的过程"时，你应该分层次地回答，从宏观到微观。

#### 第一步：30 秒高层概述

首先用 30 秒钟给出一个高层的概述，说出三个核心阶段：初始化、数据响应式化、挂载渲染。

这样可以让面试官知道你理解了全局，而不是一上来就陷入细节。

#### 第二步：1 分钟生命周期钩子

然后花 1 分钟讲解四个重要的生命周期钩子：beforeCreate、created、beforeMount、mounted。

重点强调 created 和 mounted 这两个钩子，说出它们的用途。

#### 第三步：根据面试官的反应深入

如果面试官没有打断你，或者追问了具体的细节，那么你可以深入讲解：

响应式系统，讲解 Object.defineProperty、Dep、Watcher。

虚拟 DOM 和 Diff 算法，讲解为什么要用虚拟 DOM，key 属性的作用。

模板编译，讲解 parse、optimize、codegen 的三个阶段。

#### 第四步：加分项

如果你还有时间，可以讲一些加分项：

为什么 data 必须是函数。

computed 和 methods 的区别。

Watcher 的三种类型。

### 要避免的错误

#### 错误一：混淆生命周期的数据可用性

不要说"beforeCreate 时 data 可用"，这是错的。data 是在 created 才初始化的。

不要说"beforeMount 时真实 DOM 已创建"，这是错的。真实 DOM 是在 mounted 才创建的。

#### 错误二：不理解响应式系统

不要只会说"用 Object.defineProperty"，要说出为什么用，怎么工作。

要能解释 Dep 和 Watcher 的关系。

#### 错误三：不知道虚拟 DOM 的作用

要能解释为什么要用虚拟 DOM，而不仅仅是"Vue 使用虚拟 DOM"。

要知道 Diff 算法的同层对比策略。

#### 错误四：不重视 key 属性

很多人不明白 key 属性为什么重要。要能用例子说明没有 key 会导致什么问题。

#### 错误五：说不清执行顺序

要能准确说出 inject、initState、provide 的执行顺序。

要能说出 beforeCreate、created、beforeMount、mounted 的执行顺序，以及每个钩子时数据的可用性。

---

## 第九部分：总结（3分钟）

### 整个流程的核心是什么

当你写 new Vue 时，Vue 做了很多事情，但核心就是两件：

第一，初始化。Vue 初始化了各种系统，包括事件系统、生命周期系统、内部属性。

第二，响应式化。Vue 把你的数据转换成响应式的，这样当数据改变时，Vue 能够自动知道，并更新视图。

第三，编译和渲染。Vue 把你的模板编译成 render 函数，然后执行这个函数生成虚拟 DOM，最后转换成真实 DOM。

### 为什么要理解这个过程

理解这个过程有很多好处：

第一，可以更好地使用 Vue。你会知道什么时候该用什么钩子，什么时候该用 computed 和 methods。

第二，可以更好地调试。当出现问题时，你知道问题可能出在哪个阶段。

第三，可以优化性能。你会知道什么操作会导致不必要的渲染，怎么样才能写出高效的代码。

第四，在面试中脱颖而出。面试官问 new Vue 的过程，大多数人只能说出生命周期钩子。但如果你能讲清楚响应式系统、虚拟 DOM、Diff 算法，面试官会对你印象深刻。

### 最后的话

Vue 的设计非常精妙，从初始化到响应式化，再到编译和渲染，每一步都经过了深思熟虑。

要完全理解 Vue，最好的方法就是读源代码。但如果你没有时间读源代码，这份文档应该能帮你理解 Vue 的工作原理。

祝你面试顺利！

---

## 附录：快速记忆点

### 四个生命周期钩子的顺序和数据可用性

```
1. beforeCreate
   ❌ data、methods、computed 都不可用
   ✅ 内部属性可用

2. created
   ✅ data、methods、computed 都可用
   ❌ $el 不可用

3. beforeMount
   ✅ $el 存在但为空
   ❌ 真实 DOM 未创建

4. mounted
   ✅ 真实 DOM 已创建，可以操作
```

### 响应式系统的三个层次

```
1. 数据劫持：Object.defineProperty
2. 依赖收集：Dep 和 Watcher
3. 通知更新：setter 触发 notify，Watcher 执行 update
```

### 虚拟 DOM 的三个阶段

```
1. _render：执行 render 函数，生成虚拟 DOM
2. __patch__：执行 Diff 算法，比较新旧虚拟 DOM
3. 真实 DOM 更新：应用最小改动
```

### 模板编译的三个阶段

```
1. Parse：HTML 字符串 → AST
2. Optimize：标记静态节点
3. CodeGen：AST → render 函数代码 → 可执行函数
```

### Diff 算法的关键

```
1. 同层对比，不跨层
2. 用 key、tag、nodeType 来判断是否是同一节点
3. 双指针算法来比较子节点
4. key 属性很重要，应该是稳定的唯一标识
```

### 常见问题速答

```
Q: data 为什么是函数？
A: 避免多个实例共享同一个对象

Q: computed 和 methods 的区别？
A: computed 有缓存，methods 没有

Q: 为什么用虚拟 DOM？
A: 性能好、跨平台、易维护

Q: key 属性有什么作用？
A: 帮助 Vue 追踪列表项，减少不必要的渲染

Q: $mount 什么时候自动调用？
A: 有 el 选项时自动调用

Q: provide 何时初始化？
A: initState 之后，这样才能访问 this.data
```

这就是 new Vue 完整流程的全文字版本，专门为语音朗读优化！

---

**结束语**

感谢你听完这个详细的讲解。希望这份文档能帮你深入理解 Vue 的工作原理。

记住，理解比记忆更重要。不要试图背诵这些内容，而是要理解每一个概念，这样才能在面试中灵活应对。

祝你学习愉快，面试成功！
