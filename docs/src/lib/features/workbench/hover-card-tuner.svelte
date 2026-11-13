<script lang="ts">
	import { type Snippet } from "svelte";
	import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { HOVER_CARD_SPEC } from "./hover-card-tuning.js";

	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	type Sample = "pinned" | "hover";
	let open = $state({
		current: { pinned: false, hover: false },
		before: { pinned: false, hover: false },
	});
	let replaying = $state({ current: false, before: false });
	let side = $state<"bottom" | "top" | "left" | "right">("bottom");
	const SIDES = [
		["bottom", "下方"],
		["top", "上方"],
		["left", "左侧"],
		["right", "右侧"],
	] as const;
	const SAMPLES = ["pinned", "hover"] as const;

	// Wait for the real trigger to mount before positioning the pinned content.
	function pin(_node: HTMLElement, pane: Pane) {
		const frame = requestAnimationFrame(() => (open[pane].pinned = true));
		return {
			destroy() {
				cancelAnimationFrame(frame);
				open[pane] = { pinned: false, hover: false };
			},
		};
	}

	function setOpen(pane: Pane, sample: Sample, value: boolean) {
		// Only replay closes the pinned sample. The hover sample keeps Bits' real behavior.
		if (sample === "hover" || value) open[pane][sample] = value;
	}

	async function replay(pane: Pane) {
		replaying[pane] = true;
		const content = document.querySelector<HTMLElement>(
			`[data-tuning-${pane}] [data-hover-card-sample="pinned"] [data-slot="hover-card-content"]`
		);
		const duration = content ? parseFloat(getComputedStyle(content).animationDuration) * 1000 : 0;
		open[pane].pinned = false;
		await new Promise((resolve) => setTimeout(resolve, duration + 120));
		open[pane].pinned = true;
		replaying[pane] = false;
	}
</script>

{#snippet canvas(pane: Pane)}
	<div class="flex flex-wrap items-center justify-end gap-2 border-b px-4 py-2">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={side}
			onValueChange={(value) => value && (side = value as typeof side)}
			aria-label="卡片方向"
		>
			{#each SIDES as [value, label] (value)}
				<ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<Button size="sm" variant="outline" disabled={replaying[pane]} onclick={() => replay(pane)}
			>重播进入与退出</Button
		>
	</div>
	<div class="hover-card-canvas" use:pin={pane}>
		{#each SAMPLES as sample (sample)}
			<div class="sample" data-side={side} data-hover-card-sample={sample}>
				<HoverCard.Root
					bind:open={() => open[pane][sample], (value) => setOpen(pane, sample, value)}
				>
					<HoverCard.Trigger
						href="/docs/components/hover-card"
						class="preview-link rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-hidden"
						tabindex={sample === "pinned" ? -1 : 0}
					>
						{sample === "pinned" ? "固定展开" : "悬停试试"}
					</HoverCard.Trigger>
					<!-- Real content stays inside its pane; Escape belongs to the editor shell. -->
					<HoverCard.Content
						{side}
						avoidCollisions={false}
						portalProps={{ disabled: true }}
						escapeKeydownBehavior="defer-otherwise-ignore"
						interactOutsideBehavior={sample === "pinned" ? "ignore" : "close"}
					>
						<div class="space-y-2">
							<p class="font-semibold">悬停卡片</p>
							<p class="text-muted-foreground">为链接补充摘要，不放必须在卡片中完成的操作。</p>
							<p class="text-muted-foreground">点击链接可查看完整说明。</p>
						</div>
					</HoverCard.Content>
				</HoverCard.Root>
			</div>
		{/each}
		<p class="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">
			固定展开用于比较样式；“悬停试试”保留组件当前的打开与关闭延迟。触屏可点击链接阅读说明。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={HOVER_CARD_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.hover-card-canvas {
		min-width: 0;
		overflow: hidden;
	}
	.sample {
		container-type: inline-size;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 360px;
		padding: 16px;
	}
	.sample[data-side="bottom"] {
		align-items: flex-start;
	}
	.sample[data-side="top"] {
		align-items: flex-end;
	}
	.sample[data-side="left"] {
		justify-content: flex-end;
	}
	.sample[data-side="right"] {
		justify-content: flex-start;
	}
	.sample :global(.preview-link) {
		flex-shrink: 0;
		text-align: center;
	}
	/* Width is a caller constraint, not a style parameter. Leave room beside the link. */
	.sample :global([data-slot="hover-card-content"]) {
		width: 256px;
		max-width: calc(100cqw - 32px);
		overflow-wrap: anywhere;
	}
	.sample[data-side="left"] :global([data-slot="hover-card-content"]),
	.sample[data-side="right"] :global([data-slot="hover-card-content"]) {
		max-width: calc(100cqw - 96px);
	}
	.sample[data-hover-card-sample="pinned"] {
		pointer-events: none;
	}
</style>
