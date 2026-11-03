<script lang="ts">
	import FileTextIcon from "@lucide/svelte/icons/file-text";
	import * as Menubar from "$lib/registry/ui/menubar/index.js";
	import * as Sheet from "$lib/registry/ui/sheet/index.js";
	import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { MENUBAR_SPEC } from "./menubar-tuning.js";
	import type { Snippet } from "svelte";

	type Pane = "current" | "before";
	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let menus = $state({ current: "", before: "" });
	let sheets = $state({ current: false, before: false });
	let statusBar = $state({ current: true, before: true });
	let zoom = $state({ current: "100", before: "100" });
	let message = $state({ current: "尚未执行操作", before: "尚未执行操作" });
	let canvases = $state<Record<Pane, HTMLElement | null>>({ current: null, before: null });
	let widths = $state({ current: 0, before: 0 });
	const actions = [
		{ label: "新建文稿", feedback: "已新建本地文稿" },
		{ label: "保存副本", feedback: "已在画布中保存副本" },
	] as const;
</script>

{#snippet canvas(pane: Pane)}
	<div
		class="menubar-canvas"
		bind:this={canvases[pane]}
		bind:clientWidth={widths[pane]}
		data-menubar-canvas
	>
		<p class="mb-4 text-sm text-muted-foreground">
			本地文稿 · 桌面菜单支持方向键与悬停切换；窄画布使用操作抽屉。
		</p>
		{#if widths[pane] >= 632}
			<div class="desktop-menu min-w-0">
				<Menubar.Root
					value={menus[pane]}
					onValueChange={(value) => (menus[pane] = value)}
					aria-label="文稿操作菜单"
				>
					<Menubar.Menu value="file">
						<Menubar.Trigger>文件</Menubar.Trigger>
						<Menubar.Content
							portalProps={{ disabled: true }}
							strategy="absolute"
							collisionBoundary={canvases[pane] ?? []}
							collisionPadding={12}
							trapFocus={false}
							preventScroll={false}
						>
							<Menubar.Group>
								<Menubar.GroupHeading>本地文稿</Menubar.GroupHeading>
								{#each actions as action (action.label)}
									<Menubar.Item onSelect={() => (message[pane] = action.feedback)}
										><FileTextIcon />{action.label}</Menubar.Item
									>
								{/each}
								<Menubar.Item disabled>打印（不可用）</Menubar.Item>
								<Menubar.Sub>
									<Menubar.SubTrigger>打开最近文稿</Menubar.SubTrigger>
									<Menubar.SubContent
										portalProps={{ disabled: true }}
										side={widths[pane] < 760 ? "bottom" : "right"}
										align={widths[pane] < 760 ? "end" : "start"}
										strategy="absolute"
										collisionBoundary={canvases[pane] ?? []}
										collisionPadding={12}
									>
										<Menubar.Item onSelect={() => (message[pane] = "已打开：设计说明")}
											>设计说明</Menubar.Item
										>
										<Menubar.Item onSelect={() => (message[pane] = "已打开：会议记录")}
											>会议记录</Menubar.Item
										>
									</Menubar.SubContent>
								</Menubar.Sub>
							</Menubar.Group>
						</Menubar.Content>
					</Menubar.Menu>
					<Menubar.Menu value="edit">
						<Menubar.Trigger>编辑</Menubar.Trigger>
						<Menubar.Content
							portalProps={{ disabled: true }}
							strategy="absolute"
							collisionBoundary={canvases[pane] ?? []}
							collisionPadding={12}
							trapFocus={false}
							preventScroll={false}
						>
							<Menubar.Item onSelect={() => (message[pane] = "已复制文稿标题（本地模拟）")}
								>复制标题</Menubar.Item
							>
							<Menubar.Item inset onSelect={() => (message[pane] = "已选中全部文稿内容")}
								>全选文稿</Menubar.Item
							>
							<Menubar.Item disabled>撤销（暂无操作）</Menubar.Item>
						</Menubar.Content>
					</Menubar.Menu>
					<Menubar.Menu value="view">
						<Menubar.Trigger>视图</Menubar.Trigger>
						<Menubar.Content
							portalProps={{ disabled: true }}
							strategy="absolute"
							collisionBoundary={canvases[pane] ?? []}
							collisionPadding={12}
							trapFocus={false}
							preventScroll={false}
						>
							<Menubar.CheckboxItem bind:checked={statusBar[pane]}>显示状态栏</Menubar.CheckboxItem>
							<Menubar.Separator />
							<Menubar.RadioGroup bind:value={zoom[pane]}>
								<Menubar.GroupHeading inset>文稿缩放</Menubar.GroupHeading>
								<Menubar.RadioItem value="100">100%</Menubar.RadioItem>
								<Menubar.RadioItem value="125">125%</Menubar.RadioItem>
								<Menubar.RadioItem value="150" disabled>150%（不可用）</Menubar.RadioItem>
							</Menubar.RadioGroup>
						</Menubar.Content>
					</Menubar.Menu>
				</Menubar.Root>
			</div>
		{:else}
			<div class="mobile-menu">
				<Sheet.Root bind:open={sheets[pane]}>
					<Sheet.Trigger class={buttonVariants({ variant: "outline" })}
						>文件／编辑／视图</Sheet.Trigger
					>
					<Sheet.Content portalProps={{ disabled: true }} side="left" class="overflow-y-auto">
						<Sheet.Header>
							<Sheet.Title>文稿操作</Sheet.Title>
							<Sheet.Description>与桌面菜单相同的本地操作，不执行网络请求。</Sheet.Description>
						</Sheet.Header>
						<div class="grid min-w-0 gap-4 px-4 pb-6">
							<section class="grid gap-2" aria-label="文件">
								<h3 class="text-sm font-medium">文件</h3>
								{#each actions as action (action.label)}<Button
										variant="outline"
										onclick={() => (message[pane] = action.feedback)}>{action.label}</Button
									>{/each}
								<Button variant="outline" disabled>打印（不可用）</Button>
								{#each ["设计说明", "会议记录"] as title (title)}<Button
										variant="ghost"
										onclick={() => (message[pane] = `已打开：${title}`)}>打开：{title}</Button
									>{/each}
							</section>
							<section class="grid gap-2" aria-label="编辑">
								<h3 class="text-sm font-medium">编辑</h3>
								<Button
									variant="outline"
									onclick={() => (message[pane] = "已复制文稿标题（本地模拟）")}>复制标题</Button
								>
								<Button variant="outline" onclick={() => (message[pane] = "已选中全部文稿内容")}
									>全选文稿</Button
								>
								<Button variant="outline" disabled>撤销（暂无操作）</Button>
							</section>
							<section class="grid gap-3" aria-label="视图">
								<h3 class="text-sm font-medium">视图</h3>
								<label class="flex items-center gap-2 text-sm"
									><input type="checkbox" bind:checked={statusBar[pane]} />显示状态栏</label
								>
								<label class="grid gap-2 text-sm" for={`${id}-${pane}-zoom`}>文稿缩放</label>
								<select
									id={`${id}-${pane}-zoom`}
									bind:value={zoom[pane]}
									class="min-w-0 rounded-md border bg-background p-2"
									><option value="100">100%</option><option value="125">125%</option><option
										value="150"
										disabled>150%（不可用）</option
									></select
								>
							</section>
							<p role="status" class="text-sm text-muted-foreground">{message[pane]}</p>
						</div>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		{/if}
		<div class={["min-w-0 rounded-lg border p-4", widths[pane] >= 632 ? "mt-80" : "mt-6"]}>
			<h3 class="font-medium">设计说明</h3>
			<p class="mt-2 text-sm text-muted-foreground">所有操作仅改变所属画布的演示状态。</p>
			<p role="status" class="mt-3 text-sm">{message[pane]} · 文稿缩放 {zoom[pane]}%</p>
			{#if statusBar[pane]}<p class="mt-2 text-xs text-muted-foreground">
					状态栏 · 本地文稿 · 已就绪
				</p>{/if}
		</div>
	</div>
{/snippet}

<ComponentTuner spec={MENUBAR_SPEC} {canvas}>{@render children()}</ComponentTuner>

<style>
	.menubar-canvas {
		position: relative;
		min-width: 0;
		min-height: 760px;
		padding: 20px 16px;
		/* A fixed Sheet and its disabled portal remain in this pane, not over the editor. */
		transform: translateZ(0);
		isolation: isolate;
	}
</style>
