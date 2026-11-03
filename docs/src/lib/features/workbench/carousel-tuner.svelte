<script lang="ts">
	import * as Carousel from "$lib/registry/ui/carousel/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { CarouselAPI } from "$lib/registry/ui/carousel/context.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CAROUSEL_SPEC } from "./carousel-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	const id = $props.id();
	let states = $state({
		current: { orientation: "horizontal" as "horizontal" | "vertical", multiple: false },
		before: { orientation: "horizontal" as "horizontal" | "vertical", multiple: false },
	});
	let apis = $state.raw<Partial<Record<Pane, CarouselAPI>>>({});
	let selection = $state({ current: { current: 0, count: 0 }, before: { current: 0, count: 0 } });
	$effect(() => {
		const cleanups = (["current", "before"] as const).map((pane) => {
			const api = apis[pane];
			if (!api) return () => {};
			const update = () => {
				selection[pane] = {
					current: api.selectedScrollSnap() + 1,
					count: api.scrollSnapList().length,
				};
			};
			update();
			api.on("select", update).on("reInit", update);
			return () => {
				api.off("select", update).off("reInit", update);
			};
		});
		return () => cleanups.forEach((cleanup) => cleanup());
	});
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			真实 Embla 轮播，可拖动或使用按钮。只调幻灯片间距，不改按钮、basis、opts、plugins
			或键盘规则；横纵两种方向仍使用原有左／右方向键。
		</p>
		<div class="flex flex-wrap items-center gap-3">
			<label for={`${id}-${pane}-orientation`} class="text-sm">方向</label>
			<select
				id={`${id}-${pane}-orientation`}
				bind:value={states[pane].orientation}
				class="rounded-md border bg-background px-2 py-1 text-sm"
			>
				<option value="horizontal">水平</option>
				<option value="vertical">垂直</option>
			</select>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={states[pane].multiple} />每屏两张
			</label>
		</div>
		<!-- The primitive captures orientation/options at creation; remount on preview changes.
		     Reserve 48px around its external buttons instead of clipping them or moving them. -->
		<div
			class={states[pane].orientation === "horizontal"
				? "min-w-0 px-12 py-2"
				: "min-w-0 px-2 py-12"}
		>
			{#key `${states[pane].orientation}-${states[pane].multiple}`}
				<Carousel.Root
					orientation={states[pane].orientation}
					opts={{ align: "start" }}
					setApi={(api) => (apis = { ...apis, [pane]: api })}
					aria-label="工作台内容轮播"
					class="w-full"
				>
					<Carousel.Content class={states[pane].orientation === "vertical" ? "h-64" : undefined}>
						{#each ["概览", "设计", "实现", "验证", "交付"] as title, index (title)}
							<Carousel.Item class={states[pane].multiple ? "basis-1/2" : undefined}>
								<div
									class={states[pane].orientation === "vertical"
										? "flex h-full min-h-0 flex-col items-center justify-center rounded-lg border bg-card p-2 text-card-foreground"
										: "flex h-40 min-w-0 flex-col items-center justify-center rounded-lg border bg-card p-2 text-card-foreground"}
								>
									<span class="text-2xl font-semibold">{index + 1}</span>
									<span class="text-xs">{title}</span>
								</div>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<Carousel.Previous />
					<Carousel.Next />
				</Carousel.Root>
			{/key}
		</div>
		<p role="status" class="text-center text-sm text-muted-foreground">
			当前滚动位置 {selection[pane].current} / {selection[pane].count}（Embla API）
		</p>
		<div class="flex justify-center">
			<Button variant="outline" size="sm" onclick={() => apis[pane]?.scrollTo(0)}>回到第一张</Button
			>
		</div>
	</div>
{/snippet}

<ComponentTuner spec={CAROUSEL_SPEC} {canvas}>{@render children()}</ComponentTuner>
