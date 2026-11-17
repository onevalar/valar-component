<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import { NumberField } from "$lib/registry/ui/number-field/index.js";

	const limitId = $props.id();
	let amount = $state<number | undefined>();
	let result = $state("");
</script>

<form
	aria-label="Workspace spend limit example"
	class="grid w-full min-w-0 max-w-sm gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		result = String(new FormData(event.currentTarget).get("limit") ?? "");
	}}
	onreset={() => (result = "")}
>
	<div class="flex min-w-0 items-center justify-between gap-3">
		<Label for={limitId}>Workspace limit (USD)</Label>
		<div class="w-24 max-w-full shrink-0 max-[359px]:w-[94px]">
			<NumberField
				id={limitId}
				name="limit"
				appearance="amount"
				bind:value={amount}
				placeholder="1,000"
			/>
		</div>
	</div>
	<div class="flex flex-wrap justify-end gap-2">
		<Button type="reset" variant="outline" size="sm">Reset</Button>
		<Button type="submit" size="sm">Preview amount</Button>
	</div>
	<output class="min-h-5 text-xs text-muted-foreground">
		{result === "" ? "No previewed amount" : `Previewed amount: ${result} USD`}
	</output>
</form>
