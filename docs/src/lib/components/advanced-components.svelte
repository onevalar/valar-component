<script lang="ts">
	import { page } from "$app/state";
	import { aiElements } from "$content/index.js";
	import { ADVANCED_CATEGORIES } from "$lib/component-categories.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import ComponentCategoryNav from "./component-category-nav.svelte";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);

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
</script>

<div class="flex flex-col gap-6">
	<ComponentCategoryNav section="advanced" bind:value={category} />
	<ComponentCardGrid items={cards} />
</div>
