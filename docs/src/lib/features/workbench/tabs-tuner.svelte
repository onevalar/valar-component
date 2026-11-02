<script lang="ts">
	import LayersIcon from "@lucide/svelte/icons/layers";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { TABS_SPEC } from "./tabs-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	const orientations = ["horizontal", "vertical"] as const;
	const variants = ["default", "line"] as const;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-8 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			用方向键切换标签；禁用项会跳过。内边距的“统一”档位同时作用于两个方向与图标标签。
		</p>
		{#each orientations as orientation (orientation)}
			{#each variants as variant (variant)}
				<section class="grid min-w-0 gap-3" aria-label={`${orientation} ${variant}`}>
					<h3 class="text-sm font-medium">
						{orientation === "horizontal" ? "水平" : "垂直"} · {variant === "default"
							? "默认"
							: "线型"}
					</h3>
					<div class="min-w-0 overflow-x-auto p-1 pb-3">
						<Tabs.Root value="overview" {orientation} class="min-w-0">
							<Tabs.List
								{variant}
								aria-label={`${orientation === "horizontal" ? "水平" : "垂直"}${variant === "default" ? "默认" : "线型"}示例`}
							>
								<Tabs.Trigger
									id={`${id}-${pane}-${orientation}-${variant}-overview-tab`}
									value="overview"
								>
									<LayersIcon data-icon="inline-start" />
									概览
								</Tabs.Trigger>
								<Tabs.Trigger
									id={`${id}-${pane}-${orientation}-${variant}-settings-tab`}
									value="settings"
								>
									设置
									<SettingsIcon data-icon="inline-end" />
								</Tabs.Trigger>
								<Tabs.Trigger
									id={`${id}-${pane}-${orientation}-${variant}-disabled-tab`}
									value="disabled"
									disabled
								>
									禁用
								</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content
								id={`${id}-${pane}-${orientation}-${variant}-overview-panel`}
								value="overview"
								class="min-w-0 break-words"
							>
								<p class="text-muted-foreground">组件概览与最近更新。</p>
							</Tabs.Content>
							<Tabs.Content
								id={`${id}-${pane}-${orientation}-${variant}-settings-panel`}
								value="settings"
								class="min-w-0 break-words"
							>
								<p class="text-muted-foreground">管理通知与显示偏好。</p>
							</Tabs.Content>
							<Tabs.Content
								id={`${id}-${pane}-${orientation}-${variant}-disabled-panel`}
								value="disabled"
								class="min-w-0"
							>
								此标签当前不可用。
							</Tabs.Content>
						</Tabs.Root>
					</div>
				</section>
			{/each}
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={TABS_SPEC} {canvas}>{@render children()}</ComponentTuner>
