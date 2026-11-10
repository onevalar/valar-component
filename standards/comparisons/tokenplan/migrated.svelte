<script lang="ts">
	import * as Tabs from "@valar/svelte-ui/tabs";
	import { Button } from "@valar/svelte-ui/button";
	import { StaticDonut } from "@valar/svelte-ui/donut-chart";
	import { Gauge, GaugeArc } from "@valar/svelte-ui/gauge";
	import { RulerSlider } from "@valar/svelte-ui/ruler-slider";
	import { Slider } from "@valar/svelte-ui/slider";
	import { StaticSparkline } from "@valar/svelte-ui/sparkline";
	import { TextureFill } from "@valar/svelte-ui/texture-fill";
	import { TickMeter } from "@valar/svelte-ui/tick-meter";
	import { WaffleChart } from "@valar/svelte-ui/waffle-chart";
	import { onMount } from "svelte";
	import { seed, ruler, missing, disabled, parts, values, options, log } from "./fixtures";
	let value = $state(seed);
	let choice = $state("tokens");
	let transparency = $state(60);
	onMount(() => {
		document.body.dataset.ready = "ready";
	});
</script>

<p>
	Actual public package exports. Valar tokens; intentional control/visual differences documented.
</p>
<label>External Value <input type="number" bind:value /></label>
<button
	type="button"
	onclick={() => {
		log("reset", 600);
		value = 600;
	}}>Reset Reference To 600</button
>
<section tabindex="-1" aria-label="Focus Start">Disclosure</section>
<Button>Close Fixture</Button>
<Button tabindex={-1}>Skip Fixture</Button>
<Button disabled>Disabled Fixture</Button>
<Button>Next Fixture</Button>
<h3>Gauge / GaugeArc</h3>
<Gauge {value} label="Quota" valueText={`${value}%`} class="w-[120px]" />
<svg viewBox="0 0 100 90" width="60" aria-hidden="true"
	><GaugeArc value={missing ? null : value} radius={28} /></svg
>
<h3>WaffleChart</h3>
<WaffleChart data={missing ? [] : parts} label="A 65, B 35" class="w-[120px]" />
<h3>StaticDonut</h3>
<StaticDonut {parts} total={100} class="w-[120px]" />
<h3>StaticSparkline</h3>
<StaticSparkline {values} />
<h3>RulerSlider</h3>
<RulerSlider
	label="Reference"
	value={Math.min(ruler.max, value)}
	{...ruler}
	animateReadout={false}
	{disabled}
	onValueChange={(next) => {
		value = next;
		log("value", next);
	}}
	onValueCommit={(next) => log("commit", next)}
/>
<h3>Measure tabs</h3>
<Tabs.Root bind:value={choice} onValueChange={(next) => log("selection", next)}>
	<Tabs.List aria-label="Measure">
		{#each options as option (option.value)}
			<Tabs.Trigger value={option.value} {disabled}>{option.label}</Tabs.Trigger>
		{/each}
	</Tabs.List>
	{#each options as option (option.value)}
		<Tabs.Content value={option.value}>Selected measure: {option.label}</Tabs.Content>
	{/each}
</Tabs.Root>
<h3>Texture Fill</h3>
{#each ["dither", "lines", "halftone", "hatch", "solid"] as texture}
	<TextureFill
		{value}
		texture={texture as "dither" | "lines" | "halftone" | "hatch" | "solid"}
		class="my-2 h-8 w-full"
		intro
	/>
{/each}
<h3>TickMeter (Independent; No Pro Reference)</h3>
<TickMeter {value} label="Quota" valueText={`${value}%`} class="w-24" />
<h3>Scalar Slider Keyboard Contract</h3>
<Slider
	type="single"
	aria-label="Transparency"
	bind:value={transparency}
	min={20}
	max={100}
	step={5}
/>
