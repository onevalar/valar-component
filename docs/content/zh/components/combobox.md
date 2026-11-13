---
title: 组合框
description: 带建议列表的自动补全输入框。
component: true
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="combobox-demo">

<div></div>

</ComponentPreview>

示例参考 Linear 的问题负责人选择器。打开后直接聚焦搜索框，输入可筛选，用方向键和 Enter 选值。勾号标记当前负责人，背景高亮跟随键盘位置。示例使用本地数据。

## 安装

<PMAddComp name="combobox" />

共享包可用 `@valar/svelte-ui/combobox`。

## 用法

```svelte
<script lang="ts">
  import { Combobox } from "$lib/components/ui/combobox/index.js";

  const options = [
    { id: "", label: "Unassigned" },
    { id: "ada", label: "Ada Chen", keywords: ["design"] },
    { id: "morgan", label: "Morgan Lee" },
  ];

  let value = $state<readonly string[]>([""]);
</script>

<Combobox label="Assignee" placeholder="Assign to…" {options} bind:value />
```

`value` 是已选 ID 数组。单选后关闭并归焦，多选后保留列表。`group` 添加分组标题，`keywords` 添加搜索别名。允许清空单选时提供明确的「未分配」选项。

## 基础用法

带框架列表的简单组合框。

<ComponentPreview name="combobox-basic">

<div></div>

</ComponentPreview>

## 分组

给选项设置 `group` 以显示分组标题。

<ComponentPreview name="combobox-groups">

<div></div>

</ComponentPreview>

## 自定义列表项

用 `option` 片段添加头像、图标或说明，行尾保留勾选。

<ComponentPreview name="combobox-custom">

<div></div>

</ComponentPreview>

## 无效

通过 `triggerProps` 设置 `aria-invalid`，用 `aria-describedby` 关联错误说明。

<ComponentPreview name="combobox-invalid">

<div></div>

</ComponentPreview>

## 禁用

传入 `disabled` 属性禁用组合框。

<ComponentPreview name="combobox-disabled">

<div></div>

</ComponentPreview>

## 弹出

用 `children` 片段自定义触发按钮内容。可设 `side`、`align` 或 `contentClass`，窄屏仍会自动避让边缘。

<ComponentPreview name="combobox-popup">

<div></div>

</ComponentPreview>

## 多选

用 `multiple` 添加和移除多个标签。选值后可继续搜索，禁用项会被键盘导航跳过。

<ComponentPreview name="combobox-multiple">

<div></div>

</ComponentPreview>

## 异步搜索

使用 `bind:query` 获取搜索词，传入 `filter={false}` 以显示调用方提供的结果。输入 `support` 可试用本地失败和重试，输入其他文字会开始新查询。

<ComponentPreview name="combobox-async">

<div></div>

</ComponentPreview>
