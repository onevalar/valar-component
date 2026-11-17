---
title: Typography
description: Read-only prose for issue descriptions, documents and articles.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/typography
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

Typography gives read-only issue descriptions and article content the hierarchy and spacing sampled in Linear's description editor. The styles apply within the article.

<ComponentPreview name="typography-demo" class="[&_.preview]:!h-auto" hideCode>

<div></div>

</ComponentPreview>

## Installation

<PMAddComp name="typography" />

The workspace package exports the same component from `@valar/svelte-ui/typography`.

## Usage

```svelte
<script lang="ts">
  import { Typography } from "$lib/components/ui/typography/index.js";
</script>

<Typography aria-labelledby="update-heading">
  <h2 id="update-heading">Update notes</h2>
  <p>Use <code>pnpm test</code> to verify the change.</p>
  <ul>
    <li>Check mobile sizing.</li>
    <li>Verify keyboard navigation.</li>
  </ul>
</Typography>
```

Choose heading levels to fit the surrounding page. Use Code Block for multi-line code and Table with `scroll="overlay"` and a `scrollLabel` if its columns need horizontal scrolling. The lead, large, small and muted examples show Valar display and supporting text for use beside prose.

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

## Inline code

<ComponentPreview name="typography-inline-code">

<div></div>

</ComponentPreview>

## Lead

<ComponentPreview name="typography-lead">

<div></div>

</ComponentPreview>

## Large

<ComponentPreview name="typography-large">

<div></div>

</ComponentPreview>

## Small

<ComponentPreview name="typography-small">

<div></div>

</ComponentPreview>

## Muted

<ComponentPreview name="typography-muted">

<div></div>

</ComponentPreview>
