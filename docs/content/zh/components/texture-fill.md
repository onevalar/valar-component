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

必填有限 value:number、texture: 'dither' | 'lines' | 'halftone' | 'hatch' | 'solid'。可选 intro=false、原生 span 属性和 class（不是 className）。须给容器明确尺寸，如 class="h-12 w-full"。图形百分比限制在范围内，未填充部分按来源保留纹理。画布装饰性且 aria-hidden；调用方拥有仪表语义和缺失值处理。

intro 仅在允许动态效果时从零开始。数值更新使用原有阻尼弹簧与移动纹理带；减少动态效果时立即同步，并响应挂载期间的偏好变化。ResizeObserver 按设备像素比（上限 3）更新尺寸。颜色跟随 currentColor 与祖先属性或主题变化。卸载或更换纹理时清理 observer、媒体监听和 RAF。SSR 只输出装饰外壳；浏览器须支持 Canvas 2D、ResizeObserver 和 matchMedia。无画布上下文时明确抛错，不静默伪装已绘制。
