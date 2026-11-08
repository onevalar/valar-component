---
title: Segmented Control
description: A required single selection composed from ToggleGroup.
component: true
---

<script>
  import ComponentPreview from "$lib/components/component-preview.svelte";
  import PMAddComp from "$lib/components/pm-add-comp.svelte";
</script>

<ComponentPreview name="segmented-control-demo"><div></div></ComponentPreview>

## Installation

<PMAddComp name="segmented-control" />

## Contract

`import { SegmentedControl, type Segment } from '@valar/svelte-ui/segmented-control'`.

Required `label`, `options: { value: string; label: string; accessory?: Snippet; disabled?: boolean }[]`; supply `value` or `bind:value`. Optional `onValueChange(string)`, `onOptionIntent(string)`, `disabled`, native ToggleGroup attributes/class. Values must be unique and nonempty. Re-selecting the selected item never clears it or emits a duplicate event. Arrow keys (RTL-aware), Home and End select, skip disabled options and move focus. Intent runs on enabled pointer entry/focus. Horizontal overflow remains scrollable.

Bits UI single-toggle semantics are radiogroup/radio and aria-checked rather than source pressed buttons. Accessories use Svelte snippets; no React runtime or layout animation. For multiple selection use ToggleGroup; for associated panels use Tabs.
