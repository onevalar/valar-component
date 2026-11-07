<script lang="ts">
	import { page } from "$app/state";
	import { aiElements } from "$content/index.js";
	import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
	import { ADVANCED_CATEGORIES } from "$lib/component-categories.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const lang = $derived(locale === "zh" ? "zh" : "en");

	let category = $state("all");

	const docs = $derived(
		aiElements.filter((doc) => doc.locale === locale && doc.path !== "ai-elements")
	);
	const slugOf = (doc: (typeof docs)[number]) => doc.path.split("/").pop() ?? "";

	const cards = $derived<CardItem[]>(
		ADVANCED_CATEGORIES.filter((c) => category === "all" || c.key === category)
			.flatMap((c) => c.slugs)
			.flatMap((slug) => docs.filter((doc) => slugOf(doc) === slug))
			.map((doc) => ({
				href: localizeHref(`/docs/${doc.path}`, locale),
				title: doc.title,
				description: doc.description,
				demo: `${slugOf(doc)}-demo`,
				zoom: 0.6,
			}))
	);
	const count = (key: string) =>
		key === "all"
			? docs.length
			: docs.filter((doc) =>
					(ADVANCED_CATEGORIES.find((c) => c.key === key)?.slugs as readonly string[]).includes(
						slugOf(doc)
					)
				).length;
</script>

<div class="mt-6 flex flex-col gap-6">
	<ToggleGroup.Root
		type="single"
		variant="outline"
		spacing={2}
		class="max-w-full flex-wrap"
		aria-label={t("components.categories")}
		bind:value={() => category, (value) => (category = value || "all")}
	>
		{#each [{ key: "all", title: t("components.all") }, ...ADVANCED_CATEGORIES.map( (c) => ({ key: c.key, title: c[lang] }) )] as chip (chip.key)}
			<ToggleGroup.Item value={chip.key}>
				{chip.title}
				<Badge variant="secondary">{count(chip.key)}</Badge>
			</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
	<ComponentCardGrid items={cards} />
</div>
