<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import { components } from "$content/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import { toCodeName } from "$lib/agent/knowledge.js";
	import {
		COMPONENT_CATEGORIES,
		DEMO_OVERRIDES,
		OTHER_CATEGORY,
	} from "$lib/component-categories.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentsCategoryPreview from "./components-category-preview.svelte";
	import ComponentCardGrid, { type CardItem } from "./component-card-grid.svelte";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const lang = $derived(locale === "zh" ? "zh" : "en");

	// The chosen category lives in the URL hash (`#form`), so each category is a link and the
	// browser's back button returns to the overview; the overview itself is what gets prerendered.
	let hash = $state("");
	$effect(() => {
		const read = () => (hash = decodeURIComponent(location.hash.slice(1)));
		read();
		addEventListener("hashchange", read);
		return () => removeEventListener("hashchange", read);
	});

	const docs = $derived(
		components.filter((doc) => doc.locale === locale && doc.path !== "components")
	);

	const categories = $derived(
		[...COMPONENT_CATEGORIES, { ...OTHER_CATEGORY, slugs: [] as readonly string[] }]
			.map((category) => {
				const known = new Set<string>(COMPONENT_CATEGORIES.flatMap((c) => c.slugs));
				const slugs = category.key === OTHER_CATEGORY.key ? [] : category.slugs;
				const items = docs.filter((doc) =>
					category.key === OTHER_CATEGORY.key
						? !known.has(doc.slug)
						: (slugs as readonly string[]).includes(doc.slug)
				);
				return { key: category.key, title: category[lang], items };
			})
			.filter((category) => category.items.length)
	);

	const current = $derived(categories.find((category) => category.key === hash));

	const cards = $derived<CardItem[]>(
		(current?.items ?? []).map((doc) => ({
			href: localizeHref(`/docs/components/${doc.slug}`, locale),
			title: doc.title,
			code: `<${toCodeName(doc.slug)} />`,
			demo: DEMO_OVERRIDES[doc.slug] ?? `${doc.slug}-demo`,
		}))
	);
</script>

{#if current}
	<div class="mt-6 flex flex-col gap-6">
		<nav
			class="flex items-center gap-2 overflow-x-auto pb-1"
			aria-label={t("components.categories")}
		>
			<Button href="#" variant="ghost" size="sm" aria-label={t("components.all")}>
				<ArrowLeftIcon />
			</Button>
			{#each categories as category (category.key)}
				<Button
					href="#{category.key}"
					size="sm"
					variant={category.key === current.key ? "default" : "outline"}
					aria-current={category.key === current.key ? "page" : undefined}
				>
					{category.title}
					<Badge variant="secondary">{category.items.length}</Badge>
				</Button>
			{/each}
		</nav>
		<ComponentCardGrid items={cards} />
	</div>
{:else}
	<ul class="mt-6 grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
		{#each categories as category (category.key)}
			<li class="flex">
				<Card.Root class="relative w-full transition-colors hover:bg-accent/40">
					<Card.Content>
						<div class="h-44 overflow-hidden rounded-lg border bg-background">
							<ComponentsCategoryPreview category={category.key} />
						</div>
					</Card.Content>
					<Card.Header>
						<Card.Title>
							<a href="#{category.key}" class="after:absolute after:inset-0">{category.title}</a>
						</Card.Title>
						<Card.Description class="line-clamp-2">
							{category.items.length} · {category.items.map((doc) => doc.title).join("、")}
						</Card.Description>
					</Card.Header>
				</Card.Root>
			</li>
		{/each}
	</ul>
{/if}
