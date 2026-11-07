<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import Metadata from "$lib/components/metadata.svelte";
	import UiRenderer from "$lib/components/ui-renderer.svelte";
	import { UI_CATALOG, validateUi } from "$lib/agent/ui-catalog.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";

	// Every example in the catalog, drawn exactly as the assistant's answers are drawn. It shows
	// what the assistant can build, and it is how an example that stops validating gets noticed.
	const examples = UI_CATALOG.map((entry) => ({
		entry,
		result: validateUi(entry.example),
	}));
</script>

<Metadata title="积木样板" description="助手可以用来拼界面的全部组件。" />

<div class="container-wrapper px-4 py-8 sm:px-6">
	<div class="mx-auto flex max-w-5xl flex-col gap-6">
		<header class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold tracking-tight">积木样板</h1>
			<p class="text-muted-foreground">
				助手用这 {UI_CATALOG.length} 种积木拼界面，样式只能选这里提供的选项。
			</p>
		</header>
		<ul class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
			{#each examples as { entry, result } (entry.type)}
				<li class="flex">
					<Card.Root class="w-full">
						<Card.Header>
							<Card.Title
								>{entry.name}
								<span class="font-mono text-xs text-muted-foreground">{entry.type}</span
								></Card.Title
							>
							<Card.Description>{entry.useWhen}</Card.Description>
							{#if !result.ok}<Card.Action
									><Badge variant="destructive">示例无效</Badge></Card.Action
								>{/if}
						</Card.Header>
						<Card.Content>
							<div class="rounded-lg border bg-background p-4">
								{#if result.ok}
									<UiRenderer root={result.root} />
								{:else}
									<p class="text-sm">{result.errors.join("；")}</p>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</li>
			{/each}
		</ul>
	</div>
</div>
