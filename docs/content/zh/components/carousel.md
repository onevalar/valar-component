---
title: 轮播
description: 基于 Embla 构建的轮播，支持动效和滑动操作。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/carousel
  doc: https://www.embla-carousel.com/docs/v8/get-started/svelte
  api: https://www.embla-carousel.com/docs/v8/api
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import Step from "$lib/components/step.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="carousel-demo">

<div></div>

</ComponentPreview>

## 关于

轮播组件基于 [Embla Carousel](https://www.embla-carousel.com/docs/v8/get-started/svelte) 库构建。

## 全屏图片

点击任一缩略图，从对应图片开始浏览。向下键和向右键切换到下一张，向上键和向左键切换到上一张。到达首尾后停止。百分比按钮在原始尺寸和最多两倍之间切换，更换图片时恢复原始大小。按 Escape 关闭，焦点返回打开预览的缩略图。

在根组件设置 `appearance="media"`，给每张图片传入从 0 开始的 `index`。在根组件内放置 `Carousel.Toolbar`，胶囊按钮组内先放下一张，再放上一张。工具栏高 40 px，控件为 28 px，图标为 14 px，内部用 0.5 px 分隔线，关闭按钮与按钮组间距为 4 px。图片在剩余空间内居中。启用减少动态效果时，切换直接完成。

<ComponentPreview name="carousel-media">

<div></div>

</ComponentPreview>

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="carousel" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `embla-carousel-svelte`：

</Step>

<PMInstall command="embla-carousel-svelte -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as Carousel from "$lib/components/ui/carousel/index.js";
</script>
```

```svelte showLineNumbers
<Carousel.Root>
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
  <Carousel.Previous />
  <Carousel.Next />
</Carousel.Root>
```

## 尺寸

用 `<Carousel.Item />` 上的 `basis` 工具类设置每一项的尺寸。

<ComponentPreview name="carousel-size">

<div></div>

</ComponentPreview>

```svelte showLineNumbers {4-6}
<!-- 33% of the carousel width. -->
<Carousel.Root>
  <Carousel.Content>
    <Carousel.Item class="basis-1/3">...</Carousel.Item>
    <Carousel.Item class="basis-1/3">...</Carousel.Item>
    <Carousel.Item class="basis-1/3">...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

```svelte showLineNumbers {4-6}
<!-- 50% on small screens and 33% on larger screens. -->
<Carousel.Root>
  <Carousel.Content>
    <Carousel.Item class="md:basis-1/2 lg:basis-1/3">...</Carousel.Item>
    <Carousel.Item class="md:basis-1/2 lg:basis-1/3">...</Carousel.Item>
    <Carousel.Item class="md:basis-1/2 lg:basis-1/3">...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

## 间距

设置每一项之间的间距，需在 `<Carousel.Item />` 上使用 `ps-[VALUE]` 工具类，并在 `<Carousel.Content />` 上使用负值的 `-ms-[VALUE]`。

<ComponentPreview name="carousel-spacing">

<div></div>

</ComponentPreview>

```svelte showLineNumbers /-ms-4/ /ps-4/
<Carousel.Root>
  <Carousel.Content class="-ms-4">
    <Carousel.Item class="ps-4">...</Carousel.Item>
    <Carousel.Item class="ps-4">...</Carousel.Item>
    <Carousel.Item class="ps-4">...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

```svelte showLineNumbers /-ms-2/ /ps-2/ /md:-ms-4/ /md:ps-4/
<Carousel.Root>
  <Carousel.Content class="-ms-2 md:-ms-4">
    <Carousel.Item class="ps-2 md:ps-4">...</Carousel.Item>
    <Carousel.Item class="ps-2 md:ps-4">...</Carousel.Item>
    <Carousel.Item class="ps-2 md:ps-4">...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

## 方向

用 `orientation` 属性设置轮播的方向。

<ComponentPreview name="carousel-orientation">

<div></div>

</ComponentPreview>

```svelte showLineNumbers /vertical | horizontal/
<Carousel.Root orientation="vertical | horizontal">
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

## 选项

通过 `opts` 属性向轮播传入选项。更多信息见 [Embla Carousel 文档](https://www.embla-carousel.com/docs/v8/api/options)。

```svelte showLineNumbers {2-5}
<Carousel.Root
  opts={{
    align: "start",
    loop: true,
  }}
>
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

## API

结合响应式状态与 `setApi` 属性获取轮播 API 实例。

<ComponentPreview name="carousel-api">

<div></div>

</ComponentPreview>

```svelte showLineNumbers {2,5,19}
<script lang="ts">
  import { type CarouselAPI } from "$lib/components/ui/carousel/context.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";

  let api = $state<CarouselAPI>();
  let current = $state(0);
  const count = $derived(api ? api.scrollSnapList().length : 0);

  $effect(() => {
    if (api) {
      current = api.selectedScrollSnap() + 1;
      api.on("select", () => {
        current = api!.selectedScrollSnap() + 1;
      });
    }
  });
</script>

<Carousel.Root setApi={(emblaApi) => (api = emblaApi)}>
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

## 事件

通过 `setApi` 获取的 api 实例监听事件。

```svelte showLineNumbers {2,5,7-13,16}
<script lang="ts">
  import { type CarouselAPI } from "$lib/components/ui/carousel/context.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";

  let api = $state<CarouselAPI>();

  $effect(() => {
    if (api) {
      api.on("select", () => {
        // Do something on select.
      });
    }
  });
</script>

<Carousel.Root setApi={(emblaApi) => (api = emblaApi)}>
  <Carousel.Content>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
    <Carousel.Item>...</Carousel.Item>
  </Carousel.Content>
</Carousel.Root>
```

事件用法的更多信息见 [Embla Carousel 文档](https://www.embla-carousel.com/docs/v8/api/events)。

## 插件

通过 `plugins` 属性传入 Embla 插件。自动播放示例在幻灯片之前提供播放／暂停按钮。鼠标悬停时临时暂停，焦点进入幻灯片区域或拖动时暂停，用户可主动恢复。开启减少动态效果时，初始状态为暂停。

<ComponentPreview name="carousel-plugin">

<div></div>

</ComponentPreview>

插件用法的更多信息见 [Embla Carousel 文档](https://www.embla-carousel.com/docs/v8/plugins)。
