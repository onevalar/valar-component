<script lang="ts">
	import { getComponentInfos } from "$lib/agent/knowledge.js";
	import { guideSections } from "$lib/doc-guide.js";
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
	let { slug, section, locale }: { slug: string; section: "basic" | "advanced"; locale: Locale } =
		$props();

	const docs = import.meta.glob("/content/**/*.md", { query: "?raw", import: "default" });
	const rulesFiles = import.meta.glob("/src/lib/registry/ui/*/RULES.md", {
		query: "?raw",
		import: "default",
	});

	const info = $derived(
		section === "basic" ? getComponentInfos(locale).find((item) => item.slug === slug) : undefined
	);
	const titles = $derived(
		new Map(getComponentInfos(locale).map((item) => [item.slug, item.title]))
	);

	async function load() {
		const dir = section === "basic" ? "components" : "ai-elements";
		const doc = docs[`/content${locale === "zh" ? "/zh" : ""}/${dir}/${slug}.md`];
		const rules =
			section === "basic" ? rulesFiles[`/src/lib/registry/ui/${slug}/RULES.md`] : undefined;
		const [raw, ruleText] = await Promise.all([doc?.(), rules?.()]);
		return {
			prose: raw ? guideSections(raw as string) : [],
			rules: ruleText ? (ruleText as string).replace(/^#.*\n/, "").trim() : "",
		};
	}
	const loaded = $derived(load());

	const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");
	const sections = $derived.by(() => {
		const out: { id: string; title: string; body: string }[] = [];
		if (info?.whenToUse.length)
			out.push({ id: "when", title: "什么时候用", body: list(info.whenToUse) });
		if (info?.whenNotToUse.length) {
			out.push({
				id: "when-not",
				title: "什么时候不用",
				body: list(
					info.whenNotToUse.map((item) =>
						item.use ? `${item.case}：改用「${titles.get(item.use) ?? item.use}」` : item.case
					)
				),
			});
		}
		return out;
	});
</script>

{#await loaded}
	<Skeleton class="h-64 rounded-xl" />
{:then { prose, rules }}
	{@const all = [
		...sections,
		...(rules ? [{ id: "rules", title: "设计准则（助手按此使用）", body: rules }] : []),
		...(info?.accessibility.length
			? [{ id: "a11y", title: "无障碍", body: list(info.accessibility) }]
			: []),
		...(info?.responsive.length
			? [{ id: "responsive", title: "响应式", body: list(info.responsive) }]
			: []),
		...prose.map((item, i) => ({
			id: `prose-${i}`,
			title: item.title || "概述",
			body: item.body,
		})),
	]}
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
			{#if info?.related.length}
				<section class="flex flex-col gap-2">
					<h2 class="text-lg font-semibold">相关组件</h2>
					<div class="flex flex-wrap gap-2">
						{#each info.related as related (related)}
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
