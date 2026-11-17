---
title: Texture Fill
description: 支持纹理与减少动态效果弹簧过渡的装饰性百分比画布。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="texture-fill-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="texture-fill" />

## 行为合同

`import { TextureFill, textures, type Texture, type FillTexture } from '@valar/svelte-ui/texture-fill'`。

传入有限的 `value: number` 与纹理 `dither`、`lines`、`halftone`、`hatch` 或 `solid`，并设置高度，例如 `class="h-4"`。中性轨道与强调色跟随主题，填充从行内起始侧开始，限制在 0–100%。将精确值放在轨道旁。如果需要仪表语义，在外层使用带名称和当前值的仪表。

启用 `intro` 后从零填充。开启减少动态效果时立即显示新值，挂载期间切换偏好也会生效。画布跟随容器尺寸和设备像素比（最高 3）；可通过文本颜色类覆写强调色。画布对辅助技术隐藏。服务端输出装饰轨道，浏览器需支持 Canvas 2D、ResizeObserver 和 matchMedia。
