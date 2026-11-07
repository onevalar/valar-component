---
title: AI 元素
description: 用 Valar Svelte 组件构建智能体界面的模式。
---

<script>
	import LinkedCard from "$lib/components/linked-card.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import AdvancedComponents from "$lib/components/advanced-components.svelte";
</script>

<AdvancedComponents />

## 说明

AI 元素是构建智能体界面的模式。每种模式都由若干 Valar Svelte 组件组合而成，复制到项目中即可使用。不需要安装任何包，代码归你所有。

[对话](/docs/ai-elements/chat)由[消息滚动容器](/docs/components/message-scroller)中的多个[消息](/docs/ai-elements/message)轮次组成。轮次内智能体执行的步骤，如[推理](/docs/ai-elements/reasoning)、[工具调用](/docs/ai-elements/tool)和[计划](/docs/ai-elements/plan)，都基于[调用链](/docs/components/trace)构建，因此每个步骤的结构一致。

示例使用 [`@ai-sdk/svelte`](https://ai-sdk.dev/docs/getting-started/svelte)。这些模式只读取消息片段，因此可搭配任意消息来源。

## 开始使用

添加多数模式所依赖的组件：

<PMAddComp name="trace code-block" />

然后打开上面的任一模式，把代码复制到项目中。各页面会列出所需的其他组件。
