<script lang="ts">
	import CheckIcon from "@lucide/svelte/icons/check";
	import CodeIcon from "@lucide/svelte/icons/code";
	import CopyIcon from "@lucide/svelte/icons/copy";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import MonitorIcon from "@lucide/svelte/icons/monitor";
	import SmartphoneIcon from "@lucide/svelte/icons/smartphone";
	import { onDestroy } from "svelte";
	import * as CodeBlock from "$lib/registry/ui/code-block/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { UiNode } from "$lib/agent/ui-catalog.js";
	import { uiNodeToSvelte } from "$lib/agent/ui-to-svelte.js";
	import UiRenderer from "./ui-renderer.svelte";

	let {
		root,
		title,
	}: {
		root: UiNode;
		title?: string;
	} = $props();

	let mode = $state<"preview" | "code">("preview");
	let viewport = $state<"desktop" | "mobile">("desktop");
	let copiedCode = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const generated = $derived(uiNodeToSvelte(root));

	function copyCode() {
		navigator.clipboard
			.writeText(generated.code)
			.then(() => {
				copiedCode = true;
				clearTimeout(copyTimer);
				copyTimer = setTimeout(() => (copiedCode = false), 2000);
			})
			.catch(() => {});
	}

	onDestroy(() => clearTimeout(copyTimer));
</script>

<div class="w-full overflow-hidden rounded-lg border-[0.5px] border-border bg-background">
	<div
		class="flex flex-wrap items-center justify-between gap-2 border-b-[0.5px] border-border bg-muted/25 px-3 py-1.5"
	>
		<span class="min-w-0 truncate text-xs font-medium text-muted-foreground">
			{title || "界面预览"}
		</span>

		<div class="flex shrink-0 flex-wrap items-center gap-1.5">
			{#if mode === "preview"}
				<div
					role="group"
					aria-label="预览宽度"
					class="flex items-center rounded-md border-[0.5px] border-border bg-background p-0.5"
				>
					<Button
						size="xs"
						shape="square"
						variant={viewport === "desktop" ? "secondary" : "ghost"}
						aria-label="桌面宽度"
						aria-pressed={viewport === "desktop"}
						onclick={() => (viewport = "desktop")}
					>
						<MonitorIcon />
						<span class="hidden sm:inline">桌面</span>
					</Button>
					<Button
						size="xs"
						shape="square"
						variant={viewport === "mobile" ? "secondary" : "ghost"}
						aria-label="窄屏宽度（390px）"
						aria-pressed={viewport === "mobile"}
						onclick={() => (viewport = "mobile")}
					>
						<SmartphoneIcon />
						<span>390px</span>
					</Button>
				</div>
			{/if}

			<div
				role="group"
				aria-label="查看模式"
				class="flex items-center rounded-md border-[0.5px] border-border bg-background p-0.5"
			>
				<Button
					size="xs"
					shape="square"
					variant={mode === "preview" ? "secondary" : "ghost"}
					aria-pressed={mode === "preview"}
					onclick={() => (mode = "preview")}
				>
					<EyeIcon />
					预览
				</Button>
				<Button
					size="xs"
					shape="square"
					variant={mode === "code" ? "secondary" : "ghost"}
					aria-pressed={mode === "code"}
					onclick={() => (mode = "code")}
				>
					<CodeIcon />
					代码
				</Button>
			</div>

			<Button
				size="xs"
				variant="outline"
				onclick={copyCode}
				aria-label={copiedCode ? "已复制 Svelte 代码" : "复制 Svelte 代码"}
			>
				{#if copiedCode}
					<CheckIcon />
					已复制
				{:else}
					<CopyIcon />
					复制代码
				{/if}
			</Button>
		</div>
	</div>

	{#if mode === "preview"}
		{#if viewport === "mobile"}
			<div class="flex justify-center bg-muted/20 p-4">
				<div
					data-preview-viewport="mobile"
					class="w-full max-w-sm overflow-x-auto rounded-lg border-[0.5px] border-border bg-background p-4"
				>
					<UiRenderer {root} />
				</div>
			</div>
		{:else}
			<div data-preview-viewport="desktop" class="p-4">
				<UiRenderer {root} />
			</div>
		{/if}
	{:else}
		<div class="flex flex-col gap-3 p-3">
			{#if generated.installCommand}
				<CodeBlock.Root size="sm">
					<CodeBlock.Header>
						<CodeBlock.Title>安装所需组件</CodeBlock.Title>
						<CodeBlock.Actions>
							<CodeBlock.CopyButton
								value={generated.installCommand}
								copyLabel="复制安装命令"
								copiedLabel="已复制安装命令"
							/>
						</CodeBlock.Actions>
					</CodeBlock.Header>
					<CodeBlock.Content code={generated.installCommand} />
				</CodeBlock.Root>
			{/if}

			<CodeBlock.Root size="sm">
				<CodeBlock.Header>
					<CodeBlock.Title>Svelte 5 源码</CodeBlock.Title>
					<CodeBlock.Actions>
						<CodeBlock.CopyButton
							value={generated.code}
							copyLabel="复制源码"
							copiedLabel="已复制源码"
						/>
					</CodeBlock.Actions>
				</CodeBlock.Header>
				<CodeBlock.Content code={generated.code} lineNumbers class="max-h-96" />
			</CodeBlock.Root>
		</div>
	{/if}
</div>
