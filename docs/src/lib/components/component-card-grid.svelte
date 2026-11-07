<script lang="ts" module>
	export type CardItem = {
		href: string;
		title: string;
		/** Name as written in code, e.g. `<Combobox />`. */
		code?: string;
		description?: string;
		/** Registry example shown as the card's picture. */
		demo: string;
		zoom?: number;
	};
</script>

<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import ComponentSample from "./component-sample.svelte";

	let { items }: { items: CardItem[] } = $props();
</script>

<!-- One card per component, each with its own picture; the grid fills the width and reflows by itself. -->
<ul class="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
	{#each items as item (item.href)}
		<li class="flex">
			<Card.Root class="relative w-full transition-colors hover:bg-accent/40">
				<Card.Content>
					<div class="h-40 overflow-hidden rounded-lg border bg-background">
						<ComponentSample name={item.demo} zoom={item.zoom ?? 0.65} />
					</div>
				</Card.Content>
				<Card.Header>
					<Card.Title>
						<a href={item.href} class="after:absolute after:inset-0">{item.title}</a>
					</Card.Title>
					{#if item.code || item.description}
						<Card.Description class="line-clamp-2">
							{#if item.code}<span class="font-mono text-xs">{item.code}</span>{/if}
							{#if item.code && item.description}<br />{/if}
							{item.description ?? ""}
						</Card.Description>
					{/if}
				</Card.Header>
			</Card.Root>
		</li>
	{/each}
</ul>
