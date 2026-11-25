<script lang="ts">
	import { page } from "$app/state";
	import BrainIcon from "@lucide/svelte/icons/brain";
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import CreditCardIcon from "@lucide/svelte/icons/credit-card";
	import FilePlus2Icon from "@lucide/svelte/icons/file-plus-2";
	import LayersIcon from "@lucide/svelte/icons/layers";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import MessageCircleDashedIcon from "@lucide/svelte/icons/message-circle-dashed";
	import ShieldAlertIcon from "@lucide/svelte/icons/shield-alert";
	import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
	import UsersIcon from "@lucide/svelte/icons/users";
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
	import UiPreviewFrame from "./ui-preview-frame.svelte";
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
			title: "工作区设置页",
			subtitle: "窄栏分组、开关行与详情属性",
			prompt: "设计一个工作区设置页，包含通知开关和基本信息",
			icon: "sliders",
		},
		{
			title: "成员权限管理页",
			subtitle: "全宽页头、筛选栏与角色表格",
			prompt: "搭一个成员权限管理页，支持按角色筛选和邀请成员",
			icon: "users",
		},
		{
			title: "账单与用量概览",
			subtitle: "套餐配额、用量进度与明细表",
			prompt: "设计一个账单与用量页面，展示套餐配额和消费明细",
			icon: "billing",
		},
		{
			title: "新建项目表单",
			subtitle: "单列输入、负责人与排期选择",
			prompt: "设计一个新建项目表单，包含名称、负责人和目标日期",
			icon: "form",
		},
		{
			title: "高危操作确认弹窗",
			subtitle: "破坏性二次确认与按钮层级",
			prompt: "设计一个删除项目的确认对话框，让我看看交互效果",
			icon: "confirm",
		},
		{
			title: "选择器方案选型",
			subtitle: "区分下拉选择、组合框与单选组",
			prompt: "下拉选择器、组合框和单选组分别在什么场景用？",
			icon: "layers",
		},
	] as const;

	// Model configuration dialog state and any prompt waiting for configuration to finish.
	let settingsOpen = $state(false);
	let pendingSend: { text: string; onDispatched?: () => void } | null = null;
	// The reader's choice per reasoning row; until they click, it follows whether it is still running.
	let reasoningOpen = $state<Record<string, boolean>>({});

	const hero = $derived(!chat.messages.length);
	const busy = $derived(chat.status === "submitted" || chat.status === "streaming");
	const hasConfiguredModel = $derived(
		Boolean(agentSettings.apiKey.trim() && agentSettings.model.trim())
	);

	function send(text: string, onDispatched?: () => void) {
		const value = text.trim();
		if (!value || busy) return;
		if (!hasConfiguredModel) {
			pendingSend = { text: value, onDispatched };
			settingsOpen = true;
			return;
		}
		onDispatched?.();
		void chat.sendMessage({ text: value });
	}

	function onSettingsOpenChange(open: boolean) {
		settingsOpen = open;
		if (!open && pendingSend) {
			const next = pendingSend;
			pendingSend = null;
			if (hasConfiguredModel && !busy) {
				next.onDispatched?.();
				void chat.sendMessage({ text: next.text });
			}
		}
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

	type Input = Record<string, unknown>;
	const strArg = (input: Input, key: string) =>
		typeof input[key] === "string" ? (input[key] as string) : "";
	const STEPS: Record<string, { verb: string; noun: string; target?: (input: Input) => string }> = {
		"tool-search_patterns": {
			verb: "搜索",
			noun: "页面骨架",
			target: (i) => (strArg(i, "query") ? `「${strArg(i, "query")}」` : ""),
		},
		"tool-get_pattern": {
			verb: "查阅",
			noun: "页面骨架",
			target: (i) => (strArg(i, "name") ? ` ${strArg(i, "name")}` : ""),
		},
		"tool-search_components": {
			verb: "查找",
			noun: "组件",
			target: (i) => {
				const q = strArg(i, "query");
				const cat = strArg(i, "category");
				return q ? `「${q}」` : cat ? `（${cat}）` : "";
			},
		},
		"tool-get_component": {
			verb: "查阅",
			noun: "组件",
			target: (i) => (strArg(i, "name") ? ` ${strArg(i, "name")}` : ""),
		},
		"tool-get_skill": {
			verb: "读取",
			noun: "设计规范",
			target: (i) => {
				const f = strArg(i, "file");
				return !f ? "" : f === "guides" ? "（组合／文案／动效）" : ` ${f}`;
			},
		},
		"tool-search_docs": {
			verb: "搜索",
			noun: "文档",
			target: (i) => (strArg(i, "query") ? `「${strArg(i, "query")}」` : ""),
		},
		"tool-read_doc": {
			verb: "读取",
			noun: "",
			target: (i) => {
				const path = strArg(i, "path");
				const example = strArg(i, "example");
				const theme = strArg(i, "theme");
				if (path) return `文档 ${path}`;
				if (example) return `示例 ${example}`;
				if (theme) return theme === "list" ? "主题列表" : `主题 ${theme}`;
				return "文档";
			},
		},
		"tool-get_ui_catalog": {
			verb: "查阅",
			noun: "积木目录",
			target: (i) => (Array.isArray(i.types) && i.types.length ? `（${i.types.length} 项）` : ""),
		},
		"tool-show_ui": {
			verb: "拼出",
			noun: "界面",
			target: (i) => (strArg(i, "title") ? `「${strArg(i, "title")}」` : ""),
		},
		"tool-review_code": { verb: "检查", noun: "代码规范" },
		// Keep legacy tool labels so persisted localStorage conversations remain readable.
		"tool-list_components": { verb: "列出", noun: "组件" },
		"tool-get_install_command": { verb: "生成", noun: "安装命令" },
		"tool-get_example": {
			verb: "读取",
			noun: "示例",
			target: (i) => (strArg(i, "name") ? ` ${strArg(i, "name")}` : ""),
		},
		"tool-list_themes": { verb: "列出", noun: "主题" },
		"tool-get_theme": {
			verb: "读取",
			noun: "主题",
			target: (i) => (strArg(i, "name") ? ` ${strArg(i, "name")}` : ""),
		},
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
							{#if card.icon === "sliders"}
								<SlidersHorizontalIcon class="size-3.5" />
							{:else if card.icon === "users"}
								<UsersIcon class="size-3.5" />
							{:else if card.icon === "billing"}
								<CreditCardIcon class="size-3.5" />
							{:else if card.icon === "form"}
								<FilePlus2Icon class="size-3.5" />
							{:else if card.icon === "confirm"}
								<ShieldAlertIcon class="size-3.5" />
							{:else}
								<LayersIcon class="size-3.5" />
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
																<UiPreviewFrame root={segment.root} title={segment.title} />
																{#if usedSlugs.length}
																	<div class="flex flex-wrap items-center gap-1.5 pt-0.5">
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
													{#if !streaming && !busy && !chat.error && message === chat.messages.at(-1) && segs.length > 0 && segs.at(-1)?.kind === "steps"}
														<div
															class="flex flex-wrap items-center justify-between gap-2 rounded-lg border-[0.5px] border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
														>
															<span>本轮查证步骤后暂未输出最终结论，可点击继续生成。</span>
															<Button
																size="xs"
																variant="outline"
																onclick={() => send("请基于刚才查到的资料继续完成回答。")}
															>
																继续生成
															</Button>
														</div>
													{/if}
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
					<Alert.Action class="flex flex-wrap items-center gap-1.5">
						{#if /reasoning_effort|responses/i.test(chat.error.message)}
							<Button
								size="xs"
								variant="outline"
								onclick={() => {
									agentSettings.effort = "none";
									agentSettings.apiMode = "responses";
									chat.clearError();
								}}>改用 Responses 接口并关闭思考</Button
							>
						{/if}
						<Button
							size="xs"
							variant="outline"
							onclick={() => {
								chat.clearError();
								settingsOpen = true;
							}}>打开模型配置</Button
						>
					</Alert.Action>
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
				<Dialog.Title>模型配置</Dialog.Title>
			</Dialog.Header>
			<AgentSettings onDone={() => onSettingsOpenChange(false)} />
		</Dialog.Content>
	</Dialog.Root>
</div>
