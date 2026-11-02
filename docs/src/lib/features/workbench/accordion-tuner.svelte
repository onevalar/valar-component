<script lang="ts">
	import * as Accordion from "$lib/registry/ui/accordion/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ACCORDION_SPEC } from "./accordion-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let demo = $state({
		current: {
			single: "overview",
			multiple: ["overview", "settings"],
			singleNoted: false,
			multipleNoted: false,
		},
		before: {
			single: "overview",
			multiple: ["overview", "settings"],
			singleNoted: false,
			multipleNoted: false,
		},
	});
</script>

{#snippet items(pane: "current" | "before", mode: "single" | "multiple")}
	<Accordion.Item value="overview" id={`${id}-${pane}-${mode}-overview-item`}>
		<Accordion.Trigger level={4} id={`${id}-${pane}-${mode}-overview-trigger`}>
			如何按需查看项目说明？
		</Accordion.Trigger>
		<Accordion.Content id={`${id}-${pane}-${mode}-overview-content`}>
			<p>
				这里默认展开，便于比较标题与正文的对齐。折叠区域适合放置常见问题和补充说明；用户必须先看到的重要信息应直接呈现，而不是藏在折叠项内。
			</p>
			<p>
				这是一段较长的补充说明，用来检查窄画布下的多行换行与自然高度。调整横向留白只改变标题和内容外层，不改变段落之间的间距，也不会重写内部按钮或链接的样式。
				<a href={`#${id}-${pane}-keyboard-help`}>查看本画布的键盘说明</a>。
			</p>
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="settings" id={`${id}-${pane}-${mode}-settings-item`}>
		<Accordion.Trigger level={4} id={`${id}-${pane}-${mode}-settings-trigger`}>
			展开后可以操作内部控件吗？
		</Accordion.Trigger>
		<Accordion.Content id={`${id}-${pane}-${mode}-settings-content`}>
			<p>可以。用 Tab 进入链接或按钮；下面的真实 Button 只更新这一侧、这一组的本地演示反馈。</p>
			<Button
				type="button"
				size="sm"
				onclick={() => {
					if (mode === "single") demo[pane].singleNoted = !demo[pane].singleNoted;
					else demo[pane].multipleNoted = !demo[pane].multipleNoted;
				}}
			>
				切换演示标记
			</Button>
			<p role="status" class="mt-3 text-muted-foreground">
				{(mode === "single" ? demo[pane].singleNoted : demo[pane].multipleNoted)
					? "已标记本组演示，没有保存设置或执行外部操作。"
					: "尚未标记本组演示。"}
			</p>
		</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item value="disabled" disabled id={`${id}-${pane}-${mode}-disabled-item`}>
		<Accordion.Trigger level={4} id={`${id}-${pane}-${mode}-disabled-trigger`}>
			暂不可用的设置（禁用项）
		</Accordion.Trigger>
		<Accordion.Content id={`${id}-${pane}-${mode}-disabled-content`}>
			<p>此项当前不可展开。</p>
		</Accordion.Content>
	</Accordion.Item>
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-8 p-4 md:p-6">
		<p id={`${id}-${pane}-keyboard-help`} class="text-xs text-muted-foreground">
			用方向键、Home／End 在标题间移动，Enter／Space 展开或收起；禁用项会跳过。Tab
			可以进入内容中的真实链接与按钮。两侧展开与演示标记互不影响，不执行外部操作。
		</p>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-single-title`}>
			<h3 id={`${id}-${pane}-single-title`} class="text-sm font-medium">
				单项展开 · 默认打开第一项
			</h3>
			<Accordion.Root
				type="single"
				bind:value={demo[pane].single}
				id={`${id}-${pane}-single`}
				aria-labelledby={`${id}-${pane}-single-title`}
				class="min-w-0 break-words"
			>
				{@render items(pane, "single")}
			</Accordion.Root>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-multiple-title`}>
			<h3 id={`${id}-${pane}-multiple-title`} class="text-sm font-medium">
				多项展开 · 默认打开前两项
			</h3>
			<Accordion.Root
				type="multiple"
				bind:value={demo[pane].multiple}
				id={`${id}-${pane}-multiple`}
				aria-labelledby={`${id}-${pane}-multiple-title`}
				class="min-w-0 break-words"
			>
				{@render items(pane, "multiple")}
			</Accordion.Root>
		</section>
	</div>
{/snippet}

<ComponentTuner spec={ACCORDION_SPEC} {canvas}>{@render children()}</ComponentTuner>
