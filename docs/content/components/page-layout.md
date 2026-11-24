---
title: Page Layout
description: Standard page width tiers, compact headers, filter toolbars, spacing-first sections, and settings/detail property rows.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/page-layout
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";
	import Step from "$lib/components/step.svelte";

	let { viewerData } = $props();
</script>

<ComponentPreview name="page-layout-demo">

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="page-layout" />
{/snippet}
{#snippet manual()}
<Steps>

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
  import * as PageLayout from "$lib/components/ui/page-layout/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>
```

```svelte showLineNumbers
<PageLayout.Root width="narrow">
  <PageLayout.Header>
    <PageLayout.Title>Workspace Settings</PageLayout.Title>
    <PageLayout.Actions>
      <Button size="sm">Save</Button>
    </PageLayout.Actions>
  </PageLayout.Header>
  <PageLayout.Section>
    <PageLayout.SectionTitle>Notifications</PageLayout.SectionTitle>
    <PageLayout.Section surface="card">
      <PageLayout.PropertyList layout="settings">
        <PageLayout.PropertyRow label="Email alerts">...</PageLayout.PropertyRow>
      </PageLayout.PropertyList>
    </PageLayout.Section>
  </PageLayout.Section>
</PageLayout.Root>
```

Use `width="full"` for tables, lists, and workspaces, and `width="narrow"` for settings, forms, and detail views. Prefer `surface="plain"` (default) to group content by spacing, and reserve `surface="card"` for single-layer grouped panels.
