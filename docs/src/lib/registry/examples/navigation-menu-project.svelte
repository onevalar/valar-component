<script lang="ts">
	import { onMount } from "svelte";
	import { getLocale } from "$lib/i18n/index.js";
	import * as Navigation from "$lib/registry/ui/navigation-menu/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const pages = [
		{ id: "project-view-overview", zh: "概览", en: "Overview" },
		{ id: "project-view-activity", zh: "活动", en: "Activity" },
		{ id: "project-view-issues", zh: "问题", en: "Issues" }
	] as const;
	let current = $state<string>(pages[0].id);

	function restorePage() {
		const fragment = window.location.hash.slice(1);
		current = pages.find(({ id }) => id === fragment)?.id ?? pages[0].id;
	}

	onMount(restorePage);
</script>

<svelte:window onhashchange={restorePage} />

<div class="w-full max-w-xl min-w-0 rounded-[10px] border border-border bg-card">
	<Navigation.Root
		appearance="project"
		aria-label={text("项目导航", "Project navigation")}
		scrollLabel={text("滚动项目导航", "Scroll project navigation")}
		class="border-b border-border px-2"
	>
		<Navigation.List>
			{#each pages as item (item.id)}
				<Navigation.Item>
					<Navigation.Link
						href={`#${item.id}`}
						active={current === item.id}
						onSelect={() => (current = item.id)}
					>
						{text(item.zh, item.en)}
					</Navigation.Link>
				</Navigation.Item>
			{/each}
		</Navigation.List>
	</Navigation.Root>
	{#each pages as item (item.id)}
		<div id={item.id} hidden={current !== item.id} class="px-3 py-4">
			<h3 class="text-sm font-medium">{text(item.zh, item.en)}</h3>
		</div>
	{/each}
</div>
