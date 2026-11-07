<script lang="ts">
	import { page } from "$app/state";
	import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
	import BrainIcon from "@lucide/svelte/icons/brain";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import MessageCircleDashedIcon from "@lucide/svelte/icons/message-circle-dashed";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import WrenchIcon from "@lucide/svelte/icons/wrench";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as MessageScroller from "$lib/registry/ui/message-scroller/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import * as Trace from "$lib/registry/ui/trace/index.js";
	import Markdown from "$lib/components/markdown/markdown.svelte";
	import { agentChat as chat } from "$lib/agent/chat.svelte.js";
	import { agentPanel } from "$lib/agent/panel.svelte.js";
	import { EFFORTS } from "$lib/agent/settings.js";
	import { agentSettings } from "$lib/agent/settings.svelte.js";
	import type { UiNode } from "$lib/agent/ui-catalog.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import AgentPrompt from "./agent-prompt.svelte";
	import AgentSettings from "./agent-settings.svelte";
	import UiRenderer from "./ui-renderer.svelte";
	import type { UIMessage } from "ai";

	/** `page` is the home screen; `panel` is the narrow drawer used on every other page. */
	let { variant = "panel" }: { variant?: "page" | "panel" } = $props();

	const locale = $derived((page.data.locale ?? "en") as Locale);

	const SUGGESTIONS = [
		"输入 6 位短信验证码用哪个组件？",
		"设计一个登录表单，让我看看效果",
		"下拉选择器、组合框、原生选择器怎么选？",
		"给设置页拼一组开关和单选",
	];

	let view = $state<"chat" | "settings">("chat");
	// The reader's choice per reasoning row; until they click, it follows whether it is still running.
	let reasoningOpen = $state<Record<string, boolean>>({});

	const hero = $derived(variant === "page" && view === "chat" && !chat.messages.length);
	const busy = $derived(chat.status === "submitted" || chat.status === "streaming");
	const notConfigured = $derived(chat.error?.message.includes("not_configured") ?? false);

	function send(text: string) {
		const value = text.trim();
		if (!value || busy) return;
		view = "chat";
		void chat.sendMessage({ text: value });
	}

	// A question handed over from elsewhere on the site (search box, suggestion buttons).
	$effect(() => {
		if (variant === "panel" ? agentPanel.open && agentPanel.pending : agentPanel.pending) {
			const question = agentPanel.pending!;
			agentPanel.pending = null;
			send(question);
		}
	});

	type Part = UIMessage["parts"][number];
	type ToolPart = Extract<Part, { type: `tool-${string}` }>;
	const isTool = (part: Part): part is ToolPart => part.type.startsWith("tool-");
	const messageText = (message: UIMessage) =>
		message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");

	type Step = { part: Part; index: number };
	type Segment =
		| { kind: "steps"; steps: Step[] }
		| { kind: "text"; text: string }
		| { kind: "ui"; root: UiNode; title?: string };

	/** Splits an answer into runs, in the order they happened: steps, text and drawn interfaces. */
	function segments(message: UIMessage): Segment[] {
		const out: Segment[] = [];
		message.parts.forEach((part, index) => {
			if (part.type === "text") {
				if (part.text) out.push({ kind: "text", text: part.text });
			} else if (
				part.type === "tool-show_ui" &&
				part.state === "output-available" &&
				(part.output as { ok?: boolean })?.ok
			) {
				const input = part.input as { root: UiNode; title?: string };
				out.push({ kind: "ui", root: input.root, title: input.title });
			} else if (part.type === "reasoning" || isTool(part)) {
				const last = out.at(-1);
				if (last?.kind === "steps") last.steps.push({ part, index });
				else out.push({ kind: "steps", steps: [{ part, index }] });
			}
		});
		return out;
	}

	type Input = Record<string, string | undefined>;
	const STEPS: Record<string, { verb: string; noun: string; target?: (input: Input) => string }> = {
		"tool-list_components": { verb: "列出", noun: "组件" },
		"tool-search_components": { verb: "搜索", noun: "组件", target: (i) => `「${i.query ?? ""}」` },
		"tool-get_component": { verb: "查阅", noun: "组件", target: (i) => ` ${i.name ?? ""}` },
		"tool-get_install_command": { verb: "生成", noun: "安装命令" },
		"tool-get_skill": { verb: "读取", noun: "技能包" },
		"tool-search_docs": {
			verb: "搜索",
			noun: "文档",
			target: (i) => (i.query ? `「${i.query}」` : ""),
		},
		"tool-read_doc": { verb: "阅读", noun: "文档", target: (i) => ` ${i.path ?? ""}` },
		"tool-get_example": { verb: "读取", noun: "示例", target: (i) => ` ${i.name ?? ""}` },
		"tool-list_themes": { verb: "列出", noun: "主题" },
		"tool-get_theme": { verb: "读取", noun: "主题", target: (i) => ` ${i.name ?? ""}` },
		"tool-get_ui_catalog": { verb: "查阅", noun: "积木说明" },
		"tool-show_ui": {
			verb: "拼出",
			noun: "界面",
			target: (i) => (i.title ? `「${i.title}」` : ""),
		},
		"tool-review_code": { verb: "检查", noun: "代码规范" },
	};

	/** Names the step as a full phrase for each state, as the Trace rules ask. */
	function toolTitle(part: ToolPart, streaming: boolean): string {
		const step = STEPS[part.type] ?? { verb: "调用", noun: part.type.replace("tool-", "") };
		const name = `${step.noun}${step.target?.((part.input ?? {}) as Input) ?? ""}`;
		if (part.state === "output-available") {
			if (part.type === "tool-show_ui" && !(part.output as { ok?: boolean })?.ok) {
				return `${name}未通过校验，正在修改`;
			}
			return `已${step.verb}${name}`;
		}
		if (part.state === "output-error") return `${step.verb}${name}失败`;
		return streaming ? `正在${step.verb}${name}` : `${step.verb}${name}失败`;
	}

	/** Components a search found, as links, so a recommendation is one click from its page. */
	function picks(steps: Step[]): { slug: string; title: string }[] {
		return steps.flatMap(({ part }) =>
			isTool(part) && part.type === "tool-search_components" && part.state === "output-available"
				? [...String(part.output).matchAll(/^- `([a-z0-9-]+)` (.+?)（/gm)]
						.slice(0, 4)
						.map((m) => ({ slug: m[1], title: m[2] }))
				: []
		);
	}
</script>

{#snippet traceRow(part: ToolPart, streaming: boolean)}
	{@const rejected =
		part.type === "tool-show_ui" &&
		part.state === "output-available" &&
		!(part.output as { ok?: boolean })?.ok}
	{@const failed =
		rejected || part.state === "output-error" || (!streaming && part.state !== "output-available")}
	<Trace.Line status={failed ? "error" : part.state === "output-available" ? undefined : "running"}>
		<Trace.Icon>
			{#if failed}
				<TriangleAlertIcon />
			{:else if part.state === "output-available"}
				<CircleCheckIcon />
			{:else}
				<LoaderCircleIcon class="animate-spin" />
			{/if}
		</Trace.Icon>
		<Trace.Title>{toolTitle(part, streaming)}</Trace.Title>
	</Trace.Line>
{/snippet}

<div class="flex min-h-0 flex-1 flex-col">
	{#if !hero}
		<div class="flex items-center gap-1 px-4 py-2 {variant === 'panel' ? 'pr-12' : ''}">
			{#if view === "settings"}
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="返回对话"
					onclick={() => (view = "chat")}
				>
					<ArrowLeftIcon />
				</Button>
			{/if}
			<span class="text-sm font-medium">{view === "settings" ? "模型设置" : "组件助手"}</span>
			{#if view === "chat"}
				<div class="ml-auto flex items-center gap-1">
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon-sm"
									aria-label="模型设置"
									onclick={() => (view = "settings")}
								>
									<SettingsIcon />
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>模型设置</Tooltip.Content>
					</Tooltip.Root>
					{#if chat.messages.length}
						<Tooltip.Root>
							<Tooltip.Trigger>
								{#snippet child({ props })}
									<Button
										{...props}
										variant="ghost"
										size="icon-sm"
										aria-label="清空对话"
										onclick={() => {
											void chat.stop();
											chat.messages = [];
											chat.clearError();
										}}
									>
										<Trash2Icon />
									</Button>
								{/snippet}
							</Tooltip.Trigger>
							<Tooltip.Content>清空对话</Tooltip.Content>
						</Tooltip.Root>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	{#if view === "settings"}
		<div class="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-4 pb-4">
			<AgentSettings onDone={() => (view = "chat")} />
		</div>
	{:else if hero}
		<!-- Before the first message the home page is only a box: ask, search or tell it what to build. -->
		<div class="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 pb-24">
			<div class="flex flex-col items-center gap-2 text-center">
				<h1 class="text-3xl font-semibold tracking-tight">想设计点什么？</h1>
				<p class="text-muted-foreground">搜组件、问选型、让我拼界面，都在这一个框里。</p>
			</div>
			<AgentPrompt
				large
				autofocus
				{busy}
				onSend={send}
				onStop={() => void chat.stop()}
				onSettings={() => (view = "settings")}
			/>
			<div class="flex flex-wrap justify-center gap-2">
				{#each SUGGESTIONS as suggestion (suggestion)}
					<Button variant="outline" size="sm" onclick={() => send(suggestion)}>{suggestion}</Button>
				{/each}
			</div>
		</div>
	{:else}
		<MessageScroller.Provider>
			<div class="min-h-0 flex-1">
				{#if !chat.messages.length}
					<Empty.Root class="h-full">
						<Empty.Header>
							<Empty.Media variant="icon"><MessageCircleDashedIcon /></Empty.Media>
							<Empty.Title>想设计点什么？</Empty.Title>
							<Empty.Description>
								问我组件怎么选，或者让我用库里的组件拼一个界面给你看。查到的、拼出来的都来自这个站。
							</Empty.Description>
						</Empty.Header>
						<Empty.Content class={variant === "page" ? "max-w-xl" : ""}>
							{#each SUGGESTIONS.slice(0, variant === "page" ? 4 : 3) as suggestion (suggestion)}
								<Button variant="outline" size="sm" onclick={() => send(suggestion)}
									>{suggestion}</Button
								>
							{/each}
						</Empty.Content>
					</Empty.Root>
				{:else}
					<MessageScroller.Root>
						<MessageScroller.Viewport>
							<MessageScroller.Content
								aria-busy={busy}
								class="mx-auto w-full gap-6 px-4 py-0 {variant === 'page' ? 'max-w-3xl' : ''}"
							>
								{#each chat.messages as message (message.id)}
									{#if message.role === "user"}
										<MessageScroller.Item messageId={message.id} scrollAnchor>
											<Message.Root align="end">
												<Message.Content>
													<Bubble.Root align="end" variant="muted">
														<Bubble.Content>{messageText(message)}</Bubble.Content>
													</Bubble.Root>
												</Message.Content>
											</Message.Root>
										</MessageScroller.Item>
									{:else}
										{@const streaming = busy && message === chat.messages.at(-1)}
										<MessageScroller.Item messageId={message.id}>
											<Message.Root>
												<Message.Content class="gap-3">
													{#each segments(message) as segment, si (si)}
														{#if segment.kind === "steps"}
															<Trace.Root>
																{#each segment.steps as { part, index } (index)}
																	{#if part.type === "reasoning"}
																		{@const id = `${message.id}-${index}`}
																		{@const running = part.state === "streaming"}
																		<Trace.Collapsible
																			open={reasoningOpen[id] ?? running}
																			onOpenChange={(open) => (reasoningOpen[id] = open)}
																		>
																			<Trace.CollapsibleTrigger>
																				<Trace.Line status={running ? "running" : undefined}>
																					<Trace.Icon>
																						{#if running}
																							<LoaderCircleIcon class="animate-spin" />
																						{:else}
																							<BrainIcon />
																						{/if}
																					</Trace.Icon>
																					<Trace.Title
																						>{running ? "正在思考" : "已思考"}</Trace.Title
																					>
																				</Trace.Line>
																			</Trace.CollapsibleTrigger>
																			<Trace.CollapsibleContent class="whitespace-pre-wrap">
																				{part.text}
																			</Trace.CollapsibleContent>
																		</Trace.Collapsible>
																	{:else if isTool(part)}
																		{@render traceRow(part, streaming)}
																	{/if}
																{/each}
															</Trace.Root>
															{#each picks(segment.steps) as pick (pick.slug)}
																<Button
																	variant="outline"
																	size="sm"
																	href={localizeHref(`/docs/components/${pick.slug}`, locale)}
																	onclick={() => (agentPanel.open = false)}
																>
																	<WrenchIcon />
																	{pick.title}
																</Button>
															{/each}
														{:else if segment.kind === "ui"}
															<Card.Root size="sm" class="w-full">
																{#if segment.title}
																	<Card.Header>
																		<Card.Title>{segment.title}</Card.Title>
																	</Card.Header>
																{/if}
																<Card.Content>
																	<UiRenderer root={segment.root} />
																</Card.Content>
															</Card.Root>
														{:else}
															<Markdown content={segment.text} />
														{/if}
													{/each}
												</Message.Content>
											</Message.Root>
										</MessageScroller.Item>
									{/if}
								{/each}
							</MessageScroller.Content>
						</MessageScroller.Viewport>
						<MessageScroller.Button />
					</MessageScroller.Root>
				{/if}
			</div>
		</MessageScroller.Provider>

		{#if chat.error}
			<div class="mx-auto w-full px-4 pb-2 {variant === 'page' ? 'max-w-3xl' : ''}">
				<Alert.Root variant="destructive">
					<TriangleAlertIcon />
					{#if notConfigured}
						<Alert.Title>还没有填写模型</Alert.Title>
						<Alert.Description>在「模型设置」里填写 API Key 和模型名后再提问。</Alert.Description>
						<Alert.Action>
							<Button size="xs" variant="outline" onclick={() => (view = "settings")}>去设置</Button
							>
						</Alert.Action>
					{:else}
						<Alert.Title>请求失败</Alert.Title>
						<Alert.Description>{chat.error.message}</Alert.Description>
						{#if /reasoning_effort|responses/i.test(chat.error.message)}
							<Alert.Action>
								<Button
									size="xs"
									variant="outline"
									onclick={() => {
										agentSettings.effort = "none";
										agentSettings.apiMode = "responses";
										chat.clearError();
									}}>改用 Responses 接口并关闭思考</Button
								>
							</Alert.Action>
						{/if}
					{/if}
				</Alert.Root>
			</div>
		{/if}

		<div class="mx-auto w-full p-4 {variant === 'page' ? 'max-w-3xl' : ''}">
			<AgentPrompt
				{busy}
				onSend={send}
				onStop={() => void chat.stop()}
				onSettings={() => (view = "settings")}
			/>
		</div>
	{/if}
</div>
