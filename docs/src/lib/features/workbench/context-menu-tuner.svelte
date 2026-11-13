<script lang="ts">
	import { tick, type Snippet } from "svelte";
	import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CONTEXT_MENU_SPEC } from "./context-menu-tuning.js";

	type Pane = "current" | "before";
	let { children }: { children: Snippet } = $props();
	let open = $state({ current: true, before: true });
	let pinned = $state({ current: true, before: true });
	let targets = $state<Record<Pane, HTMLElement | null>>({ current: null, before: null });
	let canvases = $state<Record<Pane, HTMLElement | null>>({ current: null, before: null });
	let canvasWidths = $state({ current: 0, before: 0 });
	let contents = $state<Record<Pane, HTMLElement | null>>({ current: null, before: null });
	let statusBar = $state({ current: true, before: true });
	let sorting = $state({ current: "name", before: "name" });
	const keep = (event: Event) => event.preventDefault();

	async function replay(pane: Pane) {
		const content = contents[pane];
		const duration = content ? parseFloat(getComputedStyle(content).animationDuration) * 1000 : 0;
		open[pane] = false;
		await new Promise((resolve) => setTimeout(resolve, duration + 120));
		// Pin the replay to an element, rather than Bits' initial virtual point at (0, 0).
		pinned[pane] = true;
		open[pane] = true;
	}

	async function keyboardMenu(event: KeyboardEvent, pane: Pane) {
		if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey)) return;
		event.preventDefault();
		const target = targets[pane];
		if (!target) return;
		const rect = target.getBoundingClientRect();
		// Bits 2.20's trigger only listens for contextmenu and long press, not these keys.
		// Dispatch through that real trigger to seed its virtual anchor with valid coordinates.
		target.dispatchEvent(
			new MouseEvent("contextmenu", {
				bubbles: true,
				cancelable: true,
				button: 2,
				clientX: rect.left + 16,
				clientY: rect.bottom - 8,
			})
		);
		await tick();
		contents[pane]?.focus({ preventScroll: true });
	}
</script>

{#snippet canvas(pane: Pane)}
	<div class="flex flex-wrap items-center justify-end gap-2 border-b px-4 py-2">
		<Button size="sm" variant="outline" onclick={() => replay(pane)}>重播进入与退出</Button>
	</div>
	<div
		class="context-canvas"
		bind:this={canvases[pane]}
		bind:clientWidth={canvasWidths[pane]}
		data-context-menu-canvas
	>
		<ContextMenu.Root bind:open={open[pane]}>
			<ContextMenu.Trigger
				bind:ref={targets[pane]}
				tabindex={0}
				class="context-target rounded-lg border border-dashed px-4 py-3 text-center text-sm text-muted-foreground -outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
				oncontextmenu={() => (pinned[pane] = false)}
				onkeydown={(event) => keyboardMenu(event, pane)}
			>
				在此右键，或聚焦后按 Shift+F10／菜单键
			</ContextMenu.Trigger>
			<!--
				Bits' virtual anchor begins at viewport (0, 0); open=true alone is not enough.
				The default/replay view uses customAnchor, while real contextmenu events switch
				back to Bits' pointer anchor and collisions are constrained to this canvas.
				No portal, automatic focus, focus trap, scroll lock or Escape interception.
			-->
			<ContextMenu.Content
				bind:ref={contents[pane]}
				portalProps={{ disabled: true }}
				customAnchor={pinned[pane] ? targets[pane] : null}
				side={pinned[pane] || canvasWidths[pane] < 520 ? "bottom" : "right"}
				align="start"
				sideOffset={12}
				strategy="absolute"
				collisionBoundary={canvases[pane] ?? []}
				collisionPadding={12}
				avoidCollisions={!pinned[pane]}
				trapFocus={false}
				preventScroll={false}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior="defer-otherwise-ignore"
				onOpenAutoFocus={keep}
				onCloseAutoFocus={keep}
			>
				<ContextMenu.Group>
					<ContextMenu.GroupHeading>文件操作</ContextMenu.GroupHeading>
					<ContextMenu.Item onSelect={keep}>
						打开<ContextMenu.Shortcut>↵</ContextMenu.Shortcut>
					</ContextMenu.Item>
					<ContextMenu.Item inset onSelect={keep}>在新窗口中打开</ContextMenu.Item>
					<ContextMenu.Item disabled>共享（禁用）</ContextMenu.Item>
					<ContextMenu.Sub>
						<ContextMenu.SubTrigger>发送到</ContextMenu.SubTrigger>
						<!-- A 320px main menu leaves no room on either side in a narrow canvas. -->
						<ContextMenu.SubContent
							portalProps={{ disabled: true }}
							side={canvasWidths[pane] < 520 ? "bottom" : "right"}
							align={canvasWidths[pane] < 520 ? "end" : "start"}
							strategy="absolute"
							collisionBoundary={canvases[pane] ?? []}
							collisionPadding={12}
							trapFocus={false}
							interactOutsideBehavior="ignore"
							escapeKeydownBehavior="defer-otherwise-ignore"
							onCloseAutoFocus={keep}
						>
							<ContextMenu.Item onSelect={keep}>邮件</ContextMenu.Item>
							<ContextMenu.Item onSelect={keep}>桌面快捷方式</ContextMenu.Item>
						</ContextMenu.SubContent>
					</ContextMenu.Sub>
				</ContextMenu.Group>
				<ContextMenu.Separator />
				<ContextMenu.CheckboxItem bind:checked={statusBar[pane]}
					>显示状态栏</ContextMenu.CheckboxItem
				>
				<ContextMenu.Separator />
				<ContextMenu.RadioGroup bind:value={sorting[pane]}>
					<ContextMenu.GroupHeading inset>排序方式</ContextMenu.GroupHeading>
					<ContextMenu.RadioItem value="name">名称</ContextMenu.RadioItem>
					<ContextMenu.RadioItem value="date">修改日期</ContextMenu.RadioItem>
					<ContextMenu.RadioItem value="size" disabled>大小（禁用）</ContextMenu.RadioItem>
				</ContextMenu.RadioGroup>
			</ContextMenu.Content>
		</ContextMenu.Root>
	</div>
{/snippet}

<ComponentTuner spec={CONTEXT_MENU_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.context-canvas {
		position: relative;
		min-height: 780px;
		padding: 24px 16px;
		overflow: hidden;
	}
	.context-canvas :global(.context-target) {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 72px;
	}
</style>
