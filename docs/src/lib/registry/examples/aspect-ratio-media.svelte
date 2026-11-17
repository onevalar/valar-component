<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { AspectRatio } from "$lib/registry/ui/aspect-ratio/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const samples = [
		{
			label: { en: "Landscape", zh: "横版" },
			alt: { en: "Landscape test image", zh: "横版测试图" },
			ratio: 16 / 9,
			width: 320,
			image: "iVBORw0KGgoAAAANSUhEUgAAAKAAAABaCAIAAACwpMoFAAAA9ElEQVR4nO3RMQ3AMBDAwIDsXqIdOhRHsQRGJP9JRuBb1/2M6v3+Ua3jxwEDBgwYMGDAIzp+HDBgwIABAwY8IsDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wPMDxAMcDHA9wvA1oOFxmrT3OmQAAAABJRU5ErkJggg=="
		},
		{
			label: { en: "Square", zh: "正方形" },
			alt: { en: "Square test image", zh: "正方形测试图" },
			ratio: 1,
			width: 160,
			image: "iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAcUlEQVR4nO3PQQkAMAgAQAMulRkMtMdymMUYwji4AhencsV9vSKEhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFfwoPto0UwsM9YBwAAAAASUVORK5CYII="
		}
	] as const;
	const locale = $derived(getLocale() === "zh" ? "zh" : "en");
	let chosen = $state(0);
	const sample = $derived(samples[chosen]!);
</script>

<div
	role="group"
	aria-label={locale === "zh" ? "问题正文媒体" : "Issue description media"}
	class="grid w-full min-w-0 max-w-sm gap-3"
>
	<div class="flex flex-wrap gap-2">
		{#each samples as preset, index (preset.label.en)}
			<Button
				variant="ghost"
				size="sm"
				aria-pressed={chosen === index}
				onclick={() => (chosen = index)}
			>
				{preset.label[locale]}
			</Button>
		{/each}
	</div>
	<AspectRatio appearance="media" ratio={sample.ratio} mediaWidth={sample.width}>
		<img src={`data:image/png;base64,${sample.image}`} alt={sample.alt[locale]} />
	</AspectRatio>
</div>
