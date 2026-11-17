<script lang="ts">
	import { REGEXP_ONLY_DIGITS } from "bits-ui";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Field from "$lib/registry/ui/field/index.js";
	import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const uid = $props.id();
	const code = "123456";
	let input = $state<HTMLInputElement | null>(null);
	let value = $state("");
	let error = $state("");
	let status = $state("");
</script>

<Card.Root class="mx-auto w-full min-w-0 max-w-md">
	<Card.Header>
		<Card.Title>Verify your login</Card.Title>
		<Card.Description>Use the demo code {code} to try verification.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form
			class="grid gap-3"
			onsubmit={(event) => {
				event.preventDefault();
				if (new FormData(event.currentTarget).get("code") !== code) {
					error = "Enter the six-digit demo code.";
					status = "";
					input?.focus();
					return;
				}
				error = "";
				status = "Code verified.";
			}}
		>
			<Field.Field data-invalid={!!error || undefined}>
				<Field.Label for={`${uid}-code`}>Verification code</Field.Label>
				<InputOTP.Root
					bind:inputRef={input}
					bind:value
					inputId={`${uid}-code`}
					name="code"
					maxlength={6}
					pattern={REGEXP_ONLY_DIGITS}
					aria-invalid={!!error || undefined}
					aria-describedby={error ? `${uid}-error` : undefined}
					onValueChange={() => {
						error = "";
						status = "";
					}}
					required
				>
					{#snippet children({ cells })}
						<InputOTP.Group>
							{#each cells.slice(0, 3) as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
						<InputOTP.Separator />
						<InputOTP.Group>
							{#each cells.slice(3) as cell (cell)}
								<InputOTP.Slot {cell} />
							{/each}
						</InputOTP.Group>
					{/snippet}
				</InputOTP.Root>
				{#if error}
					<Field.Error id={`${uid}-error`}>{error}</Field.Error>
				{/if}
			</Field.Field>
			<div class="flex flex-wrap items-center gap-2">
				<Button type="submit">Verify</Button>
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						value = "";
						error = "";
						status = "";
						input?.focus();
					}}
				>
					Clear code
				</Button>
			</div>
			{#if status}
				<p role="status" class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</form>
	</Card.Content>
</Card.Root>
