<script lang="ts">
	import { page } from "$app/state";
	import Button from "$lib/registry/ui/button/button.svelte";
	import { localeFromPathname } from "$lib/i18n/config.js";
	import { sectionOf, type NavItem } from "$lib/navigation.js";
	import { cn } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		items,
		class: className,
		...restProps
	}: {
		items: NavItem[];
		class?: string;
	} & HTMLAttributes<HTMLElement> = $props();

	const current = $derived(sectionOf(page.url.pathname, localeFromPathname(page.url.pathname)));
</script>

<nav class={cn("items-center gap-0.5", className)} {...restProps}>
	{#each items as item (item.href)}
		<Button
			href={item.href}
			variant="ghost"
			size="sm"
			class={cn(
				item.section && item.section === current
					? "bg-accent font-semibold text-foreground"
					: "text-muted-foreground hover:text-foreground"
			)}
			aria-current={item.section && item.section === current ? "page" : undefined}
		>
			{item.title}
		</Button>
	{/each}
</nav>
