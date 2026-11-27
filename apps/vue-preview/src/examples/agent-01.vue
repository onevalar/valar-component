<script setup lang="ts">
import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
} from "@valar/vue-ui/attachment";
import { Bubble, BubbleContent } from "@valar/vue-ui/bubble";
import { Button } from "@valar/vue-ui/button";
import { Card } from "@valar/vue-ui/card";
import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockHeader,
	CodeBlockTitle,
} from "@valar/vue-ui/code-block";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@valar/vue-ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@valar/vue-ui/dropdown-menu";
import { InputGroup, InputGroupTextarea } from "@valar/vue-ui/input-group";
import { Marker } from "@valar/vue-ui/marker";
import { Message, MessageContent, MessageFooter } from "@valar/vue-ui/message";
import {
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerRoot,
	MessageScrollerViewport,
} from "@valar/vue-ui/message-scroller";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/vue-ui/popover";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/vue-ui/trace";
// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import {
	computed,
	defineComponent,
	h,
	nextTick,
	onBeforeUnmount,
	reactive,
	ref,
	useId,
	useTemplateRef,
	type PropType,
} from "vue";

const icons = {
	project: "m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10",
	research: "M21 21l-4.3-4.3m2.3-5.7a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
	team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm3-3.87a4 4 0 0 1 0 7.75",
	file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6",
	chevron: "m6 9 6 6 6-6",
	plus: "M12 5v14M5 12h14",
	close: "m18 6-12 12M6 6l12 12",
	up: "M12 19V5m-7 7 7-7 7 7",
	down: "M12 5v14m-7-7 7 7 7-7",
	copy: "M8 4V3H3v13h1m4-8h13v13H8z",
} as const;

function Icon({ name }: { name: keyof typeof icons }) {
	return h(
		"svg",
		{
			"aria-hidden": "true",
			class: "size-3.5 shrink-0",
			viewBox: "0 0 24 24",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": 2,
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
		},
		[h("path", { d: icons[name] })]
	);
}

const examples = [
	{
		id: "project",
		title: "Create a new project",
		description: "Turn an idea into a well-scoped project",
		reply: [
			"Let's start with the outcome. What problem should this project solve, and who will use it?",
			"Share a goal and rough timeline, and I can lay out scope, milestones, and acceptance criteria.",
		],
	},
	{
		id: "research",
		title: "Research a topic",
		description: "Research a topic across the issue backlog",
		reply: [
			"What feature, problem, or keyword should I look for? You can specify a team or search across the workspace.",
			"I can group the results by theme and flag what needs further verification.",
		],
	},
	{
		id: "team",
		title: "Set up a new team",
		description: "Create a team that matches how you work",
		reply: [
			"What will this team own? Start with members, responsibilities, and workflow, then set up statuses and projects.",
			"Describe how the team collaborates today and I can outline a proposed setup.",
		],
	},
] as const;
const checklist = [
	"Confirm that the page title matches the current view.",
	"Make the primary action easy to find.",
	"Check default, hover, pressed, and disabled states.",
	"Complete the flow using only a keyboard.",
	"Verify where focus goes after changing views.",
	"Check how long titles and filenames truncate.",
	"Verify that the empty state offers a next step.",
	"Make loading states easy to recognize.",
	"Check that users can edit or retry after an error.",
	"Compare text contrast in both color schemes.",
	"Check wrapping and control access on narrow screens.",
	"Verify reading position and jumping to the latest item.",
	"Verify controls with reduced motion enabled.",
	"Check accessible names for icon-only buttons.",
	"Check that assistive technology receives status updates.",
	"Record any interactions or environments that need another pass.",
];
const checklistIntro =
	"Here is an interface review checklist. Start with the primary flow, then check the edge states.";
const attachmentIntro =
	"The attachment is ready. Here is a checklist for reviewing this interface.";

type Example = (typeof examples)[number];
type ChatFile = { id: number; file: File; state: "uploading" | "done" | "error"; url?: string };
type Draft = { text: string; files: ChatFile[] };
type Turn = {
	id: string;
	prompt: string;
	example?: Example;
	files: ChatFile[];
	phase: "thinking" | "working" | "streaming" | "done" | "stopped";
	tool: "search" | "file" | null;
	seconds?: number;
	reply: string[];
	items: number;
};
type Chat = { id: string; title: string; date?: string; turns: Turn[] };
const emptyDraft = (): Draft => ({ text: "", files: [] });
const chats = ref<Chat[]>([
	{
		id: "sample",
		title: "Interface review checklist",
		turns: [
			{
				id: "sample-turn",
				prompt: "Give me an interface review checklist.",
				files: [],
				phase: "done",
				tool: "search",
				seconds: 3,
				reply: [checklistIntro],
				items: checklist.length,
			},
		],
	},
]);
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const label = (chat: Chat) => (chat.date ? "Just now" : "Sample");
const sizeLabel = (size: number) =>
	size < 1024
		? `${size} B`
		: size < 1048576
			? `${Math.round(size / 1024)} KB`
			: `${(size / 1048576).toFixed(1)} MB`;
const tokens = {
	"--agent-panel": "light-dark(#f7f7f8, #131313)",
	"--agent-base": "light-dark(#ededee, #0b0b0b)",
	"--agent-composer": "light-dark(#fff, #181819)",
	"--agent-reply": "light-dark(#fff, #1e1f21)",
	"--agent-file": "light-dark(#f2f2f4, #252628)",
	"--agent-bubble": "light-dark(#ebebee, #222325)",
	"--agent-placeholder": "light-dark(#77777c, #929296)",
	"--agent-send": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--foreground": "light-dark(lch(9.794% 0 282), lch(90.826% 1.425 272))",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(65% 1.2 272))",
	"--border": "light-dark(#e3e3e7, #29292b)",
	"--popover": "light-dark(white, #222223)",
	"--popover-foreground": "var(--foreground)",
	"--accent": "light-dark(#eaeaec, #262628)",
	"--accent-foreground": "var(--foreground)",
	"--muted": "var(--accent)",
	"--ring": "var(--agent-send)",
};

const Attachments = defineComponent({
	props: {
		files: { type: Array as PropType<ChatFile[]>, required: true },
		removable: Boolean,
	},
	emits: { remove: (_id: number) => true },
	setup(props, { emit }) {
		return () =>
			props.files.length
				? h(
						AttachmentGroup,
						{
							role: "group",
							"aria-label": "Attachments",
							class: "w-full flex-col items-stretch gap-1.5 overflow-x-hidden",
						},
						{
							default: () =>
								props.files.map(({ id, file, state, url }) =>
									h(
										Attachment,
										{
											key: id,
											size: "sm",
											state,
											class:
												"w-full flex-nowrap gap-2 rounded-md border-border bg-(--agent-file) text-foreground",
										},
										{
											default: () => [
												url && file.type.startsWith("image/")
													? h(
															AttachmentMedia,
															{ variant: "image" },
															{ default: () => h("img", { src: url, alt: "" }) }
														)
													: h(
															AttachmentMedia,
															{ class: "text-muted-foreground" },
															{ default: () => h(Icon, { name: "file" }) }
														),
												h(AttachmentContent, null, {
													default: () => [
														h(AttachmentTitle, { title: file.name }, { default: () => file.name }),
														h(AttachmentDescription, null, {
															default: () =>
																state === "uploading"
																	? h("span", { role: "status" }, "Preparing attachment…")
																	: state === "error"
																		? h("span", { role: "alert" }, "File exceeds 10 MB")
																		: sizeLabel(file.size),
														}),
													],
												}),
												props.removable
													? h(
															AttachmentActions,
															{ class: "relative! inset-auto!" },
															{
																default: () =>
																	h(
																		AttachmentAction,
																		{
																			"aria-label": `Remove ${file.name}`,
																			title: "Remove attachment",
																			onClick: () => emit("remove", id),
																		},
																		{ default: () => h(Icon, { name: "close" }) }
																	),
															}
														)
													: url
														? h(
																"a",
																{
																	class:
																		"shrink-0 rounded-md p-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring",
																	href: url,
																	download: file.name,
																	"aria-label": `Download ${file.name}`,
																},
																"Download"
															)
														: null,
											],
										}
									)
								),
						}
					)
				: null;
	},
});

const drafts = reactive<Record<string, Draft>>({ new: emptyDraft(), sample: emptyDraft() });
const activeId = ref("new");
const showExamples = ref(true);
const historyOpen = ref(false);
const historyLabel = useId();
const section = useTemplateRef<HTMLElement>("section");
const picker = useTemplateRef<HTMLInputElement>("picker");
const copied = reactive<Record<string, string>>({});
let restoreComposer = false;
let serial = 0;
const turnTimers = new Map<string, ReturnType<typeof setTimeout>>();
const fileTimers = new Map<number, ReturnType<typeof setTimeout>>();
const urls = new Set<string>();
const chat = computed(() => chats.value.find(({ id }) => id === activeId.value));
const latest = computed(() => chat.value?.turns.at(-1));
const running = computed(
	() => !!latest.value && latest.value.phase !== "done" && latest.value.phase !== "stopped"
);
const draft = computed(() => drafts[activeId.value]);
const ready = computed(
	() =>
		!!(draft.value.text.trim() || draft.value.files.length) &&
		draft.value.files.every(({ state }) => state === "done")
);
const portalProps = computed(() => ({ to: section.value ?? undefined }));

const focus = () => section.value?.querySelector("textarea")?.focus({ preventScroll: true });

onBeforeUnmount(() => {
	turnTimers.forEach((timer) => clearTimeout(timer));
	fileTimers.forEach((timer) => clearTimeout(timer));
	urls.forEach((url) => URL.revokeObjectURL(url));
});

async function copy(turn: Turn) {
	try {
		await navigator.clipboard.writeText(
			[
				...turn.reply,
				...checklist.slice(0, turn.items).map((item, index) => `${index + 1}. ${item}`),
			].join("\n\n")
		);
		if (section.value) copied[turn.id] = "Copied";
	} catch {
		if (section.value) copied[turn.id] = "Could not copy";
	}
}

function addFiles(files: File[]) {
	const target = draft.value;
	for (const file of files) {
		const id = ++serial;
		if (file.size > 10 * 1024 * 1024) {
			target.files.push({ id, file, state: "error" });
			continue;
		}
		const url = URL.createObjectURL(file);
		urls.add(url);
		target.files.push({ id, file, state: "uploading", url });
		fileTimers.set(
			id,
			setTimeout(() => {
				fileTimers.delete(id);
				const item = target.files.find((entry) => entry.id === id);
				if (item) item.state = "done";
			}, 350)
		);
	}
}

function removeFile(id: number) {
	const removed = draft.value.files.find((entry) => entry.id === id);
	clearTimeout(fileTimers.get(id));
	fileTimers.delete(id);
	if (removed?.url) {
		URL.revokeObjectURL(removed.url);
		urls.delete(removed.url);
	}
	draft.value.files = draft.value.files.filter((entry) => entry.id !== id);
	focus();
}

function runTurn(turn: Turn) {
	const started = Date.now();
	const paragraphs = turn.example?.reply ?? [turn.files.length ? attachmentIntro : checklistIntro];
	let paragraph = 0,
		offset = 0;
	const schedule = (run: () => void, delay: number) => {
		turnTimers.set(
			turn.id,
			setTimeout(() => {
				turnTimers.delete(turn.id);
				run();
			}, delay)
		);
	};
	function advance() {
		if (paragraph < paragraphs.length) {
			turn.phase = "streaming";
			const text = paragraphs[paragraph];
			offset += 18;
			turn.reply[paragraph] = text.slice(0, offset);
			if (offset >= text.length) {
				paragraph++;
				offset = 0;
			}
			schedule(advance, 80);
		} else if (!turn.example && turn.items < checklist.length) {
			turn.items++;
			schedule(advance, 110);
		} else turn.phase = "done";
	}
	schedule(() => {
		if (!turn.tool) {
			advance();
			return;
		}
		turn.phase = "working";
		schedule(() => {
			turn.seconds = Math.max(1, Math.round((Date.now() - started) / 1000));
			advance();
		}, 780);
	}, 430);
}

async function send(example?: Example) {
	if (running.value || (!example && !ready.value)) return;
	const prompt = example?.title ?? draft.value.text.trim();
	const files = example ? [] : draft.value.files;
	const previous = activeId.value;
	const id = chat.value?.id ?? `chat-${++serial}`;
	const turn = reactive<Turn>({
		id: `turn-${++serial}`,
		prompt,
		files,
		example,
		phase: "thinking",
		tool: example ? null : files.length ? "file" : "search",
		reply: [],
		items: 0,
	});
	if (chat.value) chat.value.turns.push(turn);
	else {
		chats.value.unshift({
			id,
			title: prompt.split("\n")[0].slice(0, 68) || files[0].file.name,
			date: new Date().toISOString(),
			turns: [turn],
		});
		drafts[id] = emptyDraft();
		activeId.value = id;
	}
	if (!example) drafts[previous] = emptyDraft();
	runTurn(turn);
	await nextTick();
	focus();
}

function stop() {
	const turn = latest.value;
	if (!running.value || !turn) return;
	clearTimeout(turnTimers.get(turn.id));
	turnTimers.delete(turn.id);
	turn.phase = "stopped";
	focus();
}

function selectChat(id: string, viaMenu = false) {
	activeId.value = id;
	if (viaMenu) {
		restoreComposer = true;
		historyOpen.value = false;
	} else focus();
}

function openHistory(event: Event) {
	event.preventDefault();
	section.value?.querySelector<HTMLInputElement>('[data-slot="command-input"]')?.focus();
}

function closeHistory(event: Event) {
	if (!restoreComposer) return;
	event.preventDefault();
	restoreComposer = false;
	focus();
}

function chooseFiles(event: Event) {
	const target = event.currentTarget as HTMLInputElement;
	addFiles(Array.from(target.files ?? []));
	target.value = "";
	focus();
}

function keys(event: KeyboardEvent) {
	if (event.isComposing || event.keyCode === 229) return;
	if (event.key === "Enter" && !event.shiftKey) {
		event.preventDefault();
		if (!event.repeat) void send();
	}
	if (event.key.toLowerCase() === "u" && (event.ctrlKey || event.metaKey) && event.shiftKey) {
		event.preventDefault();
		picker.value?.click();
	}
}

function dragOver(event: DragEvent) {
	if (!event.dataTransfer?.types.includes("Files")) return;
	event.preventDefault();
	event.dataTransfer.dropEffect = "copy";
}

function drop(event: DragEvent) {
	if (!event.dataTransfer?.files.length) return;
	event.preventDefault();
	addFiles(Array.from(event.dataTransfer.files));
	focus();
}

const smallButton = "size-6 shrink-0 rounded-full p-0 shadow-none [&_svg]:size-3.5";
</script>

<template>
	<section
		ref="section"
		aria-label="Agent chat"
		:style="tokens"
		class="@container/agent flex h-[min(79svh,860px)] min-h-[480px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-(--agent-panel) text-foreground [color-scheme:light] dark:[color-scheme:dark]"
	>
		<header class="flex h-11 shrink-0 items-center border-b border-border px-2.5">
			<h2 class="max-w-full min-w-0" :aria-label="chat?.title ?? 'New chat'">
				<Popover v-model:open="historyOpen">
					<PopoverTrigger
						aria-label="Switch chat"
						title="Switch chat"
						class="flex h-7 max-w-full items-center gap-1.5 rounded-full px-2 text-[13px] font-medium hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
					>
						<span class="truncate">{{ chat?.title ?? "New chat" }}</span
						><span class="text-muted-foreground"><Icon name="chevron" /></span>
					</PopoverTrigger>
					<PopoverContent
						as-child
						appearance="surface"
						align="start"
						:portal-props="portalProps"
						class="w-[264px] max-w-[calc(100vw-2rem)] gap-0 p-0"
						@open-auto-focus="openHistory"
						@close-auto-focus="closeHistory"
					>
						<div :aria-labelledby="historyLabel">
							<span :id="historyLabel" class="sr-only">Chat history</span>
							<Command class="rounded-xl bg-transparent">
								<CommandInput aria-label="Search chats" placeholder="Search chats…" />
								<CommandList aria-label="Chat results">
									<CommandEmpty>No matching chats</CommandEmpty>
									<CommandGroup
										><CommandItem
											value="new"
											:keywords="['New chat']"
											@select="selectChat('new', true)"
											><Icon name="plus" />New chat</CommandItem
										></CommandGroup
									>
									<CommandSeparator />
									<CommandGroup heading="Recent chats">
										<CommandItem
											v-for="item in chats"
											:key="item.id"
											:value="item.id"
											:keywords="[item.title]"
											class="justify-between"
											@select="selectChat(item.id, true)"
											><span class="min-w-0 truncate">{{ item.title }}</span
											><span class="shrink-0 text-xs text-muted-foreground">{{
												label(item)
											}}</span></CommandItem
										>
									</CommandGroup>
								</CommandList>
							</Command>
						</div>
					</PopoverContent>
				</Popover>
			</h2>
		</header>
		<div
			:class="
				chat
					? 'flex min-h-0 flex-1 flex-col'
					: 'min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-(--agent-panel) to-(--agent-base)'
			"
		>
			<div
				:class="
					chat
						? 'contents'
						: 'mx-auto flex min-h-full w-full max-w-[744px] flex-col justify-center gap-3 px-3 py-6 sm:px-4'
				"
			>
				<MessageScrollerProvider v-if="chat" :key="chat.id" default-scroll-position="start">
					<MessageScrollerRoot class="min-h-0 flex-1">
						<MessageScrollerViewport aria-label="Conversation messages">
							<MessageScrollerContent
								:aria-busy="running"
								class="mx-auto w-full max-w-[824px] gap-6 px-3 pt-4 pb-8 sm:px-4"
							>
								<MessageScrollerItem v-if="chat.date" :message-id="`${chat.id}-time`"
									><time
										:datetime="chat.date"
										class="block text-center text-xs text-muted-foreground"
										>{{ dateFormat.format(new Date(chat.date)) }}</time
									></MessageScrollerItem
								>
								<template v-for="turn in chat.turns" :key="turn.id">
									<MessageScrollerItem :message-id="`${turn.id}-user`" scroll-anchor>
										<Message align="end" role="group" aria-label="Your message">
											<MessageContent class="items-end">
												<Bubble variant="muted" align="end" class="max-w-[92%] sm:max-w-[77%]">
													<BubbleContent
														class="space-y-2 rounded-lg border-0 bg-(--agent-bubble) px-3 py-2 text-[15px] leading-6"
													>
														<Attachments :files="turn.files" />
														<span
															v-if="turn.example"
															class="inline-flex items-center gap-1 rounded border border-border px-1"
															><Icon :name="turn.example.id" />{{ turn.prompt }}</span
														>
														<p v-else-if="turn.prompt" class="wrap-anywhere whitespace-pre-wrap">
															{{ turn.prompt }}
														</p>
													</BubbleContent>
												</Bubble>
											</MessageContent>
										</Message>
									</MessageScrollerItem>
									<MessageScrollerItem :message-id="`${turn.id}-reply`">
										<Message role="group" aria-label="Agent reply">
											<MessageContent class="gap-2">
												<Marker
													v-if="turn.phase === 'thinking'"
													class="text-[13px] text-muted-foreground motion-safe:animate-pulse"
													>Thinking…</Marker
												>
												<Trace
													v-if="
														turn.tool &&
														turn.phase !== 'thinking' &&
														(turn.phase !== 'stopped' || turn.seconds)
													"
												>
													<TraceCollapsible>
														<TraceCollapsibleTrigger class="rounded-sm py-0.5 text-[13px]">{{
															turn.seconds
																? `Worked for ${turn.seconds} ${turn.seconds === 1 ? "second" : "seconds"}`
																: "Working…"
														}}</TraceCollapsibleTrigger>
														<TraceCollapsibleContent
															class="space-y-2 ps-2 pt-1 motion-reduce:animate-none"
														>
															<TraceLine :status="turn.seconds ? undefined : 'running'">
																<TraceIcon
																	><Icon :name="turn.tool === 'file' ? 'file' : 'research'"
																/></TraceIcon>
																<TraceTitle>{{
																	turn.tool === "file"
																		? turn.seconds
																			? "Checked attachments"
																			: "Checking attachments…"
																		: turn.seconds
																			? "Searched sample issues"
																			: "Searching sample issues…"
																}}</TraceTitle>
																<TraceDescription v-if="turn.seconds && turn.tool === 'search'"
																	>Review checklist</TraceDescription
																>
															</TraceLine>
															<CodeBlock v-if="turn.seconds && turn.tool === 'file'">
																<CodeBlockHeader
																	><CodeBlockTitle
																		>Local attachment metadata</CodeBlockTitle
																	></CodeBlockHeader
																>
																<CodeBlockContent
																	class="focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
																	aria-label="Attachment metadata"
																	wrap
																	:code="
																		turn.files
																			.map(({ file }) => `${file.name} · ${sizeLabel(file.size)}`)
																			.join('\n')
																	"
																/>
															</CodeBlock>
														</TraceCollapsibleContent>
													</TraceCollapsible>
												</Trace>
												<Bubble v-if="turn.reply.length" variant="ghost" class="w-full">
													<BubbleContent class="w-full border-0 text-[15px] leading-6">
														<p
															v-for="(paragraph, index) in turn.reply"
															:key="index"
															class="mb-3 last:mb-0"
														>
															{{ paragraph }}
														</p>
														<ol v-if="turn.items" class="list-decimal space-y-1 ps-6">
															<li v-for="item in checklist.slice(0, turn.items)" :key="item">
																{{ item }}
															</li>
														</ol>
													</BubbleContent>
												</Bubble>
												<p
													v-if="turn.phase === 'stopped'"
													role="status"
													class="text-xs text-muted-foreground"
												>
													Response stopped
												</p>
												<MessageFooter
													v-if="
														turn.phase === 'done' || (turn.phase === 'stopped' && turn.reply.length)
													"
													class="gap-1"
												>
													<Button
														variant="ghost"
														size="icon-xs"
														aria-label="Copy reply"
														title="Copy reply"
														@click="copy(turn)"
														><Icon name="copy"
													/></Button>
													<span role="status" class="text-xs text-muted-foreground">{{
														copied[turn.id]
													}}</span>
												</MessageFooter>
											</MessageContent>
										</Message>
									</MessageScrollerItem>
								</template>
							</MessageScrollerContent>
						</MessageScrollerViewport>
						<MessageScrollerButton
							aria-label="Scroll to latest"
							size="xs"
							class="h-7 w-auto gap-1 rounded-full border bg-(--agent-bubble) px-2.5 text-xs shadow-sm data-[direction=end]:bottom-2"
							><Icon name="down" />Latest</MessageScrollerButton
						>
					</MessageScrollerRoot>
				</MessageScrollerProvider>
				<form
					aria-label="Chat composer"
					:class="chat ? 'mx-auto w-full max-w-[848px] shrink-0 px-3 pb-3 sm:px-4' : 'w-full'"
					@submit.prevent="send()"
					@dragover="dragOver"
					@drop="drop"
				>
					<span class="sr-only" role="status">{{ running ? "Agent is responding" : "" }}</span>
					<InputGroup
						appearance="composer"
						class="flex h-auto flex-col items-stretch gap-2 rounded-xl border border-border px-3 pt-4 pb-2.5 shadow-none sm:px-4"
						:class="chat ? 'bg-(--agent-reply)' : 'bg-(--agent-composer)'"
					>
						<div class="flex max-h-[min(35svh,17rem)] min-w-0 flex-col gap-2 overflow-y-auto">
							<Attachments :files="draft.files" removable @remove="removeFile" />
							<InputGroupTextarea
								v-model="draft.text"
								aria-label="Message Agent"
								:placeholder="chat ? 'Reply…' : 'Ask Agent…'"
								:rows="1"
								class="field-sizing-content max-h-36 w-full flex-none rounded-none border-0 bg-transparent p-0 text-[15px] leading-6 shadow-none outline-none placeholder:text-(--agent-placeholder) focus-visible:ring-0 md:text-[15px]"
								:class="chat ? 'min-h-[68px]' : 'min-h-11'"
								@keydown="keys"
								@paste="addFiles(Array.from($event.clipboardData?.files ?? []))"
							/>
						</div>
						<div class="flex items-center justify-end gap-2">
							<input ref="picker" type="file" hidden multiple @change="chooseFiles" />
							<DropdownMenu>
								<DropdownMenuTrigger as-child
									><Button
										variant="ghost"
										size="icon-xs"
										aria-label="Add files"
										title="Add files"
										:class="[smallButton, 'text-muted-foreground']"
										><Icon name="plus" /></Button
								></DropdownMenuTrigger>
								<DropdownMenuContent
									appearance="surface"
									align="end"
									class="w-48"
									:portal-props="portalProps"
								>
									<DropdownMenuItem
										aria-keyshortcuts="Meta+Shift+U Control+Shift+U"
										aria-label="File"
										@select="picker?.click()"
										><Icon name="file" />File<DropdownMenuShortcut
											aria-hidden="true"
											class="tracking-normal"
											>Ctrl/⌘ Shift U</DropdownMenuShortcut
										></DropdownMenuItem
									>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								v-if="running"
								type="button"
								size="icon-xs"
								:class="[smallButton, 'bg-(--agent-send) text-white hover:bg-(--agent-send)/85']"
								aria-label="Stop responding"
								title="Stop responding"
								@click="stop"
								><span aria-hidden="true" class="size-2 rounded-[2px] bg-current"
							/></Button>
							<Button
								v-else
								type="submit"
								size="icon-xs"
								:disabled="!ready"
								:class="[
									smallButton,
									'bg-(--agent-send) text-white hover:bg-(--agent-send)/85',
									chat
										? 'disabled:bg-accent disabled:text-muted-foreground disabled:opacity-100'
										: 'disabled:opacity-80',
								]"
								aria-label="Send message"
								title="Send message"
								><Icon name="up"
							/></Button>
						</div>
					</InputGroup>
				</form>
				<template v-if="!chat">
					<template v-if="showExamples">
						<div class="mt-2 flex items-center justify-between px-2">
							<p class="text-xs text-muted-foreground">Get started with some examples</p>
							<Button
								variant="ghost"
								size="icon-xs"
								aria-label="Dismiss examples"
								@click="
									showExamples = false;
									focus();
								"
								><Icon name="close"
							/></Button>
						</div>
						<div class="grid gap-2 @min-[525px]/agent:grid-cols-3">
							<Card
								v-for="example in examples"
								:key="example.id"
								size="sm"
								class="min-w-0 rounded-lg border border-border bg-transparent p-0 shadow-none ring-0 hover:bg-accent"
							>
								<button
									type="button"
									class="flex min-h-19 w-full items-center gap-3 rounded-lg p-3 text-start focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring @min-[525px]/agent:min-h-[132px] @min-[525px]/agent:flex-col @min-[525px]/agent:items-start @min-[525px]/agent:justify-between @min-[525px]/agent:p-4"
									@click="send(example)"
								>
									<span class="grid size-5 shrink-0 place-items-center text-muted-foreground"
										><Icon :name="example.id"
									/></span>
									<span class="space-y-1"
										><span class="block text-[13px] leading-4 font-medium">{{ example.title }}</span
										><span class="block text-xs leading-[18px] text-muted-foreground">{{
											example.description
										}}</span></span
									>
								</button>
							</Card>
						</div>
					</template>
					<nav aria-label="Recent chats" class="flex flex-col">
						<Button
							v-for="item in chats.slice(0, 4)"
							:key="item.id"
							variant="ghost"
							size="sm"
							class="h-8 w-full justify-between rounded-md px-3 text-[13px] font-normal text-muted-foreground"
							@click="selectChat(item.id)"
							><span class="min-w-0 truncate">{{ item.title }}</span
							><span class="shrink-0 text-xs">{{ label(item) }}</span></Button
						>
					</nav>
				</template>
			</div>
		</div>
	</section>
</template>
