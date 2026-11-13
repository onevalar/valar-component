<script lang="ts">
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as Select from "$lib/registry/ui/select/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Input } from "$lib/registry/ui/input/index.js";

	const id = $props.id();
	const countries = [
		{ value: "us", label: "United States" },
		{ value: "uk", label: "United Kingdom" },
		{ value: "ca", label: "Canada" },
	];

	let country = $state("us");
	let submitted = $state(false);
</script>

<form
	class="w-full max-w-sm"
	onreset={() => {
		country = "us";
		submitted = false;
	}}
	onsubmit={(event) => {
		event.preventDefault();
		submitted = true;
	}}
>
	<Field.Group>
		<Field.Field>
			<Field.Label for={`${id}-name`}>Name</Field.Label>
			<Input id={`${id}-name`} name="name" autocomplete="name" placeholder="Jordan Lee" required />
		</Field.Field>
		<Field.Field>
			<Field.Label for={`${id}-email`}>Email</Field.Label>
			<Input
				id={`${id}-email`}
				name="email"
				type="email"
				autocomplete="email"
				placeholder="jordan@example.com"
				aria-describedby={`${id}-email-description`}
			/>
			<Field.Description id={`${id}-email-description`}
				>Receives workspace updates.</Field.Description
			>
		</Field.Field>
		<div class="grid gap-4 @md/field-group:grid-cols-2">
			<Field.Field>
				<Field.Label for={`${id}-phone`}>Phone</Field.Label>
				<Input
					id={`${id}-phone`}
					name="phone"
					type="tel"
					autocomplete="tel"
					placeholder="+1 (555) 123-4567"
				/>
			</Field.Field>
			<Field.Field>
				<Field.Label for={`${id}-country`}>Country</Field.Label>
				<Select.Root type="single" items={countries} bind:value={country}>
					<Select.Trigger id={`${id}-country`}>
						<Select.Value />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each countries as item (item.value)}
								<Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
		</div>
		<Field.Field>
			<Field.Label for={`${id}-address`}>Address</Field.Label>
			<Input
				id={`${id}-address`}
				name="address"
				autocomplete="street-address"
				placeholder="123 Main St"
			/>
		</Field.Field>
		<Field.Field orientation="horizontal">
			<Button type="reset" variant="outline">Reset</Button>
			<Button type="submit">Submit</Button>
		</Field.Field>
		{#if submitted}<p role="status" class="text-muted-foreground text-xs">
				Preview submitted.
			</p>{/if}
	</Field.Group>
</form>
