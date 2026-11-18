<script lang="ts">
	import { getComponentInfos } from "$lib/agent/knowledge.js";
	import { isPublishedBasicComponent } from "$lib/basic-component-visibility.js";
	import { buildGuideSections, loadComponentGuideData } from "$lib/component-ai-spec.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Skeleton } from "$lib/registry/ui/skeleton/index.js";
	import Markdown from "./markdown/markdown.svelte";

	/**
	 * The "how to choose and use it" page of a component: when to use it, when not to, the design
	 * rules the assistant is given, accessibility and responsive notes, and the docs prose without
	 * install steps or code. The rules and card texts are the same ones the assistant reads, so
	 * a wrong answer from it can be traced to a line shown here.
	 */
	let {
		slug,
		sourceDir,
		locale,
	}: { slug: string; sourceDir: "components" | "ai-elements"; locale: Locale } = $props();

	const info = $derived(
		sourceDir === "components"
			? getComponentInfos(locale).find((item) => item.slug === slug)
			: undefined
	);
	const relatedSlugs = $derived(info?.related.filter(isPublishedBasicComponent) ?? []);
	const titles = $derived(
		new Map(getComponentInfos(locale).map((item) => [item.slug, item.title]))
	);

	const loaded = $derived(loadComponentGuideData({ slug, sourceDir, locale }));
</script>

{#await loaded}
	<Skeleton class="h-64 rounded-xl" />
{:then { prose, rules }}
	{@const all = buildGuideSections({ info, titles, rules, prose })}
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_11rem]">
		<div class="flex min-w-0 flex-col gap-8">
			{#each all as item (item.id)}
				<section id={item.id} class="flex scroll-mt-24 flex-col gap-2">
					<h2 class="text-lg font-semibold">{item.title}</h2>
					<Markdown content={item.body} class="text-sm" />
				</section>
			{:else}
				<p class="text-sm text-muted-foreground">这个组件还没有说明。</p>
			{/each}
			{#if relatedSlugs.length}
				<section class="flex flex-col gap-2">
					<h2 class="text-lg font-semibold">相关组件</h2>
					<div class="flex flex-wrap gap-2">
						{#each relatedSlugs as related (related)}
							<Button
								variant="outline"
								size="sm"
								href={localizeHref(`/docs/components/${related}`, locale)}
							>
								{titles.get(related) ?? related}
							</Button>
						{/each}
					</div>
				</section>
			{/if}
		</div>
		{#if all.length > 1}
			<nav
				aria-label="本页内容"
				class="sticky top-[calc(var(--header-height)+1rem)] hidden h-fit flex-col lg:flex"
			>
				{#each all as item (item.id)}
					<Button href="#{item.id}" variant="ghost" size="sm" class="justify-start">
						<span class="truncate">{item.title}</span>
					</Button>
				{/each}
			</nav>
		{/if}
	</div>
{/await}
