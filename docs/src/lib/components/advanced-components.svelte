<script lang="ts">
	import { page } from "$app/state";
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import { aiElements } from "$content/index.js";
	import { ADVANCED_MODULES, ADVANCED_SCENES } from "$lib/advanced-catalog.js";
	import { getComponentInfos, toCodeName } from "$lib/agent/knowledge.js";
	import { ADVANCED_CATEGORIES } from "$lib/component-categories.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentCategoryNav from "./component-category-nav.svelte";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const zh = $derived(locale === "zh");

	let category = $state("all");
	let query = $state("");
	let searchInput = $state<HTMLInputElement | null>(null);

	function clearSearch() {
		query = "";
		searchInput?.focus();
	}

	const docs = $derived(
		aiElements.filter((doc) => doc.locale === locale && doc.path !== "ai-elements")
	);
	const titles = $derived(
		new Map(getComponentInfos(locale).map((item) => [item.slug, item.title] as const))
	);
	const slugOf = (doc: (typeof docs)[number]) => doc.path.split("/").pop() ?? "";
	const formatDeps = (deps: readonly string[]) => {
		const names = deps.slice(0, 3).map((slug) => titles.get(slug) ?? toCodeName(slug));
		return deps.length > 3 ? [...names, `+${deps.length - 3}`] : names;
	};

	const allEntries = $derived.by(() => {
		const lang = zh ? "zh" : "en";
		const bySlug = new Map<string, CardItem & { search: string }>();

		for (const scene of ADVANCED_SCENES) {
			bySlug.set(scene.slug, {
				href: localizeHref(`/advanced/${scene.slug}`, locale),
				title: scene.title[lang],
				description: scene.description[lang],
				demo: scene.demo,
				zoom: 0.6,
				badge: { label: zh ? "完整界面" : "Scene", variant: "secondary" },
				tags: formatDeps(scene.components),
				search: [
					scene.slug,
					scene.blockName,
					scene.title.zh,
					scene.title.en,
					scene.description[lang],
					...scene.keywords,
					...scene.components,
				]
					.join(" ")
					.toLowerCase(),
			});
		}

		for (const mod of ADVANCED_MODULES) {
			bySlug.set(mod.slug, {
				href: localizeHref(`/docs/components/${mod.slug}`, locale),
				title: mod.title[lang],
				description: mod.description[lang],
				demo: mod.demo,
				zoom: 0.6,
				badge: { label: zh ? "核心模块" : "Module", variant: "outline" },
				tags: formatDeps(mod.components),
				search: [
					mod.slug,
					mod.title.zh,
					mod.title.en,
					mod.description[lang],
					...mod.keywords,
					...mod.components,
				]
					.join(" ")
					.toLowerCase(),
			});
		}

		for (const doc of docs) {
			const slug = slugOf(doc);
			bySlug.set(slug, {
				href: localizeHref(`/docs/${doc.path}`, locale),
				title: doc.title,
				description: doc.description,
				demo: `${slug}-demo`,
				zoom: 0.6,
				badge: { label: zh ? "AI 组合" : "AI Pattern", variant: "outline" },
				search: [slug, doc.title, doc.description ?? ""].join(" ").toLowerCase(),
			});
		}

		return bySlug;
	});

	const trimmed = $derived(query.trim().toLowerCase());

	const cards = $derived.by<CardItem[]>(() => {
		const slugs = ADVANCED_CATEGORIES.filter(
			(c) => trimmed || category === "all" || c.key === category
		).flatMap((c) => c.slugs);
		return slugs
			.map((slug) => allEntries.get(slug))
			.filter((item): item is CardItem & { search: string } => Boolean(item))
			.filter((item) => !trimmed || item.search.includes(trimmed));
	});
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
		{#if !trimmed}
			<ComponentCategoryNav section="advanced" bind:value={category} />
		{:else}
			<p class="text-xs text-muted-foreground tabular-nums" aria-live="polite">
				{zh ? `找到 ${cards.length} 个匹配项` : `${cards.length} matching`}
			</p>
		{/if}
		<InputGroup.Root appearance="settings-search" class="w-full shrink-0 sm:ml-auto sm:w-52">
			<InputGroup.Input
				bind:ref={searchInput}
				type="search"
				bind:value={query}
				placeholder={zh ? "筛选高级组件…" : "Filter advanced…"}
				aria-label={zh ? "筛选高级组件…" : "Filter advanced…"}
				onkeydown={(event) => {
					if (event.key === "Escape" && query) {
						event.preventDefault();
						event.stopPropagation();
						clearSearch();
					}
				}}
			/>
			<InputGroup.Addon aria-hidden="true">
				<SearchIcon class="size-3.5" />
			</InputGroup.Addon>
			<InputGroup.Addon align="inline-end">
				{#if query}
					<InputGroup.Button
						size="icon-xs"
						aria-label={t("common.clear")}
						onclick={clearSearch}
					>
						<XIcon class="size-3" />
					</InputGroup.Button>
				{/if}
			</InputGroup.Addon>
		</InputGroup.Root>
	</div>
	{#if cards.length}
		<ComponentCardGrid items={cards} />
	{:else}
		<Empty.Root class="border py-12">
			<Empty.Header>
				<Empty.Title>{t("components.noResults", { query: query.trim() })}</Empty.Title>
				<Empty.Description>
					{zh
						? "试试搜业务场景名（例如：项目管理、收件箱、设置页、对话）。"
						: "Try searching for a scene, module, or AI pattern."}
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button variant="outline" size="sm" onclick={() => (query = "")}>
					{t("common.clear")}
				</Button>
			</Empty.Content>
		</Empty.Root>
	{/if}
</div>
