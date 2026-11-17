---
title: 颜色选择器
description: 选择颜色：色盘、十六进制输入与预设色块，值为 "#rrggbb"。
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

CLI 会一并安装 Valar 的 Popover 和 Scroll Area。

## 用法

```svelte
<script lang="ts">
  import { ColorPicker } from "$lib/components/ui/color-picker/index.js";
  let color = $state("#2563eb");
</script>

<ColorPicker
  label="主色"
  bind:value={color}
  presets={["#0f172a", "#2563eb"]}
/>
```

## 标签调色板

<ComponentPreview name="color-picker-label"><div></div></ComponentPreview>

在标签名称旁使用 `appearance="label"`。`presets` 支持十六进制字符串或 `{ color, label }`。Tab 依次访问各预设色和自定义入口。选择预设色或输入有效的自定义 Hex 后按 Enter，面板关闭并把焦点还给触发器。自定义面板的饱和度／亮度区域和色相条支持指针及方向键。通过 `labels` 本地化自定义面板。

## 交互行为

- 显示和提交值采用小写六位十六进制 `#rrggbb`。`normalizeHex` 会展开三位简写，外部无效值显示为 `#000000`。
- 默认面板同步原生色盘、十六进制输入和可选预设。六位输入立即生效。三位简写在 Enter 或失焦时生效，未完成的输入失焦后恢复为当前值。
- 预设按钮用 `aria-pressed` 表达当前色。Escape 关闭并将焦点归还给触发器。空间不足时使用悬浮滚动条。
- `contentProps` 可传入 `sideOffset`、`class` 或 `portalProps` 等 Popover.Content 配置。默认开启 Portal，容器内渲染可传 `portalProps={{ disabled: true }}`。
- 根节点 `class` 与 `contentProps.class` 可以覆盖布局类。两种面板都使用 `data-slot="color-picker-content"`。
- 传入 `name` 将当前 `#rrggbb` 随原生表单提交。原生色盘外观由浏览器决定。
