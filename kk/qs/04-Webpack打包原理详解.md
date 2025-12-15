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

## 快速自测

- [ ] 能解释Webpack的4个核心概念吗？
- [ ] 知道打包的5个阶段吗？
- [ ] 理解Loader和Plugin的区别吗？
- [ ] 能写出Tree Shaking的配置吗？
- [ ] 知道代码分割的3种方法吗？
- [ ] 能优化bundle体积吗？
- [ ] 理解contenthash的作用吗？
- [ ] 能自己写一个简单的Loader吗？
