<script lang="ts">
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SCROLL_AREA_SPEC } from "./scroll-area-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let directions = $state<Record<"current" | "before", "vertical" | "horizontal" | "both">>({
		current: "both",
		before: "both",
	});
	let viewports = $state<{ current: HTMLElement | null; before: HTMLElement | null }>({
		current: null,
		before: null,
	});
	// Bits' viewport is a native overflow element, but the wrapper does not expose viewport
	// attributes. Add accessible focus/name to the actual preview viewport, not a fake bar.
	$effect(() => {
		for (const pane of ["current", "before"] as const) {
			const viewport = viewports[pane];
			if (!viewport) continue;
			viewport.tabIndex = 0;
			viewport.setAttribute("role", "region");
			viewport.setAttribute(
				"aria-label",
				`${pane === "current" ? "草稿" : "对比"} · 可滚动文件列表`
			);
			viewport.setAttribute("aria-describedby", `${id}-${pane}-help`);
		}
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-4 p-4 md:p-6">
		<label class="grid gap-2 text-sm" for={`${id}-${pane}-direction`}>
			演示溢出方向（不保存）
			<select
				id={`${id}-${pane}-direction`}
				class="h-9 rounded-md border bg-background px-2"
				bind:value={directions[pane]}
			>
				<option value="both">横纵双向</option>
				<option value="vertical">仅纵向</option>
				<option value="horizontal">仅横向</option>
			</select>
		</label>
		<p id={`${id}-${pane}-help`} class="text-xs text-muted-foreground">
			Tab 聚焦滚动区域后用方向键、Page Down
			浏览；也可拖动真实滚动条。方向、滚动位置与容器尺寸不保存。
		</p>
		<ScrollArea
			id={`${id}-${pane}-scroll-area`}
			bind:viewportRef={viewports[pane]}
			orientation={directions[pane]}
			type="always"
			class="h-72 w-full min-w-0 rounded-lg border"
		>
			<div
				class={directions[pane] === "vertical"
					? "grid gap-3 p-4"
					: "grid w-max min-w-full gap-3 p-4"}
			>
				{#each Array.from({ length: directions[pane] === "horizontal" ? 3 : 28 }, (_, index) => index + 1) as row (row)}
					<a
						href={`#${id}-${pane}-direction`}
						class={directions[pane] === "vertical"
							? "block rounded-sm text-sm break-words underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
							: "block rounded-sm text-sm whitespace-nowrap underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"}
					>
						{String(row).padStart(2, "0")} · 项目文件与超长标签 / 设计规范 / 可访问的真实滚动区域 / independent-preview-documentation.md
					</a>
				{/each}
			</div>
		</ScrollArea>
	</div>
{/snippet}

<ComponentTuner spec={SCROLL_AREA_SPEC} {canvas}>{@render children()}</ComponentTuner>
