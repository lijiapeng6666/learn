# Webpack 5 阶段完整演示

这个示例展示了一个简单项目从源代码到最终产物的完整过程。

---

## 初始项目结构

```
project/
├── webpack.config.js
├── package.json
├── src/
│   ├── index.js (入口文件)
│   ├── math.js
│   ├── util.js
│   └── style.css
└── dist/
    └── (打包后的产物)
```

### 源代码文件

**src/index.js (入口)**
```javascript
import { add } from './math.js'
import { multiply } from './util.js'
import './style.css'

console.log('Result:', add(5, 3))
console.log('Multiply:', multiply(4, 2))
```

**src/math.js**
```javascript
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b  // ❌ 未使用，会被Tree Shaking删除
```

**src/util.js**
```javascript
export const multiply = (a, b) => a * b
export const divide = (a, b) => a / b    // ❌ 未使用，会被Tree Shaking删除
```

**src/style.css**
```css
body {
  color: blue;
}
```

**webpack.config.js**
```javascript
module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

---

## Stage 1: 初始化（Initialization）

**这个阶段做什么：**
- 读取 webpack.config.js 配置文件
- 创建 Compiler 对象
- 注册所有插件
- 准备开始编译

**这个阶段的输出：**

```javascript
// Compiler 对象（简化表示）
{
  // 配置信息
  options: {
    mode: 'production',
    entry: './src/index.js',
    output: { filename: 'bundle.js' },
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'] }
      ]
    }
  },

  // 已注册的插件
  plugins: [],

  // 准备好的 loaders
  loaders: {
    'css-loader': [Function],
    'style-loader': [Function],
    'babel-loader': [Function]
  },

  // 状态标志
  _isCompiling: false,
  _readyToRun: true
}
```

**内存中的信息：**
```
✓ 配置已加载
✓ Loaders 已注册
✓ Plugins 已注册
✓ 准备开始读取源文件
```

---

## Stage 2: 编译（Compilation）

**这个阶段做什么：**
- 从 entry 开始递归解析依赖
- 每个模块经过对应的 loader 处理
- 生成 AST（抽象语法树）
- 提取模块之间的依赖关系
- 构建完整的"模块依赖图"

### 2.1 第一步：入口解析

**输入：** `./src/index.js`

```javascript
// 读取文件内容
import { add } from './math.js'
import { multiply } from './util.js'
import './style.css'

console.log('Result:', add(5, 3))
console.log('Multiply:', multiply(4, 2))
```

**输出：** 找到的依赖关系

```
入口文件分析：
src/index.js
├─ 依赖1：./math.js (import { add } from './math.js')
├─ 依赖2：./util.js (import { multiply } from './util.js')
└─ 依赖3：./style.css (import './style.css')
```

### 2.2 第二步：递归处理依赖

**处理 src/math.js：**

```javascript
// 原始文件
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
```

**经过 babel-loader 处理后：**
```javascript
exports.add = function (a, b) {
  return a + b;
};
exports.subtract = function (a, b) {
  return a - b;
};
```

**经过 AST 分析：**
```
Module {
  id: './src/math.js',
  exports: ['add', 'subtract'],
  code: '...',
  dependencies: []  // 没有依赖其他模块
}
```

---

**处理 src/util.js：**

```javascript
// 原始文件
export const multiply = (a, b) => a * b
export const divide = (a, b) => a / b
```

**经过 babel-loader 处理后：**
```javascript
exports.multiply = function (a, b) {
  return a * b;
};
exports.divide = function (a, b) {
  return a / b;
};
```

**经过 AST 分析：**
```
Module {
  id: './src/util.js',
  exports: ['multiply', 'divide'],
  code: '...',
  dependencies: []  // 没有依赖其他模块
}
```

---

**处理 src/style.css：**

```css
/* 原始文件 */
body {
  color: blue;
}
```

**经过 css-loader 处理：**
```javascript
// css-loader 将 CSS 转换为 JS
module.exports = "body { color: blue; }"
```

**经过 style-loader 处理：**
```javascript
// style-loader 生成注入代码
const style = document.createElement('style')
style.innerHTML = "body { color: blue; }"
document.head.appendChild(style)
```

**最终 CSS 以 JS 形式存在：**
```javascript
// 最终产物（简化）
(function() {
  const style = document.createElement('style')
  style.innerHTML = "body { color: blue; }"
  document.head.appendChild(style)
})()
```

---

### 2.3 Stage 2 的最终输出：模块依赖图

```javascript
// 这是内存中的完整映射
{
  modules: {
    // 模块 0：入口文件
    0: {
      id: './src/index.js',
      code: `
        const { add } = __webpack_require__(1)
        const { multiply } = __webpack_require__(2)
        __webpack_require__(3)
        console.log('Result:', add(5, 3))
        console.log('Multiply:', multiply(4, 2))
      `,
      dependencies: {
        './math.js': 1,
        './util.js': 2,
        './style.css': 3
      },
      // 使用情况分析
      usedExports: {
        1: ['add'],        // 只使用了 add，subtract 未使用
        2: ['multiply'],   // 只使用了 multiply，divide 未使用
        3: true            // 整个 CSS 都使用
      }
    },

    // 模块 1：math.js
    1: {
      id: './src/math.js',
      code: `
        exports.add = function (a, b) {
          return a + b;
        };
        exports.subtract = function (a, b) {
          return a - b;
        };
      `,
      exports: ['add', 'subtract'],
      dependencies: {}
    },

    // 模块 2：util.js
    2: {
      id: './src/util.js',
      code: `
        exports.multiply = function (a, b) {
          return a * b;
        };
        exports.divide = function (a, b) {
          return a / b;
        };
      `,
      exports: ['multiply', 'divide'],
      dependencies: {}
    },

    // 模块 3：style.css
    3: {
      id: './src/style.css',
      code: `
        const style = document.createElement('style')
        style.innerHTML = "body { color: blue; }"
        document.head.appendChild(style)
      `,
      dependencies: {}
    }
  },

  // 依赖关系图
  graph: {
    './src/index.js': ['./src/math.js', './src/util.js', './src/style.css'],
    './src/math.js': [],
    './src/util.js': [],
    './src/style.css': []
  }
}
```

**这个图表表示：**
```
index.js (模块0)
├─ 需要 math.js (模块1) → 但只用了 add，subtract 未使用
├─ 需要 util.js (模块2) → 但只用了 multiply，divide 未使用
└─ 需要 style.css (模块3) → 全部使用

math.js 和 util.js 没有进一步的依赖
```

---

## Stage 3: 优化（Optimization）

**这个阶段做什么：**
- 根据依赖图做 Tree Shaking（删除未使用的导出）
- 进行代码压缩
- 去重合并

### 3.1 Tree Shaking 分析

**删除前：**
```
模块 1 (math.js)：
  ✓ exports.add       ← 被使用
  ✗ exports.subtract  ← 未被使用，删除！

模块 2 (util.js)：
  ✓ exports.multiply  ← 被使用
  ✗ exports.divide    ← 未被使用，删除！

模块 3 (style.css)：
  ✓ 整个 CSS          ← 被使用，保留
```

### 3.2 优化后的模块依赖图

```javascript
{
  modules: {
    // 模块 0：入口（无变化）
    0: {
      id: './src/index.js',
      code: `
        const { add } = __webpack_require__(1)
        const { multiply } = __webpack_require__(2)
        __webpack_require__(3)
        console.log('Result:', add(5, 3))
        console.log('Multiply:', multiply(4, 2))
      `,
      dependencies: {
        './math.js': 1,
        './util.js': 2,
        './style.css': 3
      }
    },

    // 模块 1：math.js（subtract 已删除）
    1: {
      id: './src/math.js',
      code: `
        exports.add = function (a, b) {
          return a + b;
        };
        // ❌ subtract 已被 Tree Shaking 删除
      `,
      exports: ['add']  // 只剩下 add
    },

    // 模块 2：util.js（divide 已删除）
    2: {
      id: './src/util.js',
      code: `
        exports.multiply = function (a, b) {
          return a * b;
        };
        // ❌ divide 已被 Tree Shaking 删除
      `,
      exports: ['multiply']  // 只剩下 multiply
    },

    // 模块 3：style.css（无变化）
    3: {
      id: './src/style.css',
      code: `
        const style = document.createElement('style')
        style.innerHTML = "body { color: blue; }"
        document.head.appendChild(style)
      `
    }
  }
}
```

**优化结果：**
- ✂️ 删除了 `subtract` 函数
- ✂️ 删除了 `divide` 函数
- 代码体积更小了！

---

## Stage 4: 生成（Generation）

**这个阶段做什么：**
- 根据优化后的模块图生成最终的 JS 代码
- 生成 source map（用于调试）

### 4.1 生成的最终 Bundle 代码

**输出文件：dist/bundle.js**

```javascript
/******/ (function(modules) { // webpackBootstrap
/******/ 	// 模块缓存对象
/******/ 	var installedModules = {};
/******/
/******/ 	// 模块加载函数（核心）
/******/ 	function __webpack_require__(moduleId) {
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		module.l = true;
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// 执行入口模块
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, exports, __webpack_require__) {

const { add } = __webpack_require__(1)
const { multiply } = __webpack_require__(2)
__webpack_require__(3)

console.log('Result:', add(5, 3))
console.log('Multiply:', multiply(4, 2))

/***/ }),

/***/ 1:
/*!*********************!*\
  !*** ./src/math.js ***!
  \**********************/
/*! exports provided: add */
/***/ (function(module, exports) {

// ❌ subtract 被删除了
exports.add = function (a, b) {
  return a + b;
};

/***/ }),

/***/ 2:
/*!*********************!*\
  !*** ./src/util.js ***!
  \**********************/
/*! exports provided: multiply */
/***/ (function(module, exports) {

// ❌ divide 被删除了
exports.multiply = function (a, b) {
  return a * b;
};

/***/ }),

/***/ 3:
/*!**********************!*\
  !*** ./src/style.css ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// style.css 被转换为 JS
const styleContent = "body { color: blue; }"
const style = document.createElement('style')
style.innerHTML = styleContent
document.head.appendChild(style)

/***/ })

/******/ });
```

### 4.2 Source Map（调试用）

**输出文件：dist/bundle.js.map**

```json
{
  "version": 3,
  "sources": [
    "webpack:///webpack/bootstrap",
    "webpack:///./src/index.js",
    "webpack:///./src/math.js",
    "webpack:///./src/util.js",
    "webpack:///./src/style.css"
  ],
  "mappings": "AAAA;AACA;AACA;...",
  "file": "bundle.js",
  "sourcesContent": [
    "// 原始的 index.js 内容",
    "// 原始的 math.js 内容",
    "..."
  ]
}
```

**作用：** 当在浏览器调试时，错误栈会映射回原始源文件

---

## Stage 5: 写入（Emit）

**这个阶段做什么：**
- 将产物写入磁盘（output 目录）
- 执行插件的 emit 钩子
- 生成必要的辅助文件

### 5.1 最终产物文件结构

```
dist/
├── bundle.js          ← 最终的 bundle 代码（可在浏览器中加载）
├── bundle.js.map      ← Source map（用于调试）
└── index.html         ← 如果使用了 HtmlWebpackPlugin，会自动生成
```

### 5.2 生成的 HTML 文件（如果使用了 HtmlWebpackPlugin）

**dist/index.html**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>My App</title>
</head>
<body>
  <div id="app"></div>
  <!-- ✅ 自动注入的 bundle.js -->
  <script src="bundle.js"></script>
</body>
</html>
```

### 5.3 浏览器加载流程

```
1. 浏览器加载 index.html
2. 遇到 <script src="bundle.js"></script>
3. 加载并执行 bundle.js

执行流程：
  ↓
  __webpack_require__(0)  // 加载模块 0（入口）
  ↓
  需要模块 1，调用 __webpack_require__(1)
  ↓
  需要模块 2，调用 __webpack_require__(2)
  ↓
  需要模块 3，调用 __webpack_require__(3)
  ↓
  执行：console.log('Result:', add(5, 3))
  ↓
  执行：console.log('Multiply:', multiply(4, 2))
  ↓
  CSS 被注入到 DOM 中
  ↓
  页面渲染完成！
```

### 5.4 实际的浏览器输出

```
控制台输出：
Result: 8
Multiply: 8

DOM 中：
<style>body { color: blue; }</style>

页面背景变成蓝色
```

---

## 完整对比总结

| 阶段 | 输入 | 工作内容 | 输出形式 | 能看到什么 |
|------|------|--------|--------|---------|
| **Stage 1** | 配置文件 | 读取配置、初始化 | 内存中的 Compiler 对象 | ❌ 看不到（内存中） |
| **Stage 2** | 源代码文件 | 解析、分析、处理 | 模块依赖图（结构化数据） | ❌ 看不到（内存中） |
| **Stage 3** | 模块依赖图 | Tree Shaking、优化 | 优化后的依赖图 | ❌ 看不到（内存中） |
| **Stage 4** | 优化后的依赖图 | 生成代码、source map | JS 代码 + source map | ✅ 看到 bundle.js |
| **Stage 5** | JS 代码 + source map | 写入磁盘、生成 HTML | dist/ 目录中的文件 | ✅ 看到 dist/ 中的文件 |

---

## 关键要点

### 1️⃣ Stage 1-3 都在内存中
- 没有任何文件写入磁盘
- 用户看不到中间产物
- 都是数据结构的转换

### 2️⃣ Stage 4 才生成代码
- 根据优化后的依赖图生成 JS
- 生成 source map
- 但还没写入磁盘

### 3️⃣ Stage 5 才能看到最终产物
- 将 Stage 4 的产物写入 dist/ 目录
- 生成 HTML 文件
- 用户终于能看到真实的文件了

### 4️⃣ Tree Shaking 在 Stage 3 完成
- subtract 和 divide 被删除
- 最终 bundle 更小
- 性能更好

---

## 如何验证这个过程

### 在浏览器中验证：
```bash
# 打开 dist/bundle.js
# 搜索 "subtract" - 找不到！已被删除
# 搜索 "divide" - 找不到！已被删除
# 搜索 "add" - 能找到！被保留
# 搜索 "color: blue" - 能找到！CSS 被注入
```

### 在开发工具中验证：
```bash
# 打开浏览器 DevTools
# 查看 Sources 标签
# 加载 bundle.js.map
# 可以看到原始的源代码！
```

