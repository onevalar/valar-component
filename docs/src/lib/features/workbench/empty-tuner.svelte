<script lang="ts">
	import SearchIcon from "@lucide/svelte/icons/search";
	import * as Avatar from "$lib/registry/ui/avatar/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { EMPTY_SPEC } from "./empty-tuning.js";
	import type { Snippet } from "svelte";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	let demo = $state({
		current: { filtersCleared: false, draftCreated: false, inviteReady: false },
		before: { filtersCleared: false, draftCreated: false, inviteReady: false },
	});
</script>

{#snippet canvas(pane: "current" | "before")}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			图标、无媒体与默认媒体三种空状态。按钮只更新当前画布的本地反馈，不创建项目、不发送邀请，也不执行外部操作。
		</p>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-icon`}>
			<h3 id={`${id}-${pane}-icon`} class="text-xs text-muted-foreground">图标媒体 · 搜索无结果</h3>
			<Empty.Root
				class="border"
				aria-labelledby={`${id}-${pane}-search-title`}
				aria-describedby={`${id}-${pane}-search-description`}
			>
				<Empty.Header class="min-w-0">
					<Empty.Media variant="icon"><SearchIcon aria-hidden="true" /></Empty.Media>
					<Empty.Title><h4 id={`${id}-${pane}-search-title`}>没有匹配的结果</h4></Empty.Title>
					<Empty.Description id={`${id}-${pane}-search-description`}>
						当前关键词、负责人和时间范围的组合没有找到项目。可以清除筛选后重新查找，或尝试更宽泛的关键词；这里的操作仅用于演示本地反馈。
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<div class="flex min-w-0 flex-wrap justify-center">
						<Button
							type="button"
							onclick={() => (demo[pane].filtersCleared = !demo[pane].filtersCleared)}
						>
							{demo[pane].filtersCleared ? "恢复筛选" : "清除筛选"}
						</Button>
					</div>
					<p role="status" class="text-sm text-muted-foreground">
						{demo[pane].filtersCleared ? "已清除本画布的演示筛选，未查询任何数据。" : ""}
					</p>
				</Empty.Content>
			</Empty.Root>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-no-media`}>
			<h3 id={`${id}-${pane}-no-media`} class="text-xs text-muted-foreground">无媒体 · 尚无内容</h3>
			<Empty.Root
				aria-labelledby={`${id}-${pane}-project-title`}
				aria-describedby={`${id}-${pane}-project-description`}
			>
				<Empty.Header class="min-w-0">
					<Empty.Title><h4 id={`${id}-${pane}-project-title`}>还没有项目</h4></Empty.Title>
					<Empty.Description id={`${id}-${pane}-project-description`}>
						先准备一个项目草稿，再补充名称与说明。此处只展示下一步提示，不会写入组件库或保存业务数据。
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<div class="flex min-w-0 flex-wrap justify-center">
						<Button
							type="button"
							onclick={() => (demo[pane].draftCreated = !demo[pane].draftCreated)}
						>
							{demo[pane].draftCreated ? "重置演示" : "准备草稿"}
						</Button>
					</div>
					<p role="status" class="text-sm text-muted-foreground">
						{demo[pane].draftCreated ? "演示草稿已就绪：下一步填写项目名称，未实际创建项目。" : ""}
					</p>
				</Empty.Content>
			</Empty.Root>
		</section>
		<section class="min-w-0 space-y-3" aria-labelledby={`${id}-${pane}-default-media`}>
			<h3 id={`${id}-${pane}-default-media`} class="text-xs text-muted-foreground">
				默认媒体 · 头像组合
			</h3>
			<Empty.Root
				aria-labelledby={`${id}-${pane}-team-title`}
				aria-describedby={`${id}-${pane}-team-description`}
			>
				<Empty.Header class="min-w-0">
					<Empty.Media variant="default">
						<Avatar.Root aria-hidden="true">
							<Avatar.Image src="/avatars/01.png" alt="" />
							<Avatar.Fallback>林</Avatar.Fallback>
						</Avatar.Root>
					</Empty.Media>
					<Empty.Title><h4 id={`${id}-${pane}-team-title`}>还没有协作成员</h4></Empty.Title>
					<Empty.Description id={`${id}-${pane}-team-description`}>
						邀请同事前，先确认需要共享的项目和访问权限。头像沿用 Avatar 的默认尺寸与圆角，不随 Empty
						的参数改变。
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<div class="flex min-w-0 flex-wrap justify-center">
						<Button
							type="button"
							onclick={() => (demo[pane].inviteReady = !demo[pane].inviteReady)}
						>
							{demo[pane].inviteReady ? "收起提示" : "邀请须知"}
						</Button>
					</div>
					<p role="status" class="text-sm text-muted-foreground">
						{demo[pane].inviteReady
							? "下一步：在实际项目中选择成员与权限；本画布不会发送邀请。"
							: ""}
					</p>
				</Empty.Content>
			</Empty.Root>
		</section>
	</div>
{/snippet}

<ComponentTuner spec={EMPTY_SPEC} {canvas}>{@render children()}</ComponentTuner>
