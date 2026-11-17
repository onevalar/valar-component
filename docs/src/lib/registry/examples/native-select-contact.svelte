<script lang="ts">
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Label } from "$lib/registry/ui/label/index.js";
	import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

	const companySizeId = $props.id();
	let companySize = $state("20-199");
	let preview = $state("");
</script>

<form
	aria-label="Company size preview"
	class="grid w-full min-w-0 max-w-md gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		preview = String(new FormData(event.currentTarget).get("company-size") ?? "");
	}}
>
	<div class="grid gap-2">
		<Label for={companySizeId}>Company size</Label>
		<NativeSelect.Root id={companySizeId} name="company-size" appearance="contact" bind:value={companySize} required>
			<NativeSelect.Option value="1-19">1–19</NativeSelect.Option>
			<NativeSelect.Option value="20-199">20–199</NativeSelect.Option>
			<NativeSelect.Option value="200-1,999">200–1,999</NativeSelect.Option>
			<NativeSelect.Option value="2,000-9,999">2,000–9,999</NativeSelect.Option>
			<NativeSelect.Option value="10,000+">10,000+</NativeSelect.Option>
		</NativeSelect.Root>
	</div>
	<Button type="submit" variant="outline" size="sm" class="justify-self-end">Preview selection</Button>
	<output class="min-h-5 text-xs text-muted-foreground">
		{preview ? `Previewed company size: ${preview}` : ""}
	</output>
</form>
