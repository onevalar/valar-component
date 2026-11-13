<script lang="ts">
	import IconCheck from "@tabler/icons-svelte/icons/check";
	import IconCopy from "@tabler/icons-svelte/icons/copy";
	import IconInfoCircle from "@tabler/icons-svelte/icons/info-circle";
	import IconStar from "@tabler/icons-svelte/icons/star";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import { UseClipboard } from "$lib/hooks/use-clipboard.svelte.js";

	let isFavorite = $state(false);

	const clipboard = new UseClipboard();
</script>

<div class="grid w-full max-w-sm gap-6">
	<InputGroup.Root>
		<InputGroup.Input
			aria-label="Repository address"
			value="https://github.com/onevalar/valar-svelte"
			readonly
		/>
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button
				aria-label="Copy"
				title="Copy"
				size="icon-xs"
				onclick={() => clipboard.copy("https://github.com/onevalar/valar-svelte")}
			>
				{#if clipboard.copied}
					<IconCheck />
				{:else}
					<IconCopy />
				{/if}
			</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
	<InputGroup.Root class="[--radius:9999px]">
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<InputGroup.Addon>
						<InputGroup.Button {...props} aria-label="Connection information" variant="secondary" size="icon-xs">
							<IconInfoCircle />
						</InputGroup.Button>
					</InputGroup.Addon>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content align="start" class="flex flex-col gap-1 rounded-xl text-sm">
				<p class="font-medium">Your connection is not secure.</p>
				<p>You should not enter any sensitive information on this site.</p>
			</Popover.Content>
		</Popover.Root>
		<InputGroup.Addon class="ps-1.5 text-muted-foreground">https://</InputGroup.Addon>
		<InputGroup.Input aria-label="Website address" />
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button
				aria-label="Favorite"
				aria-pressed={isFavorite}
				onclick={() => (isFavorite = !isFavorite)}
				size="icon-xs"
			>
				<IconStar
					data-favorite={isFavorite}
					class="data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary"
				/>
			</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
	<InputGroup.Root>
		<InputGroup.Addon>
			<InputGroup.Button aria-label="Search information" size="icon-sm">
				<IconInfoCircle />
			</InputGroup.Button>
		</InputGroup.Addon>
		<InputGroup.Input aria-label="Search query" placeholder="Type to search..." />
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button variant="secondary" size="sm">Search</InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
