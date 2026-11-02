<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as Drawer from "$lib/registry/ui/drawer/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { DRAWER_SPEC } from "./drawer-tuning.js";

	let { children }: { children: Snippet } = $props();
	let open = $state({ current: true, before: true });
	let containers = $state<{ current?: HTMLDivElement; before?: HTMLDivElement }>({});
	let direction = $state<"bottom" | "top" | "left" | "right">("bottom");
	const DIRECTIONS = [
		["bottom", "底部"],
		["top", "顶部"],
		["left", "左侧"],
		["right", "右侧"],
	] as const;

	async function replay(pane: "current" | "before") {
		open[pane] = false;
		await tick();
		// Vaul's enter/exit and runtime cleanup share a fixed 500ms duration.
		await new Promise((resolve) => setTimeout(resolve, 620));
		open[pane] = true;
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="flex flex-wrap items-center justify-end gap-2 border-b px-4 py-2">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			size="sm"
			value={direction}
			onValueChange={(value) => value && (direction = value as typeof direction)}
			aria-label="抽屉方向"
		>
			{#each DIRECTIONS as [value, label] (value)}
				<ToggleGroup.Item {value}>{label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<p class="px-4 py-2 text-xs text-muted-foreground">
		可拖拽面板关闭；重播可再次打开。方向仅用于预览。
	</p>
	<div class="drawer-canvas" bind:this={containers[pane]}>
		{#key direction}
			<Drawer.Root
				bind:open={open[pane]}
				{direction}
				container={containers[pane]}
				shouldScaleBackground={false}
				noBodyStyles
				disablePreventScroll={false}
				repositionInputs={false}
			>
				<Drawer.Content
					portalProps={{ disabled: true }}
					trapFocus={false}
					interactOutsideBehavior="ignore"
					escapeKeydownBehavior="defer-otherwise-ignore"
					onOpenAutoFocus={(event) => event.preventDefault()}
					onCloseAutoFocus={(event) => event.preventDefault()}
				>
					<Drawer.Header>
						<Drawer.Title>配送时间</Drawer.Title>
						<Drawer.Description>选择适合你的时段。这是 Drawer 的实时预览。</Drawer.Description>
					</Drawer.Header>
					<div class="px-4 py-2 text-sm">今天 18:00–20:00 · 配送到家</div>
					<Drawer.Footer>
						<Button>确认时段</Button>
						<Drawer.Close class="text-sm underline underline-offset-4">取消</Drawer.Close>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		{/key}
	</div>
{/snippet}

<ComponentTuner spec={DRAWER_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.drawer-canvas {
		position: relative;
		min-height: 480px;
		overflow: hidden;
		isolation: isolate;
	}
	.drawer-canvas :global([data-slot="drawer-overlay"]),
	.drawer-canvas :global([data-slot="drawer-content"]) {
		position: absolute;
	}
	.drawer-canvas :global([data-slot="drawer-content"]) {
		max-height: 100%;
		overflow-y: auto;
	}
</style>
