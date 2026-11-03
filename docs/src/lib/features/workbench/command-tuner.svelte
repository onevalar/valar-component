<script lang="ts">
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { COMMAND_SPEC } from "./command-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	type Mode = "inline" | "dialog" | "popover";
	let states = $state({
		current: {
			mode: "inline" as Mode,
			open: true,
			query: "",
			selected: "",
			feedback: "尚未执行",
			loading: false,
		},
		before: {
			mode: "inline" as Mode,
			open: true,
			query: "",
			selected: "",
			feedback: "尚未执行",
			loading: false,
		},
	});
	const timers = new SvelteMap<Pane, ReturnType<typeof setTimeout>>();
	function select(pane: Pane, label: string) {
		states[pane].feedback = `已执行：${label}`;
	}
	function load(pane: Pane) {
		if (states[pane].loading) return;
		states[pane].loading = true;
		timers.set(
			pane,
			setTimeout(() => {
				states[pane].loading = false;
				timers.delete(pane);
				states[pane].feedback = "本地命令已刷新";
			}, 900)
		);
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearTimeout(timer);
	});
</script>

{#snippet commands(pane: Pane)}
	<!-- Root value is the highlighted command; Input value is the filter, not the selection. -->
	<Command.Root bind:value={states[pane].selected}>
		<Command.Input
			aria-label="搜索命令"
			placeholder="搜索日期、设置或 report…"
			bind:value={states[pane].query}
		/>
		<Command.List aria-label="可执行命令">
			<Command.Empty>没有匹配的命令，换个关键词试试。</Command.Empty>
			{#if states[pane].loading}<Command.Loading progress={0.5}>正在刷新本地命令…</Command.Loading
				>{/if}
			<Command.Group heading="常用操作">
				<Command.Item
					value="calendar"
					keywords={["日期", "日历", "date"]}
					onSelect={() => select(pane, "查看日历")}
					><CalendarIcon /><span>查看日历</span><Command.Shortcut>↵</Command.Shortcut></Command.Item
				>
				<Command.Item
					value="settings"
					keywords={["设置", "preferences"]}
					onSelect={() => select(pane, "打开设置")}
					><SettingsIcon /><span>打开设置</span></Command.Item
				>
				<Command.Item
					value="unavailable"
					keywords={["禁用"]}
					disabled
					onSelect={() => select(pane, "不应执行")}
					><SettingsIcon /><span>没有权限（禁用）</span></Command.Item
				>
			</Command.Group>
			<Command.Separator />
			<Command.Group heading="本地报表">
				{#each Array.from({ length: 12 }, (_, index) => index + 1) as month (month)}
					<Command.Item
						value={`report-${month}`}
						keywords={["报表", "report", `${month}月`]}
						onSelect={() => select(pane, `${month}月报表`)}
						><CalendarIcon /><span>{month}月报表</span></Command.Item
					>
				{/each}
			</Command.Group>
		</Command.List>
	</Command.Root>
{/snippet}

{#snippet canvas(pane: Pane)}
	<div class="command-canvas grid min-w-0 gap-4 p-3">
		<p class="text-xs text-muted-foreground">
			上下键移动、Enter执行。可搜索同义词
			date／preferences，输入不存在的词查看空结果。快捷键文字不注册全局事件；刷新只模拟本地加载。
		</p>
		<div class="flex flex-wrap items-center gap-2">
			<label for={`${id}-${pane}-mode`} class="text-xs">组合场景</label>
			<select
				id={`${id}-${pane}-mode`}
				class="rounded border bg-background p-1 text-sm"
				bind:value={states[pane].mode}
				onchange={() => (states[pane].open = true)}
				><option value="inline">内联</option><option value="dialog">Dialog 内联预览</option><option
					value="popover">Popover 搜索选择</option
				></select
			>
			<Button size="sm" variant="outline" onclick={() => load(pane)} disabled={states[pane].loading}
				>刷新命令</Button
			>
		</div>
		{#if states[pane].mode === "inline"}
			<div class="min-w-0 rounded-lg border">{@render commands(pane)}</div>
		{:else if states[pane].mode === "dialog"}
			<!-- Command.Dialog cannot pass Content interaction props; compose its public pieces. -->
			<Button size="sm" variant="outline" onclick={() => (states[pane].open = !states[pane].open)}
				>切换面板</Button
			>
			<div class="dialog-stage">
				<Dialog.Root bind:open={states[pane].open}>
					<Dialog.Content
						portalProps={{ disabled: true }}
						trapFocus={false}
						preventScroll={false}
						interactOutsideBehavior="ignore"
						escapeKeydownBehavior="defer-otherwise-ignore"
						onOpenAutoFocus={(event) => event.preventDefault()}
						onCloseAutoFocus={(event) => event.preventDefault()}
						showCloseButton={false}
						class="cn-command-dialog p-0"
					>
						<Dialog.Header class="sr-only"
							><Dialog.Title>本地命令搜索</Dialog.Title><Dialog.Description
								>过滤命令后使用方向键和Enter执行</Dialog.Description
							></Dialog.Header
						>
						{@render commands(pane)}
					</Dialog.Content>
				</Dialog.Root>
			</div>
		{:else}
			<div class="popover-stage">
				<Popover.Root bind:open={states[pane].open}>
					<Popover.Trigger class={buttonVariants({ variant: "outline", size: "sm" })}
						>搜索选择命令</Popover.Trigger
					>
					<Popover.Content
						portalProps={{ disabled: true }}
						trapFocus={false}
						interactOutsideBehavior="ignore"
						escapeKeydownBehavior="defer-otherwise-ignore"
						onOpenAutoFocus={(event) => event.preventDefault()}
						onCloseAutoFocus={(event) => event.preventDefault()}
						class="w-full p-0"
						avoidCollisions={false}
					>
						{@render commands(pane)}
					</Popover.Content>
				</Popover.Root>
			</div>
		{/if}
		<output aria-live="polite" class="text-xs text-muted-foreground"
			>{states[pane].feedback} · 搜索：{states[pane].query || "全部"}</output
		>
	</div>
{/snippet}

<ComponentTuner spec={COMMAND_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.dialog-stage {
		position: relative;
		min-height: 360px;
	}
	.dialog-stage :global([data-slot="dialog-overlay"]) {
		position: absolute;
	}
	.dialog-stage :global([data-slot="dialog-content"]) {
		position: relative;
		top: auto;
		left: auto;
		translate: none;
		max-width: 100%;
	}
	.popover-stage {
		position: relative;
		display: grid;
		gap: 12px;
	}
	.popover-stage :global([data-bits-floating-content-wrapper]) {
		position: relative !important;
		transform: none !important;
		width: 100%;
	}
	.popover-stage :global([data-slot="popover-content"]) {
		width: 100%;
	}
</style>
