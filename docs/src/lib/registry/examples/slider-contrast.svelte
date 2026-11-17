<script lang="ts">
	import { Slider } from "$lib/registry/ui/slider/index.js";

	const uid = $props.id();
	let contrast = $state(30);
</script>

<div
	class="w-full max-w-[640px] rounded-[10px] border border-border bg-card px-4 dark:bg-[#151515]"
	data-slot="theme-contrast-setting"
>
	<div class="flex min-h-[62px] flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
		<span id={`${uid}-contrast`} class="text-[13px]/[15.5px] font-medium text-[#5e5e5f] dark:text-[#9a9c9a]">
			Contrast
		</span>
		<div class="flex h-8 w-[250px] max-w-full min-w-0 items-center gap-3">
			<Slider
				type="single"
				appearance="settings"
				aria-labelledby={`${uid}-contrast`}
				bind:value={contrast}
				min={15}
				max={100}
				step={1}
			/>
			<span
				data-slot="theme-contrast-value"
				class="shrink-0 text-right text-[13px]/[15.5px] font-normal text-[#303031] dark:text-[#e4e5e3] tabular-nums"
			>
				{contrast}
			</span>
		</div>
	</div>
</div>
