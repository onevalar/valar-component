<script lang="ts">
	import UserRoundIcon from "@lucide/svelte/icons/user-round";
	import { buttonVariants } from "$lib/registry/ui/button/index.js";
	import { Combobox } from "$lib/registry/ui/combobox/index.js";

	const assignees = [
		{ id: "", label: "Unassigned" },
		{ id: "ada", label: "Ada Chen", group: "Members" },
		{ id: "morgan", label: "Morgan Lee", group: "Members" },
		{ id: "priya", label: "Priya Shah", group: "Members" },
	];
	let value = $state<readonly string[]>([""]);
	const assignee = $derived(assignees.find((option) => option.id === value[0])?.label);
</script>

<div class="flex flex-col items-center gap-2">
	<Combobox
		label="Choose an assignee"
		placeholder="Assign to…"
		empty="No matching assignees."
		options={assignees}
		bind:value
		triggerProps={{ "aria-label": `Assignee: ${assignee}` }}
		class={buttonVariants({
			variant: "outline",
			shape: "pill",
			size: "xs",
			class: "gap-1.5 px-2 text-xs font-normal",
		})}
	>
		{#snippet children()}
			<UserRoundIcon class="size-3.5" aria-hidden="true" />
			{assignee}
		{/snippet}
		{#snippet option(item)}
			{#if item.id}
				<span
					aria-hidden="true"
					class="grid size-4 shrink-0 place-items-center rounded-full bg-accent text-[9px] leading-none text-accent-foreground"
					>{item.label.slice(0, 1)}</span
				>
			{:else}
				<UserRoundIcon aria-hidden="true" />
			{/if}
			<span class="min-w-0 flex-1 wrap-anywhere">{item.label}</span>
		{/snippet}
	</Combobox>
	<p role="status" class="text-xs text-muted-foreground">Current assignee: {assignee}</p>
</div>
