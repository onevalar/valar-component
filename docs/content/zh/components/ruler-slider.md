---
title: Ruler Slider
description: 支持移动尺带、精确读数、惯性滑动与边界回弹的数值输入。
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="ruler-slider-demo"><div></div></ComponentPreview>

## 安装

<PMAddComp name="ruler-slider" />

## 行为合同

`import { RulerSlider } from '@valar/svelte-ui/ruler-slider'`。

必填 label；支持 `value`/`bind:value`、defaultValue（默认 min）、onValueChange(number)、onValueCommit(number)。默认 min=0、max=100、step=1、majorEvery=10、spacing=10、disabled=false。可选 largeStep、format(number)、unit、name、class 和原生 div 属性。提供有限数值和 max > min。读数按范围和步长规范化；外部更新不触发回调。具名隐藏输入提交纯数字，禁用时不提交。通过绑定值重置，不依赖原生 form.reset()。

拖动按 `spacing / step` 反向移动尺带，不依赖视口宽度；轻点将目标刻度移到固定中心指针。快速释放产生惯性并停在刻度上，再次按住可截住尺带。边界最多弹性延伸 44px，释放后回弹；指针取消或失去捕获时不产生甩动。仅接管横向占优的滚轮，纵向滚动继续交给页面。标签覆盖完整范围，大范围应设置合理的大刻度间隔。

所有方向键按一步调整，PageUp/Down 与 Shift+方向键使用 largeStep（默认 step × majorEvery），Home/End 到边界。Alt/Ctrl/Meta 快捷键直接穿透。format 和 unit 同时用于滑块视口的 aria-valuetext。

拖动与惯性过程中，经过刻度触发 onValueChange。拖动停止后触发一次 onValueCommit；轻点与按键立即提交目标（与来源实际实现一致）；滚轮停止 120 毫秒后提交。外部值更新只重定向尺带，不触发回调。卸载清理 RAF、计时器和监听器；减少动态效果时直接定位，无惯性和弹性延伸。仅接受 `animateReadout={false}`，读数同步显示，不提供滚动数字动画。
