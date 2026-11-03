<script lang="ts">
	import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
	import AppSidebar from "$lib/registry/blocks/sidebar-07/components/app-sidebar.svelte";
	import { IsMobile } from "$lib/registry/hooks/is-mobile.svelte.js";

	const mobile = new IsMobile();
	let side = $state<"left" | "right">("left");
	let variant = $state<"sidebar" | "floating" | "inset">("sidebar");
	let collapsible = $state<"offcanvas" | "icon" | "none">("icon");
</script>

<div data-sidebar-preview data-side={side} data-variant={variant} data-collapsible={collapsible}>
	<!-- Only a deliberate scenario change remounts the shell; geometry/theme messages do not. -->
	{#key `${side}:${variant}:${collapsible}`}
		<Sidebar.Provider
			persistState={false}
			class={side === "right" ? "flex-row-reverse" : undefined}
		>
			<AppSidebar {side} {variant} {collapsible} />
			<Sidebar.Inset>
				<header class="flex min-h-16 shrink-0 flex-wrap items-center gap-2 border-b px-4 py-3">
					<Sidebar.Trigger />
					<div>
						<h1 class="text-sm font-medium">项目工作台</h1>
						<p class="text-xs text-muted-foreground" data-testid="sidebar-viewport">
							{mobile.current ? "移动预览（≤767px）" : "桌面预览（≥768px）"}
						</p>
					</div>
				</header>
				<section class="flex flex-col gap-4 p-4" aria-label="侧边栏预览场景">
					<div class="flex flex-wrap gap-3 text-xs">
						<label class="grid gap-1">
							位置
							<select bind:value={side} class="rounded-md border bg-background p-1.5">
								<option value="left">左侧</option>
								<option value="right">右侧</option>
							</select>
						</label>
						<label class="grid gap-1">
							外观
							<select bind:value={variant} class="rounded-md border bg-background p-1.5">
								<option value="sidebar">Sidebar</option>
								<option value="floating">Floating</option>
								<option value="inset">Inset</option>
							</select>
						</label>
						<label class="grid gap-1">
							折叠方式
							<select bind:value={collapsible} class="rounded-md border bg-background p-1.5">
								<option value="offcanvas">Offcanvas</option>
								<option value="icon">Icon</option>
								<option value="none">None</option>
							</select>
						</label>
					</div>
					<p class="text-xs text-muted-foreground">
						以上仅切换真实应用场景，不保存为样式参数。Ctrl／⌘+B 或左上角按钮切换侧栏；None
						模式不使用移动抽屉。
					</p>
					<section class="rounded-lg border p-4" aria-labelledby="sidebar-project-heading">
						<h2 id="sidebar-project-heading" class="font-medium">数据加载</h2>
						<p class="mt-2 text-sm text-muted-foreground">
							使用侧栏项目导航、折叠菜单及账户菜单，检查真实键盘、提示与弹层。预览不会保存侧栏展开状态。
						</p>
						<button
							type="button"
							class="mt-4 rounded-md border px-3 py-2 text-sm"
							data-testid="sidebar-main-action"
						>
							主内容操作
						</button>
					</section>
				</section>
			</Sidebar.Inset>
		</Sidebar.Provider>
	{/key}
</div>
