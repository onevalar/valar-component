<script module lang="ts">
	import { createParts } from "@ui-sdk/svelte/primitive";
	import { iconPicker } from "./icon-picker.js";
	import "./icon-picker.css";

	const { Root, Trigger, Content, Search, Results, Item, Selection } = createParts(iconPicker, {
		trigger: "button",
		content: "div",
		search: "input",
		results: "div",
		item: "button",
		selection: "p",
	});
</script>

{#snippet glyph(path: string)}
	<svg
		aria-hidden="true"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.75"
		stroke-linecap="round"
		stroke-linejoin="round"><path d={path} /></svg
	>
{/snippet}

<main class="icon-picker-preview">
	<h1>Project settings</h1>
	<Root>
		<div class="icon-picker-setting">
			<div>
				<span>Project icon</span>
				<Selection class="icon-picker-selection">
					{#snippet children({ name })}Selected icon: {name}{/snippet}
				</Selection>
			</div>
			<Trigger aria-label="Choose project icon" class="icon-picker-trigger">
				{#snippet children({ selected })}{@render glyph(selected.path)}{/snippet}
			</Trigger>
		</div>
		<Content
			align="end"
			sideOffset={8}
			collisionPadding={8}
			initialFocus="input[type=search]"
			class="icon-picker-panel"
		>
			<Search />
			<Results class="icon-picker-results">
				{#snippet children({ results })}
					{#each results as { name, path } (name)}
						<Item value={name} aria-label={name} title={name} class="icon-picker-item"
							>{@render glyph(path)}</Item
						>
					{:else}
						<p class="icon-picker-empty">No icons found</p>
					{/each}
				{/snippet}
			</Results>
		</Content>
	</Root>
</main>
