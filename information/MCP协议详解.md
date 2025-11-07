# MCP 协议详解 - 通俗易懂版

## 📌 MCP 是什么？

**MCP = Model Context Protocol（模型上下文协议）**

简单理解：这是一个让 AI 模型和其他工具/服务互相对话的"通用语言"。就像你和朋友通过手机聊天一样，AI 通过 MCP 和各种工具进行交互。

---

## 🎯 核心概念速记

### 1. **三个关键角色**（最重要！）

| 角色 | 是谁 | 职责 | 例子 |
|------|------|------|------|
| **Host（主机）** | LLM 应用程序 | 发起连接，与用户交互，管理多个 Client | Claude 桌面版、IDE 插件、聊天机器人 |
| **Client（客户端）** | 主机内的协议客户端 | 维护与单个 Server 的连接，路由消息，协商功能 | Host 内部的连接管理器 |
| **Server（服务器）** | 数据/工具提供方 | 实现 MCP 协议，提供具体服务 | 文件系统、数据库、第三方 API 包装器 |

**关键理解**：
```
Host ← 一对多 → Client ← 一对一 → Server
(主机)          (客户端)        (服务器)

一个 Host 可以维护多个 Client 连接
一个 Client 只连接一个 Server
一个 Server 可以被多个 Client 连接
```

**生活类比**：
- Host = 航空公司前台（与乘客交互）
- Client = 前台和航班的通信员（每个人负责一架航班）
- Server = 具体的航班/飞机（提供服务）

### 2. **三大资源类型**

MCP 协议核心只有三种东西：

#### 📚 **Resources（资源）** - 文件/数据
```
用途：读取文件、数据库、网页等信息
例子：
- 读取本地文件
- 获取数据库内容
- 获取网页数据

特点：
✓ 只读或读写
✓ 有 URI 标识
✓ 支持 blob（二进制）或文本
```

#### 🔧 **Tools（工具）** - 可执行动作
```
用途：执行某个操作（不是读，而是做）
例子：
- 运行代码
- 发送邮件
- 修改文件
- 调用 API

特点：
✓ 有输入参数（schema）
✓ 有执行结果
✓ 可能改变系统状态
```

#### 💬 **Prompts（提示）** - 预制对话模板
```
用途：预设一些常用的 AI 提示词
例子：
- "代码审查的提示词模板"
- "写文档的提示词模板"

特点：
✓ 可以有动态参数
✓ 重用性强
```

---

## 🔄 三个角色详解

### Host（主机）的职责

```
主机的作用：
✓ 启动和管理整个系统
✓ 维护与用户的交互（UI、输入输出）
✓ 创建和管理多个 Client 连接（一对多）
✓ 负责消息的最终处理和响应

例如：Claude 桌面版
- 提供用户界面
- 处理用户输入
- 创建 Client 连接去访问各个 MCP Server
- 整合所有 Server 返回的结果给用户
```

### Client（客户端）的职责

```
客户端的作用：
✓ 建立与 Server 的一对一连接
✓ 在 Host 和 Server 之间路由消息
✓ 管理会话生命周期
✓ 协商双方的能力（initialization）
✓ 处理协议的技术细节

特点：
- 一个 Client = 一个 Server 的连接
- 多个 Client = 多个 Server 的连接
- Client 是"快递员"，负责消息传递
```

### Server（服务器）的职责

```
服务器的作用：
✓ 实现 MCP 协议规范
✓ 提供具体的数据或功能
✓ 响应 Client 的请求
✓ 执行所有与服务相关的操作

例如：
- 文件系统 Server：提供文件读写操作
- 数据库 Server：提供数据查询操作
- GitHub Server：提供仓库操作
- 邮件 Server：提供发邮件功能
```

### 三层结构可视化

```
┌─────────────────────────────────────────────────┐
│             🖥️  HOST（主机）                    │
│        Claude 桌面版 / IDE 插件 / 聊天机器人    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │      内部的 Client 们（消息路由器）      │  │
│  │                                          │  │
│  │ Client-A ─── Client-B ─── Client-C     │  │
│  │   (连接A)      (连接B)      (连接C)    │  │
│  └──────────────────────────────────────────┘  │
│          ↓           ↓           ↓             │
└─────────────────────────────────────────────────┘
          ↓           ↓           ↓
    ┌─────────┐ ┌─────────┐ ┌──────────┐
    │ Server1 │ │ Server2 │ │ Server3  │
    │ (文件系 │ │ (数据库)│ │ (GitHub) │
    │  统)    │ │         │ │          │
    └─────────┘ └─────────┘ └──────────┘
```

---

## 🔍 实战案例：Cursor / Claude Code 中的 MCP 架构

这里我们用 **Cursor 或 Claude Code** 这样的实际应用来看 Host、Client、Server 的划分。

### Host = IDE 整体应用

```
🖥️  Cursor / Claude Code IDE
    ↓
包含以下部分：

【UI 层】
✓ 代码编辑器窗口
✓ 侧边栏、命令面板
✓ 用户交互界面

【应用逻辑】
✓ 处理用户输入
✓ 管理编辑器状态
✓ 决策要用哪些 Server

【MCP 管理】
✓ 创建和维护 Client 连接
✓ 路由 API 调用
✓ 整合所有 Server 结果
```

**Host 的责任**：
- ✓ 与用户交互（接收输入、显示结果）
- ✓ 决策使用哪些 Server
- ✓ 管理多个 Client 连接（一对多）
- ✓ 整合各个 Server 的数据

---

### Client = IDE 内部的连接管理器

```
📨 MCP Client Instance (在 IDE 进程内)
    ↓
不是独立程序，是 IDE 内部的一个模块：

【连接建立】
✓ 与一个 Server 建立通信
✓ 可以是 STDIO、SSE 或 HTTP

【消息路由】
✓ 接收来自 Host 的请求
✓ 转发给 Server
✓ 把 Server 响应转回 Host

【会话管理】
✓ 维护连接状态
✓ 处理初始化握手 (initialize)
✓ 协商能力 (capabilities)

【协议处理】
✓ 实现 JSON-RPC 2.0
✓ 错误处理
```

**Client 的责任**：
- ✓ 与 Server 建立连接（一对一）
- ✓ 转发 Host 的请求到 Server
- ✓ 转发 Server 的响应到 Host
- ✓ 维护连接状态

---

### Server = 外部独立程序

```
⚙️  MCP Server (独立运行)
    ↓
可以是任何语言编写的独立程序：

【文件系统 Server】
✓ 提供 Resources（文件列表、读写）
✓ 提供 Tools（创建、删除、修改文件）

【Git Server】
✓ 提供 Tools（commit、push、pull 等）
✓ 提供 Resources（仓库信息）

【代码分析 Server】
✓ 提供 Resources（代码结构信息）
✓ 提供 Tools（代码格式化、lint 等）

【数据库 Server】
✓ 提供 Resources（表结构、数据）
✓ 提供 Tools（查询、插入、更新）
```

**Server 的责任**：
- ✓ 实现 MCP 协议规范
- ✓ 提供具体的数据或功能
- ✓ 响应 Client 的请求
- ✓ 执行实际的业务操作

---

### 🔄 Cursor 中的实际交互例子

#### 例子1：用户点击"搜索文件"

```
【用户操作】
用户在 Cursor 命令面板输入："Find in files"
  ↓
【Host 决策】
Cursor IDE 分析：需要访问文件系统
  ↓
【Host 使用 Client】
IDE 的 MCP 管理器选择"文件系统 Client"实例
  ↓
【Client 请求】
文件系统 Client 发送：
  {
    "jsonrpc": "2.0",
    "id": 123,
    "method": "resources/list",
    "params": { "path": "/project" }
  }
  ↓
【Server 处理】
文件系统 Server 遍历目录，返回文件列表
  ↓
【Client 转发】
Client 将结果转发给 Host
  ↓
【Host 显示】
Cursor 把文件列表显示在"搜索结果"面板
  ↓
【用户看到】
用户看到项目中的所有文件
```

**参与者流向**：
用户 → Host(IDE) → Client(连接管理) → Server(文件系统) → Client → Host(IDE) → 用户

---

#### 例子2：用户执行"Git: Commit"

```
【用户操作】
用户在命令面板选择："Git: Commit"
  ↓
【Host 分析】
Cursor 分析需要调用 Git 功能
  ↓
【Host 查询能力】
Host 通过"Git Client"查询可用的 Git 工具
  Client 发送：tools/list
  ↓
【Server 返回工具列表】
Git Server 返回所有可用工具
  例如：{ name: "commit", inputSchema: {...} }
  ↓
【Host 决策】
Cursor 确认参数（commit message、changed files 等）
  ↓
【Host 执行】
Host 通过"Git Client"发送执行请求：
  {
    "jsonrpc": "2.0",
    "id": 456,
    "method": "tools/call",
    "params": {
      "name": "commit",
      "arguments": {
        "message": "Fix bug in parser",
        "files": [...]
      }
    }
  }
  ↓
【Server 执行】
Git Server 执行：git commit -m "Fix bug in parser"
  ↓
【Server 返回结果】
Server 返回：{ "success": true, "hash": "abc123" }
  ↓
【Client 转发】
Client 把结果转发给 Host
  ↓
【Host 反馈】
Cursor 显示："Commit successful!"
  ↓
【用户看到】
用户看到提交成功的消息
```

**参与者流向**：
用户 → Host(IDE) → Client(查询) → Server(列表)
   → Host(决策) → Client(执行) → Server(操作) → Client → Host(反馈) → 用户

---

### 📋 三个角色在 Cursor 中的对应关系

| 角色 | 具体实现 | 在 Cursor 中的位置 | 运行位置 |
|------|--------|-------------------|---------|
| **Host** | Cursor IDE 应用整体 | 主进程 | Cursor 进程内 |
| **Client** | 连接管理模块 | IDE 内部库 | Cursor 进程内 |
| **Server** | 外部程序/服务 | ~/.cursor/mcp 目录 | 独立进程或远程 |

---

### 💡 类比理解（便利店模型）

```
场景：你去便利店买东西

🖥️  Host = 便利店整体
    - 店员、收银员、货架（UI）
    - 店长管理（业务逻辑）
    - 店长决定从哪个供应商进货（MCP 管理）

📨 Client = 店的采购员
    - 店长告诉采购员"需要更多矿泉水"
    - 采购员去仓库（Server）拿货
    - 采购员把货送回店里
    - 采购员不是店员，是店内部的功能角色

⚙️  Server = 后方仓库或供应商
    - 真正存放和提供货物的地方
    - 采购员从这里拿货
    - 完全独立于便利店

【关键点】
- 顾客（用户）跟店长（Host）互动
- 店长（Host）不直接去仓库
- 店长通过采购员（Client）去仓库（Server）拿货
```

---

## 🔄 通信流程（最重要！）

### 完整交互流程

```
┌─────────────────────────────────────────────────────────┐
│            1️⃣  Host 启动初始化阶段                      │
├─────────────────────────────────────────────────────────┤
│ Host 决定需要使用某些服务，创建 Client                 │
│ Client 代表 Host 向 Server 发送初始化请求              │
│ Server 响应：确认支持的功能和能力                      │
│ Client 将 Server 的能力报告给 Host                     │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│            2️⃣  Host-Client-Server 交互阶段              │
├─────────────────────────────────────────────────────────┤
│ Host: "我需要读取文件"                                 │
│   ↓ (通过 Client)                                      │
│ Server: "好的，给你文件内容"                           │
│   ↓ (通过 Client)                                      │
│ Host: "收到！继续其他操作"                             │
└─────────────────────────────────────────────────────────┘
```

### 简化的交互模式

```
用户操作
  ↓
Host（前台）
  ↓
Client（快递员）
  ↓
Server（仓库）
  ↓
Client（返回）
  ↓
Host（显示给用户）
  ↓
用户看到结果
```

---

## 📤 JSON-RPC - 通信格式

MCP 使用 **JSON-RPC 2.0** 协议。简单说就是：

### 请求格式（客户端发送）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list",
  "params": {}
}
```

**解释**：
- `jsonrpc`: 版本（固定 "2.0"）
- `id`: 请求编号（用来匹配回复）
- `method`: 要做什么
- `params`: 参数

### 回复格式（服务器返回）

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "file:///data/users.txt",
        "name": "用户数据"
      }
    ]
  }
}
```

或者出错了：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  }
}
```

---

## 🎬 常见场景演示（三角交互：Host → Client → Server）

### 场景 1：读取文件资源

```
【用户操作】
用户在 Claude 中说："给我读一下项目的配置文件"
  ↓
【Host 处理】
Host（Claude）分析需要读取文件
  ↓
【Host → Client】
Host 通过 Client 发送请求给 Server
  ↓
【Client → Server】
Client 转发：resources/list 请求
  ↓
【Server 响应】
Server 返回：所有可用资源列表
  ↓
【Server → Client → Host】
Client 接收并转发响应给 Host
  ↓
【Host 处理】
Host 向 Server 请求读取 "file:///config.json"
  ↓
【Server 响应】
Server 返回文件内容
  ↓
【Host 展示】
Host 把内容展示给用户
```

**参与者**：Host(发起) → Client(转发) → Server(执行) → Client(转发) → Host(展示)

---

### 场景 2：调用工具执行操作

```
【用户操作】
用户："帮我发送一封邮件"
  ↓
【Host 决策】
Host 需要调用邮件工具
  ↓
【Host → Client】
Host 通过 Client 查询可用工具
  ↓
【Client → Server】
Client 发送：tools/list 请求
  ↓
【Server 响应】
Server 返回：所有可用工具列表
  例如：{ name: "send_email", inputSchema: {...} }
  ↓
【Client → Host】
Client 转发工具列表给 Host
  ↓
【Host 验证参数】
Host 检查邮件参数是否完整
  ↓
【Host → Client】
Host 通过 Client 发送工具调用请求
  client 发送：tools/call
  params: { name: "send_email", arguments: {...} }
  ↓
【Client → Server】
Client 转发到 Server
  ↓
【Server 执行】
Server 实际执行邮件发送
  ↓
【Server → Client → Host】
Server 返回执行结果（成功/失败）
  ↓
【Host 反馈】
Host 向用户显示结果
```

**参与者**：Host(发起) → Client(查询) → Server(列表)
           → Host(决策) → Client(调用) → Server(执行) → Host(反馈)

---

### 场景 3：获取提示模板

```
【用户操作】
用户："我需要一个代码审查的提示词"
  ↓
【Host 查询】
Host 需要获取提示词模板
  ↓
【Host → Client】
Host 通过 Client 查询可用提示
  ↓
【Client → Server】
Client 发送：prompts/list 请求
  ↓
【Server 响应】
Server 返回：所有可用提示列表
  例如：{ name: "code_review", description: "代码审查模板" }
  ↓
【Client → Host】
Client 转发提示列表给 Host
  ↓
【Host 选择】
Host 选择 "code_review" 提示
  ↓
【Host → Client】
Host 通过 Client 请求具体提示内容
  发送：prompts/get
  params: { name: "code_review", arguments: {...} }
  ↓
【Client → Server】
Client 转发请求
  ↓
【Server 处理】
Server 生成定制化的提示词模板
  例如：根据参数填充代码审查模板
  ↓
【Server → Client → Host】
Server 返回完整的提示词
  ↓
【Host 使用】
Host 使用这个提示词进行代码审查
```

**参与者**：Host(查询) → Client(查列表) → Server(返回列表)
           → Host(选择) → Client(获取) → Server(生成) → Host(使用)

---

## 🔗 传输层 - 三种通信方式详解

MCP **不关心怎么传输**，只关心消息格式（JSON-RPC）。根据部署场景选择传输方式：

### 1️⃣ **STDIO（标准输入输出）**

**是什么**：
```
Host 直接启动 Server 进程，通过管道通信
Host 写入 stdin → Server 读取
Server 写入 stdout → Host 读取
```

**特点**：
- ✅ 本地通信，延迟低，无网络开销
- ✅ 进程级别管理，安全性好
- ✅ 类似 LSP（Language Server Protocol）
- ❌ 只能本地使用，不支持远程

**例子**：
```
Claude 桌面版启动本地 Python MCP Server
  ↓
Host 创建子进程
  ↓
通过 stdin/stdout 发送 JSON-RPC 消息
  ↓
收到响应后处理
```

**消息流**：
```
Host                           Server Process
  │                                 │
  ├─ write stdin ────────────────→ read stdin
  │  { "method": "resources/list" }  │
  │                                  │ 处理请求
  │                                  │
  ├─ read stdout ←──────────────── write stdout
  │  { "result": {...} }             │
```

---

### 2️⃣ **HTTP + SSE（Server-Sent Events）**

**首先理解 SSE 是什么**：

SSE 是一种 **HTTP 标准**，允许服务器主动向客户端发送数据（单向推送）。

**对比传统 HTTP**：
```
传统 HTTP：
客户端 → 发送请求 → 服务器
客户端 ← 收到响应 ← 服务器
（请求-响应模式，单向）

SSE：
客户端 → 建立连接 → 服务器
客户端 ← 不断接收数据推送 ← 服务器
（连接保持打开，服务器可主动推送）
```

**MCP 中如何使用 SSE**：

```
┌─────────────────────────────────────────────┐
│  Host（客户端角色）                         │
└────┬────────────────────────────────┬───────┘
     │                                │
     │ 1. HTTP POST                   │ 2. SSE 连接
     │    发送请求                    │    接收响应
     │                                │
     ↓                                ↓
┌─────────────────────────────────────────────┐
│  Server（服务器角色）                       │
│                                             │
│  处理 POST 请求 → 返回 SSE 流              │
└─────────────────────────────────────────────┘
```

**具体流程**：

```
【第一步】客户端建立 SSE 连接
─────────────────────────────
Host 发送：
  POST /events HTTP/1.1
  Content-Type: application/json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }

【第二步】服务器推送响应
─────────────────────────────
Server 返回：
  HTTP/1.1 200 OK
  Content-Type: text/event-stream

  data: {"jsonrpc":"2.0","id":1,"result":{...}}

  data: {"jsonrpc":"2.0","id":2,"result":{...}}

【第三步】连接保持打开
─────────────────────────────
服务器不关闭连接，继续推送新的事件：

  data: {"jsonrpc":"2.0","method":"progress",...}

  data: {"jsonrpc":"2.0","method":"update",...}
```

**SSE 数据格式**：

```
data: {"jsonrpc":"2.0","id":1,"result":{}}
      ↑                                   ↑
   前缀标记                          JSON 消息
```

**特点**：
- ✅ 支持远程服务，多个 Host 连接
- ✅ 服务器可主动推送（不仅仅是回复请求）
- ✅ 基于 HTTP，容易穿过防火墙
- ✅ 自动重连，连接断开自动重试
- ⚠️ 单向的（只能服务器→客户端），客户端请求仍需用 HTTP POST

**例子**：
```
Host 连接远程 MCP Server（如云服务）
  ↓
Host 通过 HTTP POST 发送请求
  ↓
Server 通过 SSE 推送响应
  ↓
连接保持打开，Server 可继续推送进度、通知等
```

---

### 3️⃣ **HTTP（传统请求-响应）**

**是什么**：
```
纯粹的 HTTP 请求-响应模式
客户端发送请求 → 服务器立即响应并关闭连接
```

**特点**：
- ✅ 最简单，最兼容
- ✅ 无需保持连接
- ❌ 服务器无法主动推送
- ❌ 每次通信需要重新建立连接

**对比**：

| 传输方式 | 部署位置 | 连接 | 推送能力 | 实现难度 |
|---------|---------|------|--------|--------|
| **STDIO** | 本地 | 进程管道 | ❌ | 低 |
| **HTTP + SSE** | 远程 | 持久连接 | ✅ | 中 |
| **HTTP** | 远程 | 短连接 | ❌ | 低 |

---

### 🎯 选择建议

```
场景1：本地 IDE 插件连接本地工具
  → 使用 STDIO
  → 最快、最安全、无额外复杂度

场景2：Claude 桌面版连接云端服务
  → 使用 HTTP + SSE
  → 支持远程、支持主动推送

场景3：Web 应用集成 MCP
  → 使用 HTTP + SSE（浏览器友好）
  → 或考虑 WebSocket（双向）

场景4：简单的远程 API
  → 使用 HTTP
  → 快速实现，功能有限
```

---

## 💡 MCP 的关键特点

### ✅ 优点
1. **统一接口**：各种工具都用同一套协议
2. **灵活扩展**：新服务只需实现 MCP 即可
3. **安全可控**：清晰的权限和能力边界
4. **异步友好**：支持长时间运行的任务

### ⚠️ 要记住
1. **无状态可选**：协议本身无状态，但实现可以有状态
2. **文本为主**：虽然支持二进制，但主要用文本
3. **顺序保证**：JSON-RPC 保证请求按顺序处理

---

## 🎓 方法速查表

### 资源相关方法

```
resources/list          列出所有资源
resources/read          读取资源内容
resources/subscribe     订阅资源变化（可选）
resources/unsubscribe   取消订阅（可选）
```

### 工具相关方法

```
tools/list              列出所有工具
tools/call              调用某个工具
```

### 提示相关方法

```
prompts/list            列出所有提示
prompts/get             获取特定提示
```

### 根方法

```
initialize              初始化连接
completion/complete     代码补全（可选）
logging/setLevel        设置日志级别（可选）
```

---

## 📋 完整交互示例

```javascript
// 1. 初始化
客户端 → 服务器
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": { ... },
    "clientInfo": {
      "name": "Claude",
      "version": "1.0"
    }
  }
}

// 2. 服务器初始化响应
服务器 → 客户端
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "resources": {},
      "tools": {},
      "prompts": {}
    },
    "serverInfo": {
      "name": "MyMCPServer",
      "version": "1.0"
    }
  }
}

// 3. 列出资源
客户端 → 服务器
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/list",
  "params": {}
}

// 4. 返回资源列表
服务器 → 客户端
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "resources": [
      {
        "uri": "file:///home/data.txt",
        "name": "数据文件",
        "mimeType": "text/plain"
      }
    ]
  }
}

// 5. 列出工具
客户端 → 服务器
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/list",
  "params": {}
}

// 6. 返回工具列表
服务器 → 客户端
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "tools": [
      {
        "name": "calculate",
        "description": "计算器",
        "inputSchema": {
          "type": "object",
          "properties": {
            "expression": {
              "type": "string",
              "description": "数学表达式"
            }
          }
        }
      }
    ]
  }
}

// 7. 调用工具
客户端 → 服务器
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": {
      "expression": "2 + 2"
    }
  }
}

// 8. 返回工具结果
服务器 → 客户端
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "结果是 4"
      }
    ]
  }
}
```

---

## 🚀 快速记忆技巧

### 记住这个模板

```
MCP = 三个角色 + 三个资源 + JSON-RPC 通信

【三个角色】：
🖥️  Host      → LLM 应用（与用户交互）
📨 Client    → 连接管理（路由消息）
⚙️  Server    → 数据提供（具体服务）

【三个资源】：
📚 Resources  → 我有什么数据（读）
🔧 Tools      → 我能做什么（执行）
💬 Prompts    → 我有什么模板（AI 用的）

【通信格式】：
JSON-RPC 2.0
request  → 请求：method + params
response → 回复：result 或 error
```

### 关键记忆：一对多 + 一对一

```
Host ← 一对多 → Client ← 一对一 → Server
 1个              N个           多个

Host 可以创建多个 Client 去连接多个 Server
Client 维护 Host 和 Server 之间的 1:1 映射
Server 可以被多个 Client 访问
```

### 三个阶段

```
1️⃣  初始化 (initialize)
    Client 发送初始化请求 → Server 返回能力列表
    ↓
2️⃣  列表查询 (*/list)
    Client 查询有什么资源、工具、提示
    ↓
3️⃣  操作执行 (*/read, */call, */get)
    Client 执行具体操作，返回结果给 Host
```

---

## 🎯 常见问题速答

### Q: MCP 和 REST API 有什么区别？

| 角度 | MCP | REST API |
|-----|-----|---------|
| 目标 | AI 和工具对话 | 网页和服务对话 |
| 方法定义 | 自由定义 method | 固定 GET/POST |
| 资源概念 | 明确的三种资源 | 资源 = URL |

### Q: MCP Server 怎么实现？

```python
# 伪代码示例
class MCPServer:
    def __init__(self):
        self.resources = {}
        self.tools = {}

    def handle_initialize(self, params):
        return {"capabilities": {...}}

    def handle_resources_list(self, params):
        return {"resources": list(self.resources.values())}

    def handle_tools_list(self, params):
        return {"tools": list(self.tools.values())}

    def handle_tools_call(self, params):
        tool_name = params["name"]
        args = params["arguments"]
        result = self.tools[tool_name](**args)
        return {"content": [{"type": "text", "text": str(result)}]}
```

### Q: 可以在浏览器中使用 MCP 吗？

可以，但通常用 SSE 或 WebSocket 作为传输层。

---

## 📚 完整概念图

```
                      用户
                       ↓
            ┌──────────────────────┐
            │   🖥️  HOST           │
            │  (LLM 应用程序)      │
            │                      │
            │ ┌────────────────┐  │
            │ │  Client Pool   │  │
            │ │ (连接管理器)   │  │
            │ │                │  │
            │ │ C1  C2  C3  C4 │  │
            │ └────────────────┘  │
            └──┬────┬────┬────┬───┘
               │    │    │    │
      ─────────┼────┼────┼────┼─────── JSON-RPC 2.0
               ↓    ↓    ↓    ↓
         ┌──────────────────────────┐
         │   MCP Servers            │
         │                          │
         │  ┌──────┐ ┌──────┐      │
         │  │Server│ │Server│ ...  │
         │  │  A   │ │  B   │      │
         │  │(文件)│ │(数据)│      │
         │  └──────┘ └──────┘      │
         │                          │
         │  每个 Server 提供：       │
         │  📚 Resources           │
         │  🔧 Tools              │
         │  💬 Prompts            │
         └──────────────────────────┘
```

**层级结构**：
```
第一层：Host       负责用户交互和整体协调
第二层：Client     负责连接管理和消息路由
第三层：Server     负责具体的数据和功能提供

Host 通过创建多个 Client 来管理多个 Server
每个 Client 与一个 Server 保持一对一的连接
```

---

## ✨ 核心要点速记卡

```
【MCP 就是】
LLM 应用 ↔ 各类服务 的通用协议

【三个角色】✨✨✨ 最重要！
🖥️  Host     LLM 应用（与用户交互，管理多个 Client）
📨 Client   连接管理员（每个 Client 对应一个 Server）
⚙️  Server   服务提供者（实现具体功能）

【一对多 + 一对一】
Host ← 一对多 → Client ← 一对一 → Server
1个              N个           多个

【三个资源类型】
📚 Resources  读取数据和文件
🔧 Tools      执行动作和操作
💬 Prompts    提供 AI 提示模板

【通信方式】
JSON-RPC 2.0 格式
request: method + params
response: result / error

【三步流程】
① initialize   (初始化握手)
② */list       (查询能力列表)
③ */read/call  (执行具体操作)

【传输可选】
Stdio(本地) | SSE(推送) | HTTP/WebSocket(网络)

【记住这个】
无状态 + 灵活 + 安全 = MCP 的核心哲学
Host 管理 Client，Client 管理 Server = 分层架构
```

---

## 🔗 相关资源

- 官方文档：https://modelcontextprotocol.io
- GitHub：https://github.com/modelcontextprotocol
- 社区实现：各种编程语言的 SDK

---

**最后一句话**：MCP 其实就是"AI 和工具的微信聊天协议"——定义清楚说话方式，双方就能无障碍沟通！🎉
