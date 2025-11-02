# NestJS 框架详解

## 考点概述
NestJS是现代Node.js后端框架，融合了Express/Fastify的高性能和Angular的架构设计理念。是大型项目开发的最佳选择。

---

## 核心特点

### 1. NestJS 相比其他框架的优势
**通俗解释：**
```
Express
├─ 优点：轻量，灵活
├─ 缺点：没有结构，容易写出烂代码
└─ 适用：小项目、快速原型

Koa
├─ 优点：更现代，中间件洋葱模型
├─ 缺点：同样缺乏结构
└─ 适用：小到中等项目

NestJS ⭐
├─ 优点：架构清晰，企业级特性
├─ 缺点：学习曲线陡峭
└─ 适用：大型项目、团队开发

Django
├─ 优点：完整的生态
└─ 缺点：不是JavaScript

Spring Boot
├─ 优点：业界标准
└─ 缺点：不是JavaScript
```

**NestJS 的设计哲学：**
```
强结构 ✅
├─ 强制使用模块、控制器、服务
├─ 代码组织清晰
└─ 团队协作高效

类型安全 ✅
├─ 全TypeScript
├─ 编译时错误检测
└─ IDE支持完美

装饰器驱动 ✅
├─ 使用装饰器定义行为
├─ 类似Java注解
└─ 代码简洁优雅

面向对象 ✅
├─ 天然支持OOP
├─ 支持继承、多态
└─ 企业开发友好

DI容器 ✅
├─ 依赖注入自动管理
├─ 降低耦合
└─ 便于测试
```

---

## 核心架构

### 2. NestJS 的三层架构

**分层结构：**
```
请求 (Request)
    ↓
────────────────────────────
│  Controller (控制层)       │
│  - 路由定义                │
│  - 请求处理                │
│  - 数据验证                │
────────────────────────────
    ↓
────────────────────────────
│  Service (业务层)          │
│  - 业务逻辑                │
│  - 数据处理                │
│  - 复杂计算                │
────────────────────────────
    ↓
────────────────────────────
│  Repository/Database (数据层)
│  - 数据库操作              │
│  - ORM集成                 │
│  - 数据持久化              │
────────────────────────────
    ↓
响应 (Response)
```

---

### 3. 核心概念详解

**Module (模块)**
```typescript
// user.module.ts
import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],  // 声明该模块的控制器
  providers: [UserService],       // 声明该模块的服务
  exports: [UserService]          // 导出服务给其他模块使用
})
export class UserModule {}

// app.module.ts (根模块)
import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { PostModule } from './post/post.module'

@Module({
  imports: [UserModule, PostModule],  // 导入其他模块
})
export class AppModule {}

// 模块的生命周期：
// 1. 声明 - 定义模块包含的类
// 2. 导入 - 其他模块导入该模块
// 3. 注册 - NestJS在DI容器中注册
// 4. 初始化 - 调用onModuleInit钩子
// 5. 销毁 - 调用onModuleDestroy钩子
```

**Controller (控制器)**
```typescript
// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UseFilters
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'

@Controller('users')  // ← 路由前缀
export class UserController {
  constructor(private userService: UserService) {}

  // GET /users
  @Get()
  async getAllUsers(@Query('page') page: number = 1) {
    return this.userService.findAll(page)
  }

  // GET /users/123
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id)
  }

  // POST /users
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  // PUT /users/123
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto
  ) {
    return this.userService.update(id, updateUserDto)
  }

  // DELETE /users/123
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id)
  }
}

// 装饰器详解：
// @Controller('users') - 声明控制器，设置路由前缀
// @Get() / @Post() / @Put() / @Delete() - HTTP方法
// @Param() - 路由参数 (:id)
// @Query() - 查询参数 (?page=1)
// @Body() - 请求体 (JSON)
// @Headers() - 请求头
// @Req() - 整个请求对象
// @Res() - 响应对象（如需自定义）
```

**Service (服务)**
```typescript
// user.service.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()  // ← 可注入，声明为服务
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll(page: number = 1) {
    const pageSize = 10
    const skip = (page - 1) * pageSize

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' }
    })

    return {
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } })
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  async update(id: string, updateUserDto: CreateUserDto) {
    await this.userRepository.update(id, updateUserDto)
    return this.userRepository.findOne({ where: { id } })
  }

  async delete(id: string) {
    return this.userRepository.delete(id)
  }
}

// 服务是业务逻辑的容器
// - 可复用性高（被多个控制器使用）
// - 便于单元测试
// - 数据库操作集中
```

---

## 关键特性

### 4. 依赖注入 (Dependency Injection)

**什么是DI？**
```
没有DI的代码：
class UserService {
  private database = new Database()  // 直接创建
}
// 问题：耦合紧密，难以测试

有DI的代码：
class UserService {
  constructor(private database: Database) {}  // 从外部注入
}
// 优点：解耦，易于测试
```

**NestJS中的DI：**
```typescript
// 定义接口
interface DatabaseProvider {
  query(sql: string): Promise<any>
}

// 实现接口
class PostgresDatabase implements DatabaseProvider {
  async query(sql: string) {
    // 查询逻辑
  }
}

// 在模块中配置
@Module({
  providers: [
    {
      provide: 'DATABASE',      // 令牌
      useClass: PostgresDatabase // 实现类
    },
    UserService
  ]
})
export class UserModule {}

// 在服务中注入
@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: DatabaseProvider) {}
  // 使用注入的依赖
}

// 好处：
// - 可以轻松切换实现（测试时换成MockDatabase）
// - 自动管理生命周期
// - 减少重复代码
```

---

### 5. DTO (数据传输对象)

**什么是DTO？**
```typescript
// 定义数据结构和验证规则
import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsOptional()
  @IsString()
  avatar?: string
}

// 在控制器中使用
@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  // createUserDto已经过验证和转换
  // 如果数据不符合规则，自动返回400错误
  return this.userService.create(createUserDto)
}

// 完整的请求流程：
// 1. 请求体被解析为JSON
// 2. NestJS尝试转换为CreateUserDto类型
// 3. 验证装饰器（@IsEmail等）检查数据
// 4. 验证通过 → 传给处理函数
// 5. 验证失败 → 返回400和错误信息

// 返回的错误示例：
{
  "statusCode": 400,
  "message": [
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

---

### 6. Guard (守卫) - 认证授权

**什么是Guard？**
```typescript
// 守卫用于控制请求是否能通过
// 常见用途：认证、授权、权限检查

// 示例1：认证守卫
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) {
      return false  // ← 拒绝请求
    }

    try {
      const decoded = this.jwtService.verify(token)
      request.user = decoded
      return true  // ← 允许请求
    } catch {
      return false
    }
  }

  private extractToken(request: any): string | undefined {
    const authHeader = request.headers.authorization
    return authHeader?.replace('Bearer ', '')
  }
}

// 示例2：角色守卫
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    // 检查用户角色
    return user.role === 'admin'
  }
}

// 使用守卫
@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)  // ← 应用多个守卫
export class AdminController {
  @Get()
  getAllUsers() {
    // 只有认证且是admin角色的用户才能访问
  }
}

// 执行顺序：
// 请求 → JwtAuthGuard → RoleGuard → 控制器
// 任何守卫返回false，请求被阻止
```

---

### 7. Interceptor (拦截器)

**什么是拦截器？**
```typescript
// 拦截器用于在请求前后执行代码
// 类似Express的中间件，但功能更强大

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

// 示例1：响应转换
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 请求前执行
    console.log('Before request')

    return next
      .handle()  // ← 执行控制器方法
      .pipe(
        map(data => ({  // ← 转换响应
          statusCode: 200,
          message: 'Success',
          data
        }))
      )
    // 请求后执行
  }
}

// 示例2：日志拦截器
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url } = request

    console.log(`[${method}] ${url} - request received`)

    const now = Date.now()

    return next.handle().pipe(
      map(data => {
        const elapsed = Date.now() - now
        console.log(`[${method}] ${url} - ${elapsed}ms`)
        return data
      })
    )
  }
}

// 示例3：异常处理
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        console.error('Error:', error)
        // 转换错误格式
        return throwError(() => new BadRequestException(error.message))
      })
    )
  }
}

// 使用拦截器
@Controller('users')
@UseInterceptors(TransformInterceptor, LoggingInterceptor)
export class UserController {
  @Get()
  getUsers() {
    return { name: 'Alice' }
  }
}

// 响应会被自动转换：
// {
//   "statusCode": 200,
//   "message": "Success",
//   "data": { "name": "Alice" }
// }
```

---

### 8. Exception Filter (异常过滤器)

**什么是异常过滤器？**
```typescript
// 统一处理异常，返回一致的错误格式

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exceptionResponse['message'] || exception.message,
      error: exceptionResponse['error'] || 'Error'
    })
  }
}

// 全局应用
// main.ts
app.useGlobalFilters(new HttpExceptionFilter())

// 或在模块中
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}

// 使用自定义异常
throw new BadRequestException('Invalid input')
throw new UnauthorizedException('No token provided')
throw new ForbiddenException('Insufficient permissions')
throw new NotFoundException('User not found')
```

---

### 9. Middleware (中间件)

**什么是中间件？**
```typescript
// 中间件在请求到达控制器前执行
// 用于日志、认证、CORS等

import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', req.method, req.path)
    next()  // ← 继续下一步
  }
}

// 注册中间件
@Module({
  imports: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')  // ← 应用到所有路由
    // 或
    .forRoutes({ path: 'users*', method: RequestMethod.GET })
  }
}

// 执行顺序：
// 请求 → 中间件1 → 中间件2 → Guard → Interceptor → 控制器
```

---

## 数据库集成

### 10. TypeORM 集成

**安装和配置：**
```bash
npm install @nestjs/typeorm typeorm mysql2
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'mydb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true  // 自动同步数据库（仅开发）
    })
  ]
})
export class AppModule {}
```

**定义实体：**
```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Post } from '../post/post.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ unique: true })
  email: string

  @Column({ select: false })  // 默认不查询（敏感数据）
  password: string

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @OneToMany(() => Post, post => post.author)
  posts: Post[]
}
```

**在服务中使用：**
```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll() {
    return this.userRepository.find({
      relations: ['posts']  // 一并加载关联数据
    })
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'password']  // 显式包含password
    })
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto)
    return this.userRepository.findOne({ where: { id } })
  }

  async delete(id: number) {
    return this.userRepository.delete(id)
  }
}
```

---

## 完整示例

### 11. 完整的用户模块

```typescript
// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column({ select: false })
  password: string

  @Column({ default: 'active' })
  status: string
}

// create-user.dto.ts
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string
}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async findAll() {
    return this.userRepository.find()
  }

  async findById(id: number) {
    return this.userRepository.findOne({ where: { id } })
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto)
    return this.userRepository.save(user)
  }

  async update(id: number, updateUserDto: CreateUserDto) {
    await this.userRepository.update(id, updateUserDto)
    return this.userRepository.findOne({ where: { id } })
  }

  async delete(id: number) {
    await this.userRepository.delete(id)
    return { message: 'User deleted' }
  }
}

// user.controller.ts
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAll() {
    return this.userService.findAll()
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findById(id)
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: CreateUserDto
  ) {
    return this.userService.update(id, updateUserDto)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id)
  }
}

// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}

// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'mydb',
      entities: [User],
      synchronize: true
    }),
    UserModule
  ]
})
export class AppModule {}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
}

bootstrap()
```

---

## 最佳实践

### 12. 开发建议

**文件夹结构：**
```
src/
├─ modules/
│  ├─ user/
│  │  ├─ entities/
│  │  │  └─ user.entity.ts
│  │  ├─ dto/
│  │  │  ├─ create-user.dto.ts
│  │  │  └─ update-user.dto.ts
│  │  ├─ user.controller.ts
│  │  ├─ user.service.ts
│  │  └─ user.module.ts
│  └─ post/
│     └─ ... (同上)
├─ common/
│  ├─ filters/
│  │  └─ http-exception.filter.ts
│  ├─ guards/
│  │  └─ jwt-auth.guard.ts
│  └─ interceptors/
│     └─ transform.interceptor.ts
├─ config/
│  └─ database.config.ts
├─ app.module.ts
└─ main.ts
```

**常见面试题：**
- [ ] NestJS的三层架构是什么？
- [ ] 什么是依赖注入？有什么好处？
- [ ] Guard和Interceptor的区别？
- [ ] 如何进行异常处理？
- [ ] TypeORM中@InjectRepository的作用？
- [ ] 如何实现JWT认证？
- [ ] 模块系统有什么优势？
- [ ] 如何编写单元测试？

---

## 快速自测

- [ ] 能建立一个完整的NestJS应用吗？
- [ ] 理解模块、控制器、服务的职责吗？
- [ ] 能写出DI配置吗？
- [ ] 能实现JWT认证守卫吗？
- [ ] 能编写和使用拦截器吗？
- [ ] 能集成TypeORM吗？
- [ ] 知道各种装饰器的用途吗？
- [ ] 能写出测试用例吗？
