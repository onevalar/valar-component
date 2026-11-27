---
title: 颜色选择器
description: 交互色盘、色相与不透明度调节、多格式色值编辑、吸管取色与预设色块。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/color-picker
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="color-picker-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="color-picker" />

依赖 Valar 的 Popover，CLI 会一并安装。

## 用法

```svelte
<script lang="ts">
  import { ColorPicker } from "$lib/registry/ui/color-picker/index.js";
  let color = $state("#2563eb");
</script>

<ColorPicker
  label="主色"
  bind:value={color}
  presets={["#0f172a", "#2563eb", "#0ea5e9", "#16a34a", "#eab308", "#f97316", "#dc2626", "#9333ea"]}
/>
```

## 行为合同

- 默认开启不透明度调节（`alpha={true}`）：不透明颜色输出小写六位 `#rrggbb`，半透明颜色输出八位 `#rrggbbaa`；若业务仅接受不透明色，传入 `alpha={false}`。导出的 `normalizeHex` 仍严格规范三位／六位不透明十六进制，`normalizeHexColor` 与 `parseColorInput` 支持透明与多格式解析。
- 浮层内置自研二维饱和度／明度色板、色相彩虹滑条与棋盘格不透明度滑条，支持指针拖拽及方向键（配合 `Shift` 大步）调节，并在纯黑／纯白边界保留当前色相。
- 面板支持 `HEX`、`RGB`、`HSL`、`OKLCH` 四种格式实时切换与分通道编辑；一键复制按钮会按当前选定格式复制标准 CSS 色值。在支持原生 EyeDropper 的桌面浏览器中自动提供屏幕吸管取色按钮。
- 十六进制输入支持三位／六位（及开启透明时的四位／八位）简写与粘贴 `rgb()`、`hsl()`、`oklch()` 字符串；未完成的输入不改动当前值，失焦后恢复，出现非法字符时以图标与文字同时提示错误。
- 支持自动记录最近使用颜色（默认本地保存最多 8 个，传 `showRecent={false}` 可关闭）与可选预设色块；选中色块按相对亮度自动切换浅／深色勾选图标以保持可读对比度。
- `contentProps` 透传 Popover.Content 的配置（不含 `children`／`child`）；面板使用专属 `data-slot="color-picker-content"`，传入 `name` 时参与原生表单提交。
