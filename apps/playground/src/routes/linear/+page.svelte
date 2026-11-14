<script lang="ts">
	import * as Tabs from "@valar/svelte-ui/tabs";
	import Agent from "@valar/svelte-ui/blocks/agent-01";
	import Inbox from "@valar/svelte-ui/blocks/inbox-01";
	import MyIssues from "@valar/svelte-ui/blocks/my-issues-01";
	import NewIssue from "@valar/svelte-ui/blocks/new-issue-01";
	import Projects from "@valar/svelte-ui/blocks/projects-01";
	import Settings from "@valar/svelte-ui/blocks/settings-01";
	import { Button, buttonVariants } from "@valar/svelte-ui/button";

	let dark = $state(false);

	$effect(() => {
		const root = document.documentElement;
		const previous = root.classList.contains("dark");
		root.classList.toggle("dark", dark);
		return () => root.classList.toggle("dark", previous);
	});
</script>

<svelte:head>
	<title>Linear 对齐预览 · Valar Svelte</title>
</svelte:head>

<main class="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-10">
	<header class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-3">
			<a href="/" class={buttonVariants({ variant: "ghost", size: "sm" })}>返回组件消费端</a>
			<h1 class="text-2xl font-semibold tracking-tight">Linear 对齐预览</h1>
		</div>
		<Button variant="outline" size="sm" aria-pressed={dark} onclick={() => (dark = !dark)}>
			深色模式
		</Button>
	</header>

	<Tabs.Root value="settings" class="gap-4">
		<Tabs.List aria-label="对齐场景" class="h-auto max-w-full flex-wrap">
			<Tabs.Trigger value="settings">设置页</Tabs.Trigger>
			<Tabs.Trigger value="issues">My issues</Tabs.Trigger>
			<Tabs.Trigger value="new-issue">新建 Issue</Tabs.Trigger>
			<Tabs.Trigger value="projects">Projects</Tabs.Trigger>
			<Tabs.Trigger value="inbox">Inbox</Tabs.Trigger>
			<Tabs.Trigger value="agent">Agent</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="settings"><Settings chinese /></Tabs.Content>
		<Tabs.Content value="issues"><MyIssues chinese /></Tabs.Content>
		<Tabs.Content value="new-issue"><NewIssue chinese /></Tabs.Content>
		<Tabs.Content value="projects"><Projects chinese /></Tabs.Content>
		<Tabs.Content value="inbox"><Inbox chinese /></Tabs.Content>
		<Tabs.Content value="agent"><Agent chinese /></Tabs.Content>
	</Tabs.Root>
</main>
