<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { SEPARATOR_SPEC } from "./separator-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	let states = $state({ current: { decorative: false }, before: { decorative: false } });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			粗细分横向／纵向编辑；长度和父级高度由场景决定，颜色继续使用全局 border
			token。装饰模式不保存为样式。
		</p>
		<div>
			<Button
				variant="outline"
				aria-pressed={states[pane].decorative}
				onclick={() => (states[pane].decorative = !states[pane].decorative)}
			>
				{states[pane].decorative ? "切换为语义分隔" : "切换为装饰分隔"}
			</Button>
		</div>
		<section class="grid min-w-0 gap-4 text-sm" aria-label="可切换语义的分隔线">
			<h3 class="font-medium">{states[pane].decorative ? "装饰分隔" : "语义分隔"} · 横向与纵向</h3>
			<p>账户信息</p>
			<Separator decorative={states[pane].decorative} orientation="horizontal" />
			<p>通知偏好</p>
			<div class="flex min-h-16 min-w-0 items-stretch gap-4">
				<span class="min-w-0 flex-1 break-words">个人资料</span>
				<Separator decorative={states[pane].decorative} orientation="vertical" />
				<span class="min-w-0 flex-1 break-words">团队权限</span>
			</div>
		</section>
		<section class="grid min-w-0 gap-4 text-sm" aria-label="纯装饰分隔线">
			<h3 class="font-medium">纯装饰 · 读屏忽略</h3>
			<Separator decorative orientation="horizontal" />
			<div class="flex min-h-12 min-w-0 items-stretch gap-4">
				<span class="min-w-0 flex-1">已更新</span>
				<Separator decorative orientation="vertical" />
				<span class="min-w-0 flex-1">今天</span>
			</div>
		</section>
		<p role="status" class="text-xs text-muted-foreground">
			第一组分隔线：{states[pane].decorative
				? "纯装饰，无 separator 角色。"
				: "保留 separator 角色与纵向方向语义。"}
		</p>
	</div>
{/snippet}

<ComponentTuner spec={SEPARATOR_SPEC} {canvas}>{@render children()}</ComponentTuner>
