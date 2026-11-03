<script lang="ts">
	import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
	import * as Kbd from "$lib/registry/ui/kbd/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { KBD_SPEC } from "./kbd-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let states = $state({
		current: { count: 0, last: "尚未执行" },
		before: { count: 0, last: "尚未执行" },
	});
	function act(pane: "current" | "before", label: string) {
		states[pane].count++;
		states[pane].last = label;
	}
	function keydown(event: KeyboardEvent, pane: "current" | "before") {
		// Only the named, focused practice button receives keys; no document/system shortcuts.
		if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
		if (event.key.toLowerCase() === "k") {
			event.preventDefault();
			act(pane, event.shiftKey ? "Shift + K" : "K");
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			act(pane, "↑");
		}
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p id={`${id}-${pane}-help`} class="text-xs text-muted-foreground">
			先聚焦“快捷键练习”按钮，再按 K、Shift + K 或
			↑。这些局部快捷键只更新本画布的计数，不劫持系统快捷键；Enter／空格也可执行。
		</p>
		<section class="grid min-w-0 gap-3" aria-label="可用局部快捷键">
			<div class="flex min-w-0 flex-wrap items-center gap-4">
				<div class="flex items-center gap-2">
					<Kbd.Root>K</Kbd.Root><span class="text-xs">单键执行</span>
				</div>
				<div class="flex items-center gap-2">
					<Kbd.Group aria-label="Shift 加 K"
						><Kbd.Root>Shift</Kbd.Root><Kbd.Root>K</Kbd.Root></Kbd.Group
					><span class="text-xs">组合执行</span>
				</div>
				<div class="flex items-center gap-2">
					<Kbd.Root aria-label="向上方向键"><ArrowUpIcon aria-hidden="true" /></Kbd.Root><span
						class="text-xs">图标按键执行</span
					>
				</div>
			</div>
		</section>
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="outline"
							aria-describedby={`${id}-${pane}-help`}
							onkeydown={(event) => keydown(event, pane)}
							onclick={() => act(pane, "按钮执行")}
						>
							快捷键练习 <Kbd.Root>K</Kbd.Root>
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content portalProps={{ disabled: true }}>
					聚焦按钮后按 <Kbd.Group aria-label="Shift 加 K"
						><Kbd.Root>Shift</Kbd.Root><Kbd.Root>K</Kbd.Root></Kbd.Group
					> 执行
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
		<p role="status" class="text-sm">已执行 {states[pane].count} 次 · {states[pane].last}</p>
	</div>
{/snippet}

<ComponentTuner spec={KBD_SPEC} {canvas}>{@render children()}</ComponentTuner>
