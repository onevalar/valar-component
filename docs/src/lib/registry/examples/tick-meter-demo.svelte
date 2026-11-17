<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import { TickMeter } from "$lib/registry/ui/tick-meter/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	const states = [
		{ value: 0, zh: "未使用", en: "Unused" },
		{ value: 50, zh: "部分使用", en: "Partly used" },
		{ value: 100, zh: "已用完", en: "At limit" },
		{ value: 125, zh: "已超限", en: "Over limit" },
	];
</script>

<section
	aria-label={text("配额使用", "Quota usage")}
	class="grid w-full max-w-lg grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-3"
>
	{#each states as state (state.value)}
		{@const label = text(state.zh, state.en)}
		<Card.Root size="sm" class="items-center gap-2 p-3">
			<TickMeter
				value={state.value}
				{label}
				valueText={text(`已使用 ${state.value}%`, `${state.value}% used`)}
				tone={state.value > 100 ? "danger" : "accent"}
				class="max-w-32"
			/>
			<p aria-hidden="true" class="text-center text-[13px]/5 text-muted-foreground wrap-anywhere">{label}</p>
		</Card.Root>
	{/each}
</section>
