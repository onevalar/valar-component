<script lang="ts">
	import { onDestroy, type Snippet } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as MessageScroller from "$lib/registry/ui/message-scroller/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import ComponentTuner from "./component-tuner.svelte";
	import { MESSAGE_SCROLLER_SPEC } from "./message-scroller-tuning.js";

	let { children }: { children: Snippet } = $props();
	const id = $props.id();
	type Pane = "current" | "before";
	type Row = { id: string; text: string; user: boolean; anchor: boolean };
	const transcript: Row[] = [
		{ id: "request", text: "请整理这次本地组件审阅的要点。", user: true, anchor: true },
		{
			id: "summary",
			text: "先检查消息列表的键盘滚动，再对比不同间距。这里的所有内容均来自本地固定文本，不会发起外部请求。",
			user: false,
			anchor: false,
		},
		{ id: "history-question", text: "阅读旧消息时加载历史会怎样？", user: true, anchor: true },
		{
			id: "history-answer",
			text: "向上滚动后点击“加载历史”。原语会保留当前阅读位置；间距编辑不会写入滚动跟随、回合锚定或视口配置。",
			user: false,
			anchor: false,
		},
		{ id: "stream-question", text: "能否演示流式回复与新回合？", user: true, anchor: true },
		{
			id: "stream-answer",
			text: "点击“本地流式回复”逐段添加文字；点击“开启新回合”添加真实锚点。滚动至旧消息时不会强行将你拉回底部。跳转按钮由真实 Message Scroller 原语控制。",
			user: false,
			anchor: false,
		},
	];
	const createPane = () => ({
		rows: transcript.map((row) => ({ ...row })),
		serial: 0,
		historyLoaded: false,
		streaming: false,
	});
	let panes = $state({ current: createPane(), before: createPane() });
	const timers = new SvelteMap<Pane, ReturnType<typeof setInterval>>();
	function stop(pane: Pane) {
		clearInterval(timers.get(pane));
		timers.delete(pane);
		panes[pane].streaming = false;
	}
	function append(pane: Pane, user: boolean) {
		const state = panes[pane];
		state.serial += 1;
		state.rows.push({
			id: `local-${state.serial}`,
			text: user
				? `新回合 ${state.serial}：请继续检查本地列表。`
				: `补充回复 ${state.serial}：这是一条普通追加消息，不开启新的回合锚点。`,
			user,
			anchor: user,
		});
	}
	function prepend(pane: Pane) {
		if (panes[pane].historyLoaded) return;
		panes[pane].rows = [
			{
				id: "archive-request",
				text: "更早的记录：这次审阅从哪里开始？",
				user: true,
				anchor: false,
			},
			{
				id: "archive-response",
				text: "从真实组件的默认状态开始，然后验证历史插入、消息追加与本地流式回复。历史消息拥有稳定 ID，不使用数组下标。",
				user: false,
				anchor: false,
			},
			...panes[pane].rows,
		];
		panes[pane].historyLoaded = true;
	}
	function stream(pane: Pane) {
		if (panes[pane].streaming) return;
		append(pane, false);
		const state = panes[pane];
		const rowId = state.rows.at(-1)!.id;
		state.rows.at(-1)!.text = "本地流式回复：";
		state.streaming = true;
		const chunks = [
			"正在逐段生成固定示例文字。",
			"每个画布有独立的 Provider 和消息状态。",
			"阅读旧消息不会被打断；可点击底部按钮回到最新内容。",
			"这里没有任何外部请求，定时器会在停止、画布关闭或卸载时清理。",
		];
		let cursor = 0;
		timers.set(
			pane,
			setInterval(() => {
				const row = state.rows.find((row) => row.id === rowId);
				if (!row) return stop(pane);
				row.text += `\n\n${chunks[cursor++]}`;
				if (cursor === chunks.length) stop(pane);
			}, 450)
		);
	}
	// Stable attachment functions clean up when a comparison pane or the editor unmounts.
	const mounts = {
		current: () => () => stop("current"),
		before: () => () => stop("before"),
	};
	onDestroy(() => {
		for (const timer of timers.values()) clearInterval(timer);
	});
</script>

{#snippet canvas(pane: Pane)}
	<div class="grid min-w-0 gap-4 p-4 md:p-6" {@attach mounts[pane]}>
		<p class="text-xs text-muted-foreground">
			使用真实消息滚动原语。先向上阅读，再加载历史或追加回复；微调仅改变 Content 留白。
		</p>
		<div class="flex flex-wrap gap-2">
			<Button
				size="sm"
				variant="outline"
				disabled={panes[pane].historyLoaded}
				onclick={() => prepend(pane)}>加载历史</Button
			>
			<Button size="sm" variant="outline" onclick={() => append(pane, false)}>追加回复</Button>
			<Button size="sm" variant="outline" onclick={() => append(pane, true)}>开启新回合</Button>
			<Button
				size="sm"
				variant="outline"
				disabled={panes[pane].streaming}
				onclick={() => stream(pane)}>本地流式回复</Button
			>
			<Button
				size="sm"
				variant="outline"
				disabled={!panes[pane].streaming}
				onclick={() => stop(pane)}>停止流式回复</Button
			>
		</div>
		<MessageScroller.Provider autoScroll>
			<div class="h-96 min-w-0 rounded-lg border">
				<MessageScroller.Root>
					<MessageScroller.Viewport
						aria-label={`${pane === "current" ? "草稿" : "对比"}本地消息记录`}
					>
						<MessageScroller.Content aria-busy={panes[pane].streaming}>
							{#each panes[pane].rows as row (row.id)}
								<MessageScroller.Item
									messageId={`${id}-${pane}-${row.id}`}
									scrollAnchor={row.anchor}
								>
									<Message.Root align={row.user ? "end" : "start"}>
										<Message.Content>
											<Message.Header>{row.user ? "本地用户" : "本地助手"}</Message.Header>
											<Bubble.Root variant={row.user ? "muted" : "ghost"}>
												<Bubble.Content
													><p class="whitespace-pre-wrap">{row.text}</p></Bubble.Content
												>
											</Bubble.Root>
										</Message.Content>
									</Message.Root>
								</MessageScroller.Item>
							{/each}
						</MessageScroller.Content>
					</MessageScroller.Viewport>
					<MessageScroller.Button direction="start" />
					<MessageScroller.Button />
				</MessageScroller.Root>
			</div>
		</MessageScroller.Provider>
	</div>
{/snippet}

<ComponentTuner spec={MESSAGE_SCROLLER_SPEC} {canvas}>{@render children()}</ComponentTuner>
