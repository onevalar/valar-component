<script lang="ts">
	import { page } from "$app/state";
	import BrainIcon from "@lucide/svelte/icons/brain";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import LayoutTemplateIcon from "@lucide/svelte/icons/layout-template";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import MessageCircleDashedIcon from "@lucide/svelte/icons/message-circle-dashed";
	import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
	import SearchIcon from "@lucide/svelte/icons/search";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import SparklesIcon from "@lucide/svelte/icons/sparkles";
	import TableIcon from "@lucide/svelte/icons/table";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import WrenchIcon from "@lucide/svelte/icons/wrench";
	import * as Alert from "$lib/registry/ui/alert/index.js";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as Empty from "$lib/registry/ui/empty/index.js";
	import * as Marker from "$lib/registry/ui/marker/index.js";
	import * as MessageScroller from "$lib/registry/ui/message-scroller/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as Trace from "$lib/registry/ui/trace/index.js";
	import Markdown from "$lib/components/markdown/markdown.svelte";
	import { ADVANCED_MODULES, ADVANCED_SCENES } from "$lib/advanced-catalog.js";
	import { agentChat as chat } from "$lib/agent/chat.svelte.js";
	import { getComponentInfos, toCodeName } from "$lib/agent/knowledge.js";
	import { agentSettings } from "$lib/agent/settings.svelte.js";
	import { usedComponentSlugs, type UiNode } from "$lib/agent/ui-catalog.js";
	import { isAdvancedModuleSlug } from "$lib/basic-component-visibility.js";
	import { localizeHref, type Locale } from "$lib/i18n/config.js";
	import { Badge } from "$lib/registry/ui/badge/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import AgentPrompt from "./agent-prompt.svelte";
	import AgentSettings from "./agent-settings.svelte";
	import UiRenderer from "./ui-renderer.svelte";
	import type { UIMessage } from "ai";

	const locale = $derived((page.data.locale ?? "en") as Locale);
	const componentInfos = $derived(
		getComponentInfos(locale).filter((item) => !isAdvancedModuleSlug(item.slug))
	);
	const componentTitles = $derived(
		new Map(componentInfos.map((item) => [item.slug, item.title] as const))
	);

	const SUGGESTION_CARDS = [
		{
			title: "组件库全局盘点",
			subtitle: "查看覆盖度与对齐状态",
			prompt: "目前组件库整体情况怎么样？",
			icon: "sparkles",
		},
		{
			title: "验证码输入框选型",
			subtitle: "推荐适合 6 位短信验证码的组件",
			prompt: "输入 6 位短信验证码用哪个组件？",
			icon: "search",
		},
		{
			title: "选择器方案对比",
			subtitle: "区分 Select、Combobox 与原生选择器",
			prompt: "下拉选择器、组合框、原生选择器怎么选？",
			icon: "layers",
		},
		{
			title: "设计一个登录表单",
			subtitle: "用基础输入与按钮现场搭建可交互卡片",
			prompt: "设计一个登录表单，让我看看效果",
			icon: "layout",
		},
		{
			title: "生成设置页开关组合",
			subtitle: "自动搭配 Field、Switch 与单选行",
			prompt: "给设置页拼一组开关和单选",
			icon: "sliders",
		},
		{
			title: "搭建项目筛选与表格",
			subtitle: "组合工具栏、筛选输入与数据列表",
			prompt: "搭一个项目筛选和数据表格面板",
			icon: "table",
		},
	] as const;

	// The model settings open as a dialog only when the user clicks the model button.
	let settingsOpen = $state(false);
	// The reader's choice per reasoning row; until they click, it follows whether it is still running.
	let reasoningOpen = $state<Record<string, boolean>>({});

	const hero = $derived(!chat.messages.length);
	const busy = $derived(chat.status === "submitted" || chat.status === "streaming");
	const threadTitle = $derived.by(() => {
		const first = chat.messages.find((item) => item.role === "user");
		const text = first ? messageText(first).trim() : "";
		return text.length > 32 ? `${text.slice(0, 32)}…` : text || "Valar 组件助手";
	});

	function send(text: string) {
		const value = text.trim();
		if (!value || busy) return;
		void chat.sendMessage({ text: value });
	}

	function onSettingsOpenChange(open: boolean) {
		settingsOpen = open;
	}

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
	{#if hero}
		<!-- Before the first message the home page centers a Linear Agent composer + 3-col cards. -->
		<div class="mx-auto flex w-full max-w-[714px] flex-1 flex-col justify-center gap-6 px-4 pb-20">
			<div class="flex flex-col items-center gap-1.5 text-center">
				<h1 class="text-[22px] font-semibold tracking-tight">想设计点什么？</h1>
				<p class="text-[13px] text-muted-foreground">
					了解组件库全貌、查询选型建议，或用基础组件现场拼出可交互界面。
				</p>
			</div>

			<AgentPrompt
				large
				autofocus
				{busy}
				onSend={send}
				onStop={() => void chat.stop()}
				onSettings={() => (settingsOpen = true)}
			/>

			<div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
				{#each SUGGESTION_CARDS as card (card.prompt)}
					<button
						type="button"
						aria-label={card.prompt}
						onclick={() => send(card.prompt)}
						class="group flex min-h-[104px] flex-col justify-between rounded-[10px] border-[0.5px] border-border bg-card/80 p-3.5 text-left transition-colors duration-150 outline-none hover:bg-accent/55 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring motion-reduce:transition-none"
					>
						<span class="text-muted-foreground transition-colors group-hover:text-foreground">
							{#if card.icon === "sparkles"}
								<SparklesIcon class="size-3.5" />
							{:else if card.icon === "search"}
								<SearchIcon class="size-3.5" />
							{:else if card.icon === "layers"}
								<LayersIcon class="size-3.5" />
							{:else if card.icon === "sliders"}
								<SlidersHorizontalIcon class="size-3.5" />
							{:else if card.icon === "table"}
								<TableIcon class="size-3.5" />
							{:else}
								<LayoutTemplateIcon class="size-3.5" />
							{/if}
						</span>
						<div class="mt-4 space-y-0.5">
							<div class="text-[13px] font-medium text-foreground">{card.title}</div>
							<div class="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
								{card.subtitle}
							</div>
						</div>
					</button>
				{/each}
			</div>

			<div class="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground">
				<Badge variant="secondary" href={localizeHref("/docs/components", locale)}>
					{locale === "zh"
						? `基础组件 · ${componentInfos.length}`
						: `Basic · ${componentInfos.length}`}
				</Badge>
				<Badge variant="secondary" href={localizeHref("/docs/ai-elements", locale)}>
					{locale === "zh"
						? `高级界面与模块 · ${ADVANCED_SCENES.length + ADVANCED_MODULES.length}`
						: `Advanced · ${ADVANCED_SCENES.length + ADVANCED_MODULES.length}`}
				</Badge>
				<Badge variant="secondary" href={localizeHref("/themes", locale)}>
					{locale === "zh" ? "全局设计规范与 Token" : "Design System & Tokens"}
				</Badge>
			</div>
		</div>
	{:else}
		<div class="border-b-[0.5px] border-border/80">
			<div class="mx-auto flex h-11 w-full max-w-[824px] items-center justify-between gap-3 px-4">
				<span class="truncate text-[13px] font-medium text-foreground">{threadTitle}</span>
				<Button
					variant="ghost"
					size="sm"
					shape="pill"
					disabled={busy}
					onclick={() => (chat.messages = [])}
					class="h-7 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
				>
					<RotateCcwIcon class="size-3.5" />
					新对话
				</Button>
			</div>
		</div>

		<MessageScroller.Provider>
			<div class="min-h-0 flex-1">
				{#if !chat.messages.length}
					<Empty.Root class="h-full">
						<Empty.Header>
							<Empty.Media variant="icon"><MessageCircleDashedIcon /></Empty.Media>
							<Empty.Title>想设计点什么？</Empty.Title>
							<Empty.Description>
								问我组件怎么选，或者让我用库里的组件拼一个界面给你看。
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{:else}
					<MessageScroller.Root>
						<MessageScroller.Viewport>
							<MessageScroller.Content
								aria-busy={busy}
								class="mx-auto w-full max-w-[824px] gap-6 px-4 py-6"
							>
								{#each chat.messages as message (message.id)}
									{#if message.role === "user"}
										<MessageScroller.Item messageId={message.id} scrollAnchor>
											<Message.Root align="end">
												<Message.Content>
													<Bubble.Root align="end" variant="muted">
														<Bubble.Content class="text-[15px] leading-6">
															{messageText(message)}
														</Bubble.Content>
													</Bubble.Root>
												</Message.Content>
											</Message.Root>
										</MessageScroller.Item>
									{:else}
										{@const streaming = busy && message === chat.messages.at(-1)}
										{@const segs = segments(message)}
										<MessageScroller.Item messageId={message.id}>
											<Message.Root>
												<Message.Content class="gap-3">
													{#if streaming && segs.length === 0}
														<Marker.Root class="text-[13px] text-muted-foreground motion-safe:animate-pulse">
															思考中…
														</Marker.Root>
													{/if}
													{#each segs as segment, si (si)}
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
																>
																	<WrenchIcon />
																	{pick.title}
																</Button>
															{/each}
														{:else if segment.kind === "ui"}
															{@const usedSlugs = usedComponentSlugs(segment.root)}
															<div class="flex w-full flex-col gap-2.5 p-px">
																{#if segment.title}
																	<p class="text-[13px] font-medium text-muted-foreground">
																		{segment.title}
																	</p>
																{/if}
																<UiRenderer root={segment.root} />
																{#if usedSlugs.length}
																	<div class="flex flex-wrap items-center gap-1.5 pt-1">
																		<span class="text-xs text-muted-foreground">本界面所用组件：</span>
																		{#each usedSlugs as slug (slug)}
																			<Badge
																				variant="secondary"
																				href={localizeHref(`/docs/components/${slug}`, locale)}
																			>
																				{componentTitles.get(slug) ?? toCodeName(slug)}
																			</Badge>
																		{/each}
																	</div>
																{/if}
															</div>
														{:else}
															<div class="text-[15px] leading-6">
																<Markdown content={segment.text} />
															</div>
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
			<div class="mx-auto w-full max-w-[824px] px-4 pb-2">
				<Alert.Root variant="destructive">
					<TriangleAlertIcon />
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
				</Alert.Root>
			</div>
		{/if}

		<div class="mx-auto w-full max-w-[824px] px-4 pt-2 pb-4">
			<AgentPrompt
				{busy}
				onSend={send}
				onStop={() => void chat.stop()}
				onSettings={() => (settingsOpen = true)}
			/>
		</div>
	{/if}

	<Dialog.Root open={settingsOpen} onOpenChange={onSettingsOpenChange}>
		<Dialog.Content closeLabel="关闭" class="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
			<Dialog.Header>
				<Dialog.Title>模型设置</Dialog.Title>
				<Dialog.Description>只需要填一次，之后在输入框里点模型名可以再改。</Dialog.Description>
			</Dialog.Header>
			<AgentSettings onDone={() => onSettingsOpenChange(false)} />
		</Dialog.Content>
	</Dialog.Root>
</div>
