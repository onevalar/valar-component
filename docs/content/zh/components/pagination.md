---
title: 分页
description: 页码导航和带结果计数的紧凑翻页。
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

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="pagination" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

安装 `bits-ui`：

</Step>

<PMInstall command="bits-ui -D" />

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

工作区组件包的入口为 `@valar/svelte-ui/pagination`。

## 用法

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

页码行超出容器宽度时使用横向悬浮 Scroll Area。

## 结果分页

用量记录或表格需要显示当前范围并支持前后浏览时，使用 `Pagination.Results`。紧凑行对应用量浏览器。可交互示例使用本地合成记录，空结果示例展示实测的禁用状态。

<ComponentPreview name="pagination-results">

<div></div>

</ComponentPreview>

```svelte
<Pagination.Results
  count={records.length}
  perPage={25}
  bind:page
  aria-label="用量记录分页"
  aria-controls="usage-records"
  previousLabel="上一页"
  nextLabel="下一页"
  formatResults={({ start, end, total }) =>
    start <= 1 && end === total ? `${total} 个结果` : `第 ${start}–${end} 条，共 ${total} 个结果`}
/>
```

连续翻页时键盘焦点留在当前按钮。到达首尾页时，焦点移到可用的方向按钮。筛选条件或每页条数变化后，将 `page` 重置为 1。

## 简单

只保留页码的简洁分页。

<ComponentPreview name="pagination-simple">

<div></div>

</ComponentPreview>

## 仅图标

只显示上一页和下一页按钮，不显示页码。适合配有每页条数选择器的数据表格。

<ComponentPreview name="pagination-icons-only">

<div></div>

</ComponentPreview>
