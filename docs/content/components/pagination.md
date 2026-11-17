---
title: Pagination
description: Numbered pagination and compact result navigation.
component: true
links:
  source: https://github.com/onevalar/valar-svelte/tree/main/docs/src/lib/registry/ui/pagination
  doc: https://bits-ui.com/docs/components/pagination
  api: https://bits-ui.com/docs/components/pagination#api-reference
---

<script>
	import ComponentPreview from "$lib/components/component-preview.svelte";
	import ComponentSource from "$lib/components/component-source.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import PMInstall from "$lib/components/pm-install.svelte";
	import Steps from "$lib/components/steps.svelte";
	import InstallTabs from "$lib/components/install-tabs.svelte";

	let { viewerData } = $props();
	import Step from "$lib/components/step.svelte";
</script>

<ComponentPreview name="pagination-demo" >

<div></div>

</ComponentPreview>

## Installation

<InstallTabs>
{#snippet cli()}
<PMAddComp name="pagination" />
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

The workspace package exports these controls from `@valar/svelte-ui/pagination`.

## Usage

```svelte showLineNumbers
<script lang="ts">
  import * as Pagination from "$lib/components/ui/pagination/index.js";
</script>
```

```svelte showLineNumbers
<Pagination.Root count={100} perPage={10}>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content>
      <Pagination.Item>
        <Pagination.Previous />
      </Pagination.Item>
      {#each pages as page (page.key)}
        {#if page.type === "ellipsis"}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
        {:else}
          <Pagination.Item>
            <Pagination.Link {page} isActive={currentPage === page.value}>
              {page.value}
            </Pagination.Link>
          </Pagination.Item>
        {/if}
      {/each}
      <Pagination.Item>
        <Pagination.Next />
      </Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>
```

Use a horizontal Scroll Area when a numbered row has more items than its container can fit.

## Results

Use `Pagination.Results` beside a data list when people need the result range and previous or next actions. The compact row follows the Usage Explorer. The interactive example uses local sample records. The empty example shows the observed disabled state.

<ComponentPreview name="pagination-results">

<div></div>

</ComponentPreview>

```svelte
<Pagination.Results
  count={records.length}
  perPage={25}
  bind:page
  aria-label="Usage results pagination"
  aria-controls="usage-records"
  previousLabel="Back"
  nextLabel="Forward"
  formatResults={({ start, end, total }) =>
    start <= 1 && end === total ? `${total} results` : `${start}–${end} of ${total} results`}
/>
```

Keyboard focus stays on the current direction button during browsing. At an endpoint, it moves to the available direction. Set `page` to 1 after changing the filter or page size.

## Simple

A simple pagination with only page numbers.

<ComponentPreview name="pagination-simple">

<div></div>

</ComponentPreview>

## Icons Only

Use just the previous and next buttons without page numbers. This is useful for data tables with a rows per page selector.

<ComponentPreview name="pagination-icons-only">

<div></div>

</ComponentPreview>
