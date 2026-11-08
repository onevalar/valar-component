<script lang="ts">
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { t } from "$lib/i18n/index.js";
	import { useHighlightedCode } from "$lib/registry/hooks/use-highlighted-code.svelte.js";

	let { code, language, title }: { code: string; language: string; title: string } = $props();
	const lines = useHighlightedCode(
		() => code,
		() => language
	);
</script>

<CodeBlock.Root>
	<CodeBlock.Header>
		<CodeBlock.Title>{title}</CodeBlock.Title>
		<CodeBlock.Actions>
			<CodeBlock.CopyButton
				value={code}
				copyLabel={t("usage.copy")}
				copiedLabel={t("usage.copied")}
			/>
		</CodeBlock.Actions>
	</CodeBlock.Header>
	<CodeBlock.Content wrap class="data-wrap:wrap-anywhere">
		{#each lines.current as line, index (index)}
			<CodeBlock.Line code={line} />
		{/each}
	</CodeBlock.Content>
</CodeBlock.Root>
