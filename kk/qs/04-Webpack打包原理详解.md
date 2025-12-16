# Webpack 打包原理详解

## 考点概述
Webpack是现代前端开发的核心工具。理解其工作原理对于优化应用性能、解决构建问题至关重要。

---

## 核心概念

### 1. Webpack 的本质
**通俗解释：**
Webpack就像一个"邮件处理中心"：
- 你丢进去各种文件（JS、CSS、图片、字体等）
- Webpack会打开、检查、改造这些文件
- 最后都打包成浏览器能理解的产物

**为什么需要Webpack？**
```
问题1：浏览器加载速度慢
├─ 原因：发送100个请求比发送1个请求慢
└─ 解决：Webpack合并文件

问题2：浏览器不支持新特性
├─ 原因：浏览器只能执行JavaScript，但我们写TypeScript、JSX
└─ 解决：Webpack转译代码

问题3：资源管理复杂
├─ 原因：手动管理各种资源的加载顺序很困难
└─ 解决：Webpack自动处理依赖关系

问题4：代码重复多
├─ 原因：相同的库被多个地方引入
└─ 解决：Webpack智能去重
```

---

### 2. Webpack 核心概念

**四大基本概念：**

```
Entry (入口)
├─ 应用的起点文件
├─ Webpack从这里开始分析
└─ 通常是main.js或index.js

Module (模块)
├─ Webpack将一切看作模块
├─ JS、CSS、图片都是模块
└─ 模块之间有依赖关系

Output (输出)
├─ 打包后的产物去哪里
├─ 通常是dist/目录
└─ 产物可被浏览器直接加载

Loader (加载器)
├─ 处理非JS的资源
├─ CSS → JS (style-loader)
├─ 图片 → Data URL (url-loader)
└─ TypeScript → JavaScript (ts-loader)

Plugin (插件)
├─ 增强Webpack功能
├─ 优化构建过程
└─ 生成HTML、提取CSS等
```

---

## Webpack 打包流程详解

### 3. 打包的 5 个阶段

**完整流程图：**
```
Stage 1: 初始化 (Initialization)
  ├─ 读取配置文件 (webpack.config.js)
  ├─ 创建Compiler对象
  ├─ 注册插件
  └─ 输出：Compiler实例

      ↓

Stage 2: 编译 (Compilation)
  ├─ 从entry开始递归解析依赖
  ├─ 每个模块经过loader处理
  ├─ 生成抽象语法树 (AST)
  ├─ 提取模块之间的依赖关系
  └─ 输出：Module Dependency Graph (模块依赖图)

      ↓

Stage 3: 优化 (Optimization)
  ├─ Tree Shaking（去除未使用代码）
  ├─ Code Splitting（代码分割）
  ├─ 去重和压缩
  └─ 输出：优化后的依赖图

      ↓

Stage 4: 生成 (Generation)
  ├─ 根据优化后的模块图
  ├─ 生成最终的bundled代码
  ├─ 生成source map（用于调试）
  └─ 输出：可执行的JS代码

      ↓ 

Stage 5: 写入 (Emit)
  ├─ 将产物写入到output目录
  ├─ 执行插件的emit钩子
  ├─ 生成HTML文件
  └─ 输出：dist/目录下的文件
```

---

### 4. 详细的编译阶段

**第一步：入口解析**
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js'  // ← 从这里开始
}

// src/index.js
import { add } from './math'
import { Component } from './component'

console.log(add(1, 2))
new Component()

// Webpack开始：
// 1. 读取./src/index.js
// 2. 找到import语句
// 3. 记录依赖：./math 和 ./component
```

**第二步：递归处理依赖**
```
依赖树构建：
                src/index.js
                /          \
              /              \
          ./math        ./component.vue
            |                |
          ./util           ./style.css

Webpack会处理所有文件，包括CSS和Vue！
```

**第三步：Loader 处理**
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      // 规则1：处理JS/JSX
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      // 规则2：处理CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
        // ← 注意顺序！从右到左执行
        // css-loader先处理CSS
        // style-loader再注入到JS
      },
      // 规则3：处理TypeScript
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      // 规则4：处理图片
      {
        test: /\.(png|jpg|gif)$/,
        use: 'url-loader',
        options: {
          limit: 8192  // 小于8KB转为Data URL
        }
      }
    ]
  }
}
```

**Loader 执行细节：**
```
原始CSS文件：
┌──────────────────────┐
│ .btn { color: red; } │
└──────────────────────┘
         ↓
   css-loader处理
         ↓
┌────────────────────────────────┐
│ module.exports = {             │
│   default: ".btn { ... }"      │
│ }                              │
└────────────────────────────────┘
         ↓
  style-loader处理
         ↓
┌────────────────────────────────────────────┐
│ const style = document.createElement(...)  │
│ style.innerHTML = ".btn { ... }"           │
│ document.head.appendChild(style)           │
└────────────────────────────────────────────┘
         ↓
   结果：CSS注入到JS中！
```

**第四步：生成模块索引**
```javascript
// 最终产物示意
(function(modules) {
  // 模块缓存
  var installedModules = {}

  // 模块加载函数
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    }

    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    )

    module.l = true
    return module.exports
  }

  // 执行入口模块
  return __webpack_require__(__webpack_require__.s = 0)
})({
  // 模块0：./src/index.js
  0: (function(module, exports, __webpack_require__) {
    const { add } = __webpack_require__(1)
    console.log(add(1, 2))
  }),

  // 模块1：./src/math.js
  1: (function(module, exports, __webpack_require__) {
    const add = (a, b) => a + b
    module.exports = { add }
  })
})
```

---

### 5. 代码分割（Code Splitting）

**为什么需要代码分割？**
```
单个bundle问题：
├─ 初始加载时间长
├─ 一个地方改动，整个bundle失效
├─ 无法按需加载

解决方案：分割成多个chunk
├─ vendor.js（第三方库）- 不常改变
├─ main.js（业务代码）- 经常改变
├─ components.js（组件）- 按需加载
```

**代码分割方法：**

```javascript
// 方法1：多入口
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  },
  output: {
    filename: '[name].js'
  }
  // 输出：app.js, admin.js
}

// 方法2：动态导入（推荐）
// src/app.js
button.addEventListener('click', () => {
  import('./heavy-module').then(module => {
    module.doSomething()
  })
})
// 输出：main.js, 0.js (heavy-module)

// 方法3：SplitChunksPlugin（提取公共代码）
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
}
// 输出：
// - vendors.js (所有node_modules)
// - main.js (业务代码)
// - common.js (公共代码)
```

---

### 6. 树摇（Tree Shaking）

**原理：**
```javascript
// math.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export const multiply = (a, b) => a * b

// app.js
import { add } from './math'  // ← 只导入add
console.log(add(1, 2))

// Webpack的分析：
// 1. subtract和multiply没有被导入
// 2. 它们没有被使用
// 3. 在生产环境下删除它们！

// 最终产物中，subtract和multiply会被移除
```

**Tree Shaking 要求：**
```javascript
// ❌ CommonJS - 无法Tree Shaking
module.exports = { add, subtract }

// ✅ ES Module - 可以Tree Shaking
export { add, subtract }

// 原因：
// - CommonJS在运行时决定导出
// - ES Module在编译时就确定导出
// - Webpack在编译阶段才能分析未使用代码
```

**配置Tree Shaking：**
```javascript
// webpack.config.js
module.exports = {
  mode: 'production',  // ← 自动启用Tree Shaking
  optimization: {
    usedExports: true  // ← 标记未使用导出
  }
}

// package.json
{
  "sideEffects": [
    "./src/styles/index.css",  // 这些文件即使未导入也要保留
    "./src/polyfills.js"
  ]
}
```

---

## Plugin 详解

### 7. 常用插件

**HtmlWebpackPlugin**
```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',  // 模板文件
      filename: 'index.html',        // 输出文件名
      minify: {
        removeComments: true,        // 删除HTML注释
        collapseWhitespace: true     // 压缩空白
      }
    })
  ]
}

// 自动做的事情：
// 1. 读取./src/index.html
// 2. 注入<script src="main.js"></script>
// 3. 注入<link rel="stylesheet" href="main.css">
// 4. 写入./dist/index.html
```

**MiniCssExtractPlugin**
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // ← 替代style-loader
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
}

// 效果：
// CSS从JS中提取出来，单独成一个文件
// 浏览器可以并行加载CSS和JS
// 缓存策略更好
```

**DefinePlugin**
```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.API_URL': JSON.stringify('https://api.example.com')
    })
  ]
}

// 在代码中使用
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production')
}

// 编译后：
if ('production' === 'production') {
  console.log('Running in production')
}
// 然后被优化为：
console.log('Running in production')
```

---

## Loader 深入

### 8. 自定义 Loader

```javascript
// 自定义的markdown-loader.js
module.exports = function(content) {
  // content是文件内容（字符串）
  // 返回处理后的结果

  // 示例：将Markdown转为HTML
  const marked = require('marked')
  const html = marked(content)

  // 返回JavaScript代码
  return `
    const html = ${JSON.stringify(html)}
    export default html
  `
}

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: './loaders/markdown-loader.js'
      }
    ]
  }
}

// 使用
import content from './README.md'
console.log(content)  // HTML字符串
```

**Loader 链式调用：**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',           // 第3步：注入到DOM
          'css-loader',             // 第2步：处理CSS导入
          'sass-loader'             // 第1步：SCSS → CSS
        ]
      }
    ]
  }
}

// 执行顺序是从右到左！
// sass-loader → css-loader → style-loader
```

---

## 性能优化

### 9. 常见优化策略

**1. 减小 Bundle 体积**
```javascript
// 分析bundle大小
// npm install webpack-bundle-analyzer --save-dev

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
// 生成可视化报告

// 优化方案：
// - 使用Tree Shaking移除未使用代码
// - 代码分割，按需加载
// - 使用更小的库（lodash-es替代lodash）
// - 提取第三方库为单独chunk
```

**2. 缓存优化**
```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js'
  }
}

// [contenthash]基于内容生成hash
// 内容不变，hash不变
// 用户浏览器缓存命中率高

// 比较：
// [hash] - 整个构建的hash（任何文件变化都影响）
// [chunkhash] - chunk的hash（该chunk变化才影响）
// [contenthash] - 文件内容的hash（最细粒度）
```

**3. 构建速度优化**
```javascript
module.exports = {
  // 使用更快的source map
  devtool: 'eval-cheap-module-source-map',  // 开发环境
  // devtool: 'source-map'  // 生产环境

  // 缩小处理范围
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,  // ← 不处理node_modules
        use: 'babel-loader'
      }
    ]
  },

  // 多进程编译
  // npm install thread-loader --save-dev
  {
    test: /\.js$/,
    use: [
      'thread-loader',  // ← 多进程
      'babel-loader'
    ]
  },

  // 缓存babel结果
  {
    test: /\.js$/,
    use: {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true  // ← 启用缓存
      }
    }
  }
}
```

---

## Webpack 配置示例

### 10. 完整的生产配置

```javascript
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  mode: 'production',

  entry: {
    main: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    clean: true  // 清除旧文件
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: { maxSize: 8 * 1024 }
        }
      }
    ]
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5
        }
      }
    }
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: true
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    })
  ]
}
```

---

---

## Loader 和 Plugin 执行过程详解

### 11. Loader 执行过程

**Loader 是什么？**
Loader 是一个转换函数，将模块源代码作为参数，返回转换后的代码。

**Loader 执行的完整流程：**

```
Stage 1: 匹配阶段
  ├─ Webpack 遇到模块 (如 style.css)
  ├─ 检查 webpack.config.js 中的 rules
  ├─ 用正则表达式 test 属性匹配文件名
  └─ 找到匹配的 rule

        ↓

Stage 2: 加载阶段
  ├─ 读取模块的源代码（原始文件内容）
  ├─ 准备 Loader 链
  └─ 获取 Loader 实例

        ↓

Stage 3: 执行阶段（重要！）
  ├─ use 数组中的 Loader 从右到左执行
  ├─ 上一个 Loader 的输出 = 下一个 Loader 的输入
  └─ 最后一个 Loader 的输出进入 Webpack

        ↓

Stage 4: 输出阶段
  └─ 转换后的代码被 Webpack 继续处理
```

**具体执行顺序示例：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',    // 第3步执行
          'css-loader',      // 第2步执行
          'sass-loader'      // 第1步执行
        ]
      }
    ]
  }
}

// 执行顺序详解：
// ─────────────────────────────────────────

// 输入：style.scss 文件
/*
$primary: #333;
.btn {
  color: $primary;
}
*/

// ↓ sass-loader 处理（第1步）
/*
.btn {
  color: #333;
}
*/

// ↓ css-loader 处理（第2步）
/*
module.exports = {
  default: ".btn { color: #333; }",
  locals: {}
}
*/

// ↓ style-loader 处理（第3步）
/*
const style = document.createElement('style');
style.innerHTML = ".btn { color: #333; }";
document.head.appendChild(style);
module.exports = {};
*/

// 输出：可执行的 JavaScript 代码
```

**Loader 链式执行的关键点：**

```javascript
// 每个 Loader 必须返回 JavaScript 代码或 Buffer
module.exports = function(source) {
  // source 是上一个 Loader 的输出（或原始文件内容）

  const result = processSource(source)

  // 必须返回字符串或 Buffer
  return result
}

// 如果有多个 Loader，形成管道：
// 原始文件 → Loader1 → Loader2 → Loader3 → Webpack
```

**Loader 执行顺序的验证：**

```javascript
// custom-loader-1.js
module.exports = function(source) {
  console.log('Loader 1 执行')
  return source + '\n// Loader 1 processed'
}

// custom-loader-2.js
module.exports = function(source) {
  console.log('Loader 2 执行')
  return source + '\n// Loader 2 processed'
}

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: [
          './custom-loader-1.js',
          './custom-loader-2.js'
        ]
      }
    ]
  }
}

// 控制台输出：
// Loader 2 执行
// Loader 1 执行
// （从右到左执行）
```

---

### 12. Plugin 执行过程

**Plugin 是什么？**
Plugin 是一个具有 apply 方法的类或对象，可以在 Webpack 编译生命周期的特定时刻执行代码。

**Plugin 执行的完整流程：**

```
Stage 1: 创建阶段
  ├─ Webpack 读取 plugins 配置
  ├─ 实例化每个 Plugin
  └─ 调用 Plugin 的 apply() 方法

        ↓

Stage 2: 钩子注册阶段
  ├─ apply() 方法接收 Compiler 对象
  ├─ Plugin 使用 compiler.hooks 注册回调
  ├─ 监听特定的编译事件
  └─ 记录回调函数

        ↓

Stage 3: 编译执行阶段
  ├─ 从 Entry 开始编译
  ├─ 在关键时刻触发已注册的钩子
  ├─ 执行对应的回调函数
  └─ Plugin 修改编译结果或行为

        ↓

Stage 4: 输出完成阶段
  └─ 编译完成后生成输出文件
```

**Plugin 生命周期钩子详解：**

```javascript
// webpack.config.js
const webpack = require('webpack')

class MyPlugin {
  apply(compiler) {
    // 钩子1：初始化完成（早期钩子）
    compiler.hooks.initialize.tap('MyPlugin', () => {
      console.log('1️⃣ 初始化完成')
    })

    // 钩子2：开始编译前
    compiler.hooks.beforeCompile.tapPromise('MyPlugin', () => {
      console.log('2️⃣ 编译前准备')
      return Promise.resolve()
    })

    // 钩子3：编译开始
    compiler.hooks.compile.tap('MyPlugin', () => {
      console.log('3️⃣ 开始编译')
    })

    // 钩子4：编译完成（重要！）
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      console.log('4️⃣ Compilation 创建')

      // 钩子4.1：模块完成
      compilation.hooks.succeedModule.tap('MyPlugin', (module) => {
        console.log('5️⃣ 模块处理完成:', module.name)
      })

      // 钩子4.2：代码生成完成
      compilation.hooks.seal.tap('MyPlugin', () => {
        console.log('6️⃣ 代码生成完成')
      })
    })

    // 钩子5：即将输出资源
    compiler.hooks.emit.tapPromise('MyPlugin', (compilation) => {
      console.log('7️⃣ 即将输出资源')

      // 可以在这里修改输出内容
      compilation.assets['custom.js'] = {
        source: () => 'console.log("added by plugin")',
        size: () => 28
      }

      return Promise.resolve()
    })

    // 钩子6：输出完成
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('8️⃣ 编译完成！')
      console.log('耗时:', stats.endTime - stats.startTime, 'ms')
    })
  }
}

module.exports = {
  plugins: [
    new MyPlugin()
  ]
}
```

**常见钩子执行顺序（编译一次的完整流程）：**

```
1. initialize         → 初始化完成
2. beforeCompile      → 编译前准备
3. compile            → 开始编译
4. compilation        → 编译对象创建
   ├─ succeedModule   → 每个模块处理完成
   ├─ optimize        → 开始优化
   ├─ optimizeChunks  → 优化 chunks
   └─ seal            → 生成代码完成
5. emit               → 即将写入文件
6. afterEmit          → 已写入文件
7. done               → 完全完成
```

**Plugin 和 Loader 的执行时机对比：**

```javascript
// 执行时间对比
const webpack = require('webpack')

class LoggingPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('LoggingPlugin', (compilation) => {
      compilation.hooks.moduleAsset.tap('LoggingPlugin', (module, filename) => {
        console.log('🔄 正在处理模块:', module.resource)
      })
    })

    compiler.hooks.emit.tap('LoggingPlugin', (compilation) => {
      console.log('📦 生成资源:', Object.keys(compilation.assets))
    })
  }
}

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: []
            // Loader 在这里执行
            // 作用：转换单个模块
          }
        }
      }
    ]
  },
  plugins: [
    new LoggingPlugin()
    // Plugin 钩子在整个编译过程中执行
    // 作用：干预整个编译过程
  ]
}
```

**实际应用示例：**

```javascript
// 自定义 Plugin：在编译完成后生成构建报告
class BuildReportPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BuildReportPlugin', (stats) => {
      const report = {
        duration: stats.endTime - stats.startTime,
        files: Object.keys(stats.compilation.assets),
        errors: stats.compilation.errors.length,
        warnings: stats.compilation.warnings.length
      }

      console.log('=== 构建报告 ===')
      console.log(`耗时: ${report.duration}ms`)
      console.log(`输出文件: ${report.files.join(', ')}`)
      console.log(`错误: ${report.errors}`)
      console.log(`警告: ${report.warnings}`)
    })
  }
}

// 自定义 Loader：添加时间戳注释
module.exports = function(source) {
  const timestamp = new Date().toISOString()
  return `/**\n * Generated at ${timestamp}\n */\n${source}`
}
```

---

### 13. babel-loader 执行过程详解

**babel-loader 是什么？**
babel-loader 是一个 Loader，将高级 JavaScript（ES6+、TypeScript 等）转换为浏览器兼容的代码。

**babel-loader 的完整执行流程：**

```
输入：高级 JavaScript 代码
        ↓
Stage 1: 初始化阶段
  ├─ Webpack 遇到 .js/.jsx 文件
  ├─ 匹配到 babel-loader 规则
  ├─ 加载 babel-loader 和 @babel/core
  └─ 读取 .babelrc 或 babel.config.js 配置

        ↓

Stage 2: 解析阶段 (Parse)
  ├─ @babel/core 使用 babylon 解析器
  ├─ 将代码字符串转换为 AST（抽象语法树）
  └─ 记录代码的结构和含义

        ↓

Stage 3: 转换阶段 (Transform)
  ├─ 遍历 AST 的每个节点
  ├─ 应用各个 Plugin 进行转换
  ├─ 每个 Plugin 修改 AST
  └─ 生成转换后的 AST

        ↓

Stage 4: 生成阶段 (Generate)
  ├─ 将转换后的 AST 转回 JavaScript 代码
  ├─ 添加 Source Map（调试信息）
  └─ 返回转换后的代码

        ↓

输出：兼容的 JavaScript 代码
```

**具体执行示例：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: '> 0.25%, not dead'  // 目标浏览器
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ],
            cacheDirectory: true  // 启用缓存
          }
        }
      }
    ]
  }
}

// ────────────────────────────────────────────────

// 输入：app.js
/*
const greeting = (name) => {
  return `Hello, ${name}!`
}

class User {
  name = 'John'  // 类属性（需要 plugin 支持）

  greet() {
    return greeting(this.name)
  }
}

const user = new User()
console.log(user.greet())
*/

// ────────────────────────────────────────────────

// Stage 1: 初始化
/*
✓ 找到 babel-loader
✓ 读取配置：@babel/preset-env, plugin-proposal-class-properties
✓ 准备转换工具
*/

// ────────────────────────────────────────────────

// Stage 2: 解析 (Parse)
/*
babel 使用 babylon 解析器转换为 AST：

AST 结构示例：
{
  type: 'Program',
  body: [
    {
      type: 'VariableDeclaration',
      declarations: [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'greeting' },
        init: {
          type: 'ArrowFunctionExpression',
          params: [{ type: 'Identifier', name: 'name' }],
          body: { /* ... */ }
        }
      }]
    },
    {
      type: 'ClassDeclaration',
      id: { type: 'Identifier', name: 'User' },
      body: {
        type: 'ClassBody',
        body: [
          // 类属性
          {
            type: 'ClassProperty',
            key: { type: 'Identifier', name: 'name' },
            value: { type: 'StringLiteral', value: 'John' }
          },
          // 方法
          { /* greet 方法 */ }
        ]
      }
    }
  ]
}
*/

// ────────────────────────────────────────────────

// Stage 3: 转换 (Transform)
/*
Plugin: @babel/preset-env
  ├─ 转换箭头函数 → 普通函数
  ├─ 转换 const/let → var
  ├─ 转换模板字符串 → 字符串拼接
  └─ ...

Plugin: @babel/plugin-proposal-class-properties
  └─ 转换类属性 → 构造函数中的属性赋值
*/

// ────────────────────────────────────────────────

// Stage 4: 生成 (Generate)
/*
输出代码：

var greeting = function(name) {
  return "Hello, " + name + "!"
}

var User = function() {
  this.name = 'John'
}

User.prototype.greet = function() {
  return greeting(this.name)
}

var user = new User()
console.log(user.greet())

// 还会生成 Source Map 用于调试：
// {"version":3,"sources":["input.js"],...}
*/
```

**babel-loader 的 3 个核心步骤详解：**

```javascript
// 1️⃣ Parse（解析）- 代码 → AST
/*
const code = `
  const add = (a, b) => a + b
`

Babel 使用 babylon 解析器：
↓
AST (Abstract Syntax Tree)
{
  Program: {
    body: [
      VariableDeclaration {
        kind: 'const',
        declarations: [
          VariableDeclarator {
            id: Identifier { name: 'add' },
            init: ArrowFunctionExpression { ... }
          }
        ]
      }
    ]
  }
}
*/

// 2️⃣ Transform（转换）- AST → 新 AST
/*
遍历 AST，应用各个 Plugin：

Plugin: @babel/plugin-transform-arrow-functions
  - 检测 ArrowFunctionExpression 节点
  - 转换为 FunctionExpression

结果 AST：
{
  Program: {
    body: [
      VariableDeclaration {
        kind: 'const',
        declarations: [
          VariableDeclarator {
            id: Identifier { name: 'add' },
            init: FunctionExpression {  // ← 已变更
              params: [Identifier('a'), Identifier('b')],
              body: { /* ... */ }
            }
          }
        ]
      }
    ]
  }
}
*/

// 3️⃣ Generate（生成）- AST → 代码
/*
将转换后的 AST 转回代码：

const add = function(a, b) {
  return a + b
}

+ Source Map（映射回原始代码位置）
*/
```

**babel-loader 配置详解：**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // Presets 预设（多个 Plugin 的组合）
            presets: [
              // @babel/preset-env: 转换 ES6+ 为目标版本
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: '> 0.25%, not dead',
                    // 或指定具体版本：
                    // browsers: ['last 2 versions', 'ie 11']
                  },
                  useBuiltIns: 'usage',  // 按需导入 polyfill
                  corejs: 3
                }
              ],
              // @babel/preset-react: 转换 JSX
              '@babel/preset-react',
              // @babel/preset-typescript: 转换 TypeScript
              '@babel/preset-typescript'
            ],

            // Plugins 插件（单个转换规则）
            plugins: [
              // 转换类属性
              '@babel/plugin-proposal-class-properties',
              // 转换装饰器
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              // 转换 optional chaining (?.)
              '@babel/plugin-proposal-optional-chaining'
            ],

            // 性能优化
            cacheDirectory: true,  // 缓存转换结果（提高速度）
            cacheCompression: false,  // 不压缩缓存（加快读写）

            // Source Map
            sourceType: 'module'
          }
        }
      }
    ]
  }
}
```

**babel-loader 的执行顺序：**

```javascript
// 假设有如下代码：
class Animal {
  constructor(name) {
    this.name = name
  }

  getType = () => this.type  // 箭头函数 + 类属性
}

// Preset/Plugin 执行顺序：
// 1. Plugins 从前往后执行
// 2. Presets 从后往前执行（反向）
// 3. Plugins 的执行顺序很重要！

// 示例顺序：
/*
plugins: [
  '@babel/plugin-proposal-class-properties',  // 1️⃣ 先转换类属性
  '@babel/plugin-transform-arrow-functions'   // 2️⃣ 再转换箭头函数
]

presets: [
  '@babel/preset-typescript',  // 3️⃣ 最后执行（因为 presets 反向）
  '@babel/preset-env'          // 4️⃣ 倒数第二个执行
]

实际执行顺序：
3 → 4 → 1 → 2
*/
```

**babel-loader 的缓存机制：**

```javascript
// 配置缓存后的效果：
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    cacheCompression: false
  }
}

// 缓存位置：
// node_modules/.cache/babel-loader/

// 第一次构建：
// 1. 转换代码（耗时 100ms）
// 2. 保存转换结果到缓存

// 第二次构建（代码未改变）：
// 1. 检查缓存
// 2. 直接使用缓存结果（耗时 5ms）
// ↓ 性能提升 20 倍！

// 缓存失效的情况：
// ❌ .babelrc 文件改变
// ❌ Babel 版本更新
// ❌ Node 版本改变
// ❌ 手动删除缓存目录
```

**babel-loader 处理 JSX 的过程：**

```javascript
// webpack.config.js
{
  loader: 'babel-loader',
  options: {
    presets: ['@babel/preset-react']
  }
}

// 输入：component.jsx
/*
const App = () => {
  return (
    <div className="app">
      <h1>Hello World</h1>
      <Button color="blue" />
    </div>
  )
}
*/

// 转换过程：
// 1. 识别 JSX 语法：<div className="app"> 等
// 2. 转换为 React.createElement() 调用：
/*
const App = () => {
  return React.createElement(
    'div',
    { className: 'app' },
    React.createElement('h1', null, 'Hello World'),
    React.createElement(Button, { color: 'blue' })
  )
}
*/
// 3. 继续用 @babel/preset-env 转换箭头函数等
// 4. 输出最终代码
```

**babel-loader 常见问题及解决方案：**

```javascript
// 问题 1: 代码转换后仍然是 ES6 语法
// 原因：没有配置 @babel/preset-env
// 解决：
{
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead'
    }]
  ]
}

// 问题 2: 某些 API（如 Promise）在低版本浏览器不可用
// 原因：Babel 只转换语法，不转换 API
// 解决：添加 polyfill
{
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',  // ← 按需导入 polyfill
      corejs: 3
    }]
  ]
}

// 问题 3: 转换速度慢
// 原因：每次都重新转换
// 解决：启用缓存
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true
  }
}

// 问题 4: 某些高级特性报错
// 原因：没有配置相应的 plugin
// 解决：添加对应的 plugin
{
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining'
  ]
}
```

**babel-loader 的性能优化：**

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        // 1️⃣ 排除 node_modules，加快转换
        exclude: /node_modules/,
        use: [
          // 2️⃣ 使用 thread-loader 多进程转换
          'thread-loader',
          {
            loader: 'babel-loader',
            options: {
              // 3️⃣ 启用缓存
              cacheDirectory: true,
              // 4️⃣ 只编译必要的特性
              presets: [
                ['@babel/preset-env', {
                  modules: false,  // 保留 ES Module，交给 Webpack 处理
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ]
            }
          }
        ]
      }
    ]
  }
}

// 性能对比：
// 无缓存：100ms
// 有缓存：10ms （提升 10 倍）
// + thread-loader：5ms （再提升 2 倍）
```

**总结：babel-loader 的核心价值**

```
babel-loader 解决的问题：
├─ 浏览器兼容性：新语法 → 旧语法
├─ 框架支持：JSX/TSX → 可执行代码
├─ 特性转换：高级语法 → 基础语法
└─ 优化构建：缓存机制、多进程加速

核心三步：
Parse（解析） → Transform（转换） → Generate（生成）
  ↓             ↓                    ↓
代码 → AST    AST 修改              代码

关键概念：
- Presets：多个 Plugin 的组合
- Plugins：单个转换规则
- AST：代码的结构化表示
- Polyfill：API 兼容垫片
```

---

## Loader vs Plugin 核心区别

```
特性          Loader                      Plugin
─────────────────────────────────────────────────────
作用时机      编译过程中                  编译生命周期
作用范围      单个模块处理                整体编译过程
处理内容      转换源代码                  修改编译行为
执行顺序      从右到左（链式）            按注册顺序
输入输出      source → 转换 → 输出       钩子回调机制
典型例子      babel-loader              HtmlWebpackPlugin
           css-loader                MiniCssExtractPlugin
           ts-loader                DefinePlugin

执行流程：
Source Code → Loader1 → Loader2 → ... → Webpack 处理
                                          ↓
              Plugin监听编译钩子  ←──────┘
              在各阶段执行回调函数
```

---

## 快速自测

- [ ] 能解释Webpack的4个核心概念吗？
- [ ] 知道打包的5个阶段吗？
- [ ] 理解Loader和Plugin的区别吗？
- [ ] 能写出Tree Shaking的配置吗？
- [ ] 知道代码分割的3种方法吗？
- [ ] 能优化bundle体积吗？
- [ ] 理解contenthash的作用吗？
- [ ] 能自己写一个简单的Loader吗？
- [ ] 知道Loader的执行顺序是从右到左吗？
- [ ] 能解释Plugin的apply()方法吗？
- [ ] 理解compiler.hooks和compilation.hooks的区别吗？
- [ ] 能自定义一个简单的Plugin吗？
