<script lang="ts">
	import FolderIcon from "@lucide/svelte/icons/folder";
	import * as Breadcrumb from "$lib/registry/ui/breadcrumb/index.js";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { BREADCRUMB_SPEC } from "./breadcrumb-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let opened = $state({ current: false, before: false });
	const destinations = [
		{ key: "home", label: "首页" },
		{ key: "library", label: "组件库" },
		{ key: "navigation", label: "导航" },
	] as const;
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			原生链接跳转到本画布的独立锚点，不访问外部站点。当前页不可点击；省略号通过真实菜单展开。
		</p>
		<section class="grid min-w-0 gap-3" aria-label="完整面包屑">
			<h3 class="text-sm font-medium">完整路径 · 自动换行</h3>
			<Breadcrumb.Root aria-label="完整文档路径">
				<Breadcrumb.List>
					{#each destinations as destination (destination.key)}
						<Breadcrumb.Item>
							{#if destination.key === "home"}<FolderIcon
									aria-hidden="true"
									class="size-4 shrink-0"
								/>{/if}
							<Breadcrumb.Link href={`#${id}-${pane}-${destination.key}`}
								>{destination.label}</Breadcrumb.Link
							>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
					{/each}
					<Breadcrumb.Item><Breadcrumb.Page>面包屑</Breadcrumb.Page></Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</section>
		<section class="grid min-w-0 gap-3" aria-label="折叠面包屑">
			<h3 class="text-sm font-medium">首项与末两级 · Ellipsis 菜单</h3>
			<Breadcrumb.Root aria-label="折叠文档路径">
				<Breadcrumb.List>
					<Breadcrumb.Item
						><Breadcrumb.Link href={`#${id}-${pane}-home`}>首页</Breadcrumb.Link></Breadcrumb.Item
					>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<DropdownMenu.Root bind:open={opened[pane]}>
							<DropdownMenu.Trigger
								aria-label="展开中间路径"
								class="rounded-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
							>
								<Breadcrumb.Ellipsis label="展开中间路径" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								<DropdownMenu.Item>
									{#snippet child({ props })}<a {...props} href={`#${id}-${pane}-library`}>组件库</a
										>{/snippet}
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item
						><Breadcrumb.Link href={`#${id}-${pane}-navigation`}>导航</Breadcrumb.Link
						></Breadcrumb.Item
					>
					<Breadcrumb.Separator />
					<Breadcrumb.Item><Breadcrumb.Page>面包屑</Breadcrumb.Page></Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</section>
		<div class="grid min-w-0 gap-3">
			{#each destinations as destination (destination.key)}
				<section
					id={`${id}-${pane}-${destination.key}`}
					tabindex="-1"
					aria-label={`${destination.label}画布锚点`}
					class="min-w-0 rounded-md border p-3 text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
				>
					<h3 class="font-medium">{destination.label}</h3>
					<p class="text-xs text-muted-foreground">
						这是本画布的「{destination.label}」目标；链接保留浏览器原生锚点行为。
					</p>
				</section>
			{/each}
		</div>
	</div>
{/snippet}

<ComponentTuner spec={BREADCRUMB_SPEC} {canvas}>{@render children()}</ComponentTuner>
