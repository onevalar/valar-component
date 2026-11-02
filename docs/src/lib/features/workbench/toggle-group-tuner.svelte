<script lang="ts">
	import LayersIcon from "@lucide/svelte/icons/layers";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TOGGLE_GROUP_SPEC } from "./toggle-group-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const samples = [
		{ type: "single", orientation: "horizontal", spacing: 0, size: "default", variant: "default" },
		{ type: "multiple", orientation: "horizontal", spacing: 0, size: "sm", variant: "outline" },
		{ type: "single", orientation: "vertical", spacing: 0, size: "lg", variant: "outline" },
		{ type: "multiple", orientation: "vertical", spacing: 0, size: "default", variant: "default" },
		{ type: "single", orientation: "horizontal", spacing: 2, size: "lg", variant: "outline" },
		{ type: "multiple", orientation: "horizontal", spacing: 2, size: "sm", variant: "default" },
		{ type: "single", orientation: "vertical", spacing: 2, size: "sm", variant: "default" },
		{ type: "multiple", orientation: "vertical", spacing: 2, size: "default", variant: "outline" },
	] as const;
	const initial = () => ({
		single: samples.map(() => "overview"),
		multiple: samples.map(() => ["overview", "settings"]),
	});
	let states = $state({ current: initial(), before: initial() });
</script>

{#snippet items()}
	<ToggleGroup.Item value="overview">
		<LayersIcon data-icon="inline-start" />
		概览
	</ToggleGroup.Item>
	<ToggleGroup.Item value="disabled" disabled>禁用</ToggleGroup.Item>
	<ToggleGroup.Item value="list">列表</ToggleGroup.Item>
	<ToggleGroup.Item value="settings">
		设置
		<SettingsIcon data-icon="inline-end" />
	</ToggleGroup.Item>
{/snippet}

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			方向键移动焦点，空格键切换选中，禁用项会跳过。拼接内边距只调整 spacing=0
			的文字侧，保留图标侧留白；圆角统一拼接轮廓与首尾端点，中间仍为直角。
			高度、非拼接几何与图文间距继承 Toggle，请在 Toggle 编辑器中统一调整。
		</p>
		{#each samples as sample, index (index)}
			{@const label = `${sample.type === "single" ? "单选" : "多选"} · ${sample.orientation === "horizontal" ? "横向" : "纵向"} · spacing=${sample.spacing} · ${sample.size} · ${sample.variant}`}
			<section class="grid min-w-0 gap-3" aria-label={label}>
				<h3 class="text-sm font-medium">{label}</h3>
				<div class="min-w-0 overflow-x-auto p-1 pb-3">
					{#if sample.type === "single"}
						<ToggleGroup.Root
							id={`${id}-${pane}-${index}`}
							type="single"
							bind:value={states[pane].single[index]}
							orientation={sample.orientation}
							spacing={sample.spacing}
							size={sample.size}
							variant={sample.variant}
							aria-label={label}
						>
							{@render items()}
						</ToggleGroup.Root>
					{:else}
						<ToggleGroup.Root
							id={`${id}-${pane}-${index}`}
							type="multiple"
							bind:value={states[pane].multiple[index]}
							orientation={sample.orientation}
							spacing={sample.spacing}
							size={sample.size}
							variant={sample.variant}
							aria-label={label}
						>
							{@render items()}
						</ToggleGroup.Root>
					{/if}
				</div>
			</section>
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={TOGGLE_GROUP_SPEC} {canvas}>{@render children()}</ComponentTuner>
