# TensorFlow 详细指南

## 简介

**TensorFlow** 是由 Google 开发的开源机器学习框架，用于构建和训练深度神经网络。它提供了灵活的架构，可以在各种平台上部署机器学习模型。

## 核心概念

### 1. 张量（Tensor）

**定义：** TensorFlow 中的基本数据结构，多维数组的抽象表示。

```python
import tensorflow as tf

# 标量（0维张量）
scalar = tf.constant(5)

# 向量（1维张量）
vector = tf.constant([1, 2, 3])

# 矩阵（2维张量）
matrix = tf.constant([[1, 2], [3, 4]])

# 3维张量
tensor_3d = tf.constant([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])

print(f"标量形状: {scalar.shape}")      # ()
print(f"向量形状: {vector.shape}")      # (3,)
print(f"矩阵形状: {matrix.shape}")      # (2, 2)
print(f"3维张量形状: {tensor_3d.shape}")  # (2, 2, 2)
```

**关键属性：**
- `shape` - 张量的维度信息
- `dtype` - 数据类型（float32, int32等）
- `numpy()` - 转换为NumPy数组

### 2. 计算图（Computation Graph）

TensorFlow 2.x 默认使用**动态图**（Eager Execution），但也支持静态图。

```python
# 动态图模式（TensorFlow 2.x默认）
@tf.function  # 可选：将函数编译为静态图以提升性能
def add_and_multiply(x, y):
    z = x + y
    return z * 2

result = add_and_multiply(tf.constant(3.0), tf.constant(4.0))
print(result)  # 14.0
```

### 3. 自动微分（Automatic Differentiation）

```python
# 梯度计算是深度学习的核心
x = tf.Variable(3.0)

with tf.GradientTape() as tape:
    y = x ** 2 + 3 * x + 2

# 求导：dy/dx
grad = tape.gradient(y, x)
print(f"在x=3处的导数: {grad}")  # 9.0 (导数为 2x + 3 = 9)
```

## 构建神经网络

### 方式1：Sequential API（简单网络）

```python
from tensorflow import keras

# 构建顺序模型
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(784,)),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(10, activation='softmax')
])

# 编译模型
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 查看模型结构
model.summary()
```

### 方式2：Functional API（复杂网络）

```python
from tensorflow import keras

# 用于多输入、多输出的网络
inputs = keras.Input(shape=(784,))
x = keras.layers.Dense(128, activation='relu')(inputs)
x = keras.layers.Dropout(0.2)(x)
outputs = keras.layers.Dense(10, activation='softmax')(x)

model = keras.Model(inputs=inputs, outputs=outputs)
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
```

### 方式3：Subclassing API（最灵活）

```python
class CustomModel(keras.Model):
    def __init__(self):
        super(CustomModel, self).__init__()
        self.dense1 = keras.layers.Dense(128, activation='relu')
        self.dense2 = keras.layers.Dense(10, activation='softmax')

    def call(self, inputs):
        x = self.dense1(inputs)
        return self.dense2(x)

model = CustomModel()
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
```

## 常见层类型

| 层类型 | 作用 | 示例 |
|--------|------|------|
| **Dense** | 全连接层 | `Dense(64, activation='relu')` |
| **Conv2D** | 2D卷积层 | `Conv2D(32, (3,3), activation='relu')` |
| **LSTM** | 长短期记忆层 | `LSTM(64)` |
| **Dropout** | 随机删除神经元 | `Dropout(0.2)` |
| **BatchNormalization** | 批归一化 | `BatchNormalization()` |
| **Embedding** | 词向量嵌入 | `Embedding(10000, 128)` |
| **Flatten** | 展平为1维 | `Flatten()` |

## 训练模型

```python
import numpy as np

# 准备数据
x_train = np.random.rand(1000, 784).astype('float32')
y_train = np.random.randint(0, 10, (1000,))

# 方法1：高级API
history = model.fit(
    x_train, y_train,
    batch_size=32,
    epochs=10,
    validation_split=0.2,
    verbose=1
)

# 方法2：自定义训练循环
@tf.function
def train_step(x, y):
    with tf.GradientTape() as tape:
        logits = model(x, training=True)
        loss = keras.losses.sparse_categorical_crossentropy(y, logits)
        loss = tf.reduce_mean(loss)

    gradients = tape.gradient(loss, model.trainable_weights)
    optimizer.apply_gradients(zip(gradients, model.trainable_weights))
    return loss

optimizer = keras.optimizers.Adam(learning_rate=0.001)
for epoch in range(10):
    loss = train_step(x_train, y_train)
    print(f"Epoch {epoch}: loss = {loss}")
```

## 评估和预测

```python
# 评估模型
x_test = np.random.rand(200, 784).astype('float32')
y_test = np.random.randint(0, 10, (200,))

loss, accuracy = model.evaluate(x_test, y_test)
print(f"测试集准确率: {accuracy * 100:.2f}%")

# 预测
predictions = model.predict(x_test[:5])
print(f"预测结果: {np.argmax(predictions, axis=1)}")
```

## 常见优化器和损失函数

### 优化器

```python
# SGD - 随机梯度下降
optimizer = keras.optimizers.SGD(learning_rate=0.01, momentum=0.9)

# Adam - 适应性学习率（推荐）
optimizer = keras.optimizers.Adam(learning_rate=0.001, beta_1=0.9, beta_2=0.999)

# RMSprop - 均方根传播
optimizer = keras.optimizers.RMSprop(learning_rate=0.001)
```

### 损失函数

```python
# 分类问题
loss_fn = keras.losses.sparse_categorical_crossentropy  # 整数标签
loss_fn = keras.losses.categorical_crossentropy  # one-hot标签

# 回归问题
loss_fn = keras.losses.mean_squared_error
loss_fn = keras.losses.mean_absolute_error
```

## 数据加载和预处理

### 使用 tf.data API

```python
# 创建数据集
dataset = tf.data.Dataset.from_tensor_slices((x_train, y_train))

# 数据预处理和批处理
dataset = dataset.shuffle(buffer_size=1024)
dataset = dataset.map(lambda x, y: (x / 255.0, y))  # 归一化
dataset = dataset.batch(32)
dataset = dataset.prefetch(tf.data.AUTOTUNE)

# 训练
model.fit(dataset, epochs=10)
```

### 图像增强

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# 数据增强
augmentation = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    zoom_range=0.2
)

# 用于训练
train_dataset = augmentation.flow(x_train, y_train, batch_size=32)
model.fit(train_dataset, epochs=10)
```

## 保存和加载模型

```python
# 保存完整模型
model.save('my_model.h5')  # HDF5格式
model.save('my_model')     # SavedModel格式

# 加载模型
loaded_model = keras.models.load_model('my_model.h5')

# 仅保存权重
model.save_weights('model_weights.h5')

# 加载权重
model.load_weights('model_weights.h5')
```

## 实战示例：MNIST手写数字识别

```python
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np

# 加载数据
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

# 数据预处理
x_train = x_train.reshape(-1, 784).astype('float32') / 255.0
x_test = x_test.reshape(-1, 784).astype('float32') / 255.0

# 构建模型
model = keras.Sequential([
    layers.Dense(128, activation='relu', input_shape=(784,)),
    layers.Dropout(0.2),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(10, activation='softmax')
])

# 编译
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss=keras.losses.sparse_categorical_crossentropy,
    metrics=['accuracy']
)

# 训练
history = model.fit(
    x_train, y_train,
    batch_size=128,
    epochs=10,
    validation_split=0.2,
    verbose=1
)

# 评估
test_loss, test_accuracy = model.evaluate(x_test, y_test)
print(f"测试准确率: {test_accuracy * 100:.2f}%")

# 预测
predictions = model.predict(x_test[:10])
print(f"前10个预测结果: {np.argmax(predictions, axis=1)}")
```

## 高级特性

### 1. 回调函数（Callbacks）

```python
# 早停
early_stopping = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=3,
    restore_best_weights=True
)

# 学习率衰减
lr_scheduler = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=2,
    min_lr=1e-7
)

# 模型检查点
checkpoint = keras.callbacks.ModelCheckpoint(
    'best_model.h5',
    monitor='val_accuracy',
    save_best_only=True
)

model.fit(x_train, y_train, callbacks=[early_stopping, lr_scheduler, checkpoint])
```

### 2. 迁移学习

```python
# 使用预训练模型
base_model = keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

# 冻结基础模型的权重
base_model.trainable = False

# 添加自己的层
model = keras.Sequential([
    base_model,
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(256, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy')
```

### 3. 正则化技术

```python
model = keras.Sequential([
    # L2正则化
    keras.layers.Dense(
        128,
        activation='relu',
        kernel_regularizer=keras.regularizers.l2(0.01),
        input_shape=(784,)
    ),
    # Dropout
    keras.layers.Dropout(0.3),
    # BatchNormalization
    keras.layers.BatchNormalization(),
    keras.layers.Dense(10, activation='softmax')
])
```

## 性能优化建议

| 优化方向 | 具体方法 | 效果 |
|---------|---------|------|
| **批量大小** | 增加batch_size（显存允许） | 训练速度↑ |
| **并行处理** | 使用`tf.data.Dataset.prefetch()` | I/O时间↓ |
| **混合精度** | `mixed_precision` 策略 | 显存↓ 速度↑ |
| **分布式训练** | `MirroredStrategy` 多GPU | 训练时间↓ |
| **模型压缩** | 量化、剪枝 | 模型大小↓ |

```python
# 混合精度训练
from tensorflow.keras import mixed_precision

policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_global_policy(policy)

# 多GPU训练
strategy = tf.distribute.MirroredStrategy()
with strategy.scope():
    model = keras.Sequential([...])
    model.compile(...)
```

## 常见问题排查

### 问题1：过拟合（Overfitting）

```python
# 症状：训练集准确率高，验证集准确率低
# 解决方案：
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu',
                      kernel_regularizer=keras.regularizers.l2(0.01)),
    keras.layers.Dropout(0.3),  # 增加Dropout
    keras.layers.Dense(10, activation='softmax')
])
```

### 问题2：梯度消失

```python
# 症状：深层网络训练效果差
# 解决方案：
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu'),
    keras.layers.BatchNormalization(),  # 添加BatchNorm
    keras.layers.Dense(64, activation='relu'),
    keras.layers.BatchNormalization(),
    keras.layers.Dense(10, activation='softmax')
])
```

### 问题3：显存不足

```python
# 减小batch_size
model.fit(x_train, y_train, batch_size=16)  # 从32改为16

# 使用混合精度
policy = mixed_precision.Policy('mixed_float16')
```

## 关键总结

✅ **核心概念** - 张量、计算图、自动微分
✅ **模型构建** - Sequential、Functional、Subclassing三种方式
✅ **数据处理** - tf.data API、数据增强
✅ **训练流程** - 编译、训练、评估、预测
✅ **优化技巧** - 回调函数、迁移学习、正则化
✅ **性能优化** - 批处理、混合精度、分布式训练

## 资源推荐

- 官方教程：https://www.tensorflow.org/tutorials
- API文档：https://www.tensorflow.org/api_docs
- TensorFlow Hub：https://tfhub.dev（预训练模型库）

---

**背景、设计、实现、效果、优化**
