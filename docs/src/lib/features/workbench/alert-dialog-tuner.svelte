<script lang="ts">
	import TrashIcon from "@lucide/svelte/icons/trash";
	import { onDestroy, type Snippet } from "svelte";
	import * as AlertDialog from "$lib/registry/ui/alert-dialog/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ALERT_DIALOG_SPEC } from "./alert-dialog-tuning.js";
	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	let state = $state({
		current: {
			open: true,
			inline: true,
			size: "default" as "default" | "sm",
			pending: false,
			error: false,
			success: false,
		},
		before: {
			open: true,
			inline: true,
			size: "default" as "default" | "sm",
			pending: false,
			error: false,
			success: false,
		},
	});
	const timers: Partial<Record<Pane, ReturnType<typeof setTimeout>>> = {};
	function changeOpen(pane: Pane, open: boolean) {
		clearTimeout(timers[pane]);
		state[pane].open = open;
		state[pane].pending = false;
		if (open) {
			state[pane].error = false;
			state[pane].success = false;
		}
	}
	function confirm(pane: Pane) {
		const retry = state[pane].error;
		state[pane].pending = true;
		timers[pane] = setTimeout(() => {
			state[pane].pending = false;
			if (retry) {
				changeOpen(pane, false);
				state[pane].success = true;
			} else state[pane].error = true;
		}, 600);
	}
	onDestroy(() => Object.values(timers).forEach(clearTimeout));
</script>

{#snippet canvas(pane: Pane)}
	<div class="flex flex-wrap items-center gap-2 border-b p-3">
		{#each ["default", "sm"] as const as size (size)}
			<Button
				size="sm"
				variant={state[pane].size === size ? "default" : "outline"}
				aria-pressed={state[pane].size === size}
				onclick={() => (state[pane].size = size)}>{size === "sm" ? "小尺寸" : "默认尺寸"}</Button
			>
		{/each}
		<Button
			size="sm"
			variant="outline"
			onclick={() => {
				state[pane].inline = !state[pane].inline;
				changeOpen(pane, state[pane].inline);
			}}>{state[pane].inline ? "真实确认流程" : "返回内联画布"}</Button
		>
		{#if state[pane].inline}<Button
				size="sm"
				variant="outline"
				onclick={() => changeOpen(pane, !state[pane].open)}
				>{state[pane].open ? "关闭预览" : "打开预览"}</Button
			>{/if}
	</div>
	<p class="px-4 pt-3 text-xs text-muted-foreground">
		内联画布不锁焦点，Esc交给编辑器；真实流程保留焦点与遮罩行为。首次确认模拟失败，再次确认成功，不发送请求或删除数据。
	</p>
	<div class:inline-canvas={state[pane].inline} class="min-w-0 p-4" data-alert-dialog-canvas>
		<AlertDialog.Root bind:open={() => state[pane].open, (value) => changeOpen(pane, value)}>
			{#if !state[pane].inline}
				<AlertDialog.Trigger>
					{#snippet child({ props })}<Button {...props} variant="outline">打开确认预览</Button
						>{/snippet}
				</AlertDialog.Trigger>
			{/if}
			<AlertDialog.Content
				size={state[pane].size}
				portalProps={{ disabled: true }}
				trapFocus={!state[pane].inline}
				preventScroll={!state[pane].inline}
				interactOutsideBehavior="ignore"
				escapeKeydownBehavior={state[pane].inline ? "defer-otherwise-ignore" : "close"}
				onOpenAutoFocus={(event) => {
					if (state[pane].inline) event.preventDefault();
				}}
				onCloseAutoFocus={(event) => {
					if (state[pane].inline) event.preventDefault();
				}}
			>
				<AlertDialog.Header>
					<AlertDialog.Media><TrashIcon aria-hidden="true" /></AlertDialog.Media>
					<AlertDialog.Title>删除这个演示项目？</AlertDialog.Title>
					<AlertDialog.Description
						>真实项目删除后无法撤销，成员将失去访问权限。这里仅模拟确认流程，不会删除任何数据。</AlertDialog.Description
					>
				</AlertDialog.Header>
				{#if state[pane].error}<p role="alert" class="text-sm text-destructive">
						模拟保存失败，项目未删除。请重试或取消。
					</p>{/if}
				<AlertDialog.Footer>
					<AlertDialog.Cancel disabled={state[pane].pending}>取消</AlertDialog.Cancel>
					<AlertDialog.Action
						variant="destructive"
						disabled={state[pane].pending}
						onclick={() => confirm(pane)}
					>
						{#if state[pane].pending}<Spinner aria-label="正在模拟确认" />{/if}
						{state[pane].pending ? "处理中…" : state[pane].error ? "重试删除演示" : "删除演示项目"}
					</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
		<p role="status" class="mt-3 text-sm text-muted-foreground">
			{state[pane].success ? "演示确认成功，未删除实际数据。" : ""}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={ALERT_DIALOG_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.inline-canvas {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 440px;
		overflow: hidden;
		padding: 32px 16px;
	}
	.inline-canvas :global([data-slot="alert-dialog-overlay"]) {
		position: absolute;
	}
	.inline-canvas :global([data-slot="alert-dialog-content"]) {
		position: relative;
		top: auto;
		left: auto;
		translate: none;
	}
</style>
