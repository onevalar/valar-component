<script lang="ts">
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Marker from "$lib/registry/ui/marker/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as Trace from "$lib/registry/ui/trace/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import type { Turn } from "./data.js";

	let { turn, chinese }: { turn: Turn; chinese: boolean } = $props();
	const text = (zh: string, en: string) => (chinese ? zh : en);
	let copyResult = $state<"ok" | "failed">();
	const copyLabel = $derived(text("复制回复", "Copy reply"));
	const toolLabel = $derived(
		turn.tool === "file"
			? turn.toolDone
				? text("已检查附件", "Checked attachments")
				: text("正在检查附件…", "Checking attachments…")
			: turn.toolDone
				? text("已搜索示例问题", "Searched sample issues")
				: text("正在搜索示例问题…", "Searching sample issues…")
	);
	const stopped = $derived(turn.phase === "stopped");

	async function copyReply() {
		const content = [
			...turn.reply,
			...turn.checklist.map((item, index) => index + 1 + ". " + item),
		];
		try {
			await navigator.clipboard.writeText(content.join("\n\n"));
			copyResult = "ok";
		} catch {
			copyResult = "failed";
		}
	}
</script>

<Message.Root role="group" aria-label={text("Agent 回复", "Agent reply")}>
	<Message.Content class="gap-2">
		{#if turn.phase === "thinking"}
			<Marker.Root class="text-[13px] text-muted-foreground motion-safe:animate-pulse">
				{text("思考中…", "Thinking…")}
			</Marker.Root>
		{/if}
		{#if turn.tool && turn.phase !== "thinking" && (!stopped || turn.toolDone)}
			<Trace.Root class="motion-reduce:[&_[data-slot=trace-collapsible-content]]:animate-none">
				<Trace.Collapsible>
					<Trace.CollapsibleTrigger
						class="rounded-sm py-0.5 text-[13px] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
					>
						{#if turn.workedSeconds}
							{text(
								"已处理 " + turn.workedSeconds + " 秒",
								"Worked for " +
									turn.workedSeconds +
									(turn.workedSeconds === 1 ? " second" : " seconds")
							)}
						{:else}
							{text("处理中…", "Working…")}
						{/if}
					</Trace.CollapsibleTrigger>
					<Trace.CollapsibleContent class="ps-2 pt-1 motion-reduce:animate-none">
						<Trace.Line status={turn.toolDone ? undefined : "running"}>
							<Trace.Icon>
								{#if turn.tool === "file"}
									<IconPlaceholder
										lucide="FileIcon"
										tabler="IconFile"
										hugeicons="File01Icon"
										phosphor="FileIcon"
										remixicon="RiFileLine"
										aria-hidden="true"
									/>
								{:else}
									<IconPlaceholder
										lucide="SearchIcon"
										tabler="IconSearch"
										hugeicons="Search01Icon"
										phosphor="MagnifyingGlassIcon"
										remixicon="RiSearchLine"
										aria-hidden="true"
									/>
								{/if}
							</Trace.Icon>
							<Trace.Title>{toolLabel}</Trace.Title>
							{#if turn.toolDone && turn.tool === "search"}
								<Trace.Description>{text("评审清单", "Review checklist")}</Trace.Description>
							{/if}
						</Trace.Line>
					</Trace.CollapsibleContent>
				</Trace.Collapsible>
			</Trace.Root>
		{/if}
		{#if turn.reply.length}
			<Bubble.Root variant="ghost" class="w-full">
				<Bubble.Content class="w-full border-0 text-[15px] leading-6">
					{#each turn.reply as paragraph, index (index)}
						<p class="mb-3 last:mb-0">{paragraph}</p>
					{/each}
					{#if turn.checklist.length}
						<ol class="list-decimal space-y-1 ps-6">
							{#each turn.checklist as item, index (index)}
								<li>{item}</li>
							{/each}
						</ol>
					{/if}
				</Bubble.Content>
			</Bubble.Root>
		{/if}
		{#if stopped}<p role="status" class="text-xs text-muted-foreground">
				{text("已停止回复", "Response stopped")}
			</p>{/if}
		{#if turn.phase === "done" || (stopped && turn.reply.length)}
			<Message.Footer class="flex items-center gap-1">
				<Button
					size="icon-xs"
					variant="ghost"
					aria-label={copyLabel}
					title={copyLabel}
					onclick={copyReply}
				>
					<IconPlaceholder
						lucide="CopyIcon"
						tabler="IconCopy"
						hugeicons="Copy01Icon"
						phosphor="CopyIcon"
						remixicon="RiFileCopyLine"
						aria-hidden="true"
					/>
				</Button>
				{#if copyResult}<span role="status" class="text-xs text-muted-foreground"
						>{copyResult === "ok"
							? text("已复制", "Copied")
							: text("无法复制", "Could not copy")}</span
					>{/if}
			</Message.Footer>
		{/if}
	</Message.Content>
</Message.Root>
