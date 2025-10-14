# 彩虹文件夹功能说明

## 功能概述

彩虹文件夹功能为 File Tree Alternative 插件添加了为文件夹自动着色的能力。该功能基于流行的 **Catppuccin 主题**颜色方案，会按照文件夹在同级目录中的顺序，循环应用不同的颜色，让您的文件树更加美观和易于区分。

## 特性

- 🌈 **灵活循环系统**：支持 1-12 种颜色循环，您可以自由选择循环数量
- 🎨 **Catppuccin 配色**：提供 14 种精美的 Catppuccin 主题预设颜色
- 🌓 **主题自适应**：自动适配浅色/深色主题，使用对应的颜色亮度
- 🔄 **智能排序**：颜色分配会遵循您设置的文件夹排序方式
- 🎯 **一键开关**：可以随时启用或禁用彩虹文件夹功能

## 如何使用

### 1. 启用功能

1. 打开 Obsidian 设置
2. 找到 "File Tree Alternative" 插件设置
3. 在 "Folder Pane Settings" 部分找到 "彩虹文件夹" 开关
4. 开启该选项

### 2. 配置循环数量

1. 使用 "循环颜色数量" 滑块选择 1-12 个颜色
2. 例如选择 6，则每 6 个文件夹循环一次颜色
3. 未启用的颜色位置会自动禁用

### 3. 选择颜色方案

在 "彩虹颜色方案" 部分为每个位置选择 Catppuccin 预设颜色：

1. 从下拉菜单中选择颜色（带有图标和中文名称）
2. 提供 14 种 Catppuccin 主题颜色
3. 只有在循环数量范围内的颜色会生效

### 4. 颜色分配规则

- 文件夹按照同级目录中的顺序获得颜色
- 第1个文件夹使用颜色1，第2个使用颜色2，以此类推
- 达到循环数量后会重新从颜色1开始，形成循环
- 颜色分配会排除被隐藏或排除的文件夹

## 可用的 Catppuccin 颜色

插件提供了 14 种 Catppuccin 主题预设颜色：

| 颜色名称 | 英文 | 适用场景 |
|---------|------|---------|
| 🎨 主题色 | Accent | 跟随当前主题的强调色 |
| 🌸 玫瑰水 | Rosewater | 柔和的粉色调 |
| 🦩 火烈鸟 | Flamingo | 明亮的粉红色 |
| 💗 粉红 | Pink | 活泼的粉色 |
| 💜 紫红 | Mauve | 优雅的紫色 |
| 🔴 红色 | Red | 醒目的红色 |
| 🍷 栗色 | Maroon | 深沉的红棕色 |
| 🍑 桃色 | Peach | 温暖的橙色 |
| 💛 黄色 | Yellow | 明亮的黄色 |
| 💚 绿色 | Green | 清新的绿色 |
| 🌊 青色 | Teal | 沉稳的青绿色 |
| ☁️ 天空蓝 | Sky | 清澈的浅蓝色 |
| 💎 宝石蓝 | Sapphire | 深邃的蓝绿色 |
| 💙 蓝色 | Blue | 标准蓝色 |
| 💜 薰衣草 | Lavender | 淡雅的紫色 |

## 默认颜色方案

插件预设了一套精心搭配的 12 色方案（彩虹顺序）：

1. 🔴 Red（红色）
2. 🍑 Peach（桃色/橙色）
3. 💛 Yellow（黄色）
4. 💚 Green（绿色）
5. 🌊 Teal（青色）
6. ☁️ Sky（天空蓝）
7. 💎 Sapphire（宝石蓝）
8. 💙 Blue（蓝色）
9. 💜 Lavender（薰衣草紫）
10. 💜 Mauve（紫红）
11. 💗 Pink（粉红）
12. 🌸 Rosewater（玫瑰水）

## 技术实现

### 代码修改说明

1. **设置系统** (`src/settings.ts`)
   - 添加了 `rainbowFolders` 布尔设置项（开关）
   - 添加了 `rainbowColorRepeat` 数字设置（1-12循环数量）
   - 添加了 `rainbowColors` 数组（存储 RainbowColorOption 类型）
   - 定义了 14 种 Catppuccin 颜色类型
   - 在设置UI中添加了滑块和下拉菜单

2. **工具函数** (`src/utils/Utils.ts`)
   - `getRainbowColorIndex()`：计算文件夹在同级目录中的索引位置，返回索引模 `rainbowColorRepeat` 的结果
   - `getRainbowColorValue()`：将颜色选项转换为 CSS 变量引用

3. **树形组件** (`src/components/FolderView/treeComponent/TreeComponent.tsx`)
   - 使用 `useMemo` 计算每个文件夹的颜色
   - 通过颜色索引获取颜色选项，再转换为 CSS 变量
   - 将颜色应用到文件夹名称的内联样式中

4. **样式表** (`styles.css`)
   - 定义了浅色主题的 Catppuccin 颜色变量（Latte 配色）
   - 定义了深色主题的 Catppuccin 颜色变量（Mocha 配色）
   - 添加了 `.rainbow-folder` 类，设置字重和过渡动画

### 与 AnuPpuccin 的对比

| 特性 | AnuPpuccin | 本插件实现 |
|------|-----------|----------|
| **技术方案** | 纯 CSS + nth-child | JavaScript + CSS 变量 |
| **依赖** | 需要 Style Settings 插件 | 无额外依赖 |
| **目标** | Obsidian 原生文件树 | File Tree Alternative 插件 |
| **循环数量** | 1-11 可选 | 1-12 可选 |
| **颜色选择** | 14 种预设 | 14 种预设 |
| **UI 位置** | Style Settings | 插件设置 |
| **集成度** | 独立 CSS 片段 | 完全集成 |

## 注意事项

- 颜色只在启用功能时应用
- 根文件夹不受彩虹颜色影响
- 激活状态的文件夹会保持其激活状态的样式
- 颜色分配会考虑文件夹排序设置
- 自动适配浅色/深色主题

## 兼容性

- ✅ 与所有现有的文件夹图标样式兼容
- ✅ 与文件夹计数功能兼容
- ✅ 与文件夹笔记功能兼容
- ✅ 与 Obsidian 主题系统兼容
- ✅ 自动适配 Catppuccin 主题

## 使用建议

### 循环数量建议

- **少量文件夹（<6个）**：选择 3-4 色循环，避免颜色浪费
- **中等数量（6-12个）**：选择 6-8 色循环，平衡美观和区分度
- **大量文件夹（>12个）**：使用完整 12 色循环，最大化视觉区分

### 颜色搭配建议

- **彩虹风格**：使用默认方案（红→橙→黄→绿→青→蓝→紫）
- **冷色调**：Teal、Sky、Sapphire、Blue、Lavender
- **暖色调**：Red、Maroon、Peach、Yellow
- **柔和风格**：Rosewater、Flamingo、Pink、Lavender
- **高对比度**：Red、Yellow、Green、Blue、Mauve

### 主题适配

插件使用 Catppuccin 的双主题配色：
- **浅色主题**：使用 Latte 配色（较深的颜色）
- **深色主题**：使用 Mocha 配色（较亮的颜色）
- 自动切换，无需手动调整

## 示例配置

### 配置1：经典彩虹（12色）
- 循环数量：12
- 颜色顺序：Red → Peach → Yellow → Green → Teal → Sky → Sapphire → Blue → Lavender → Mauve → Pink → Rosewater

### 配置2：简约四色
- 循环数量：4
- 颜色选择：Red、Yellow、Blue、Green

### 配置3：渐变蓝色系
- 循环数量：6
- 颜色选择：Teal → Sky → Sapphire → Blue → Lavender → Mauve

### 配置4：暖色调
- 循环数量：5
- 颜色选择：Red → Maroon → Peach → Yellow → Flamingo

## 更新日志

### v2.6.1 (预计)
- ✨ 新增彩虹文件夹功能
- 🎨 基于 Catppuccin 主题的 14 色预设方案
- 🔢 支持 1-12 种颜色的灵活循环
- 🌓 自动适配浅色/深色主题
- ⚙️ 直观的滑块和下拉菜单配置界面

## 鸣谢

- **Catppuccin 主题**：提供了优雅的配色方案
- **AnuPpuccin 主题**：彩虹文件夹功能的灵感来源
- **原插件作者**：Ozan Tellioglu

---

**插件作者**: Ozan Tellioglu  
**彩虹文件夹功能**: 基于 Catppuccin 和 AnuPpuccin 的设计理念  
**许可证**: MIT


