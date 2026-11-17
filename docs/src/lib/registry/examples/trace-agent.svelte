<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import * as Trace from "$lib/registry/ui/trace/index.js";
	import { getLocale } from "$lib/i18n/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	const chinese = $derived(getLocale() === "zh");
	let running = $state(false);
</script>

<div class="grid w-full max-w-sm min-w-0 gap-3">
	<Trace.Root appearance="agent">
		{#if running}
			<Trace.Line status="running">
				<Trace.Title>{chinese ? "正在搜索…" : "Searching…"}</Trace.Title>
				<Trace.Description
					>{chinese ? "组件验收记录" : "Component acceptance notes"}</Trace.Description
				>
			</Trace.Line>
		{:else}
			<Trace.Collapsible>
				<Trace.CollapsibleTrigger>
					{chinese ? "已处理 3 秒" : "Worked for 3 seconds"}
				</Trace.CollapsibleTrigger>
				<Trace.CollapsibleContent>
					<Trace.Line>
						<Trace.Icon><Search aria-hidden="true" /></Trace.Icon>
						<Trace.Title>{chinese ? "已搜索问题" : "Searched issues"}</Trace.Title>
					</Trace.Line>
				</Trace.CollapsibleContent>
			</Trace.Collapsible>
		{/if}
	</Trace.Root>
	<Button
		variant="outline"
		size="xs"
		class="justify-self-start"
		aria-pressed={running}
		onclick={() => (running = !running)}
	>
		{chinese ? "模拟工具运行" : "Simulate tool run"}
	</Button>
</div>
