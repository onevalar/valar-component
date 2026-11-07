<script lang="ts">
	import { page } from "$app/state";
	import { toCodeName } from "$lib/agent/knowledge.js";
	import { DEMO_OVERRIDES } from "$lib/component-categories.js";
	import { basicCategories } from "$lib/component-category-list.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import ComponentCategoryNav from "./component-category-nav.svelte";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);

	let current = $state("");

	const categories = $derived(basicCategories(locale));

	const cards = $derived<CardItem[]>(
		(categories.find((category) => category.key === current)?.items ?? []).map((doc) => ({
			href: localizeHref(`/docs/components/${doc.slug}`, locale),
			title: doc.title,
			code: `<${toCodeName(doc.slug)} />`,
			demo: DEMO_OVERRIDES[doc.slug] ?? `${doc.slug}-demo`,
		}))
	);
</script>

<div class="flex flex-col gap-6">
	<ComponentCategoryNav section="basic" bind:value={current} />
	<ComponentCardGrid items={cards} />
</div>
