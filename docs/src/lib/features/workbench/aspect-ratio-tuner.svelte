<script lang="ts">
	import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ASPECT_RATIO_SPEC } from "./aspect-ratio-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const ratios = [
		{ label: "16:9 横向", value: 16 / 9 },
		{ label: "1:1 方形", value: 1 },
		{ label: "3:4 纵向", value: 3 / 4 },
	];
	let states = $state({ current: { ratio: 0 }, before: { ratio: 0 } });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			宽高比是使用处属性，下面的比例选择不保存。容器默认没有圆角或裁切；图片不自带圆角，便于观察显式编辑的边界。
		</p>
		<div class="grid gap-2">
			<label for={`${id}-${pane}-ratio`} class="text-sm font-medium">场景宽高比（不保存）</label>
			<select
				id={`${id}-${pane}-ratio`}
				bind:value={states[pane].ratio}
				class="w-full min-w-0 rounded-md border bg-background p-2 text-sm"
			>
				{#each ratios as ratio, index (ratio.label)}<option value={index}>{ratio.label}</option
					>{/each}
			</select>
		</div>
		<div class="w-full max-w-sm min-w-0">
			<AspectRatio ratio={ratios[states[pane].ratio].value}>
				<img
					src="/favicon.svg"
					alt="Valar 标志，用于观察媒体容器的宽高比、圆角与裁切"
					class="size-full bg-muted object-cover"
				/>
			</AspectRatio>
		</div>
		<p role="status" class="text-xs text-muted-foreground">
			当前画布比例：{ratios[states[pane].ratio].label}；不会写入版本或组件样式。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={ASPECT_RATIO_SPEC} {canvas}>{@render children()}</ComponentTuner>
