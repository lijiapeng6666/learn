# Stage 4 代码生成详解 - 从依赖图到 Bundle

这部分解释 Webpack 如何将"优化后的模块依赖图"转换成最终的 `bundle.js`。

---

## 准备阶段：来自 Stage 3 的输入

### Stage 3 输出的优化后依赖图

```javascript
// 这就是 Stage 3 给 Stage 4 的输入
const optimizedModuleGraph = {
  modules: {
    0: {
      id: './src/index.js',
      code: `
        const { add } = __webpack_require__(1)
        const { multiply } = __webpack_require__(2)
        __webpack_require__(3)
        console.log('Result:', add(5, 3))
        console.log('Multiply:', multiply(4, 2))
      `
    },
    1: {
      id: './src/math.js',
      code: `
        exports.add = function (a, b) {
          return a + b;
        };
        // subtract 已被删除！
      `
    },
    2: {
      id: './src/util.js',
      code: `
        exports.multiply = function (a, b) {
          return a * b;
        };
        // divide 已被删除！
      `
    },
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

---

## Stage 4 的核心工作：生成 Bundle

### 核心思路

```
优化后的依赖图
  ↓
  ├─ 生成"模块容器"（用对象包装每个模块）
  ├─ 生成"模块加载器"（__webpack_require__ 函数）
  ├─ 生成"启动代码"（执行入口模块）
  └─ 将所有部分组织成一个自执行函数 (IIFE)
  ↓
最终的 bundle.js
```

### 生成过程（伪代码实现）

```javascript
// ===== Stage 4 的伪代码实现 =====

function generateBundle(optimizedModuleGraph) {

  // ========== 第一步：生成模块对象 ==========
  // 将每个模块的代码包装成函数

  const modulesCode = `{
    // 模块 0
    0: (function(module, exports, __webpack_require__) {
      ${optimizedModuleGraph.modules[0].code}
    }),

    // 模块 1
    1: (function(module, exports, __webpack_require__) {
      ${optimizedModuleGraph.modules[1].code}
    }),

    // 模块 2
    2: (function(module, exports, __webpack_require__) {
      ${optimizedModuleGraph.modules[2].code}
    }),

    // 模块 3
    3: (function(module, exports, __webpack_require__) {
      ${optimizedModuleGraph.modules[3].code}
    })
  }`

  // ========== 第二步：生成模块加载器 ==========
  // 这是 Webpack 的核心：如何加载一个模块

  const webpackBootstrap = `
    (function(modules) {  // 自执行函数，接收 modules 对象

      // 模块缓存，避免重复加载
      var installedModules = {};

      // 核心的模块加载函数
      function __webpack_require__(moduleId) {

        // 第一步：检查缓存
        if(installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }

        // 第二步：创建新的 module 对象
        var module = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
        };

        // 第三步：执行该模块的代码
        // modules[moduleId] 是一个函数，执行它
        modules[moduleId].call(
          module.exports,      // this 指向 module.exports
          module,              // 传入 module 对象
          module.exports,      // 传入 exports 对象
          __webpack_require__  // 传入 require 函数
        );

        // 第四步：标记模块已加载
        module.l = true;

        // 第五步：返回该模块的导出
        return module.exports;
      }

      // ========== 第三步：执行入口模块 ==========
      // 直接加载模块 0（入口文件）
      return __webpack_require__(__webpack_require__.s = 0);

    })  // 自执行函数的左括号
    (${modulesCode})  // 传入 modules 对象
  `

  return webpackBootstrap;
}
```

---

## 详细逐步演示

### 第一步：生成模块对象

原始代码来自 Stage 3：
```javascript
// 模块 0 的代码
const { add } = __webpack_require__(1)
const { multiply } = __webpack_require__(2)
__webpack_require__(3)
console.log('Result:', add(5, 3))
console.log('Multiply:', multiply(4, 2))
```

**转换过程：** 用函数包装，传入 `module`、`exports` 和 `__webpack_require__`

```javascript
// 生成后的模块 0
0: (function(module, exports, __webpack_require__) {
  const { add } = __webpack_require__(1)
  const { multiply } = __webpack_require__(2)
  __webpack_require__(3)
  console.log('Result:', add(5, 3))
  console.log('Multiply:', multiply(4, 2))
})
```

---

### 第二步：生成 Bootstrap 代码（模块加载器）

这是 Webpack 自己的代码，不来自源代码：

```javascript
(function(modules) {
  var installedModules = {};

  function __webpack_require__(moduleId) {
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    );

    module.l = true;
    return module.exports;
  }

  return __webpack_require__(__webpack_require__.s = 0);

})(modules_object_here)
```

---

### 第三步：将两部分组合

```javascript
(function(modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    // ... 模块加载器的代码 ...
  }
  return __webpack_require__(__webpack_require__.s = 0);
})({
  // 这里是所有的 modules
  0: (function(module, exports, __webpack_require__) {
    const { add } = __webpack_require__(1)
    const { multiply } = __webpack_require__(2)
    __webpack_require__(3)
    console.log('Result:', add(5, 3))
    console.log('Multiply:', multiply(4, 2))
  }),

  1: (function(module, exports, __webpack_require__) {
    exports.add = function (a, b) {
      return a + b;
    };
  }),

  2: (function(module, exports, __webpack_require__) {
    exports.multiply = function (a, b) {
      return a * b;
    };
  }),

  3: (function(module, exports, __webpack_require__) {
    const style = document.createElement('style')
    style.innerHTML = "body { color: blue; }"
    document.head.appendChild(style)
  })
})
```

---

## 执行流程详解

### 浏览器加载 bundle.js 时发生什么

```
第一步：浏览器看到这个自执行函数
(function(modules) { ... })(modules_object)

↓

第二步：自动执行！传入 modules 对象
- installedModules = {}（空缓存）
- 定义 __webpack_require__ 函数
- 直接调用 __webpack_require__(0)

↓

第三步：加载模块 0（入口）
__webpack_require__(0) {
  installedModules[0] = { i: 0, l: false, exports: {} }

  执行模块 0 的代码：
    const { add } = __webpack_require__(1)
    ↓ 需要模块 1，调用 __webpack_require__(1)
}

↓

第四步：加载模块 1（math.js）
__webpack_require__(1) {
  installedModules[1] = { i: 1, l: false, exports: {} }

  执行模块 1 的代码：
    exports.add = function (a, b) { return a + b; }

  module.exports 现在有了 add 属性！
  return module.exports
}

↓

第五步：回到模块 0
const { add } = __webpack_require__(1)  // ✓ 得到了 add 函数

继续执行：
  const { multiply } = __webpack_require__(2)

↓

第六步：加载模块 2（util.js）
__webpack_require__(2) {
  // 同上，返回 { multiply: function... }
}

↓

第七步：继续模块 0
const { multiply } = __webpack_require__(2)  // ✓ 得到了 multiply 函数

继续执行：
  __webpack_require__(3)  // 注入 CSS

↓

第八步：加载模块 3（style.css）
__webpack_require__(3) {
  执行代码：
    const style = document.createElement('style')
    style.innerHTML = "body { color: blue; }"
    document.head.appendChild(style)
}

↓

第九步：回到模块 0，执行业务代码
console.log('Result:', add(5, 3))      // 输出：Result: 8
console.log('Multiply:', multiply(4, 2))  // 输出：Multiply: 8

↓

完成！
```

---

## 关键数据结构解析

### modules 对象的结构

```javascript
{
  0: function(module, exports, __webpack_require__) { ... },
  1: function(module, exports, __webpack_require__) { ... },
  2: function(module, exports, __webpack_require__) { ... },
  3: function(module, exports, __webpack_require__) { ... }
}
```

**注意：**
- 键是 **模块 ID**（数字）
- 值是 **函数**（不是直接的代码）
- 这些函数接受 3 个参数：module、exports、__webpack_require__

### installedModules 的结构

```javascript
installedModules = {
  0: { i: 0, l: true, exports: undefined },
  1: { i: 1, l: true, exports: { add: function... } },
  2: { i: 2, l: true, exports: { multiply: function... } },
  3: { i: 3, l: true, exports: undefined }
}
```

**含义：**
- `i`: 模块 ID
- `l`: 是否已加载（loaded）
- `exports`: 该模块导出的内容

---

## 与 CommonJS 的对应关系

### 模块 1 的源代码（模块内部）

```javascript
// 模块 1 原始代码（ES Module）
export const add = (a, b) => a + b
```

**转换后（Babel 转为 CommonJS）：**
```javascript
exports.add = function (a, b) {
  return a + b;
};
```

**在 Bundle 中：**
```javascript
1: (function(module, exports, __webpack_require__) {
  exports.add = function (a, b) {
    return a + b;
  };

  // 当这个函数执行时：
  // - module.exports 现在是 { add: function... }
  // - return module.exports 就返回这个对象
})
```

**在模块 0 中使用：**
```javascript
const { add } = __webpack_require__(1)
// __webpack_require__(1) 返回 { add: function... }
// 解构赋值得到 add 函数
```

---

## 实际的 bundle.js 片段

这是真实的 Webpack 生成的代码（简化版）：

```javascript
/******/ (function(modules) { // webpackBootstrap
/******/ 	var installedModules = {};
/******/ 	function __webpack_require__(moduleId) {
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 		module.l = true;
/******/ 		return module.exports;
/******/ 	}
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {
// 模块 0 的代码
const { add } = __webpack_require__(1)
const { multiply } = __webpack_require__(2)
__webpack_require__(3)
console.log('Result:', add(5, 3))
console.log('Multiply:', multiply(4, 2))
/***/ }),

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {
// 模块 1 的代码
exports.add = function (a, b) {
  return a + b;
};
/***/ }),

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {
// 模块 2 的代码
exports.multiply = function (a, b) {
  return a * b;
};
/***/ }),

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {
// 模块 3 的代码
const style = document.createElement('style')
style.innerHTML = "body { color: blue; }"
document.head.appendChild(style)
/***/ })

/******/ });
```

---

## Tree Shaking 的痕迹

### 对比：删除前 vs 删除后

**删除前（Stage 2 的输出）：**
```javascript
1: (function(module, exports, __webpack_require__) {
  exports.add = function (a, b) {
    return a + b;
  };
  exports.subtract = function (a, b) {  // ← 这里有
    return a - b;
  };
})
```

**删除后（Stage 4 的生成）：**
```javascript
1: (function(module, exports, __webpack_require__) {
  exports.add = function (a, b) {
    return a + b;
  };
  // subtract 被删除了！
})
```

**关键点：**
- Tree Shaking 在 Stage 3 就删除了代码
- Stage 4 的代码生成器只需要复制剩余的代码
- 最终 bundle 中根本不存在 subtract 和 divide

---

## 总结：从依赖图到 Bundle 的三个步骤

```
Step 1: 包装模块代码
└─ 每个模块的代码用函数包装
└─ 参数是 module、exports、__webpack_require__
└─ 形成 modules 对象

Step 2: 创建 Bootstrap 代码
└─ Webpack 自己的运行时代码
└─ 定义 __webpack_require__ 函数
└─ 定义缓存 installedModules
└─ 执行入口模块

Step 3: 组合成 IIFE
└─ 自执行函数，接收 modules 参数
└─ 页面加载时自动执行
└─ 自动从入口模块开始加载依赖

最终产物 = IIFE + modules 对象
```

---

## 为什么要这样设计？

### 1. 为什么要用函数包装？
```javascript
// ❌ 如果直接拼接代码
var add = () => {}
var multiply = () => {}
// 变量会污染全局作用域！

// ✅ 用函数包装
1: (function(module, exports, __webpack_require__) {
  var add = () => {}
  // 在函数内部，有自己的作用域
})
```

### 2. 为什么要有缓存？
```javascript
// ❌ 没有缓存的话
__webpack_require__(1)  // 第一次，执行模块代码
__webpack_require__(1)  // 第二次，又执行一遍！浪费

// ✅ 有缓存
if(installedModules[moduleId]) {
  return installedModules[moduleId].exports;  // 直接返回缓存
}
```

### 3. 为什么要传 __webpack_require__？
```javascript
// 模块内部需要加载其他模块
1: (function(module, exports, __webpack_require__) {
  const add = __webpack_require__(2)  // ← 需要这个函数
  // 如果不传入，就没办法加载其他模块了
})
```

### 4. 为什么要用 IIFE（自执行函数）？
```javascript
// ✅ IIFE 立即执行，不需要 <script> 标签调用
(function() {
  // 自动执行
  __webpack_require__(0)
})()

// ❌ 如果不用 IIFE，需要额外的启动代码
<script>
  // 需要手动调用
  modules[0]()
</script>
```

