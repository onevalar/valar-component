<script lang="ts">
	import BoxIcon from "@lucide/svelte/icons/box";
	import CircleUserIcon from "@lucide/svelte/icons/circle-user-round";
	import UsersIcon from "@lucide/svelte/icons/users-round";
	import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputGroup from "$lib/registry/ui/input-group/index.js";

	const id = $props.id();
	const icons = [
		{ label: "Profile", icon: CircleUserIcon },
		{ label: "People", icon: UsersIcon },
		{ label: "Box", icon: BoxIcon },
	];
	let icon = $state("Profile");
	const Icon = $derived(icons.find((entry) => entry.label === icon)?.icon ?? CircleUserIcon);
</script>

<Field.Field class="w-full max-w-[200px]">
	<Field.Label for={id}>Icon &amp; name</Field.Label>
	<InputGroup.Root appearance="settings-name">
		<InputGroup.Input {id} placeholder="e.g. Engineering" maxlength={48} />
		<InputGroup.Addon>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<InputGroup.Button {...props} size="icon-sm" aria-label={`Choose team icon. Current: ${icon}`}>
							<Icon aria-hidden="true" />
						</InputGroup.Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.RadioGroup bind:value={icon} aria-label="Team icon">
						{#each icons as entry (entry.label)}
							<DropdownMenu.RadioItem value={entry.label}>{entry.label}</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</InputGroup.Addon>
	</InputGroup.Root>
</Field.Field>
