<script lang="ts">
	import { page } from "$app/state";
	import SearchIcon from "@lucide/svelte/icons/search";
	import XIcon from "@lucide/svelte/icons/x";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import { getComponentInfos, toCodeName } from "$lib/agent/knowledge.js";
	import { basicComponentAlignment } from "$lib/basic-component-visibility.js";
	import { DEMO_OVERRIDES } from "$lib/component-categories.js";
	import { basicCategories } from "$lib/component-category-list.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentCategoryNav from "./component-category-nav.svelte";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);

	let current = $state("all");
	let query = $state("");
	let searchInput = $state<HTMLInputElement | null>(null);

	function clearSearch() {
		query = "";
		searchInput?.focus();
	}

	const categories = $derived(basicCategories(locale));
	const infoBySlug = $derived(
		new Map(getComponentInfos(locale).map((info) => [info.slug, info] as const))
	);
	const allDocs = $derived(categories.flatMap((category) => category.items));
	const trimmed = $derived(query.trim().toLowerCase());

	const visibleDocs = $derived.by(() => {
		const pool =
			trimmed || current === "all"
				? allDocs
				: (categories.find((category) => category.key === current)?.items ?? allDocs);
		if (!trimmed) return pool;
		const rank = (doc: (typeof pool)[number]) => {
			const title = doc.title.toLowerCase();
			const slug = doc.slug.toLowerCase();
			const code = toCodeName(doc.slug).toLowerCase();
			if (slug === trimmed || title === trimmed || code === trimmed) return 0;
			if (slug.startsWith(trimmed) || title.startsWith(trimmed) || code.startsWith(trimmed))
				return 1;
			return 2;
		};
		return pool
			.filter((doc) => {
				const info = infoBySlug.get(doc.slug);
				const haystack = [
					doc.title,
					doc.slug,
					toCodeName(doc.slug),
					doc.description ?? "",
					...(info?.keywords ?? []),
					...(info?.whenToUse ?? []),
				]
					.join(" ")
					.toLowerCase();
				return haystack.includes(trimmed);
			})
			.sort((a, b) => rank(a) - rank(b));
	});

	const cards = $derived<CardItem[]>(
		visibleDocs.map((doc) => {
			const alignment = basicComponentAlignment(doc.slug);
			return {
				href: localizeHref(`/docs/components/${doc.slug}`, locale),
				title: doc.title,
				code: `<${toCodeName(doc.slug)} />`,
				description: doc.description,
				demo: DEMO_OVERRIDES[doc.slug] ?? `${doc.slug}-demo`,
				badge:
					alignment === "partial"
						? { label: t("components.alignmentPartial"), variant: "secondary" }
						: alignment === "pending"
							? { label: t("components.alignmentPending"), variant: "outline" }
							: undefined,
			};
		})
	);
</script>

<div class="flex flex-col gap-5">
	{#if categories.length}
		<div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
			{#if !trimmed}
				<ComponentCategoryNav section="basic" bind:value={current} />
			{:else}
				<p class="text-xs text-muted-foreground tabular-nums" aria-live="polite">
					{locale === "zh" ? `找到 ${cards.length} 个匹配组件` : `${cards.length} matching`}
				</p>
			{/if}
			<InputGroup.Root appearance="settings-search" class="w-full shrink-0 sm:ml-auto sm:w-52">
				<InputGroup.Input
					bind:ref={searchInput}
					type="search"
					bind:value={query}
					placeholder={t("components.filter")}
					aria-label={t("components.filter")}
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
						{locale === "zh"
							? "试试搜英文名称、中文名或常见场景关键词（例如：验证码、日期、弹窗）。"
							: "Try a component name, slug, or usage keyword."}
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<Button variant="outline" size="sm" onclick={() => (query = "")}>
						{t("common.clear")}
					</Button>
				</Empty.Content>
			</Empty.Root>
		{/if}
	{:else}
		<p class="text-muted-foreground">{t("components.alignmentEmpty")}</p>
	{/if}
</div>
