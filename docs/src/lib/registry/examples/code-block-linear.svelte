<script lang="ts">
	import WrapTextIcon from "@lucide/svelte/icons/text-wrap";
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { useHighlightedCode } from "$lib/registry/hooks/use-highlighted-code.svelte.js";
	import { Button } from "$lib/registry/ui/button/index.js";

	const issue = `const release = {
  id: "issue-review",
  title: "Review the code sample",
  status: "ready",
  documentation: "https://example.com/docs/releases/component-preview/code-block/issue-review/keyboard-and-scroll-area",
  tags: ["documentation", "qa"],
  version: 2,
};

console.log(release);`;
	const agent = `const tasks = ["Design", "Build", "Review"];

for (const task of tasks) {
  console.log(task);
}`;
	const highlighted = useHighlightedCode(
		() => agent,
		() => "javascript"
	);
	let wrap = $state(false);
</script>

<div class="grid w-full max-w-lg min-w-0 gap-4 [contain:inline-size]">
	<CodeBlock.Root appearance="issue">
		<CodeBlock.Actions>
			<CodeBlock.CopyButton
				value={issue}
				copyLabel="Copy issue code"
				copiedLabel="Issue code copied"
			/>
		</CodeBlock.Actions>
		<CodeBlock.Content
			code={issue}
			aria-label="Issue code"
			lineNumbers
			class="max-h-36 scroll-fade-y"
		/>
	</CodeBlock.Root>

	<CodeBlock.Root appearance="agent">
		<CodeBlock.Header>
			<CodeBlock.Title>JavaScript</CodeBlock.Title>
			<CodeBlock.Actions>
				<Button
					variant="ghost"
					size="icon-xs"
					class="size-6.5"
					aria-label="Wrap reply code"
					aria-pressed={wrap}
					onclick={() => (wrap = !wrap)}
				>
					<WrapTextIcon />
				</Button>
				<CodeBlock.CopyButton
					value={agent}
					copyLabel="Copy reply code"
					copiedLabel="Reply code copied"
				/>
			</CodeBlock.Actions>
		</CodeBlock.Header>
		<CodeBlock.Content {wrap} aria-label="Agent reply code" lineNumbers>
			{#each highlighted.current as line, index (index)}
				<CodeBlock.Line code={line} />
			{/each}
		</CodeBlock.Content>
	</CodeBlock.Root>
</div>
