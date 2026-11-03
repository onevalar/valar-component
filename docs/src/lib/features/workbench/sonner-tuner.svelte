<script lang="ts">
	import ComponentTuner from "./component-tuner.svelte";
	import TunerFrame from "./tuner-frame.svelte";
	import { SONNER_SPEC, type SonnerValues } from "./sonner-tuning.js";
	import type { TunerCanvasState } from "./tuner.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
</script>

{#snippet canvas(_pane: "current" | "before", state: TunerCanvasState<SonnerValues>)}
	<div class="w-full min-w-0 space-y-3">
		<p class="p-3 text-xs text-muted-foreground">
			修改参数会重新播放本侧真实通知示例；不会重置另一侧或站点通知。通知时长、位置、圆角与业务内容不是样式参数。
			悬停或 Alt+T 展开会暂停计时；上游普通 Tab 聚焦操作按钮不会暂停，勿依赖它延长操作时间。
		</p>
		<TunerFrame component="sonner" {state} />
	</div>
{/snippet}

<ComponentTuner spec={SONNER_SPEC} {canvas}>{@render children()}</ComponentTuner>
