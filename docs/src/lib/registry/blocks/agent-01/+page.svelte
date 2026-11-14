<script lang="ts">
	import { onDestroy, tick } from "svelte";
	import { prefersReducedMotion } from "svelte/motion";
	import * as Bubble from "$lib/registry/ui/bubble/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Command from "$lib/registry/ui/command/index.js";
	import * as Scroller from "$lib/registry/ui/message-scroller/index.js";
	import * as Message from "$lib/registry/ui/message/index.js";
	import * as Popover from "$lib/registry/ui/popover/index.js";
	import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import AgentAttachments from "./agent-attachments.svelte";
	import AgentComposer from "./agent-composer.svelte";
	import AgentReply from "./agent-reply.svelte";
	import {
		examples,
		newDraft,
		replyFor,
		sampleChats,
		type Chat,
		type ChatFile,
		type Draft,
		type Example,
		type Turn,
	} from "./data.js";

	let { chinese = false }: { chinese?: boolean } = $props();
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const id = $props.id();
	const portal = { to: '[id="' + id + '"]' };
	const tokens = `
		--agent-panel: light-dark(#f7f7f8, #131313);
		--agent-base: light-dark(#ededee, #0b0b0b);
		--agent-composer: light-dark(#fff, #181819);
		--agent-reply: light-dark(#fff, #1e1f21);
		--agent-file: light-dark(#f2f2f4, #252628);
		--agent-bubble: light-dark(#ebebee, #222325);
		--agent-placeholder: light-dark(#77777c, #929296);
		--agent-send: light-dark(#585ec3, #6268ce);
		--agent-focus: light-dark(#6d74d6, #858bf1);
		--foreground: light-dark(lch(9.794% 0 282), lch(90.826% 1.425 272));
		--muted-foreground: light-dark(lch(39.176% 1.25 282), lch(65% 1.2 272));
		--border: light-dark(#e3e3e7, #29292b);
		--popover: light-dark(white, #222223);
		--popover-foreground: var(--foreground);
		--accent: light-dark(#eaeaec, #262628);
		--accent-foreground: var(--foreground);
		--muted: var(--accent);
		--ring: var(--agent-focus);
	`;

	let chats = $state<Chat[]>(sampleChats(text));
	let drafts = $state<Record<string, Draft>>({ new: newDraft(), sample: newDraft() });
	let activeId = $state<string>();
	let showExamples = $state(true);
	let historyOpen = $state(false);
	let historySearch = $state<HTMLInputElement | null>(null);
	let composer = $state<{ focus: () => void }>();
	let nextChat = 0;
	let nextTurn = 0;
	let nextFile = 0;
	let focusOnClose = false;
	const turnTimers = new Map<string, ReturnType<typeof setTimeout>>();
	const fileTimers = new Map<number, ReturnType<typeof setTimeout>>();
	const objectUrls = new Set<string>();

	const chat = $derived(chats.find((item) => item.id === activeId));
	const draft = $derived(drafts[activeId ?? "new"]);
	const latest = $derived(chat?.turns.at(-1));
	const running = $derived(!!latest && latest.phase !== "done" && latest.phase !== "stopped");

	onDestroy(() => {
		turnTimers.forEach((timer) => clearTimeout(timer));
		fileTimers.forEach((timer) => clearTimeout(timer));
		objectUrls.forEach((url) => URL.revokeObjectURL(url));
	});

	function addFiles(files: File[]) {
		const current = draft;
		const entries = files.map((file): ChatFile => {
			const id = ++nextFile;
			if (file.size > 10 * 1024 * 1024) return { id, file, state: "error" };
			const url = URL.createObjectURL(file);
			objectUrls.add(url);
			const timer = setTimeout(() => {
				fileTimers.delete(id);
				const entry = current.files.find((item) => item.id === id);
				if (entry) entry.state = "done";
			}, 350);
			fileTimers.set(id, timer);
			return { id, file, url, state: "uploading" };
		});
		current.files.push(...entries);
	}

	async function removeFile(id: number) {
		const item = draft.files.find((entry) => entry.id === id);
		if (!item) return;
		clearTimeout(fileTimers.get(id));
		fileTimers.delete(id);
		if (item.url) {
			URL.revokeObjectURL(item.url);
			objectUrls.delete(item.url);
		}
		draft.files = draft.files.filter((entry) => entry.id !== id);
		await tick();
		composer?.focus();
	}

	function schedule(turn: Turn, run: () => void, delay: number) {
		const timer = setTimeout(() => {
			turnTimers.delete(turn.id);
			run();
		}, delay);
		turnTimers.set(turn.id, timer);
	}

	function stream(turn: Turn) {
		const { paragraphs, checklist } = replyFor(text, turn.example, turn.files);
		let paragraph = 0;
		let offset = 0;
		let item = 0;
		turn.phase = "streaming";

		function advance() {
			if (paragraph < paragraphs.length) {
				const value = paragraphs[paragraph];
				offset += chinese ? 7 : 18;
				turn.reply[paragraph] = value.slice(0, offset);
				if (offset >= value.length) {
					paragraph++;
					offset = 0;
				}
				schedule(turn, advance, 80);
			} else if (item < checklist.length) {
				turn.checklist.push(checklist[item++]);
				schedule(turn, advance, 110);
			} else {
				turn.phase = "done";
			}
		}
		advance();
	}

	function runTurn(turn: Turn) {
		const started = Date.now();
		schedule(
			turn,
			() => {
				if (!turn.tool) {
					stream(turn);
					return;
				}
				turn.phase = "working";
				schedule(
					turn,
					() => {
						turn.toolDone = true;
						turn.workedSeconds = Math.max(1, Math.round((Date.now() - started) / 1000));
						stream(turn);
					},
					780
				);
			},
			430
		);
	}

	async function send(example?: Example) {
		if (running) return;
		const prompt = example ? text(example.title[0], example.title[1]) : draft.text.trim();
		const files = example ? [] : draft.files;
		if ((!prompt && !files.length) || files.some((file) => file.state !== "done")) return;

		const now = new Date();
		const previous = activeId ?? "new";
		const chatId = activeId ?? "chat-" + ++nextChat;
		if (!activeId) {
			chats.unshift({
				id: chatId,
				title: prompt.split("\n")[0].slice(0, 68) || files[0].file.name,
				date: now.toISOString(),
				label: text("刚刚", "Just now"),
				turns: [],
			});
		}
		if (!example) drafts[previous] = newDraft();
		drafts[chatId] ??= newDraft();
		activeId = chatId;

		const current = chats.find((item) => item.id === chatId)!;
		const id = "turn-" + ++nextTurn;
		current.turns.push({
			id,
			prompt,
			example,
			files,
			phase: "thinking",
			tool: example ? null : files.length ? "file" : "search",
			toolDone: false,
			reply: [],
			checklist: [],
		});
		const turn = current.turns.at(-1)!;
		runTurn(turn);
		await tick();
		composer?.focus();
	}

	async function stop() {
		if (!running || !latest) return;
		clearTimeout(turnTimers.get(latest.id));
		turnTimers.delete(latest.id);
		latest.phase = "stopped";
		await tick();
		composer?.focus();
	}

	async function selectChat(next?: string, viaMenu = false) {
		activeId = next;
		if (viaMenu) {
			focusOnClose = true;
			historyOpen = false;
		}
		await tick();
		composer?.focus();
	}
</script>

{#snippet inputPanel(active: boolean)}
	<AgentComposer
		bind:this={composer}
		{draft}
		{active}
		{running}
		{chinese}
		{portal}
		onText={(value) => (draft.text = value)}
		onFiles={addFiles}
		onRemove={removeFile}
		onSend={() => send()}
		onStop={stop}
	/>
{/snippet}

{#snippet exampleIcon(example: Example)}
	{#if example.id === "project"}
		<IconPlaceholder
			lucide="BoxIcon"
			tabler="IconBox"
			hugeicons="CubeIcon"
			phosphor="CubeIcon"
			remixicon="RiBox3Line"
			aria-hidden="true"
		/>
	{:else if example.id === "research"}
		<IconPlaceholder
			lucide="SearchIcon"
			tabler="IconSearch"
			hugeicons="Search01Icon"
			phosphor="MagnifyingGlassIcon"
			remixicon="RiSearchLine"
			aria-hidden="true"
		/>
	{:else}
		<IconPlaceholder
			lucide="UsersIcon"
			tabler="IconUsers"
			hugeicons="UserGroupIcon"
			phosphor="UsersIcon"
			remixicon="RiGroupLine"
			aria-hidden="true"
		/>
	{/if}
{/snippet}

<Tooltip.Provider delayDuration={500} skipDelayDuration={150}>
	<section
		{id}
		aria-label={text("Agent 对话", "Agent chat")}
		style={tokens}
		class="@container/agent flex h-[min(79svh,860px)] min-h-[480px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-(--agent-panel) text-foreground [color-scheme:light] dark:[color-scheme:dark]"
	>
		<header class="flex h-11 shrink-0 items-center border-b border-border px-2.5">
			<h2 class="max-w-full min-w-0" aria-label={chat?.title ?? text("新对话", "New chat")}>
				<Popover.Root bind:open={historyOpen}>
					<Tooltip.Hint label={text("切换对话", "Switch chat")} {portal}>
						{#snippet trigger({ props })}
							<Popover.Trigger
								{...props}
								aria-label={text("切换对话", "Switch chat")}
								class="flex h-7 max-w-full items-center gap-1.5 rounded-full px-2 text-[13px] font-medium hover:bg-accent aria-expanded:bg-accent"
							>
								<span class="truncate">{chat?.title ?? text("新对话", "New chat")}</span>
								<IconPlaceholder
									lucide="ChevronDownIcon"
									tabler="IconChevronDown"
									hugeicons="ArrowDown01Icon"
									phosphor="CaretDownIcon"
									remixicon="RiArrowDownSLine"
									class="size-3 shrink-0 text-muted-foreground"
									aria-hidden="true"
								/>
							</Popover.Trigger>
						{/snippet}
					</Tooltip.Hint>
					<Popover.Content
						appearance="surface"
						role="dialog"
						aria-label={text("对话历史", "Chat history")}
						portalProps={portal}
						align="start"
						class="w-[264px] max-w-[calc(100vw-2rem)] gap-0 p-0"
						onOpenAutoFocus={(event) => {
							event.preventDefault();
							historySearch?.focus();
						}}
						onCloseAutoFocus={(event) => {
							if (focusOnClose) {
								event.preventDefault();
								focusOnClose = false;
								composer?.focus();
							}
						}}
					>
						<Command.Root class="rounded-xl bg-transparent">
							<Command.Input
								bind:ref={historySearch}
								aria-label={text("搜索对话", "Search chats")}
								placeholder={text("搜索对话…", "Search chats…")}
							/>
							<Command.List>
								<Command.Empty>{text("没有匹配的对话", "No matching chats")}</Command.Empty>
								<Command.Group>
									<Command.Item
										value={text("新对话", "New chat")}
										onSelect={() => selectChat(undefined, true)}
									>
										<span aria-hidden="true">+</span>{text("新对话", "New chat")}
									</Command.Item>
								</Command.Group>
								<Command.Separator />
								<Command.Group heading={text("最近对话", "Recent chats")}>
									{#each chats as item (item.id)}
										<Command.Item
											value={item.title + " " + item.id}
											class="justify-between"
											onSelect={() => selectChat(item.id, true)}
										>
											<span class="truncate">{item.title}</span><span
												class="shrink-0 text-xs text-muted-foreground">{item.label}</span
											>
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</h2>
		</header>
		{#if chat}
			{#key chat.id}
				<Scroller.Provider defaultScrollPosition="start">
					<div class="flex min-h-0 flex-1 flex-col">
						<Scroller.Root class="min-h-0 flex-1">
							<Scroller.Viewport aria-label={text("对话消息", "Conversation messages")}>
								<Scroller.Content
									aria-busy={running}
									class="mx-auto w-full max-w-[824px] gap-6 px-3 pt-4 pb-8 sm:px-4"
								>
									{#if chat.date}
										<Scroller.Item messageId={chat.id + "-time"}>
											<time
												datetime={chat.date}
												class="block text-center text-xs text-muted-foreground"
											>
												{new Intl.DateTimeFormat(chinese ? "zh-CN" : "en-US", {
													dateStyle: "medium",
													timeStyle: "short",
												}).format(new Date(chat.date))}
											</time>
										</Scroller.Item>
									{/if}
									{#each chat.turns as turn (turn.id)}
										<Scroller.Item messageId={turn.id + "-user"} scrollAnchor>
											<Message.Root
												align="end"
												role="group"
												aria-label={text("你的消息", "Your message")}
											>
												<Message.Content class="items-end">
													<Bubble.Root
														variant="muted"
														align="end"
														style="--muted: var(--agent-bubble)"
														class="max-w-[92%] sm:max-w-[77%]"
													>
														<Bubble.Content
															class="space-y-2 rounded-lg border-0 bg-(--agent-bubble) px-3 py-2 text-[15px] leading-6"
														>
															{#if turn.files.length}<AgentAttachments
																	files={turn.files}
																	{chinese}
																/>{/if}
															{#if turn.example}
																<span
																	class="inline-flex items-center gap-1 rounded border border-border px-1 [&_svg]:size-3.5"
																	>{@render exampleIcon(turn.example)}{turn.prompt}</span
																>
															{:else if turn.prompt}
																<p class="whitespace-pre-wrap">{turn.prompt}</p>
															{/if}
														</Bubble.Content>
													</Bubble.Root>
												</Message.Content>
											</Message.Root>
										</Scroller.Item>
										<Scroller.Item messageId={turn.id + "-reply"}>
											<AgentReply {turn} {chinese} />
										</Scroller.Item>
									{/each}
								</Scroller.Content>
							</Scroller.Viewport>
							<Scroller.Button
								aria-label={text("跳到最新消息", "Scroll to latest")}
								behavior={prefersReducedMotion.current ? "instant" : "smooth"}
								class="bottom-2 h-7 w-auto gap-1 rounded-full border bg-(--agent-bubble) px-2.5 text-xs shadow-sm motion-reduce:transition-none"
							>
								<IconPlaceholder
									lucide="ArrowDownIcon"
									tabler="IconArrowDown"
									hugeicons="ArrowDown02Icon"
									phosphor="ArrowDownIcon"
									remixicon="RiArrowDownLine"
									aria-hidden="true"
								/>
								{text("最新", "Latest")}
							</Scroller.Button>
						</Scroller.Root>
						<div class="mx-auto w-full max-w-[848px] shrink-0 px-3 pb-3 sm:px-4">
							{@render inputPanel(true)}
						</div>
					</div>
				</Scroller.Provider>
			{/key}
		{:else}
			<div
				class="min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-(--agent-panel) to-(--agent-base)"
			>
				<div
					class="mx-auto flex min-h-full w-full max-w-[744px] flex-col justify-center gap-3 px-3 py-6 sm:px-4"
				>
					{@render inputPanel(false)}
					{#if showExamples}
						<div class="mt-2 flex items-center justify-between px-2">
							<p class="text-xs text-muted-foreground">
								{text("从这些示例开始", "Get started with some examples")}
							</p>
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label={text("隐藏示例", "Dismiss examples")}
								onclick={() => (showExamples = false)}
							>
								<IconPlaceholder
									lucide="XIcon"
									tabler="IconX"
									hugeicons="Cancel01Icon"
									phosphor="XIcon"
									remixicon="RiCloseLine"
									aria-hidden="true"
								/>
							</Button>
						</div>
						<div class="grid gap-2 @min-[525px]/agent:grid-cols-3">
							{#each examples as example (example.id)}
								<Card.Root
									size="sm"
									class="relative min-w-0 rounded-lg border border-border bg-transparent py-0 shadow-none ring-0 hover:bg-accent"
								>
									<button
										type="button"
										class="flex min-h-19 w-full flex-row items-center gap-3 rounded-lg p-3 text-start outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset @min-[525px]/agent:min-h-[132px] @min-[525px]/agent:flex-col @min-[525px]/agent:items-start @min-[525px]/agent:justify-between @min-[525px]/agent:p-4"
										onclick={() => send(example)}
									>
										<span
											class="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground [&_svg]:size-3.5"
											>{@render exampleIcon(example)}</span
										>
										<span class="space-y-1">
											<span class="block text-[13px] leading-4 font-medium"
												>{text(example.title[0], example.title[1])}</span
											>
											<span class="block text-xs leading-[18px] text-muted-foreground"
												>{text(example.description[0], example.description[1])}</span
											>
										</span>
									</button>
								</Card.Root>
							{/each}
						</div>
					{/if}
					<nav aria-label={text("最近对话", "Recent chats")} class="flex flex-col">
						{#each chats.slice(0, 4) as item (item.id)}
							<Button
								variant="ghost"
								size="sm"
								class="h-8 w-full justify-between rounded-md px-3 text-[13px] font-normal text-muted-foreground"
								onclick={() => selectChat(item.id)}
							>
								<span class="min-w-0 truncate">{item.title}</span><span class="shrink-0 text-xs"
									>{item.label}</span
								>
							</Button>
						{/each}
					</nav>
				</div>
			</div>
		{/if}
	</section>
</Tooltip.Provider>
