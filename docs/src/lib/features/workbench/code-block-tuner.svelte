<script lang="ts">
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { useHighlightedCode } from "$lib/registry/hooks/use-highlighted-code.svelte.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { CODE_BLOCK_SPEC } from "./code-block-tuning.js";

	let { children }: { children: Snippet } = $props();
	type Pane = "current" | "before";
	const initial =
		'const message = "横向留白只影响代码块自身，不改变复制、行号或长行横向滚动的行为";\n\nconsole.log(message);';
	const chunks = [
		"\n",
		"\nconst result = {",
		"\n  ok: true,",
		'\n  source: "本地流式演示",',
		"\n};",
	];
	const patch = [
		{ variant: "default", code: "export function greet() {" },
		{ variant: "removed", code: '  return "Hello";' },
		{ variant: "added", code: '  return "你好，Valar";' },
		{ variant: "default", code: "" },
		{ variant: "highlighted", code: "}" },
	] as const;
	const patchText = patch
		.map(
			(line) =>
				`${line.variant === "added" ? "+" : line.variant === "removed" ? "-" : " "}${line.code}`
		)
		.join("\n");
	let states = $state({
		current: { code: initial, wrap: false, numbered: true, streaming: false },
		before: { code: initial, wrap: false, numbered: true, streaming: false },
	});
	const highlighted = {
		current: useHighlightedCode(
			() => states.current.code,
			() => "ts"
		),
		before: useHighlightedCode(
			() => states.before.code,
			() => "ts"
		),
	};
	const timers = new SvelteMap<Pane, ReturnType<typeof setInterval>>();
	function stop(pane: Pane) {
		clearInterval(timers.get(pane));
		timers.delete(pane);
		states[pane].streaming = false;
	}
	function append(pane: Pane) {
		stop(pane);
		states[pane].streaming = true;
		let index = 0;
		timers.set(
			pane,
			setInterval(() => {
				states[pane].code += chunks[index++];
				if (index === chunks.length) stop(pane);
			}, 250)
		);
	}
	function replace(pane: Pane) {
		stop(pane);
		states[pane].code = 'const replaced = true;\n\nconsole.log("已替换内容，可继续追加");';
	}
	onDestroy(() => {
		for (const timer of timers.values()) clearInterval(timer);
	});
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-6 p-4 md:p-6">
		<p class="text-xs text-muted-foreground">
			两种尺寸共用真实高亮输出；复制直接使用系统剪贴板，不模拟成功状态。追加与替换仅操作本地文本，两侧独立。
		</p>
		<div class="flex flex-wrap gap-2">
			<Button
				size="sm"
				variant="outline"
				aria-pressed={states[pane].wrap}
				onclick={() => (states[pane].wrap = !states[pane].wrap)}>长行换行</Button
			>
			<Button
				size="sm"
				variant="outline"
				aria-pressed={states[pane].numbered}
				onclick={() => (states[pane].numbered = !states[pane].numbered)}>行号</Button
			>
			<Button size="sm" disabled={states[pane].streaming} onclick={() => append(pane)}
				>流式追加</Button
			>
			<Button size="sm" variant="outline" onclick={() => replace(pane)}>替换内容／取消追加</Button>
		</div>
		<p role="status" class="text-xs text-muted-foreground">
			{states[pane].streaming ? "正在逐段追加…" : "本地代码已就绪，可复制或再次追加。"}
		</p>
		{#each ["default", "sm"] as size (size)}
			<section class="grid min-w-0 gap-3" aria-label={`${size} 尺寸代码块`}>
				<h3 class="text-sm font-medium">
					{size === "sm" ? "小尺寸" : "默认尺寸"} · 标题／页脚组合
				</h3>
				{#each ["both", "none", "header", "footer"] as layout (layout)}
					<CodeBlock.Root size={size === "sm" ? "sm" : "default"}>
						{#if layout === "both" || layout === "header"}
							<CodeBlock.Header>
								<CodeBlock.Title
									>demo.ts · {layout === "both" ? "标题与页脚" : "仅标题"}</CodeBlock.Title
								>
								<CodeBlock.Actions
									><CodeBlock.CopyButton value={states[pane].code} /></CodeBlock.Actions
								>
							</CodeBlock.Header>
						{:else if layout === "none"}
							<CodeBlock.Actions
								><CodeBlock.CopyButton value={states[pane].code} /></CodeBlock.Actions
							>
						{/if}
						<CodeBlock.Content
							wrap={states[pane].wrap}
							lineNumbers={states[pane].numbered}
							startLine={10}
						>
							{#each highlighted[pane].current as line, index (index)}
								<CodeBlock.Line code={line} />
							{/each}
						</CodeBlock.Content>
						{#if layout === "both" || layout === "footer"}
							<CodeBlock.Footer>
								<span class="text-xs text-muted-foreground"
									>TypeScript · {layout === "both" ? "标题与页脚" : "仅页脚"}</span
								>
								<CodeBlock.Actions
									><CodeBlock.CopyButton value={states[pane].code} /></CodeBlock.Actions
								>
							</CodeBlock.Footer>
						{/if}
					</CodeBlock.Root>
				{/each}
				<CodeBlock.Root size={size === "sm" ? "sm" : "default"}>
					<CodeBlock.Header>
						<CodeBlock.Title>变更与空行 · diff</CodeBlock.Title>
						<CodeBlock.Actions><CodeBlock.CopyButton value={patchText} /></CodeBlock.Actions>
					</CodeBlock.Header>
					<CodeBlock.Content wrap={states[pane].wrap} lineNumbers={states[pane].numbered}>
						{#each patch as line, index (index)}<CodeBlock.Line
								variant={line.variant}
								code={line.code}
							/>{/each}
					</CodeBlock.Content>
				</CodeBlock.Root>
			</section>
		{/each}
	</div>
{/snippet}

<ComponentTuner spec={CODE_BLOCK_SPEC} {canvas}>{@render children()}</ComponentTuner>
