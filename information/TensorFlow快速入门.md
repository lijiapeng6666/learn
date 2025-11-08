# TensorFlow 通俗入门（5 分钟读懂）

## 一句话讲清楚
- TensorFlow 是一套“让电脑自己找规律”的工具。你给它很多“样本”（输入和正确答案），它会把模型里的很多小旋钮（参数）一点点调好，让输出更接近答案。

## 能干嘛（举例）
- 图片：猫狗识别、手写数字识别、找到图片里的人/车（检测/分割）
- 文本：垃圾邮件判定、评论情感、文档分类、翻译/摘要
- 数值：房价/销量/温度等连续值预测（回归）
- 声音/视频：语音转文字、哼歌识曲、事件识别
- 推荐/排序：给用户推视频/商品、点不点的概率（CTR）
- 生成式：写诗、画画、把草图变清晰（生成模型）

## 什么时候用/不该用
- 该用：有较多数据；任务像“看图/读文/听声/时间序列”这类复杂模式识别；传统规则不好写。
- 不该用：规则清楚、样本很少、对可解释性极强的需求（可先用简单模型）。

## 它怎么工作（打比方）
- 模型像函数 f(x; θ)：x 是输入，θ 是一堆“旋钮”。
- 损失像“走偏的距离”：预测越不准，损失越大。
- 训练像“摸黑下山”找最低点：用优化器（Adam/SGD）按梯度的方向把 θ 往更小的损失挪。
- 批次 batch/轮次 epoch：一次看一小批样本，所有样本都跑一遍叫 1 个 epoch。
- 验证集/过拟合：训练很好但新数据差=过拟合；用早停、正则化、数据增广缓解。

## 三步跑起来（最小可跑 demo）
```python
import numpy as np, tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 1) 造点“表格二分类”数据：前 3 列之和 > 0 就是 1，否则 0
x = np.random.randn(4000, 20).astype('float32')
y = (x[:, :3].sum(axis=1) > 0).astype('int32')

# 2) 搭个简单模型：若干全连接层
model = keras.Sequential([
  layers.Input(shape=(20,)),
  layers.Dense(64, activation='relu'),
  layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# 3) 训练并评估
model.fit(x, y, epochs=5, batch_size=128, validation_split=0.2, verbose=0)
print('accuracy =', model.evaluate(x, y, verbose=0)[1])
```

## 常见任务怎么选模型（顺口溜）
- 图片看花样：用卷积（Conv2D，找边、纹理、形状）；小数据优先“迁移学习”（用现成 ResNet/MobileNet 再微调）。
- 文本看语义：Embedding + RNN/LSTM/GRU；更强用 Transformer。
- 时间序列看趋势：1D CNN / LSTM / Transformer。
- 表格看组合：多层感知机（Dense）；高低阶混合可以 Wide & Deep。
- 检测/分割：Faster/Mask R-CNN、U-Net（直接用官方/社区实现）。

## 常用词对照（讲人话）
- Tensor：多维数组（数字表格/图片都是它）。
- Layer（层）：一次变换（比如“加权求和→激活”）。
- Model（模型）：很多层首尾相接的“流水线”。
- Loss（损失）：离答案有多远（越小越好）。
- Optimizer（优化器）：怎么把“旋钮”往更好的方向拧（Adam/SGD）。
- Metric（指标）：你真正关心的成绩（accuracy/AUC/RMSE）。

## 常见坑（快速避雷）
- 分类最后一层/损失要配套：
  - 二分类 → `Dense(1, sigmoid)` + `binary_crossentropy`
  - 多分类（标签是整数） → `Dense(C, softmax)` + `sparse_categorical_crossentropy`
- shape 不对：注意 batch 在最前（`(batch, h, w, c)` 或 `(batch, features)`）。
- dtype 不对：统一用 float32；标签常是 int32。
- 过拟合：加 Dropout、L2、数据增广；用 EarlyStopping。
- GPU 没用上：`tf.config.list_physical_devices('GPU')` 检查；驱动/CUDA/cuDNN 版本要匹配。

## 入门路线（最省力）
1) 跑通上面的“表格二分类”demo，理解 fit/evaluate 基本流程。
2) 选一个贴近你业务的数据（图像/文本/时间序列），照“任务-模型速配”起一个最小模型跑通。
3) 学会保存/加载（`model.save`/`load_model`）并写推理脚本；指标不行再逐步加深模型或做数据增强。

## 最常用训练模板（可套用）
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

def build_model(input_dim, num_classes=1):
  return keras.Sequential([
    layers.Input(shape=(input_dim,)),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.2),
    layers.Dense(num_classes, activation='sigmoid' if num_classes==1 else 'softmax')
  ])

model = build_model(input_dim=32, num_classes=1)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['AUC','accuracy'])

# 假数据占位：用你自己的数据替换
import numpy as np
x = np.random.randn(5000, 32).astype('float32')
y = (x[:, :5].sum(axis=1) > 0).astype('int32')

cb = [keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)]
model.fit(x, y, validation_split=0.2, epochs=50, batch_size=128, callbacks=cb)
model.save('out/demo_saved_model')
```

---

## 进阶版（原文）
## 概念速览
- 它是什么：TensorFlow 是谷歌开源的机器学习/深度学习框架，用来构建、训练并部署模型；提供自动求导、硬件加速（CPU/GPU/TPU）与从高层 tf.keras 到低层算子的一整套 API。
- 能解决什么：
  - 分类（图像/文本/音频），回归（价格/需求等连续值），目标检测/分割；
  - 序列建模（时间序列预测、翻译、摘要、语音），推荐与排序，生成式（文本/图像/音频生成）；
  - 部署到服务器（TF Serving）、移动端/边缘（TF Lite）、浏览器（TF.js）。
- 为什么用它：深度学习在非结构化数据上表现更好；多 GPU/TPU 易扩展；生产生态完善（SavedModel、Serving/Lite/JS、TensorBoard）。
- 基本术语与直觉：
  - 张量 Tensor（多维数组）；层/模型（可组合的变换，Sequential/Model）；
  - 损失函数（度量预测与目标差距，如交叉熵/MSE）；
  - 反向传播与优化器（Adam/SGD 用梯度更新参数）；
  - 批次/轮次（batch/epoch）；过拟合/欠拟合（用正则、数据增广、早停）。
- 典型工作流（六步）：
  1) 明确任务与指标 → 2) 准备与预处理数据 → 3) 选模型结构 → 4) 训练（损失/优化器/早停） → 5) 评估与调参 → 6) 导出与部署（SavedModel）。
- 任务-模型速配（怎么选架构）：
  - 图片：CNN、迁移学习（ResNet/MobileNet）、ViT；
  - 文本：Embedding + LSTM/GRU 或 Transformer；
  - 时间序列：1D CNN、LSTM/Transformer；
  - 表格：MLP，或 Wide&Deep/TabTransformer；
  - 检测/分割：Faster/Mask R-CNN、RetinaNet、U-Net；
  - 生成式：GAN/扩散、Transformer。
- 生态与部署路线图：
  - 建模训练：tf.keras、tf.data、自定义训练（tf.GradientTape）；
  - 可视化调试：TensorBoard、tf.print、tf.debugging；
  - 部署：TF Serving、TF Lite、TF.js；
  - 加速：混合精度（AMP）、XLA、分布式策略（MirroredStrategy/TPU）。
- 入门建议（从零到能用）：
  - 先跑通表格二分类、MNIST 图像、简单文本三类最小样例；
  - 学会 tf.data 与回调（EarlyStopping/ModelCheckpoint）；
  - 学会自定义训练（GradientTape）与 tf.function（图编译）；
  - 选一个真实小任务复刻并调参，导出 SavedModel 做推理。

---
# TensorFlow 2.x 快速入门与速查

本稿以 tf.keras 为主，覆盖常用 80% 能力：最小可跑样例、自定义训练、数据管道、保存加载、性能与分布式，以及常见坑与速查。

## 你将学到
- 基础概念：Tensor/Variable、Keras 层/模型、优化器与损失、tf.data
- 快速上手：回归/图像/文本最小样例，训练与评估
- 自定义训练：GradientTape 与 tf.function
- 工程实践：保存与加载、性能优化、分布式
- 排错与速查：常见坑、API 速查表

## 安装与环境
- 安装（CPU）：
  ```bash
  pip install -U tensorflow
  ```
- 版本与 GPU 检查：
  ```python
  import tensorflow as tf
  print(tf.__version__)
  print(tf.config.list_physical_devices('GPU'))
  ```
- 复现性（部分可重复）：
  ```python
  import os, random, numpy as np, tensorflow as tf
  SEED = 42
  random.seed(SEED); np.random.seed(SEED); tf.random.set_seed(SEED)
  ```

## 第一个模型：线性回归（y ≈ 2x - 1）
```python
import numpy as np, tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 构造数据
x = np.linspace(-1, 1, 200).astype('float32')
y = 2 * x - 1 + 0.1 * np.random.randn(*x.shape).astype('float32')

# 定义模型
model = keras.Sequential([layers.Dense(1, input_shape=(1,))])
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# 训练与评估
model.fit(x, y, epochs=50, batch_size=32, verbose=0)
print(model.evaluate(x, y, verbose=0))
print('w,b ≈', [v.numpy().round(2) for v in model.weights])
```

## 图像分类最小样例（CNN，MNIST）
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
x_train = x_train[..., None] / 255.0
x_test  = x_test[..., None] / 255.0

model = keras.Sequential([
  layers.Conv2D(32, 3, activation='relu', input_shape=(28,28,1)),
  layers.MaxPooling2D(),
  layers.Conv2D(64, 3, activation='relu'),
  layers.GlobalAveragePooling2D(),
  layers.Dense(10, activation='softmax')
])
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
model.fit(x_train, y_train, epochs=3, batch_size=128, validation_split=0.1)
model.evaluate(x_test, y_test)
```

## 文本分类最小样例（TextVectorization + LSTM）
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

texts = tf.constant([
  'good movie', 'great acting', 'bad film', 'terrible plot',
  'loved it', 'hate it'
])
labels = tf.constant([1,1,0,0,1,0])

vec = layers.TextVectorization(max_tokens=1000, output_sequence_length=10)
vec.adapt(texts)

model = keras.Sequential([
  vec,
  layers.Embedding(input_dim=1000, output_dim=16),
  layers.Bidirectional(layers.LSTM(16)),
  layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(texts, labels, epochs=20, verbose=0)
print(model.predict(tf.constant(['great film', 'boring'])).ravel())
```

## tf.data 数据管道（高性能输入）
```python
import tensorflow as tf
import numpy as np

def make_ds(x, y, batch=64, shuffle=True):
  ds = tf.data.Dataset.from_tensor_slices((x, y))
  if shuffle: ds = ds.shuffle(1000)
  return ds.batch(batch).prefetch(tf.data.AUTOTUNE)

x = np.random.randn(10000, 32).astype('float32')
y = (x.sum(axis=1) > 0).astype('int32')
train_ds = make_ds(x[:8000], y[:8000])
val_ds   = make_ds(x[8000:], y[8000:], shuffle=False)

# 直接传入 fit
# model.fit(train_ds, validation_data=val_ds, epochs=...)
```

## 自定义训练循环（GradientTape + tf.function）
```python
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

model = keras.Sequential([layers.Dense(64, activation='relu'),
                          layers.Dense(1)])
opt = keras.optimizers.Adam()
loss_fn = keras.losses.MeanSquaredError()
train_loss = keras.metrics.Mean()
val_loss = keras.metrics.Mean()

@tf.function  # 图编译加速
def train_step(x, y):
  with tf.GradientTape() as tape:
    pred = model(x, training=True)
    loss = loss_fn(y, pred)
  grads = tape.gradient(loss, model.trainable_variables)
  opt.apply_gradients(zip(grads, model.trainable_variables))
  return loss

def fit(train_ds, val_ds, epochs=5):
  for e in range(epochs):
    train_loss.reset_states(); val_loss.reset_states()
    for x, y in train_ds:
      train_loss.update_state(train_step(x, y))
    for x, y in val_ds:
      val_loss.update_state(loss_fn(y, model(x, training=False)))
    tf.print('epoch', e, 'train', train_loss.result(), 'val', val_loss.result())

# fit(train_ds, val_ds)
```

## 保存、加载与部署
- 保存整个模型（结构+权重+配置）：
  ```python
  model.save('out/my_model')       # SavedModel 目录
  model = tf.keras.models.load_model('out/my_model')
  ```
- 只存权重：
  ```python
  model.save_weights('out/weights.h5')
  model.load_weights('out/weights.h5')
  ```
- 自定义推理签名（Serving）：
  ```python
  @tf.function(input_signature=[tf.TensorSpec([None, 32], tf.float32)])
  def serve(x):
    return {'y': model(x, training=False)}
  tf.saved_model.save(model, 'out/saved', signatures={'serving_default': serve})
  ```

## 性能与加速
- tf.data：.cache()、.prefetch(tf.data.AUTOTUNE)、map(num_parallel_calls=tf.data.AUTOTUNE)
- 混合精度（GPU/TPU，Ampere+ 效果明显）：
  ```python
  from tensorflow.keras import mixed_precision
  mixed_precision.set_global_policy('mixed_float16')
  # 注意最终输出/损失的精度处理
  ```
- XLA（部分场景提速）：
  ```python
  tf.config.optimizer.set_jit(True)
  ```
- 大 batch + 梯度累积（显存受限时）；避免 Python 循环，向量化；热点加 @tf.function

## 分布式训练
- 单机多 GPU（数据并行）：
  ```python
  strategy = tf.distribute.MirroredStrategy()
  with strategy.scope():
      model = ...; model.compile(...)
  model.fit(train_ds, epochs=...)
  ```
- 多机：MultiWorkerMirroredStrategy（需要集群环境）
- TPU：TPUStrategy（需 TPU runtime）

## 常见坑与排错
- shape 不匹配：关注 batch 维；用 model.summary()、tensor.shape
- dtype 不一致：float32/float16/int32 混用会报错；统一 dtype
- 损失与最后一层：分类要匹配（sigmoid+binary_crossentropy；softmax+sparse_categorical_crossentropy）
- 过拟合：正则化、Dropout、数据增广、早停（EarlyStopping）
- GPU 未生效：
  - print(tf.config.list_physical_devices('GPU'))
  - 驱动/CUDA/cuDNN 版本匹配
- 调试：tf.print、tf.debugging.assert_*；临时设 tf.config.run_functions_eagerly(True)

## 实战模板（表格二分类，端到端）
```python
import numpy as np, tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# 1) 数据
x = np.random.randn(5000, 20).astype('float32')
y = (x[:, :3].sum(axis=1) + 0.1*np.random.randn(5000) > 0).astype('int32')
train_ds = tf.data.Dataset.from_tensor_slices((x[:4000], y[:4000])) \
          .shuffle(2000).batch(128).prefetch(tf.data.AUTOTUNE)
val_ds = tf.data.Dataset.from_tensor_slices((x[4000:], y[4000:])) \
        .batch(128).prefetch(tf.data.AUTOTUNE)

# 2) 模型
model = keras.Sequential([
  layers.Input(shape=(20,)),
  layers.Dense(64, activation='relu'),
  layers.BatchNormalization(),
  layers.Dropout(0.2),
  layers.Dense(1, activation='sigmoid')
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['AUC','accuracy'])

# 3) 训练
cb = [keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True)]
model.fit(train_ds, validation_data=val_ds, epochs=50, callbacks=cb)

# 4) 保存/加载
model.save('out/tabular_cls')
reloaded = keras.models.load_model('out/tabular_cls')
print(reloaded.evaluate(val_ds, verbose=0))
```

## 速查（常用 API）
- Layers：Dense, Conv2D, LSTM/GRU, BatchNormalization, Dropout, GlobalAveragePooling2D
- Loss：mse, binary_crossentropy, sparse_categorical_crossentropy
- Optimizer：Adam, SGD(momentum), RMSprop
- Metrics：accuracy, AUC, Precision, Recall
- tf.data：from_tensor_slices, map, batch, prefetch, cache, shuffle
- 训练：model.compile/fit/evaluate/predict，callbacks(EarlyStopping, ModelCheckpoint)
- 保存：model.save / load_model；save_weights / load_weights
- 低阶：tf.Variable, tf.GradientTape, tf.function, tf.nn


