---
title: 页面布局
description: 固化页面宽度分档、单行紧凑页头、筛选工具栏、间距分组区块与设置／详情属性行的标准布局骨架。
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

## 安装

<InstallTabs>
{#snippet cli()}
<PMAddComp name="page-layout" />
{/snippet}
{#snippet manual()}
<Steps>

<Step>

将以下代码复制到项目中。

</Step>
{#if viewerData}
	<ComponentSource item={viewerData} data-llm-ignore/>
{/if}

</Steps>
{/snippet}
</InstallTabs>

## 用法

```svelte showLineNumbers
<script lang="ts">
  import * as PageLayout from "$lib/components/ui/page-layout/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
</script>
```

```svelte showLineNumbers
<PageLayout.Root width="narrow">
  <PageLayout.Header>
    <PageLayout.Title>工作区设置</PageLayout.Title>
    <PageLayout.Actions>
      <Button size="sm">保存</Button>
    </PageLayout.Actions>
  </PageLayout.Header>
  <PageLayout.Section>
    <PageLayout.SectionTitle>通知偏好</PageLayout.SectionTitle>
    <PageLayout.Section surface="card">
      <PageLayout.PropertyList layout="settings">
        <PageLayout.PropertyRow label="邮件通知">...</PageLayout.PropertyRow>
      </PageLayout.PropertyList>
    </PageLayout.Section>
  </PageLayout.Section>
</PageLayout.Root>
```

列表、表格与工作台使用 `width="full"`，设置页、独立表单和详情页使用 `width="narrow"`。区块默认使用 `surface="plain"` 优先靠留白间距表达分组，仅在需要单层成组承载时切换 `surface="card"`。
