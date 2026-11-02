<script lang="ts">
	import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Item from "$lib/registry/ui/item/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { ITEM_SPEC, ITEM_SIZES } from "./item-tuning.js";
	import type { Snippet } from "svelte";
	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let demo = $state({ current: [] as string[], before: [] as string[] });
	function mark(pane: "current" | "before", key: string) {
		demo[pane] = demo[pane].includes(key)
			? demo[pane].filter((value) => value !== key)
			: [...demo[pane], key];
	}
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p id={`${id}-${pane}-help`} class="text-xs text-muted-foreground">
			三档尺寸分别展示普通、描边、弱化行；媒体、文字和按钮沿用各自组件。操作只更新本行演示标记，不保存业务数据。整行链接与内部按钮分开，避免嵌套交互元素。
		</p>
		{#each ITEM_SIZES as { id: size, label } (size)}
			<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-${size}-title`}>
				<h3 id={`${id}-${pane}-${size}-title`} class="text-sm font-medium">
					{label}尺寸 · 内容列表
				</h3>
				<Item.Group aria-labelledby={`${id}-${pane}-${size}-title`}>
					{#each ["default", "outline", "muted"] as const as variant, index (variant)}
						{@const key = `${size}-${variant}`}
						<Item.Root
							role="listitem"
							{variant}
							size={size === "default" ? undefined : size}
							data-item-sample={key}
							class="min-w-0"
						>
							{#if index === 0}
								<Item.Media variant="icon"><FileTextIcon aria-hidden="true" /></Item.Media>
							{:else if index === 1}
								<Item.Media variant="image"><img src="/avatars/02.png" alt="" /></Item.Media>
							{:else}
								<Item.Media>
									<Avatar.Root size={size === "xs" ? "sm" : "default"}>
										<Avatar.Image src="/avatars/01.png" alt="" />
										<Avatar.Fallback>林</Avatar.Fallback>
									</Avatar.Root>
								</Item.Media>
							{/if}
							<Item.Content class="min-w-0">
								<Item.Title
									>{index === 0
										? "项目说明文档"
										: index === 1
											? "设计参考图片"
											: "林晓 · 设计成员"}</Item.Title
								>
								<Item.Description>
									{index === 0
										? "用于讨论布局、内容层次与交付约定。较长说明沿用组件自身的两行截断，不更改文字层次。"
										: index === 1
											? "本地图片媒体，尺寸与裁切保持当前样式。"
											: "负责项目体验与视觉规范，头像由 Avatar 编辑器统一调整。"}
								</Item.Description>
							</Item.Content>
							<Item.Actions>
								<Button
									size="sm"
									variant="outline"
									aria-label={`${label}尺寸 · ${variant} · 切换标记`}
									aria-pressed={demo[pane].includes(key)}
									onclick={() => mark(pane, key)}
									>{demo[pane].includes(key) ? "已标记" : "标记"}</Button
								>
							</Item.Actions>
						</Item.Root>
						{#if index < 2}<Item.Separator />{/if}
					{/each}
				</Item.Group>
			</section>
		{/each}
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-composition-title`}>
			<h3 id={`${id}-${pane}-composition-title`} class="text-sm font-medium">完整分区与原生链接</h3>
			<Item.Root variant="outline" class="min-w-0">
				<Item.Header><p class="text-xs text-muted-foreground">项目概览 · Header</p></Item.Header>
				<Item.Content class="min-w-0">
					<Item.Title>保留内容与操作的独立层次</Item.Title>
					<Item.Description
						>Header／Footer 与行同宽；它们的内部间距不受行密度旋钮影响。</Item.Description
					>
				</Item.Content>
				<Item.Footer
					><p class="text-xs text-muted-foreground">仅用于本地布局演示 · Footer</p></Item.Footer
				>
			</Item.Root>
			<Item.Root variant="muted" size="sm" class="min-w-0">
				{#snippet child({ props })}
					<a {...props} href={`#${id}-${pane}-help`}>
						<Item.Content class="min-w-0"
							><Item.Title>查看本画布的列表说明</Item.Title></Item.Content
						>
						<Item.Actions><ChevronRightIcon aria-hidden="true" /></Item.Actions>
					</a>
				{/snippet}
			</Item.Root>
		</section>
		<p role="status" class="text-sm text-muted-foreground">
			本画布已标记 {demo[pane].length} 行，未保存业务数据。
		</p>
	</div>
{/snippet}

<ComponentTuner spec={ITEM_SPEC} {canvas}>{@render children()}</ComponentTuner>
