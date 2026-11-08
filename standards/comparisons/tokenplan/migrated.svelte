<script lang="ts">
	import { Button } from "@valar/svelte-ui/button";
	import { ConfirmAction } from "@valar/svelte-ui/confirm-action";
	import { StaticDonut } from "@valar/svelte-ui/donut-chart";
	import { Gauge, GaugeArc } from "@valar/svelte-ui/gauge";
	import { RulerSlider } from "@valar/svelte-ui/ruler-slider";
	import { SegmentedControl } from "@valar/svelte-ui/segmented-control";
	import { Slider } from "@valar/svelte-ui/slider";
	import { StaticSparkline } from "@valar/svelte-ui/sparkline";
	import { TextureFill } from "@valar/svelte-ui/texture-fill";
	import { TickMeter } from "@valar/svelte-ui/tick-meter";
	import { WaffleChart } from "@valar/svelte-ui/waffle-chart";
	import { onMount } from "svelte";
	import {
		seed,
		ruler,
		missing,
		disabled,
		fullWidth,
		parts,
		values,
		options,
		copy,
		confirm,
		undo,
		log,
	} from "./fixtures";
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
<h3>SegmentedControl</h3>
<SegmentedControl
	label="Measure"
	bind:value={choice}
	{options}
	{disabled}
	onValueChange={(next) => log("selection", next)}
/>
<h3>ConfirmAction</h3>
<ConfirmAction
	{...copy}
	{disabled}
	{fullWidth}
	onConfirm={confirm}
	onUndo={undo}
	onStateChange={(next) => log("state", next)}
/>
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
