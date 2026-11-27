<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Tabs from "$lib/registry/ui/tabs/index.js";
	import FrameworkUsage from "$lib/components/framework-usage.svelte";
	import Metadata from "$lib/components/metadata.svelte";
	import NativeFrameworkPreview from "$lib/components/native-framework-preview.svelte";
	import PMAddComp from "$lib/components/pm-add-comp.svelte";
	import Agent from "$lib/registry/blocks/agent-01/+page.svelte";
	import Inbox from "$lib/registry/blocks/inbox-01/+page.svelte";
	import MyIssues from "$lib/registry/blocks/my-issues-01/+page.svelte";
	import NewIssue from "$lib/registry/blocks/new-issue-01/+page.svelte";
	import Projects from "$lib/registry/blocks/projects-01/+page.svelte";
	import Settings from "$lib/registry/blocks/settings-01/+page.svelte";
	import { getComponentInfos, toCodeName } from "$lib/agent/knowledge.js";
	import { localeFromPathname, localizeHref } from "$lib/i18n/config.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	let { data } = $props();

	const locale = $derived(localeFromPathname(page.url.pathname));
	const zh = $derived(locale === "zh");
	const scene = $derived(data.scene);
	const title = $derived(scene.title[zh ? "zh" : "en"]);
	const description = $derived(scene.description[zh ? "zh" : "en"]);
	const titles = $derived(
		new Map(getComponentInfos(locale).map((item) => [item.slug, item.title] as const))
	);

	const projectCases = ["sample", "empty", "single"] as const;
	const projectLabels = {
		sample: ["示例数据", "Sample projects"],
		empty: ["空工作区", "Empty workspace"],
		single: ["单团队", "Single team"],
	};
	let projectScenario = $state<(typeof projectCases)[number]>("sample");
	let emptyInbox = $state(false);
	const scenario = $derived(
		scene.slug === "projects"
			? projectScenario
			: scene.slug === "inbox" && emptyInbox
				? "empty"
				: undefined
	);
</script>

<Metadata {title} {description} />

{#snippet samples()}
	{#if scene.slug === "projects"}
		<div role="group" aria-label={zh ? "预览数据" : "Preview data"} class="flex flex-wrap gap-2">
			{#each projectCases as item (item)}
				<Button
					variant={projectScenario === item ? "secondary" : "outline"}
					size="sm"
					aria-pressed={projectScenario === item}
					onclick={() => (projectScenario = item)}
				>
					{projectLabels[item][zh ? 0 : 1]}
				</Button>
			{/each}
		</div>
	{:else if scene.slug === "inbox"}
		<Button
			variant="outline"
			size="sm"
			aria-pressed={emptyInbox}
			onclick={() => (emptyInbox = !emptyInbox)}
		>
			{zh ? "空收件箱" : "Empty inbox"}
		</Button>
	{/if}
{/snippet}

<div class="container-wrapper">
	<div class="container max-w-6xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
		<header class="space-y-4">
			<div>
				<Button href={localizeHref("/docs/ai-elements#scenes", locale)} variant="outline" size="sm">
					<ArrowLeftIcon />
					{zh ? "返回高级组件" : "Back to Advanced components"}
				</Button>
			</div>
			<div class="space-y-2">
				<h1 class="text-3xl font-semibold tracking-tight">{title}</h1>
				<p class="max-w-3xl text-sm text-muted-foreground">{description}</p>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<span class="text-xs font-medium text-muted-foreground">
					{zh ? "所用基础组件：" : "Built with basic components:"}
				</span>
				{#each scene.components as slug (slug)}
					<Badge variant="secondary" href={localizeHref(`/docs/components/${slug}`, locale)}>
						{titles.get(slug) ?? toCodeName(slug)}
					</Badge>
				{/each}
			</div>
		</header>

		<FrameworkUsage slug={scene.blockName}>
			{#snippet nativePreview(framework)}
				{@render samples()}
				<NativeFrameworkPreview {framework} example={scene.blockName} {title} {scenario} tall />
			{/snippet}
			<Tabs.Root value="preview" class="gap-5">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<Tabs.List>
						<Tabs.Trigger value="preview">{zh ? "交互预览" : "Interactive preview"}</Tabs.Trigger>
						<Tabs.Trigger value="install"
							>{zh ? "安装与共享包入口" : "Install & usage"}</Tabs.Trigger
						>
					</Tabs.List>

					{@render samples()}
				</div>

				<Tabs.Content value="preview">
					{#if scene.slug === "my-issues"}
						<MyIssues chinese={zh} />
					{:else if scene.slug === "projects"}
						{#key projectScenario}
							<Projects
								chinese={zh}
								empty={projectScenario === "empty"}
								singleTeam={projectScenario === "single"}
							/>
						{/key}
					{:else if scene.slug === "inbox"}
						{#key emptyInbox}
							<Inbox chinese={zh} empty={emptyInbox} />
						{/key}
					{:else if scene.slug === "new-issue"}
						<NewIssue chinese={zh} />
					{:else if scene.slug === "settings"}
						<Settings chinese={zh} />
					{:else if scene.slug === "agent"}
						<Agent chinese={zh} />
					{/if}
				</Tabs.Content>

				<Tabs.Content value="install" class="space-y-4">
					<Card.Root>
						<Card.Header>
							<Card.Title>{zh ? "通过 CLI 安装区块源码" : "Install via CLI"}</Card.Title>
							<Card.Description>
								{zh
									? "将完整场景区块写入目标项目路由，并自动拉取依赖的基础组件。"
									: "Adds the full scene block and all required basic components into your project."}
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<PMAddComp name={scene.blockName} />
						</Card.Content>
					</Card.Root>
					<Card.Root>
						<Card.Header>
							<Card.Title>{zh ? "从共享 UI 包直接导入" : "Import from @valar/svelte-ui"}</Card.Title
							>
							<Card.Description>
								{zh
									? "同工作区项目可直接引入该入口，跟随基础组件和全局 token 同步更新。"
									: "Workspace apps can import this entry directly to stay synced with component and token edits."}
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<pre class="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs"><code
									>import Scene from "@valar/svelte-ui/blocks/{scene.blockName}";</code
								></pre>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		</FrameworkUsage>
	</div>
</div>
