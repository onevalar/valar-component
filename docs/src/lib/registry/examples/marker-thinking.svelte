<script lang="ts">
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Marker from "$lib/registry/ui/marker/index.js";

	const text = (zh: string, en: string) => (getLocale() === "zh" ? zh : en);
	let thinking = $state(true);
</script>

<section
	aria-label={text("Agent 思考状态", "Agent thinking state")}
	class="grid w-full max-w-sm justify-items-start gap-3"
>
	<div class="min-h-4 w-full">
		{#if thinking}
			<Marker.Root appearance="thinking">
				<Marker.Content>{text("思考中…", "Thinking…")}</Marker.Content>
			</Marker.Root>
		{:else}
			<p role="status" class="sr-only">{text("已停止回复", "Response stopped")}</p>
		{/if}
	</div>
	<Button type="button" size="sm" variant="outline" onclick={() => (thinking = !thinking)}>
		{thinking ? text("停止回复", "Stop response") : text("开始思考", "Start thinking")}
	</Button>
</section>
