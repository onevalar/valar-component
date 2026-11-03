<script lang="ts">
	import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { COLLAPSIBLE_SPEC } from "./collapsible-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	let states = $state({
		current: { open: true, disabled: false },
		before: { open: true, disabled: false },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			默认不增加面板背景、边框或留白；这里只编辑内容层留白。展开与禁用仅用于本画布演示，不保存为样式。
		</p>
		<div>
			<Button
				variant="outline"
				aria-pressed={states[pane].disabled}
				onclick={() => (states[pane].disabled = !states[pane].disabled)}
			>
				{states[pane].disabled ? "启用折叠区" : "禁用折叠区"}
			</Button>
		</div>
		<Collapsible.Root
			bind:open={states[pane].open}
			disabled={states[pane].disabled}
			class="grid min-w-0 gap-3"
		>
			<Collapsible.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="justify-start">
						{states[pane].open ? "收起高级设置" : "展开高级设置"}
					</Button>
				{/snippet}
			</Collapsible.Trigger>
			<Collapsible.Content>
				<div class="grid min-w-0 gap-2 text-sm">
					<h3 class="font-medium">高级设置</h3>
					<p class="text-muted-foreground">
						保留原语的 aria-expanded、键盘操作和禁用行为。此内容没有额外的默认面板装饰。
					</p>
					<p class="break-words text-muted-foreground">
						较长的内容会随容器换行，不固定宽高；留白来自显式选择的组件几何。
					</p>
				</div>
			</Collapsible.Content>
		</Collapsible.Root>
		<p role="status" class="text-xs text-muted-foreground">
			{states[pane].disabled ? "折叠触发器已禁用。" : "折叠触发器已启用。"}
			{states[pane].open ? "内容已展开。" : "内容已收起。"}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={COLLAPSIBLE_SPEC} {canvas}>{@render children()}</ComponentTuner>
