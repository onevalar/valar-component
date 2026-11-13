<script lang="ts">
	import { Progress } from "$lib/registry/ui/progress/index.js";
</script>

<div class="grid w-full max-w-sm gap-4">
	{#each [{ label: "Waiting to upload", value: 0, text: "0%" }, { label: "Preparing files", value: null, text: "Waiting for total" }, { label: "Uploading files", value: 30, text: "50%" }, { label: "Upload complete", value: 50, text: "100%" }] as sample (sample.label)}
		<div class="grid gap-2">
			<div class="flex justify-between gap-2 text-[13px]">
				<span class="font-medium">{sample.label}</span>
				<span class="text-muted-foreground tabular-nums">{sample.text}</span>
			</div>
			<Progress aria-label={sample.label} value={sample.value} min={10} max={50} />
		</div>
	{/each}
</div>
