<script lang="ts">
	import {
		ColorPicker,
		formatColor,
		hexToRgba,
		rgbaToCss,
	} from "$lib/registry/ui/color-picker/index.js";

	let color = $state("#2563eb");
	const rgba = $derived(hexToRgba(color, true) ?? { r: 37, g: 99, b: 235, a: 1 });
	const cssColor = $derived(rgbaToCss(rgba));
	const oklchLabel = $derived(formatColor(rgba, "oklch", true));
</script>

<div class="grid w-full max-w-xs gap-4">
	<ColorPicker
		label="主色"
		bind:value={color}
		presets={["#0f172a", "#2563eb", "#0ea5e9", "#16a34a", "#eab308", "#f97316", "#dc2626", "#9333ea"]}
	/>
	<div class="flex items-center gap-3 rounded-lg border-[0.5px] border-border bg-card p-3">
		<div
			class="relative size-10 shrink-0 overflow-hidden rounded-md border-[0.5px] border-black/15 dark:border-white/20"
			style:background="repeating-conic-gradient(var(--muted) 0 25%, var(--background) 0 50%) 0 / 8px 8px"
		>
			<div class="absolute inset-0" style:background={cssColor}></div>
		</div>
		<div class="grid min-w-0 gap-0.5">
			<span class="truncate font-mono text-xs font-medium text-foreground tabular-nums"
				>{color}</span
			>
			<span class="truncate font-mono text-[11px] text-muted-foreground tabular-nums"
				>{oklchLabel}</span
			>
		</div>
	</div>
</div>
