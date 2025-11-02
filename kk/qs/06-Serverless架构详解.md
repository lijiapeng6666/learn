# Serverless 架构详解

## 考点概述
Serverless（无服务器）是云计算的新范式，让开发者专注于业务逻辑，无需管理基础设施。是现代云应用的关键技术。

---

## 核心概念

### 1. 什么是Serverless
**通俗解释：**
```
传统开发（Self-hosted）
├─ 你要买服务器
├─ 你要管理系统
├─ 你要扩容缩容
├─ 你要监控运维
└─ 成本高，事务繁重

VPS（虚拟私有服务器）
├─ 租用虚拟机
├─ 仍需配置和管理
├─ 成本略低
└─ 运维仍然繁重

容器化（Docker/Kubernetes）
├─ 自动扩容缩容
├─ 更灵活
├─ 学习成本高
└─ 仍需运维

Serverless ⭐ (无服务器)
├─ "零"运维
├─ 按使用付费
├─ 自动扩展
├─ 成本最低
└─ 开发者只需写代码
```

**关键特点：**
```
✅ 无基础设施管理
   └─ 不需要关心服务器、操作系统、补丁更新

✅ 按使用计费
   └─ 执行时间：$0.0000002/100ms
   └─ 内存：按GB计费
   └─ 调用次数：首百万次免费

✅ 自动扩展
   ├─ 0并发 → 1000并发自动处理
   └─ 无需手动配置

✅ 开发高效
   ├─ 只需关心业务逻辑
   ├─ 快速部署
   └─ 快速迭代

❌ 有限制
   ├─ 执行时间通常限制在15分钟内
   ├─ 无状态（不能保存本地文件）
   ├─ 冷启动延迟（几百ms）
   └─ 适合事件驱动的短流程
```

---

### 2. Serverless 的两大类

**FaaS (Function as a Service) - 函数即服务**
```
这是最常见的Serverless形式

主要平台：
├─ AWS Lambda
├─ Google Cloud Functions
├─ Azure Functions
├─ Alibaba Function Compute
└─ Tencent SCF

特点：
├─ 粒度：函数级
├─ 管理：自动
├─ 扩展：毫秒级
├─ 用途：短期任务

使用场景：
├─ API后端（REST、GraphQL）
├─ 定时任务（每天定点执行）
├─ 消息处理（队列、事件）
├─ 文件处理（上传、转换）
├─ 数据转换和ETL
└─ 爬虫和数据收集
```

**BaaS (Backend as a Service) - 后端即服务**
```
提供现成的后端功能

主要平台：
├─ Firebase (Google)
├─ Supabase
├─ Amplify (AWS)
├─ Hasura
└─ Parse

提供的服务：
├─ 数据库 (Firestore, PostgreSQL)
├─ 认证 (Auth0, Firebase Auth)
├─ 存储 (文件存储)
├─ 消息推送
├─ 实时数据同步
└─ ML/AI服务

适用：
└─ 快速构建全栈应用（前端工程师也能做后端）
```

---

## AWS Lambda 详解

### 3. Lambda 的基本概念

**Lambda 函数结构：**
```javascript
// 最基础的Lambda函数
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' })
  }
}

// 参数详解：
// event - 触发事件（来自API调用、S3、SQS等）
// context - 执行上下文（函数信息、请求ID等）
// 返回值 - 函数输出结果

// 更完整的例子
exports.handler = async (event, context) => {
  console.log('Event:', event)
  console.log('Context:', context)

  // context中的有用信息：
  // - context.functionName: 函数名
  // - context.functionVersion: 函数版本
  // - context.invokeId: 调用ID
  // - context.awsRequestId: AWS请求ID
  // - context.getRemainingTimeInMillis(): 剩余执行时间
  // - context.callbackWaitsForEmptyEventLoop: 是否等待事件循环

  try {
    const result = await doSomething(event)
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

---

### 4. Lambda 的触发事件源

**API Gateway 触发**
```javascript
// 最常见的触发方式（REST API）

// event 结构
{
  "httpMethod": "POST",
  "path": "/api/users",
  "queryStringParameters": {
    "page": "1"
  },
  "headers": {
    "Content-Type": "application/json"
  },
  "body": "{\"name\": \"Alice\"}",  // ← JSON字符串，需要parse
  "requestContext": {
    "identity": {
      "sourceIp": "192.168.1.1"
    }
  }
}

// 处理示例
exports.handler = async (event) => {
  // 解析请求
  const method = event.httpMethod
  const path = event.path
  const queryParams = event.queryStringParameters
  const body = JSON.parse(event.body)

  // 业务逻辑
  const result = await processRequest(method, path, body)

  // 返回响应
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(result)
  }
}
```

**S3 事件触发**
```javascript
// 文件上传到S3时触发

// event 结构
{
  "Records": [
    {
      "s3": {
        "bucket": { "name": "my-bucket" },
        "object": { "key": "photos/photo123.jpg" }
      },
      "eventName": "ObjectCreated:Put"
    }
  ]
}

// 处理示例 - 图片处理
exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name
    const key = record.s3.object.key

    // 处理图片：生成缩略图、压缩等
    await processImage(bucket, key)
  }

  return { statusCode: 200 }
}
```

**SQS 队列触发**
```javascript
// 处理队列中的消息

// event 结构
{
  "Records": [
    {
      "messageId": "abc123",
      "body": "{\"orderId\": 456, \"status\": \"paid\"}"
    }
  ]
}

// 处理示例 - 订单处理
exports.handler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body)

    // 处理订单
    await processOrder(message.orderId, message.status)

    // 如果处理失败，可以重新入队
  }

  return { statusCode: 200 }
}
```

**DynamoDB Stream 触发**
```javascript
// 数据库变化时触发

// event 结构
{
  "Records": [
    {
      "dynamodb": {
        "Keys": { "id": { "S": "user123" } },
        "NewImage": {
          "id": { "S": "user123" },
          "name": { "S": "Alice" }
        }
      },
      "eventName": "INSERT"  // INSERT, MODIFY, REMOVE
    }
  ]
}

// 处理示例 - 用户变化同步到搜索引擎
exports.handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      await elasticSearch.index(record.dynamodb.NewImage)
    } else if (record.eventName === 'REMOVE') {
      await elasticSearch.delete(record.dynamodb.Keys.id)
    }
  }

  return { statusCode: 200 }
}
```

**定时触发（CloudWatch Events）**
```javascript
// 定时执行（类似Cron）

// event 结构
{
  "source": "aws.events",
  "detail-type": "Scheduled Event",
  "time": "2024-10-27T12:00:00Z"
}

// 处理示例 - 每天凌晨2点生成报表
exports.handler = async (event) => {
  const report = await generateDailyReport()
  await sendEmail(report)
  return { statusCode: 200 }
}

// 配置示例（Cron表达式）
// 每天凌晨2点：cron(0 2 * * ? *)
// 每周一上午9点：cron(0 9 ? * MON *)
// 每5分钟：rate(5 minutes)
// 每小时：rate(1 hour)
```

---

### 5. Lambda 的生命周期

**完整的执行流程：**
```
1. 初始化阶段 (一次性)
   ├─ 分配内存
   ├─ 启动运行时（Node.js/Python等）
   ├─ 下载代码
   └─ 执行顶层代码（全局变量、导入等）
   └─ 耗时：100-1000ms（冷启动）

2. 调用函数 (每次调用)
   ├─ 创建execution context
   ├─ 执行handler方法
   ├─ 返回结果
   └─ 清理
   └─ 耗时：1-100ms

3. 重用容器
   ├─ Lambda会保活容器几分钟
   ├─ 下次调用可直接执行handler（无需重新初始化）
   └─ 称为"热启动"

冷启动 vs 热启动：
├─ 冷启动：200ms+（含初始化）
└─ 热启动：5ms（只执行handler）

优化建议：
├─ 尽量把初始化代码放在handler外面
├─ 重用连接（数据库、HTTP）
├─ 预留并发来避免冷启动
└─ 增加内存（更快的CPU）
```

---

### 6. Lambda 最佳实践

**代码示例**
```javascript
// ❌ 不好的做法
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB()

exports.handler = async (event) => {
  // 每次调用都创建新连接
  const s3 = new AWS.S3()

  // 在handler中做初始化
  const result = await s3.getObject({...}).promise()

  return result
}

// ✅ 好的做法
const AWS = require('aws-sdk')

// 在顶层创建连接（可复用）
const s3 = new AWS.S3()
const ddb = new AWS.DynamoDB()

// 缓存初始化的资源
let cachedData = null

exports.handler = async (event) => {
  // 复用连接
  if (!cachedData) {
    cachedData = await ddb.getItem({...}).promise()
  }

  const result = await s3.getObject({...}).promise()

  return result
}

// 更好的做法：使用环境变量和配置
const TABLE_NAME = process.env.TABLE_NAME
const BUCKET_NAME = process.env.BUCKET_NAME
const AWS_REGION = process.env.AWS_REGION

exports.handler = async (event) => {
  // 使用环境变量
  const ddb = new AWS.DynamoDB({ region: AWS_REGION })

  try {
    const result = await ddb.getItem({
      TableName: TABLE_NAME,
      Key: { id: { S: event.id } }
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

---

## Serverless 框架

### 7. Serverless Framework

**安装和初始化：**
```bash
# 安装Serverless框架
npm install -g serverless

# 初始化项目
serverless create --template aws-nodejs --path my-service
cd my-service

# 部署
serverless deploy

# 查看日志
serverless logs -f handler

# 本地调试
serverless offline start
```

**配置文件示例**
```yaml
# serverless.yml
service: my-api-service

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  memorySize: 256  # MB
  timeout: 30      # 秒
  environment:
    TABLE_NAME: users
    BUCKET_NAME: my-bucket

functions:
  # GET /users
  getUsers:
    handler: handlers/users.getAll
    events:
      - http:
          path: users
          method: get
          cors: true

  # GET /users/{id}
  getUserById:
    handler: handlers/users.getById
    events:
      - http:
          path: users/{id}
          method: get
          cors: true

  # POST /users
  createUser:
    handler: handlers/users.create
    events:
      - http:
          path: users
          method: post
          cors: true

  # 定时任务 - 每天凌晨2点
  dailyReport:
    handler: handlers/reports.generate
    events:
      - schedule: cron(0 2 * * ? *)

  # SQS事件处理
  processOrder:
    handler: handlers/orders.process
    events:
      - sqs:
          arn: arn:aws:sqs:us-east-1:123456789:orders
          batchSize: 10

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: users
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
```

---

### 8. AWS SAM (Serverless Application Model)

**SAM 配置示例**
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Description: Serverless REST API

Globals:
  Function:
    Timeout: 30
    MemorySize: 256
    Runtime: nodejs18.x
    Environment:
      Variables:
        TABLE_NAME: !Ref UsersTable

Resources:
  # API Gateway
  ApiGateway:
    Type: AWS::Serverless::Api
    Properties:
      StageName: dev
      Cors: "'*'"

  # Lambda函数
  GetUsersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/
      Handler: users.getAll
      Events:
        GetRequest:
          Type: Api
          Properties:
            RestApiId: !Ref ApiGateway
            Path: /users
            Method: GET
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref UsersTable

  # DynamoDB表
  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: users
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH

Outputs:
  ApiEndpoint:
    Value: !Sub 'https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/dev'
```

---

## Serverless 的优缺点

### 9. 优势和劣势

**优势：**
```
✅ 成本低
   └─ 按实际使用付费，无常驻开销

✅ 开发效率高
   ├─ 只关注业务逻辑
   ├─ 快速部署
   └─ 快速迭代

✅ 自动扩展
   └─ 从0到10000并发自动处理

✅ 高可用
   ├─ 内置冗余
   ├─ 自动故障转移
   └─ 99.99% SLA

✅ 无需运维
   ├─ AWS负责基础设施
   ├─ 自动补丁和升级
   └─ 无需担心服务器

✅ 与云服务集成好
   └─ AWS生态丰富
```

**劣势：**
```
❌ 有限制
   ├─ 执行时间限制（15分钟）
   ├─ 内存有限（3GB）
   ├─ 不能持久化本地文件
   ├─ 无状态
   └─ 环境变量也有大小限制

❌ 冷启动延迟
   ├─ 新容器启动需要200-1000ms
   ├─ 对时延敏感的应用不适合
   └─ 可以用预留并发解决（有成本）

❌ 调试困难
   ├─ 不能ssh到服务器
   ├─ 依赖CloudWatch日志
   └─ 本地开发需要特殊工具

❌ 成本预测难
   ├─ 突发流量可能产生高费用
   ├─ 需要监控和告警
   └─ 大流量场景可能比普通服务器贵

❌ 不适合所有场景
   └─ 长时间运行的任务
   └─ 需要特定操作系统特性
   └─ 连接池需要时间建立
```

---

## 适用场景

### 10. Serverless 适合什么

**最佳场景：**
```
1. REST/GraphQL API
   └─ API Gateway + Lambda + DynamoDB
   └─ 自动扩展，完美匹配

2. 异步处理
   ├─ 消息队列（SQS）
   ├─ 事件驱动（SNS）
   └─ 流处理（Kinesis）

3. 定时任务
   ├─ 数据备份
   ├─ 报表生成
   ├─ 定期清理
   └─ Cron表达式

4. 文件处理
   ├─ 图片缩略图生成
   ├─ 视频转码
   ├─ 文档转换
   └─ S3 + Lambda

5. Webhook处理
   ├─ GitHub webhook
   ├─ Stripe支付通知
   ├─ 第三方API回调
   └─ 实时处理

6. 单页应用后端
   ├─ 身份认证
   ├─ API
   ├─ 数据存储
   └─ 可以是全Serverless
```

**不适合的场景：**
```
1. 长时间运行的任务
   ├─ 数据库迁移
   ├─ 大数据处理
   ├─ 机器学习训练
   └─ 改用EC2或ECS

2. 需要特定OS的应用
   ├─ Windows应用
   ├─ 需要特定驱动
   └─ 改用EC2

3. 高并发且对冷启动敏感
   ├─ 实时多人游戏
   ├─ 高频交易系统
   └─ 改用容器或虚拟机

4. 持久连接
   ├─ WebSocket（可用Lambda + API Gateway WebSocket）
   ├─ 实时推送
   └─ 需要特殊处理
```

---

## 完整示例

### 11. REST API 完整示例

```javascript
// handlers/users.js
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB()

const TABLE_NAME = process.env.TABLE_NAME

// GET /users
exports.getAll = async (event) => {
  try {
    const result = await ddb.scan({
      TableName: TABLE_NAME
    }).promise()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.Items)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

// GET /users/{id}
exports.getById = async (event) => {
  const id = event.pathParameters.id

  try {
    const result = await ddb.getItem({
      TableName: TABLE_NAME,
      Key: { id: { S: id } }
    }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

// POST /users
exports.create = async (event) => {
  const body = JSON.parse(event.body)

  try {
    await ddb.putItem({
      TableName: TABLE_NAME,
      Item: {
        id: { S: Date.now().toString() },
        name: { S: body.name },
        email: { S: body.email },
        createdAt: { S: new Date().toISOString() }
      }
    }).promise()

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'User created' })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
```

---

## 快速自测

- [ ] 能解释Serverless的核心概念吗？
- [ ] FaaS和BaaS的区别是什么？
- [ ] Lambda的执行模型了解吗？
- [ ] 能写出REST API的Lambda函数吗？
- [ ] 冷启动和热启动的区别？
- [ ] 能配置Serverless框架吗？
- [ ] 知道DynamoDB的基本操作吗？
- [ ] 能处理S3或SQS事件吗？
- [ ] Serverless适合什么场景？
- [ ] 有什么成本优化的方法？
