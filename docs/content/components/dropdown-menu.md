---
title: Dropdown Menu
description: Displays a menu to the user — such as a set of actions or functions — triggered by a button.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/dropdown-menu
  doc: https://bits-ui.com/docs/components/dropdown-menu
  api: https://bits-ui.com/docs/components/dropdown-menu#api-reference
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

<ComponentPreview name="dropdown-menu-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="dropdown-menu" />
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
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
</script>
```

```svelte showLineNumbers
<DropdownMenu.Root>
  <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Group>
      <DropdownMenu.Label>My Account</DropdownMenu.Label>
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
      <DropdownMenu.Item>Billing</DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item>Team</DropdownMenu.Item>
      <DropdownMenu.Item>Subscription</DropdownMenu.Item>
    </DropdownMenu.Group>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Basic

A dropdown menu with the surface sampled from Linear’s workspace switcher. The same row highlight follows the pointer or the keyboard. Group labels and separators keep related commands together.

<ComponentPreview name="dropdown-menu-basic">

<div></div>

</ComponentPreview>

## Submenu

Use `DropdownMenu.Sub` to nest secondary actions.

<ComponentPreview name="dropdown-menu-submenu">

<div></div>

</ComponentPreview>

## Shortcuts

Use `DropdownMenu.Shortcut` to align a keyboard hint at the end of a row. Bind the shortcut separately when the action is available outside the menu.

<ComponentPreview name="dropdown-menu-shortcuts">

<div></div>

</ComponentPreview>

## Icons

Combine icons with labels for quick scanning.

<ComponentPreview name="dropdown-menu-icons">

<div></div>

</ComponentPreview>

## Checkboxes

Use `DropdownMenu.CheckboxItem` for toggles.

<ComponentPreview name="dropdown-menu-checkboxes">

<div></div>

</ComponentPreview>

## Checkboxes Icons

Add icons to checkbox items.

<ComponentPreview name="dropdown-menu-checkboxes-icons">

<div></div>

</ComponentPreview>

## Radio Group

Use `DropdownMenu.RadioGroup` for exclusive choices. The trailing check indicates the current value while the highlight follows keyboard focus or the pointer. Choice rows stay open by default. Set `closeOnSelect` for workflows such as switching workspaces.

<ComponentPreview name="dropdown-menu-radio-group">

<div></div>

</ComponentPreview>

## Radio Icons

Show radio options with icons.

<ComponentPreview name="dropdown-menu-radio-icons">

<div></div>

</ComponentPreview>

## Destructive

Linear’s issue menu opens a confirmation from a neutral Delete row. Use a neutral `DropdownMenu.Item` to open the confirmation and mark the final action as destructive in the alert dialog. `variant="destructive"` is also available for menu commands that need an explicit warning color.

<ComponentPreview name="dropdown-menu-destructive">

<div></div>

</ComponentPreview>

## Avatar

An account switcher dropdown triggered by an avatar.

<ComponentPreview name="dropdown-menu-avatar">

<div></div>

</ComponentPreview>

## Complex

A richer example combining groups, icons, and submenus.

<ComponentPreview name="dropdown-menu-complex">

<div></div>

</ComponentPreview>
