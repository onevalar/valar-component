---
title: Tabs
description: A set of layered sections of content—known as tab panels—that are displayed one at a time.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/tabs
  doc: https://bits-ui.com/docs/components/tabs
  api: https://bits-ui.com/docs/components/tabs#api-reference
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

<ComponentPreview name="tabs-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="tabs" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

Install `bits-ui`:

</Step>

<PMInstall command="bits-ui -D" />

<Step>

Copy and paste the following code into your project.

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## Usage

```svelte showLineNumbers
<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
</script>
```

```svelte showLineNumbers
<Tabs.Root value="account" class="w-full max-w-[400px]">
  <Tabs.List aria-label="Account settings">
    <Tabs.Trigger value="account">Account</Tabs.Trigger>
    <Tabs.Trigger value="password">Password</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="account">
    Make changes to your account here.
  </Tabs.Content>
  <Tabs.Content value="password">Change your password here.</Tabs.Content>
</Tabs.Root>
```

Use an accessible name on the list. The active panel uses the same value as its trigger. Arrow keys and Home/End move among enabled tabs. The default activation mode switches the panel when focus moves.

## Line

Use `variant="line"` on `Tabs.List` for a line style. When space runs out, the list scrolls horizontally and reveals the focused tab. Try End and Home in the preview.

<ComponentPreview name="tabs-line">

<div></div>

</ComponentPreview>

## Capsule

Use `variant="capsule"` for a few peer panels in a narrow space, such as a project sidebar. This example uses `activationMode="manual"`, so arrow keys move focus and Space or Enter activates the focused tab.

<ComponentPreview name="tabs-capsule">

<div></div>

</ComponentPreview>

## Vertical

Use `orientation="vertical"` and the Up and Down arrow keys for a vertical list.

<ComponentPreview name="tabs-vertical">

<div></div>

</ComponentPreview>

## Disabled

<ComponentPreview name="tabs-disabled">

<div></div>

</ComponentPreview>

## Icons

<ComponentPreview name="tabs-icons">

<div></div>

</ComponentPreview>
