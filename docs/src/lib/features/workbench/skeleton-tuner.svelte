<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SKELETON_SPEC } from "./skeleton-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let states = $state({ current: { loading: true }, before: { loading: true } });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-5 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			宽高属于使用处的内容布局，不是 Skeleton 的全局参数。点击按钮恢复真实内容。
		</p>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" onclick={() => (states[pane].loading = !states[pane].loading)}
				>{states[pane].loading ? "显示真实内容" : "重新加载内容"}</Button
			>
		</div>
		<section
			class="grid min-w-0 gap-4 rounded-lg border p-4"
			aria-labelledby={`${id}-${pane}-profile`}
			aria-busy={states[pane].loading}
		>
			<h3 id={`${id}-${pane}-profile`} class="text-sm font-medium">成员资料</h3>
			{#if states[pane].loading}
				<p class="sr-only">正在加载成员资料。</p>
				<div class="flex min-w-0 items-start gap-4" aria-hidden="true">
					<Skeleton class="size-12 shrink-0" />
					<div class="grid min-w-0 flex-1 gap-2">
						<Skeleton class="h-5 w-24" />
						<Skeleton class="h-5 w-full" />
						<Skeleton class="h-5 w-3/4" />
					</div>
				</div>
			{:else}
				<div class="flex min-w-0 items-start gap-4">
					<div
						class="flex size-12 shrink-0 items-center justify-center bg-muted text-sm"
						aria-hidden="true"
					>
						林
					</div>
					<div class="grid min-w-0 flex-1 gap-2 text-sm leading-5">
						<p class="font-medium">林晓 · 设计师</p>
						<p class="text-muted-foreground">负责组件体验与无障碍设计。</p>
						<p class="text-muted-foreground">最近更新：今天</p>
					</div>
				</div>
			{/if}
		</section>
		<p role="status" class="text-xs text-muted-foreground">
			{states[pane].loading ? "演示加载中，可随时显示真实内容。" : "内容已就绪。"}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={SKELETON_SPEC} {canvas}>{@render children()}</ComponentTuner>
