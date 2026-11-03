<script lang="ts">
	import * as Resizable from "$lib/registry/ui/resizable/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { RESIZABLE_SPEC } from "./resizable-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let directions = $state<Record<"current" | "before", "horizontal" | "vertical">>({
		current: "horizontal",
		before: "horizontal",
	});
	let layouts = $state({ current: [40, 60], before: [40, 60] });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-4 p-4 md:p-6">
		<label class="grid gap-2 text-sm" for={`${id}-${pane}-direction`}>
			演示方向（不保存）
			<select
				id={`${id}-${pane}-direction`}
				class="h-9 rounded-md border bg-background px-2"
				bind:value={directions[pane]}
			>
				<option value="horizontal">左右分栏</option>
				<option value="vertical">上下分栏</option>
			</select>
		</label>
		<p id={`${id}-${pane}-help`} class="text-xs text-muted-foreground">
			拖动分隔线，或 Tab 聚焦后用方向键调整。比例仅为本画布临时状态；触摸命中区和把手形状不变。
		</p>
		<Resizable.PaneGroup
			id={`${id}-${pane}-group`}
			direction={directions[pane]}
			class="h-72 min-h-72 w-full rounded-lg border"
			onLayoutChange={(sizes) => {
				layouts[pane] = sizes;
			}}
		>
			<Resizable.Pane id={`${id}-${pane}-first`} defaultSize={40} minSize={20}>
				<div class="flex h-full min-w-0 flex-col justify-center gap-2 overflow-auto p-3">
					<h3 class="text-sm font-semibold">文件导航 · {Math.round(layouts[pane][0] ?? 40)}%</h3>
					<p class="text-xs break-words text-muted-foreground">
						这是用于验证窄分栏与长标签的真实内容，不会把比例保存为样式。
					</p>
				</div>
			</Resizable.Pane>
			<Resizable.Handle
				id={`${id}-${pane}-handle`}
				withHandle
				aria-label="调整导航与内容分栏"
				aria-describedby={`${id}-${pane}-help`}
			/>
			<Resizable.Pane id={`${id}-${pane}-second`} defaultSize={60} minSize={20}>
				<div class="flex h-full min-w-0 flex-col justify-center gap-2 overflow-auto p-3">
					<h3 class="text-sm font-semibold">编辑内容 · {Math.round(layouts[pane][1] ?? 60)}%</h3>
					<p class="text-xs break-words text-muted-foreground">
						键盘与指针调整由 PaneForge 管理；比较画布拥有独立 ID 与临时比例。
					</p>
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
{/snippet}

<ComponentTuner spec={RESIZABLE_SPEC} {canvas}>{@render children()}</ComponentTuner>
