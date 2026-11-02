<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CARD_SPEC } from "./card-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let names = $state({ current: "设计系统", before: "设计系统" });
	let saved = $state({ current: false, before: false });
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="@container grid min-w-0 gap-6 p-4 md:p-6">
		<div class="grid min-w-0 gap-6 @[46rem]:grid-cols-2">
			{#each ["default", "sm"] as size (size)}
				<section
					class="min-w-0 space-y-3"
					aria-label={size === "sm" ? "小尺寸卡片" : "默认尺寸卡片"}
				>
					<p class="text-xs text-muted-foreground">
						{size === "sm" ? "小尺寸 · sm" : "默认尺寸 · default"}
					</p>
					<Card.Root size={size as "default" | "sm"}>
						<Card.Header>
							<Card.Title><h3>项目设置</h3></Card.Title>
							<Card.Description>统一团队的组件与设计规范。</Card.Description>
							<Card.Action><Badge variant="secondary">草稿</Badge></Card.Action>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-2">
								<Label for={`${id}-${pane}-${size}`}>项目名称</Label>
								<Input
									id={`${id}-${pane}-${size}`}
									bind:value={names[pane]}
									oninput={() => (saved[pane] = false)}
								/>
							</div>
						</Card.Content>
						<Card.Footer class="flex-wrap gap-2">
							<Button onclick={() => (saved[pane] = true)}>保存设置</Button>
							<span class="text-xs text-muted-foreground" role="status"
								>{saved[pane] ? "已保存预览" : "仅此画布生效"}</span
							>
						</Card.Footer>
					</Card.Root>
				</section>
			{/each}
		</div>
		<section class="min-w-0 space-y-3" aria-label="贴边与图片卡片">
			<p class="text-xs text-muted-foreground">图片、分隔线与贴边内容</p>
			<Card.Root data-card-edge>
				<img src="/favicon.svg" alt="Valar 标志" class="h-20 w-full bg-muted object-contain" />
				<Card.Header class="border-b">
					<Card.Title><h3>组件使用约定</h3></Card.Title>
					<Card.Description>留白变化时，贴边内容仍与卡片边缘对齐。</Card.Description>
				</Card.Header>
				<Card.Content class="-mb-(--card-spacing)">
					<div
						data-card-bleed
						class="-mx-(--card-spacing) border-t bg-muted/50 px-(--card-spacing) py-4"
					>
						优先复用组件，颜色与字号跟随全局 token。
					</div>
				</Card.Content>
				<Card.Footer class="border-t"><Button variant="outline">查看规范</Button></Card.Footer>
			</Card.Root>
		</section>
	</div>
{/snippet}

<ComponentTuner spec={CARD_SPEC} {canvas}>{@render children()}</ComponentTuner>
