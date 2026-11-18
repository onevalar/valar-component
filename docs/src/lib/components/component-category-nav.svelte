<script lang="ts">
	import { page } from "$app/state";
	import { categoryChips } from "$lib/component-category-list.js";
	import type { Locale } from "$lib/i18n/config.js";
	import { t } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	/**
	 * The row of categories at the top of a catalog page. The chosen one lives in the URL hash
	 * (`#form`): each is a link, it can be shared, and the browser's back button returns to the
	 * previous one. Without a hash the first one shows.
	 */
	let {
		section,
		value = $bindable(),
	}: {
		section: "basic" | "advanced";
		value?: string;
	} = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const chips = $derived(categoryChips(section, locale));

	$effect(() => {
		const read = () => {
			const hash = decodeURIComponent(location.hash.slice(1));
			value = chips.some((chip) => chip.key === hash) ? hash : chips[0]!.key;
		};
		read();
		addEventListener("hashchange", read);
		return () => removeEventListener("hashchange", read);
	});
</script>

<nav class="flex flex-wrap items-center gap-1.5" aria-label={t("components.categories")}>
	{#each chips as chip (chip.key)}
		<Button
			href="#{chip.key}"
			size="sm"
			shape="pill"
			variant={chip.key === value ? "secondary" : "ghost"}
			class={chip.key === value
				? "h-7 gap-1.5 bg-accent px-3 text-xs font-medium text-foreground shadow-[0_0_0_0.5px_var(--border)]"
				: "h-7 gap-1.5 px-3 text-xs font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground"}
			aria-current={chip.key === value ? "page" : undefined}
		>
			{chip.title}
			<span class="text-[11px] text-muted-foreground tabular-nums">{chip.count}</span>
		</Button>
	{/each}
</nav>
