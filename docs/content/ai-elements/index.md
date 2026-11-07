---
title: AI Elements
description: Patterns for agentic interfaces, built from Valar Svelte components.
---

<script>
	import LinkedCard from "$lib/components/linked-card.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import AdvancedComponents from "$lib/components/advanced-components.svelte";
</script>

<AdvancedComponents />

## About

AI Elements are patterns for building agentic interfaces. Each one is a composition of Valar Svelte components that you copy into your project. There is no package to install. The code is yours.

A [Chat](/docs/ai-elements/chat) is a list of [Message](/docs/ai-elements/message) turns inside a [Message Scroller](/docs/components/message-scroller). The steps an agent takes inside a turn, like [Reasoning](/docs/ai-elements/reasoning), [Tool](/docs/ai-elements/tool) and [Plan](/docs/ai-elements/plan), are built on [Trace](/docs/components/trace), so every step has the same shape.

The examples use [`@ai-sdk/svelte`](https://ai-sdk.dev/docs/getting-started/svelte). The patterns only read message parts, so they work with any source of messages.

## Getting Started

Add the components most patterns are built on:

<PMAddComp name="trace code-block" />

Then open a pattern above and copy its code into your project. Each page lists any other components it needs.
