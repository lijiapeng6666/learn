# Node.js 核心知识详解

## 考点概述
Node.js是JavaScript在服务器端的运行环境。掌握Node.js是现代全栈开发的必备技能，涉及事件驱动、异步编程、模块系统等核心概念。

---

## 第一部分：Node.js基础

### 1. 什么是Node.js

**通俗解释：**
```
JavaScript原本只能在浏览器中运行
Node.js让JavaScript也能在服务器上运行

浏览器中的JavaScript：
├─ 操作DOM
├─ 处理用户交互
└─ 调用API

服务器中的Node.js：
├─ 处理HTTP请求
├─ 读写文件和数据库
├─ 运行后端业务逻辑
└─ 管理服务器资源
```

**Node.js的核心特点：**

```
事件驱动(Event-Driven)
├─ 基于事件循环(Event Loop)
├─ 不是阻塞式的
└─ 一个请求来了，放入事件队列，异步处理

非阻塞I/O(Non-blocking I/O)
├─ 读写文件不会阻塞主线程
├─ 数据库查询不会等待
└─ 一个线程可以处理多个请求

单线程(Single-threaded)
├─ 主线程是单线程的
├─ 但有线程池处理密集操作（libuv）
└─ 异步回调在事件循环中执行
```

---

### 2. Node.js的运行原理

**事件循环（Event Loop）：**

```
Node.js启动
  ↓
初始化，加载脚本
  ↓
进入事件循环
  │
  ├─ 检查timer队列（setTimeout、setInterval）
  ├─ 检查I/O操作队列（文件读写、网络请求）
  ├─ 检查微任务队列（Promise、process.nextTick）
  ├─ 检查宏任务队列（setImmediate）
  │
  └─ 如果都是空的，退出；否则继续循环
```

**具体流程（详细版）：**

```javascript
// 理解事件循环的执行顺序

console.log('1. 同步代码开始')

setTimeout(() => {
  console.log('2. setTimeout回调')  // 宏任务
}, 0)

Promise.resolve()
  .then(() => {
    console.log('3. Promise回调')  // 微任务
  })

console.log('4. 同步代码结束')

// 执行顺序：
// 1. 同步代码开始
// 4. 同步代码结束
// 3. Promise回调（微任务先执行）
// 2. setTimeout回调（宏任务后执行）

// 关键：微任务(microtask) > 宏任务(macrotask)
```

**为什么需要事件循环？**

```
传统同步模型（阻塞式）：
请求1来了 → 处理请求1 → 等待数据库返回（阻塞！）
         → 请求2来了（需要等待）
         → 数据库返回，继续处理

问题：同时只能处理一个请求，效率低

Node.js异步模型（非阻塞式）：
请求1来了 → 发起数据库查询 → 立即返回处理下一个
请求2来了 → 发起数据库查询 → 立即返回处理下一个
请求1的数据库查询完成 → 触发回调，处理结果
请求2的数据库查询完成 → 触发回调，处理结果

优势：一个线程可以处理多个请求！
```

---

### 3. Node.js 模块系统

**CommonJS 模块（Node.js默认）：**

```javascript
// 导出方式1：module.exports
// math.js
module.exports = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
}

// 导入
const math = require('./math')
console.log(math.add(1, 2))  // 3

// 导出方式2：exports（不推荐）
exports.multiply = (a, b) => a * b  // 等价于module.exports.multiply

// ⚠️ 注意区别
exports = { foo: 'bar' }  // ❌ 无效，exports被重新赋值
module.exports = { foo: 'bar' }  // ✅ 有效
```

**ES6 Module（现代方式）：**

```javascript
// 需要在package.json中设置 "type": "module"

// 导出
// math.js
export const add = (a, b) => a + b
export const subtract = (a, b) => a - b
export default class Calculator {}

// 导入
import Calculator, { add, subtract } from './math.js'
import * as math from './math.js'

// 混合导入
import Calculator, { add } from './math.js'
```

**两种模块系统的对比：**

```
CommonJS (require/exports)         ES6 Module (import/export)
├─ 运行时加载                      ├─ 编译时加载
├─ 同步的                         ├─ 异步的
├─ Node.js原生                    ├─ JavaScript标准
├─ 可以动态require                ├─ 必须静态import
└─ 性能略低                       └─ 性能更优

建议：新项目用ES6 Module
```

**模块的实际使用：**

```javascript
// server.js
const express = require('express')
const routes = require('./routes')
const db = require('./db')

const app = express()
app.use('/api', routes)

app.listen(3000, () => {
  console.log('Server running on port 3000')
})

// 或者用ES6
import express from 'express'
import routes from './routes'
import db from './db'
```

---

## 第二部分：核心模块

### 4. 常用的 Node.js 内置模块

**fs（文件系统）：**

```javascript
const fs = require('fs')

// 异步读取文件（推荐）
fs.readFile('./file.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('读取失败', err)
    return
  }
  console.log('文件内容:', data)
})

// Promise版本
fs.promises.readFile('./file.txt', 'utf-8')
  .then(data => console.log(data))
  .catch(err => console.error(err))

// async/await版本（最推荐）
async function readFile() {
  try {
    const data = await fs.promises.readFile('./file.txt', 'utf-8')
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}

// 写入文件
fs.writeFile('./output.txt', 'Hello', (err) => {
  if (err) throw err
  console.log('写入成功')
})

// 删除文件
fs.unlink('./file.txt', (err) => {
  if (err) throw err
  console.log('删除成功')
})
```

**path（路径处理）：**

```javascript
const path = require('path')

// 拼接路径（跨平台兼容）
const filePath = path.join(__dirname, 'src', 'index.js')
// Windows: C:\project\src\index.js
// Linux: /project/src/index.js

// 解析路径
const parsed = path.parse('/home/user/file.txt')
// {
//   root: '/',
//   dir: '/home/user',
//   base: 'file.txt',
//   name: 'file',
//   ext: '.txt'
// }

// 获取扩展名
const ext = path.extname('index.js')  // '.js'

// 获取目录名
const dir = path.dirname('/home/user/file.txt')  // '/home/user'
```

**http（创建服务器）：**

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
  // req: 请求对象
  // res: 响应对象

  console.log('请求路径:', req.url)
  console.log('请求方法:', req.method)

  if (req.url === '/' && req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end('<h1>Hello World</h1>')
  } else if (req.url === '/api/user' && req.method === 'GET') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ id: 1, name: 'Alice' }))
  } else {
    res.statusCode = 404
    res.end('Not Found')
  }
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/')
})

// 通常不直接用http，而是用Express框架
```

**events（事件驱动）：**

```javascript
const EventEmitter = require('events')

// 创建事件发射器
const emitter = new EventEmitter()

// 监听事件
emitter.on('message', (msg) => {
  console.log('收到消息:', msg)
})

emitter.on('message', (msg) => {
  console.log('第二个监听器:', msg)
})

// 发出事件
emitter.emit('message', 'Hello')
// 输出：
// 收到消息: Hello
// 第二个监听器: Hello

// 一次性监听
emitter.once('login', (user) => {
  console.log(`${user}登录了`)
})

emitter.emit('login', 'Alice')
emitter.emit('login', 'Bob')  // 不会触发，因为once只监听一次
```

---

### 5. 异步编程模式

**回调函数（Callback）：**

```javascript
// 回调地狱（Callback Hell）
function getData(callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: 'Alice' })
  }, 1000)
}

getData((err, user) => {
  if (err) {
    console.error(err)
    return
  }

  getOrders(user.id, (err, orders) => {
    if (err) {
      console.error(err)
      return
    }

    getOrderDetails(orders[0].id, (err, details) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(details)
      // 三层嵌套，代码难以维护
    })
  })
})
```

**Promise：**

```javascript
// Promise链式调用
function getData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: 1, name: 'Alice' })
    }, 1000)
  })
}

getData()
  .then(user => getOrders(user.id))
  .then(orders => getOrderDetails(orders[0].id))
  .then(details => console.log(details))
  .catch(err => console.error(err))

// 优点：避免回调地狱，代码更清晰
// 缺点：.then链式，仍需理解Promise概念
```

**async/await（最佳实践）：**

```javascript
// 就像同步代码一样，但实际上是异步的
async function process() {
  try {
    const user = await getData()
    const orders = await getOrders(user.id)
    const details = await getOrderDetails(orders[0].id)
    console.log(details)
  } catch (err) {
    console.error(err)
  }
}

process()

// 优点：
// ✅ 代码看起来就是同步的，易读易维护
// ✅ 错误处理用try/catch，更自然
// ✅ 调试更容易
```

**并发控制：**

```javascript
// 顺序执行（一个接一个）
async function sequential() {
  const user = await getUser()     // 等待1秒
  const orders = await getOrders() // 等待1秒
  // 总耗时：2秒
  return { user, orders }
}

// 并行执行（同时进行）
async function parallel() {
  const [user, orders] = await Promise.all([
    getUser(),      // 同时开始
    getOrders()     // 同时开始
  ])
  // 总耗时：1秒（取最长的）
  return { user, orders }
}

// 选择合适的模式能显著提升性能！
```

---

## 第三部分：Web框架

### 6. Express 框架基础

**为什么需要Express？**

```
用原生Node.js http模块：
const server = http.createServer((req, res) => {
  if (req.url === '/users' && req.method === 'GET') {
    // 处理GET /users
  } else if (req.url === '/users' && req.method === 'POST') {
    // 处理POST /users
  } else if (req.url === '/users/:id' && req.method === 'GET') {
    // 处理GET /users/:id
  } else if (req.url === '/users/:id' && req.method === 'PUT') {
    // 处理PUT /users/:id
  }
  // 繁琐，容易出错
})

用Express框架：
const app = express()
app.get('/users', (req, res) => {})
app.post('/users', (req, res) => {})
app.get('/users/:id', (req, res) => {})
app.put('/users/:id', (req, res) => {})
// 清晰，高效
```

**Express 的核心概念：**

```javascript
const express = require('express')
const app = express()

// 中间件（Middleware）
app.use(express.json())  // 解析JSON请求体
app.use(express.static('public'))  // 提供静态文件

// 路由处理
app.get('/api/users', (req, res) => {
  res.json({ users: [...] })
})

app.post('/api/users', (req, res) => {
  const user = req.body  // 从请求体获取数据
  // 保存到数据库
  res.status(201).json(user)
})

app.put('/api/users/:id', (req, res) => {
  const id = req.params.id  // 从URL参数获取
  // 更新数据库
  res.json(user)
})

app.delete('/api/users/:id', (req, res) => {
  // 删除数据
  res.status(204).end()
})

// 中间件的执行顺序
app.use((req, res, next) => {
  console.log('日志中间件')
  next()  // 调用next继续执行下一个中间件
})

app.use((req, res, next) => {
  console.log('认证中间件')
  if (req.headers.authorization) {
    next()
  } else {
    res.status(401).json({ error: '需要认证' })
  }
})

app.listen(3000)
```

---

### 7. 常见的 Node.js 框架对比

**Express vs Koa vs Fastify vs NestJS：**

```
Express
├─ 最成熟的框架（2010年）
├─ 生态最丰富
├─ 学习资源最多
├─ 性能一般
└─ 适合：快速原型、小项目

Koa
├─ 中间件系统更优雅（洋葱模型）
├─ 更现代（async/await原生支持）
├─ 性能比Express好
└─ 适合：中等规模项目

Fastify
├─ 性能最好（比Express快3倍）
├─ 专注于高性能
├─ 社区还在成长
└─ 适合：高并发场景、实时应用

NestJS
├─ 企业级框架
├─ 内置依赖注入、装饰器
├─ 完整的应用框架
├─ 学习曲线陡峭
└─ 适合：大型项目、团队开发
```

---

## 第四部分：实战应用

### 8. 完整的 Express 应用示例

```javascript
// server.js
const express = require('express')
const fs = require('fs').promises
const path = require('path')

const app = express()

// 中间件
app.use(express.json())

// 存储用户数据的文件
const usersFile = path.join(__dirname, 'users.json')

// 辅助函数：读取用户列表
async function readUsers() {
  try {
    const data = await fs.readFile(usersFile, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    return []
  }
}

// 辅助函数：写入用户列表
async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2))
}

// 获取所有用户
app.get('/api/users', async (req, res) => {
  try {
    const users = await readUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: '获取用户失败' })
  }
})

// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await readUsers()
    const user = users.find(u => u.id === parseInt(req.params.id))

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ error: '获取用户失败' })
  }
})

// 创建用户
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body

    // 验证
    if (!name || !email) {
      return res.status(400).json({ error: '名称和邮箱必填' })
    }

    const users = await readUsers()
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name,
      email,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    await writeUsers(users)

    res.status(201).json(newUser)
  } catch (err) {
    res.status(500).json({ error: '创建用户失败' })
  }
})

// 更新用户
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body
    const users = await readUsers()
    const user = users.find(u => u.id === parseInt(req.params.id))

    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }

    if (name) user.name = name
    if (email) user.email = email

    await writeUsers(users)
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: '更新用户失败' })
  }
})

// 删除用户
app.delete('/api/users/:id', async (req, res) => {
  try {
    const users = await readUsers()
    const index = users.findIndex(u => u.id === parseInt(req.params.id))

    if (index === -1) {
      return res.status(404).json({ error: '用户不存在' })
    }

    const deleted = users.splice(index, 1)
    await writeUsers(users)

    res.json(deleted[0])
  } catch (err) {
    res.status(500).json({ error: '删除用户失败' })
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: '服务器错误' })
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
```

---

### 9. Node.js 最佳实践

**项目结构：**

```
my-app/
├─ src/
│  ├─ routes/
│  │  └─ users.js
│  ├─ controllers/
│  │  └─ userController.js
│  ├─ models/
│  │  └─ User.js
│  ├─ middleware/
│  │  └─ auth.js
│  ├─ utils/
│  │  └─ database.js
│  └─ app.js
├─ test/
│  └─ users.test.js
├─ .env
├─ .gitignore
├─ package.json
└─ server.js
```

**环境变量管理：**

```javascript
// .env 文件
DATABASE_URL=mongodb://localhost:27017/mydb
API_PORT=3000
JWT_SECRET=your_secret_key

// app.js
require('dotenv').config()

const dbUrl = process.env.DATABASE_URL
const port = process.env.API_PORT

// 这样避免把敏感信息硬编码
```

**错误处理：**

```javascript
// ❌ 不好
app.get('/users/:id', (req, res) => {
  const user = db.findUser(req.params.id)  // 如果出错，应用会崩溃
  res.json(user)
})

// ✅ 好
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json(user)
  } catch (err) {
    next(err)  // 传给错误处理中间件
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || '服务器错误'
  })
})
```

---

## 第五部分：性能和调试

### 10. Node.js 性能优化

**常见瓶颈：**

```
1️⃣ 阻塞事件循环
  ❌ 同步读取大文件
  ❌ 密集的CPU计算
  ✅ 使用异步操作
  ✅ 使用Worker Threads进行CPU密集操作

2️⃣ 内存泄漏
  ❌ 不释放的全局变量
  ❌ 事件监听器未移除
  ✅ 使用内存分析工具定位
  ✅ 及时清理资源

3️⃣ 数据库查询
  ❌ N+1查询问题
  ❌ 没有索引
  ✅ 使用ORM的关联查询
  ✅ 建立合适的索引

4️⃣ 并发控制
  ❌ 无限并发导致资源耗尽
  ✅ 使用连接池
  ✅ 限制并发数量
```

**监控和调试：**

```javascript
// 使用console.time计时
console.time('query')
await database.query('SELECT ...')
console.timeEnd('query')
// 输出: query: 123.45ms

// 使用Node.js内置的Profiler
// node --prof app.js
// node --prof-process isolate-*.log > profile.txt

// 或使用第三方工具
// npm install clinic
// clinic doctor -- node app.js
```

---

## 面试标准答案

### 如果被问"Node.js的事件循环是什么？"

```typescript
✅ 基础回答：
"Node.js使用事件循环来处理异步操作。
当I/O操作完成时，对应的回调会被加入队列，
事件循环会执行这些回调。"

⭐⭐ 更好的回答：
"事件循环有几个阶段：
1. timer阶段：执行setTimeout/setInterval
2. I/O阶段：执行文件读写、网络请求的回调
3. 微任务阶段：执行Promise、process.nextTick
4. 宏任务阶段：执行setImmediate

微任务总是在宏任务之前执行。
这允许Node.js用单线程处理多个并发操作。"

⭐⭐⭐ 优秀回答：
"Node.js的事件循环是基于libuv库实现的。
它是一个持续运行的循环，检查是否有待处理的事件。
具体来说，每个循环周期会按顺序检查：
timer队列→I/O观察者→检查点→立即执行队列。

微任务（Promise、process.nextTick）在每个阶段之间执行。
这种设计让Node.js能在单线程中处理高并发。

比如，当你使用Promise或async/await时，
微任务保证了代码的执行顺序：

console.log('1')
Promise.resolve().then(() => console.log('2'))
setTimeout(() => console.log('3'), 0)
console.log('4')

输出：1 4 2 3

这是因为Promise的回调是微任务，
setTimeout的回调是宏任务。"
```

---

## 快速自测

- [ ] 我能解释Node.js的事件循环吗？
- [ ] 我知道CommonJS和ES6 Module的区别吗？
- [ ] 我能用async/await处理异步代码吗？
- [ ] 我知道Express的中间件概念吗？
- [ ] 我能创建一个完整的REST API吗？
- [ ] 我能使用fs模块进行文件操作吗？
- [ ] 我知道什么是回调地狱吗？
- [ ] 我能调试Node.js应用吗？
- [ ] 我知道如何优化Node.js性能吗？
- [ ] 我能处理Node.js中的错误吗？

---

## 关键知识点总结

| 概念 | 说明 | 重要性 |
|------|------|--------|
| 事件循环 | Node.js异步处理的核心 | ⭐⭐⭐⭐⭐ |
| 回调/Promise/async | 异步编程的三种方式 | ⭐⭐⭐⭐⭐ |
| 模块系统 | CommonJS和ES6 Module | ⭐⭐⭐⭐ |
| Express框架 | 最流行的Web框架 | ⭐⭐⭐⭐ |
| 中间件 | Express的核心概念 | ⭐⭐⭐⭐ |
| 内置模块 | fs、path、http等 | ⭐⭐⭐ |
| 错误处理 | try/catch、.catch() | ⭐⭐⭐⭐ |
| 性能优化 | 避免阻塞、内存管理 | ⭐⭐⭐ |

---

## 推荐学习资源

**官方文档：**
- Node.js官方文档：https://nodejs.org/docs/
- Express官方文档：https://expressjs.com/

**书籍：**
- 《Node.js设计模式》
- 《深入浅出Node.js》

**实战项目：**
1. 创建一个简单的REST API
2. 使用数据库（MongoDB或PostgreSQL）
3. 添加认证和授权
4. 部署到云服务器
