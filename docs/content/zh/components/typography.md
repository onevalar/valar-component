---
title: 排版
description: 问题描述、文档和文章的只读排版。
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/typography
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

Typography 将 Linear 描述编辑器实测的文字层级和间距应用到只读问题描述和文章正文。样式作用于文章内部。

<ComponentPreview name="typography-demo" class="[&_.preview]:!h-auto" hideCode>

<div></div>

</ComponentPreview>

## 安装

<PMAddComp name="typography" />

工作区也可以从 `@valar/svelte-ui/typography` 引入同一个组件。

## 用法

```svelte
<script lang="ts">
  import { Typography } from "$lib/components/ui/typography/index.js";
</script>

<Typography aria-labelledby="update-heading">
  <h2 id="update-heading">更新说明</h2>
  <p>运行 <code>pnpm test</code> 验证改动。</p>
  <ul>
    <li>检查移动端尺寸。</li>
    <li>验证键盘导航。</li>
  </ul>
</Typography>
```

按所在页面选择标题级别。多行代码使用 Code Block。宽表格使用 Table，并传入 `scroll="overlay"` 和 `scrollLabel`。下文的导语、大号、小号和弱化样式采用 Valar 的展示与辅助文字规则，可在正文旁搭配使用。

## h1

<ComponentPreview name="typography-h1">

<div></div>

</ComponentPreview>

## h2

<ComponentPreview name="typography-h2">

<div></div>

</ComponentPreview>

## h3

<ComponentPreview name="typography-h3">

<div></div>

</ComponentPreview>

## h4

<ComponentPreview name="typography-h4">

<div></div>

</ComponentPreview>

## p

<ComponentPreview name="typography-p">

<div></div>

</ComponentPreview>

## blockquote

<ComponentPreview name="typography-blockquote">

<div></div>

</ComponentPreview>

## table

<ComponentPreview name="typography-table">

<div></div>

</ComponentPreview>

## list

<ComponentPreview name="typography-list">

<div></div>

</ComponentPreview>

## 行内代码

<ComponentPreview name="typography-inline-code">

<div></div>

</ComponentPreview>

## 导语

<ComponentPreview name="typography-lead">

<div></div>

</ComponentPreview>

## 大号

<ComponentPreview name="typography-large">

<div></div>

</ComponentPreview>

## 小号

<ComponentPreview name="typography-small">

<div></div>

</ComponentPreview>

## 弱化

<ComponentPreview name="typography-muted">

<div></div>

</ComponentPreview>
