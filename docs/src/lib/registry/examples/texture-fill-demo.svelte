<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { TextureFill, textures } from "$lib/registry/ui/texture-fill/index.js";
	import { SliderField } from "$lib/registry/ui/slider-field/index.js";

	const patterns = [...textures, "solid"] as const;
	const labels = {
		dither: "抖动点阵",
		lines: "竖线",
		halftone: "网点",
		hatch: "斜线",
		solid: "纯色",
	};
	const chinese = $derived(getLocale() === "zh");
	let value = $state(65);
</script>

<div class="grid w-full min-w-0 max-w-md gap-4">
	<SliderField appearance="readout" label={chinese ? "填充比例" : "Fill amount"} bind:value min={0} max={100} unit="%" />
	{#each patterns as texture (texture)}
		<div class="grid min-w-0 gap-1">
			<div class="flex flex-wrap justify-between gap-x-2 text-xs">
				<span class="font-medium capitalize">{chinese ? labels[texture] : texture}</span>
				<span class="text-muted-foreground tabular-nums">{value}%</span>
			</div>
			<TextureFill {value} {texture} class="h-4" />
		</div>
	{/each}
</div>
