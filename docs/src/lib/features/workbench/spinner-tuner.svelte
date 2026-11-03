<script lang="ts">
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SPINNER_SPEC } from "./spinner-tuning.js";

	let { children }: { children: Snippet } = $props();
	let states = $state({
		current: { saving: false, saved: false },
		before: { saving: false, saved: false },
	});
	const timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();
	function save(pane: "current" | "before") {
		if (states[pane].saving) return;
		states[pane] = { saving: true, saved: false };
		timers.set(
			pane,
			setTimeout(() => {
				states[pane] = { saving: false, saved: true };
				timers.delete(pane);
			}, 1800)
		);
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearTimeout(timer);
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			尺寸以外沿用组件库；下列显式尺寸不会跟随默认尺寸调整。
		</p>
		<section class="grid min-w-0 gap-3" aria-label="独立加载指示">
			<h3 class="text-sm">独立 Spinner · 默认 status 与读屏名称</h3>
			<div class="flex flex-wrap items-center gap-4"><Spinner /></div>
		</section>
		<div role="status" class="flex min-w-0 items-center gap-3">
			<Spinner role="presentation" aria-hidden="true" />
			<span class="text-sm">正在准备预览…</span>
		</div>
		<section class="grid min-w-0 gap-3" aria-label="调用处显式尺寸">
			<h3 class="text-sm">显式 size-4 与 size-6</h3>
			<div class="flex flex-wrap items-center gap-4">
				<Spinner class="size-4" aria-label="固定 16 像素加载指示" />
				<Spinner class="size-6" aria-label="固定 24 像素加载指示" />
			</div>
		</section>
		<form
			class="grid min-w-0 gap-3"
			onsubmit={(event) => {
				event.preventDefault();
				save(pane);
			}}
		>
			<div class="flex flex-wrap gap-2">
				<Button type="submit" disabled={states[pane].saving}>
					{#if states[pane].saving}<Spinner role="presentation" aria-hidden="true" />{/if}
					{states[pane].saving ? "保存中…" : "模拟保存"}
				</Button>
				<Button disabled><Spinner role="presentation" aria-hidden="true" />提交中…</Button>
			</div>
			<p role="status" class="text-xs text-muted-foreground">
				{states[pane].saving
					? "正在保存本地演示…"
					: states[pane].saved
						? "演示已保存，无网络请求。"
						: "提交按钮保留文字并在处理中禁用。"}
			</p>
		</form>
	</div>
{/snippet}

<ComponentTuner spec={SPINNER_SPEC} {canvas}>{@render children()}</ComponentTuner>
