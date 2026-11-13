<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import CheckIcon from "@lucide/svelte/icons/check";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BADGE_SPEC } from "./badge-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const variants = [
		{ value: "default", label: "默认", text: "已发布" },
		{ value: "secondary", label: "次要", text: "草稿" },
		{ value: "destructive", label: "危险", text: "已失败" },
		{ value: "outline", label: "描边", text: "待审核" },
		{ value: "ghost", label: "幽灵", text: "已归档" },
		{ value: "link", label: "链接", text: "文档" },
	] as const;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			Badge 是简短标记，不执行按钮操作。图标一侧保留样式自带留白；带链接的标记可用 Tab 聚焦、Enter
			跳转。
		</p>
		{#each variants as variant (variant.value)}
			<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-${variant.value}`}>
				<h3 id={`${id}-${pane}-${variant.value}`} class="text-xs text-muted-foreground">
					{variant.label} · {variant.value}
				</h3>
				<div class="flex min-w-0 flex-wrap items-center gap-3">
					<Badge variant={variant.value}>{variant.text}</Badge>
					<Badge variant={variant.value}>
						<CheckIcon data-icon="inline-start" aria-hidden="true" />
						{variant.text}
					</Badge>
					<Badge variant={variant.value}>
						{variant.text}
						<CheckIcon data-icon="inline-end" aria-hidden="true" />
					</Badge>
					<Badge variant={variant.value} href={`#${id}-${pane}-details`}>
						查看说明
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Badge>
				</div>
			</section>
		{/each}
		<p
			id={`${id}-${pane}-details`}
			tabindex="-1"
			class="rounded-md border p-3 text-xs text-muted-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
		>
			画布说明：链接仅跳转到本画布；高度、上下留白、图标大小、颜色和字体沿用组件库。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={BADGE_SPEC} {canvas}>{@render children()}</ComponentTuner>
