<script lang="ts">
	import * as NavigationMenu from "$lib/registry/ui/navigation-menu/index.js";
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { NAVIGATION_MENU_SPEC } from "./navigation-menu-tuning.js";
	import type { Snippet } from "svelte";

	type Pane = "current" | "before";
	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let sheets = $state({ current: false, before: false });
	let widths = $state({ current: 0, before: 0 });
	let panels = $state({
		current: { shared: "guide", inline: "components" },
		before: { shared: "guide", inline: "components" },
	});
	const destinations = [
		{ key: "overview", label: "概览", text: "当前页面：本地导航概览。" },
		{ key: "guide", label: "使用指南", text: "从真实链接进入指南栏目；触发器本身不跳转。" },
		{ key: "setup", label: "安装步骤", text: "安装与配置内容仅在当前画布演示，不请求外部地址。" },
		{ key: "components", label: "组件目录", text: "查看组件目录，或切换到指南面板。" },
		{ key: "patterns", label: "组合示例", text: "组合示例的锚点目标也在所属画布中。" },
	] as const;
	const href = (pane: Pane, key: string) => `#${id}-${pane}-${key}`;
</script>

{#snippet canvas(pane: Pane)}
	<div class="navigation-canvas" bind:clientWidth={widths[pane]} data-navigation-menu-canvas>
		<p class="mb-4 text-sm text-muted-foreground">
			站点主导航 · 两种 viewport 布局；悬停或用方向键切换指南／组件面板。
		</p>
		{#if widths[pane] >= 632}
			<div class="desktop-navigation min-w-0">
				{#each [true, false] as viewport (viewport)}
					<section
						class="min-w-0 pb-64"
						aria-label={viewport ? "共享 viewport 示例" : "独立面板示例"}
					>
						<p class="mb-3 text-xs text-muted-foreground">viewport={String(viewport)}</p>
						<NavigationMenu.Root
							{viewport}
							value={panels[pane][viewport ? "shared" : "inline"]}
							onValueChange={(value) => (panels[pane][viewport ? "shared" : "inline"] = value)}
							aria-label={viewport ? "共享视口导航" : "独立面板导航"}
						>
							<NavigationMenu.List>
								<NavigationMenu.Item
									><NavigationMenu.Link href={href(pane, "overview")} active
										>概览</NavigationMenu.Link
									></NavigationMenu.Item
								>
								<NavigationMenu.Item value="guide">
									<NavigationMenu.Trigger>指南</NavigationMenu.Trigger>
									<NavigationMenu.Content>
										<div class="grid min-w-0 gap-2">
											<NavigationMenu.Link href={href(pane, "guide")}>使用指南</NavigationMenu.Link>
											<NavigationMenu.Link href={href(pane, "setup")}>安装步骤</NavigationMenu.Link>
										</div>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
								<NavigationMenu.Item value="components">
									<NavigationMenu.Trigger>组件</NavigationMenu.Trigger>
									<NavigationMenu.Content>
										<div class="grid min-w-0 gap-2">
											<NavigationMenu.Link href={href(pane, "components")}
												>组件目录</NavigationMenu.Link
											>
											<NavigationMenu.Link href={href(pane, "patterns")}
												>组合示例</NavigationMenu.Link
											>
										</div>
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							</NavigationMenu.List>
						</NavigationMenu.Root>
					</section>
				{/each}
			</div>
		{:else}
			<div class="mobile-navigation">
				<Sheet.Root bind:open={sheets[pane]}>
					<Sheet.Trigger class={buttonVariants({ variant: "outline" })}>打开站点导航</Sheet.Trigger>
					<Sheet.Content portalProps={{ disabled: true }} side="left" class="overflow-y-auto">
						<Sheet.Header
							><Sheet.Title>站点导航</Sheet.Title><Sheet.Description
								>与桌面导航相同的本地链接。</Sheet.Description
							></Sheet.Header
						>
						<nav aria-label="移动站点导航" class="grid min-w-0 gap-3 px-4 pb-6">
							{#each destinations as destination (destination.key)}
								<a
									href={href(pane, destination.key)}
									aria-current={destination.key === "overview" ? "page" : undefined}
									class="rounded-md border p-3 text-sm underline-offset-4 hover:underline"
									onclick={() => (sheets[pane] = false)}>{destination.label}</a
								>
							{/each}
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		{/if}
		<div class="mt-6 grid min-w-0 gap-3">
			{#each destinations as destination (destination.key)}
				<section
					id={`${id}-${pane}-${destination.key}`}
					tabindex="-1"
					aria-label={destination.label}
					class="min-w-0 scroll-mt-6 rounded-lg border p-4 -outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
				>
					<h3 class="text-sm font-medium">{destination.label}</h3>
					<p class="mt-2 text-sm text-muted-foreground">{destination.text}</p>
				</section>
			{/each}
		</div>
	</div>
{/snippet}

<ComponentTuner spec={NAVIGATION_MENU_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.navigation-canvas {
		position: relative;
		min-width: 0;
		min-height: 720px;
		padding: 20px 16px;
		transform: translateZ(0);
		isolation: isolate;
	}
</style>
