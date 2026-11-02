<script lang="ts">
	import ArrowRightIcon from "@lucide/svelte/icons/arrow-right";
	import BoldIcon from "@lucide/svelte/icons/bold";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { Toggle } from "$lib/registry/ui/toggle/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TOGGLE_SIZES, TOGGLE_SPEC } from "./toggle-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const variants = ["default", "outline"] as const;
	function initial() {
		return Object.fromEntries(
			TOGGLE_SIZES.flatMap(({ id }) =>
				variants.flatMap((variant) =>
					["text", "start", "end", "icon"].map((kind) => [
						`${id}-${variant}-${kind}`,
						kind === "start",
					])
				)
			)
		);
	}
	let states = $state({ current: initial(), before: initial() });
	let groups = $state({
		current: { joined: "left", spaced: "left" },
		before: { joined: "left", spaced: "left" },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-sm text-muted-foreground">
			按空格或回车切换按下状态；横向内边距只调整没有图标的一侧。
		</p>
		{#each TOGGLE_SIZES as size (size.id)}
			<section class="grid min-w-0 gap-3" aria-label={`${size.label}尺寸`}>
				<h3 class="text-sm font-medium">{size.label}尺寸</h3>
				{#each variants as variant (variant)}
					<div
						data-toggle-sample={`${size.id}-${variant}`}
						class="flex min-w-0 flex-wrap items-center gap-3"
					>
						<Toggle
							size={size.id}
							{variant}
							bind:pressed={states[pane][`${size.id}-${variant}-text`]}>文字</Toggle
						>
						<Toggle
							size={size.id}
							{variant}
							bind:pressed={states[pane][`${size.id}-${variant}-start`]}
							><BoldIcon data-icon="inline-start" />加粗</Toggle
						>
						<Toggle
							size={size.id}
							{variant}
							bind:pressed={states[pane][`${size.id}-${variant}-end`]}
							>继续<ArrowRightIcon data-icon="inline-end" /></Toggle
						>
						<Toggle
							size={size.id}
							{variant}
							aria-label="仅图标加粗"
							bind:pressed={states[pane][`${size.id}-${variant}-icon`]}><BoldIcon /></Toggle
						>
					</div>
				{/each}
			</section>
		{/each}
		<section class="grid min-w-0 gap-3" aria-label="禁用与错误示例">
			<h3 class="text-sm font-medium">禁用与错误</h3>
			<div class="flex flex-wrap gap-3">
				<Toggle disabled>禁用未按下</Toggle>
				<Toggle disabled pressed variant="outline">禁用已按下</Toggle>
				<Toggle variant="outline" aria-invalid="true" aria-describedby={`${id}-${pane}-error`}
					>错误外观</Toggle
				>
			</div>
			<p id={`${id}-${pane}-error`} class="text-sm text-destructive">
				固定校验外观示例，不改变按钮的切换行为。
			</p>
		</section>
		<section class="grid min-w-0 gap-3" aria-label="共享尺寸的 Toggle Group">
			<h3 class="text-sm font-medium">共同尺寸如何影响按钮组</h3>
			<p class="text-sm text-muted-foreground">
				两组均继承默认高度和图文间距；拼接组保留自己的留白与端点圆角。
			</p>
			{#each ["joined", "spaced"] as sample (sample)}
				<div class="min-w-0 overflow-x-auto p-1">
					<ToggleGroup.Root
						type="single"
						variant="outline"
						spacing={sample === "joined" ? 0 : 2}
						bind:value={groups[pane][sample as "joined" | "spaced"]}
						aria-label={sample === "joined" ? "拼接对齐" : "分离对齐"}
					>
						<ToggleGroup.Item value="left">左对齐</ToggleGroup.Item>
						<ToggleGroup.Item value="center" disabled>居中</ToggleGroup.Item>
						<ToggleGroup.Item value="right">右对齐</ToggleGroup.Item>
					</ToggleGroup.Root>
				</div>
			{/each}
		</section>
	</div>
{/snippet}

<ComponentTuner spec={TOGGLE_SPEC} {canvas}>{@render children()}</ComponentTuner>
