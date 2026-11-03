<script lang="ts">
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Progress } from "$lib/registry/ui/progress/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { PROGRESS_SPEC } from "./progress-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let states = $state({
		current: { value: 0, loading: false },
		before: { value: 0, loading: false },
	});
	const timers = new SvelteMap<string, ReturnType<typeof setInterval>>();
	function load(pane: "current" | "before") {
		if (states[pane].loading) return;
		states[pane] = { value: 0, loading: true };
		timers.set(
			pane,
			setInterval(() => {
				states[pane].value += 20;
				if (states[pane].value >= 100) {
					clearInterval(timers.get(pane));
					timers.delete(pane);
					states[pane].loading = false;
				}
			}, 350)
		);
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearInterval(timer);
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			轨道几何不改变进度语义；以下状态使用真实 Progress，保留原有过渡。
		</p>
		{#each [{ value: 0, label: "尚未开始 · 0%" }, { value: 42, label: "正在导入 · 42%" }, { value: 100, label: "导入完成 · 100%" }, { value: null, label: "准备中 · 进度未知" }] as sample, index (index)}
			<section class="grid min-w-0 gap-3" aria-labelledby={`${id}-${pane}-${index}`}>
				<h3 id={`${id}-${pane}-${index}`} class="text-sm">{sample.label}</h3>
				<Progress value={sample.value} max={100} aria-labelledby={`${id}-${pane}-${index}`} />
			</section>
		{/each}
		<section class="grid min-w-0 gap-3" aria-labelledby={`${id}-${pane}-task`}>
			<h3 id={`${id}-${pane}-task`} class="text-sm">本地模拟导入 · {states[pane].value}%</h3>
			<Progress value={states[pane].value} max={100} aria-labelledby={`${id}-${pane}-task`} />
			<div class="flex flex-wrap gap-2">
				<Button onclick={() => load(pane)} disabled={states[pane].loading}
					>{states[pane].loading ? "导入中…" : "模拟导入"}</Button
				>
			</div>
			<p role="status" class="text-xs text-muted-foreground">
				{states[pane].loading
					? "正在处理本地演示数据…"
					: states[pane].value === 100
						? "演示数据已导入，可重新运行。"
						: "点击按钮开始，无网络请求。"}
			</p>
		</section>
	</div>
{/snippet}

<ComponentTuner spec={PROGRESS_SPEC} {canvas}>{@render children()}</ComponentTuner>
