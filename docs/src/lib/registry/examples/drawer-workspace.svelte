<script lang="ts">
	import MenuIcon from "@lucide/svelte/icons/menu";
	import XIcon from "@lucide/svelte/icons/x";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Drawer from "$lib/registry/ui/drawer/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";

	const groups = [
		{
			label: ["快捷入口", "Shortcuts"],
			items: [
				["收件箱", "Inbox"],
				["我的问题", "My issues"],
				["Agent", "Agent"],
				["收藏", "Favorites"],
			],
		},
		{
			label: ["工作区", "Workspace"],
			items: [
				["项目", "Projects"],
				["视图", "Views"],
				["文档", "Documents"],
				["动态", "Pulse"],
			],
		},
		{
			label: ["我的团队", "Your teams"],
			items: [
				["设计", "Design"],
				["工程", "Engineering"],
				["站点", "Website"],
				["基础设施", "Infrastructure"],
			],
		},
		{
			label: ["管理", "Administration"],
			items: [
				["通知", "Notifications"],
				["工作流", "Workflows"],
				["安全与访问", "Security & access"],
				["设置", "Settings"],
			],
		},
	];
	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let open = $state(false);
	let current = $state(["我的问题", "My issues"]);
</script>

<Drawer.Root direction="left" bind:open autoFocus shouldScaleBackground={false}>
	<div class="flex min-w-0 flex-wrap items-center justify-between gap-3">
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="outline" size="sm">
					<MenuIcon aria-hidden="true" />
					{text("打开工作区菜单", "Open workspace menu")}
				</Button>
			{/snippet}
		</Drawer.Trigger>
		<p role="status" class="min-w-0 text-[13px] text-muted-foreground wrap-anywhere">
			{text("当前视图", "Current view")} · {text(current[0], current[1])}
		</p>
	</div>
	<Drawer.Content appearance="workspace">
		<Drawer.Header class="shrink-0 flex-row items-center justify-between gap-2 py-3">
			<div class="flex min-w-0 items-center gap-2">
				<span
					aria-hidden="true"
					class="grid size-5 shrink-0 place-items-center rounded-md bg-foreground text-[11px] text-background"
					>V</span
				>
				<Drawer.Title class="truncate text-[13px] font-semibold"
					>{text("工作区导航", "Workspace navigation")}</Drawer.Title
				>
			</div>
			<Drawer.Description class="sr-only"
				>{text("选择工作区视图。", "Choose a workspace view.")}</Drawer.Description
			>
			<Drawer.Close>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="ghost"
						size="icon-sm"
						aria-label={text("关闭工作区菜单", "Close workspace menu")}
					>
						<XIcon aria-hidden="true" />
					</Button>
				{/snippet}
			</Drawer.Close>
		</Drawer.Header>
		<ScrollArea.Root
			class="min-h-0 flex-1"
			type="hover"
			data-vaul-no-drag
			viewportLabel={text("滚动工作区菜单", "Scroll workspace menu")}
		>
			<nav aria-label={text("工作区视图", "Workspace views")} class="grid gap-4 px-3 pb-3">
				{#each groups as { label, items } (label[1])}
					<section aria-label={text(label[0], label[1])}>
						<h3 class="mb-1 px-2 text-xs font-medium text-muted-foreground">
							{text(label[0], label[1])}
						</h3>
						<ul class="grid gap-0.5">
							{#each items as [zh, en] (en)}
								<li>
									<Button
										variant={current[1] === en ? "secondary" : "ghost"}
										size="sm"
										shape="square"
										class="w-full justify-start rounded-lg px-2 text-[13px]"
										aria-current={current[1] === en ? "page" : undefined}
										onclick={() => {
											current = [zh, en];
											open = false;
										}}>{text(zh, en)}</Button
									>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</nav>
		</ScrollArea.Root>
	</Drawer.Content>
</Drawer.Root>
