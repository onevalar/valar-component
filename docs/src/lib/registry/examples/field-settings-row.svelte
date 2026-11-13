<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";
	import { Separator } from "$lib/registry/ui/separator/index.js";

	const id = $props.id();
	const triggerId = `${id}-theme`;
	const descriptionId = `${id}-description`;
	const themes = [
		{ label: "System preference", value: "system" },
		{ label: "Light", value: "light" },
		{ label: "Dark", value: "dark" },
	];
	let theme = $state("system");
	let identifier = $state("");
	let edited = $state(false);
	const error = $derived(edited && !/^[A-Z0-9]{2,7}$/.test(identifier));
</script>

<Card.Root size="settings" class="w-full max-w-[640px]">
	<Card.Content>
		<Field.Group class="gap-0">
			<Field.Field appearance="settings" orientation="responsive">
				<Field.Content>
					<Field.Label for={triggerId}>Interface theme</Field.Label>
					<Field.Description id={descriptionId}>Choose your preferred appearance.</Field.Description
					>
				</Field.Content>
				<Select.Root type="single" items={themes} bind:value={theme}>
					<Select.Trigger id={triggerId} size="settings" aria-describedby={descriptionId}>
						{themes.find((item) => item.value === theme)?.label}
					</Select.Trigger>
					<Select.Content appearance="settings">
						{#each themes as item (item.value)}
							<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Separator decorative class="mx-4 data-horizontal:w-auto" />
			<Field.Field appearance="settings" orientation="responsive" data-invalid={error || undefined}>
				<Field.Content>
					<Field.Label for={`${id}-identifier`} required>Identifier</Field.Label>
					<Field.Description id={`${id}-identifier-help`}>
						Used as a prefix for team issues (e.g. {identifier || "ENG"}-123).
					</Field.Description>
					<Field.Error
						id={`${id}-identifier-error`}
						errors={error ? [{ message: "Use 2 to 7 letters or numbers." }] : []}
					/>
				</Field.Content>
				<Input
					id={`${id}-identifier`}
					class="max-w-full @md/field-group:w-[172px]"
					value={identifier}
					placeholder="e.g. ENG"
					maxlength={7}
					required
					aria-invalid={error}
					aria-describedby={`${id}-identifier-help${error ? ` ${id}-identifier-error` : ""}`}
					oninput={(event) => {
						identifier = event.currentTarget.value.toUpperCase();
						event.currentTarget.value = identifier;
					}}
					onblur={() => (edited = true)}
				/>
			</Field.Field>
			<Separator decorative class="mx-4 data-horizontal:w-auto" />
			<Field.Field appearance="settings" orientation="responsive" aria-labelledby={`${id}-parent`}>
				<Field.Content><Field.Title id={`${id}-parent`}>Parent team</Field.Title></Field.Content>
				<p class="text-sm text-muted-foreground">Available on the Business plan</p>
			</Field.Field>
		</Field.Group>
	</Card.Content>
</Card.Root>
