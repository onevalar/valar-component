<script lang="ts">
	import ComponentTuner from "./component-tuner.svelte";
	import TunerFrame from "./tuner-frame.svelte";
	import { SIDEBAR_SPEC, type SidebarValues } from "./sidebar-tuning.js";
	import type { TunerCanvasState } from "./tuner.js";

	let widths = $state({ current: 0, before: 0 });
</script>

{#snippet canvas(pane: "current" | "before", state: TunerCanvasState<SidebarValues>)}
	<div class="w-full min-w-0 space-y-3">
		<label class="flex flex-wrap items-center gap-2 text-xs">
			预览窗口
			<select
				aria-label="{pane === 'current' ? '草稿' : '对照'}侧栏预览窗口"
				bind:value={widths[pane]}
				class="rounded-md border bg-background p-2"
			>
				<option value={0}>适应画布</option>
				<option value={390}>390px · 窄屏</option>
				<option value={767}>767px · 移动边界</option>
				<option value={768}>768px · 桌面边界</option>
				<option value={1024}>1024px · 桌面</option>
			</select>
		</label>
		<p class="text-xs text-muted-foreground">
			每侧是独立应用窗口，宽窗口可在画布内横向滚动。预览不写入侧栏
			cookie；几何与明暗调整保留展开状态。
		</p>
		<TunerFrame component="sidebar" {state} width={widths[pane]} />
	</div>
{/snippet}

<ComponentTuner spec={SIDEBAR_SPEC} {canvas}>
	{#snippet children(state)}
		<TunerFrame component="sidebar" {state} />
	{/snippet}
</ComponentTuner>
