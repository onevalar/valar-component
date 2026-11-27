import {
	Attachment,
	AttachmentAction,
	AttachmentActions,
	AttachmentContent,
	AttachmentDescription,
	AttachmentGroup,
	AttachmentMedia,
	AttachmentTitle,
} from "@valar/react-ui/attachment";
import { Bubble, BubbleContent } from "@valar/react-ui/bubble";
import { Button } from "@valar/react-ui/button";
import { Card } from "@valar/react-ui/card";
import {
	CodeBlock,
	CodeBlockContent,
	CodeBlockHeader,
	CodeBlockTitle,
} from "@valar/react-ui/code-block";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@valar/react-ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@valar/react-ui/dropdown-menu";
import { InputGroup, InputGroupTextarea } from "@valar/react-ui/input-group";
import { Marker } from "@valar/react-ui/marker";
import { Message, MessageContent, MessageFooter } from "@valar/react-ui/message";
import { MessageScroller } from "@valar/react-ui/message-scroller";
import { Popover, PopoverContent, PopoverTrigger } from "@valar/react-ui/popover";
import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from "@valar/react-ui/trace";
// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";

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
	return (
		<svg
			aria-hidden="true"
			className="size-3.5 shrink-0"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={icons[name]} />
		</svg>
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
const emptyDraft: Draft = { text: "", files: [] };
const sample: Chat = {
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
};
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
} as CSSProperties;

function Attachments({ files, onRemove }: { files: ChatFile[]; onRemove?: (id: number) => void }) {
	if (!files.length) return null;
	return (
		<AttachmentGroup
			role="group"
			aria-label="Attachments"
			className="w-full flex-col items-stretch gap-1.5 overflow-x-hidden"
		>
			{files.map(({ id, file, state, url }) => (
				<Attachment
					key={id}
					size="sm"
					state={state}
					className="w-full flex-nowrap gap-2 rounded-md border-border bg-(--agent-file) text-foreground"
				>
					{url && file.type.startsWith("image/") ? (
						<AttachmentMedia variant="image">
							<img src={url} alt="" />
						</AttachmentMedia>
					) : (
						<AttachmentMedia className="text-muted-foreground">
							<Icon name="file" />
						</AttachmentMedia>
					)}
					<AttachmentContent>
						<AttachmentTitle title={file.name}>{file.name}</AttachmentTitle>
						<AttachmentDescription>
							{state === "uploading" ? (
								<span role="status">Preparing attachment…</span>
							) : state === "error" ? (
								<span role="alert">File exceeds 10 MB</span>
							) : (
								sizeLabel(file.size)
							)}
						</AttachmentDescription>
					</AttachmentContent>
					{onRemove ? (
						<AttachmentActions className="relative! inset-auto!">
							<AttachmentAction
								aria-label={`Remove ${file.name}`}
								title="Remove attachment"
								onClick={() => onRemove(id)}
							>
								<Icon name="close" />
							</AttachmentAction>
						</AttachmentActions>
					) : (
						url && (
							<a
								className="shrink-0 rounded-md p-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
								href={url}
								download={file.name}
								aria-label={`Download ${file.name}`}
							>
								Download
							</a>
						)
					)}
				</Attachment>
			))}
		</AttachmentGroup>
	);
}

function Reply({ turn }: { turn: Turn }) {
	const [copied, setCopied] = useState("");
	const items = checklist.slice(0, turn.items);
	const stopped = turn.phase === "stopped";
	async function copy() {
		try {
			await navigator.clipboard.writeText(
				[...turn.reply, ...items.map((item, index) => `${index + 1}. ${item}`)].join("\n\n")
			);
			setCopied("Copied");
		} catch {
			setCopied("Could not copy");
		}
	}
	return (
		<Message role="group" aria-label="Agent reply">
			<MessageContent className="gap-2">
				{turn.phase === "thinking" && (
					<Marker className="text-[13px] text-muted-foreground motion-safe:animate-pulse">
						Thinking…
					</Marker>
				)}
				{turn.tool && turn.phase !== "thinking" && (!stopped || turn.seconds) && (
					<Trace>
						<TraceCollapsible>
							<TraceCollapsibleTrigger className="rounded-sm py-0.5 text-[13px]">
								{turn.seconds
									? `Worked for ${turn.seconds} ${turn.seconds === 1 ? "second" : "seconds"}`
									: "Working…"}
							</TraceCollapsibleTrigger>
							<TraceCollapsibleContent className="space-y-2 ps-2 pt-1 motion-reduce:animate-none">
								<TraceLine status={turn.seconds ? undefined : "running"}>
									<TraceIcon>
										<Icon name={turn.tool === "file" ? "file" : "research"} />
									</TraceIcon>
									<TraceTitle>
										{turn.tool === "file"
											? turn.seconds
												? "Checked attachments"
												: "Checking attachments…"
											: turn.seconds
												? "Searched sample issues"
												: "Searching sample issues…"}
									</TraceTitle>
									{turn.seconds && turn.tool === "search" && (
										<TraceDescription>Review checklist</TraceDescription>
									)}
								</TraceLine>
								{turn.seconds && turn.tool === "file" && (
									<CodeBlock>
										<CodeBlockHeader>
											<CodeBlockTitle>Local attachment metadata</CodeBlockTitle>
										</CodeBlockHeader>
										<CodeBlockContent
											className="focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
											aria-label="Attachment metadata"
											wrap
											code={turn.files
												.map(({ file }) => `${file.name} · ${sizeLabel(file.size)}`)
												.join("\n")}
										/>
									</CodeBlock>
								)}
							</TraceCollapsibleContent>
						</TraceCollapsible>
					</Trace>
				)}
				{turn.reply.length > 0 && (
					<Bubble variant="ghost" className="w-full">
						<BubbleContent className="w-full border-0 text-[15px] leading-6">
							{turn.reply.map((paragraph, index) => (
								<p key={index} className="mb-3 last:mb-0">
									{paragraph}
								</p>
							))}
							{items.length > 0 && (
								<ol className="list-decimal space-y-1 ps-6">
									{items.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ol>
							)}
						</BubbleContent>
					</Bubble>
				)}
				{stopped && (
					<p role="status" className="text-xs text-muted-foreground">
						Response stopped
					</p>
				)}
				{(turn.phase === "done" || (stopped && turn.reply.length > 0)) && (
					<MessageFooter className="gap-1">
						<Button
							variant="ghost"
							size="icon-xs"
							aria-label="Copy reply"
							title="Copy reply"
							onClick={copy}
						>
							<Icon name="copy" />
						</Button>
						<span role="status" className="text-xs text-muted-foreground">
							{copied}
						</span>
					</MessageFooter>
				)}
			</MessageContent>
		</Message>
	);
}

export default function AgentExample() {
	const [chats, setChats] = useState([sample]);
	const [drafts, setDrafts] = useState<Record<string, Draft>>({});
	const [activeId, setActiveId] = useState("new");
	const [showExamples, setShowExamples] = useState(true);
	const [historyOpen, setHistoryOpen] = useState(false);
	const section = useRef<HTMLElement>(null);
	const compose = useRef<HTMLTextAreaElement>(null);
	const picker = useRef<HTMLInputElement>(null);
	const search = useRef<HTMLInputElement>(null);
	const restoreComposer = useRef(false);
	const serial = useRef(0);
	const turnTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>()).current;
	const fileTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>()).current;
	const urls = useRef(new Set<string>()).current;
	const chat = chats.find(({ id }) => id === activeId);
	const latest = chat?.turns.at(-1);
	const running = !!latest && latest.phase !== "done" && latest.phase !== "stopped";
	const draft = drafts[activeId] ?? emptyDraft;
	const ready =
		!!(draft.text.trim() || draft.files.length) &&
		draft.files.every(({ state }) => state === "done");
	const focus = () => compose.current?.focus({ preventScroll: true });

	useEffect(
		() => () => {
			turnTimers.forEach((timer) => clearTimeout(timer));
			fileTimers.forEach((timer) => clearTimeout(timer));
			urls.forEach((url) => URL.revokeObjectURL(url));
			turnTimers.clear();
			fileTimers.clear();
			urls.clear();
		},
		[turnTimers, fileTimers, urls]
	);

	function updateDraft(id: string, update: (previous: Draft) => Draft) {
		setDrafts((previous) => ({ ...previous, [id]: update(previous[id] ?? emptyDraft) }));
	}

	function addFiles(files: File[]) {
		if (!files.length) return;
		const draftId = activeId;
		const added = files.map((file): ChatFile => {
			const id = ++serial.current;
			if (file.size > 10 * 1024 * 1024) return { id, file, state: "error" };
			const url = URL.createObjectURL(file);
			urls.add(url);
			fileTimers.set(
				id,
				setTimeout(() => {
					fileTimers.delete(id);
					updateDraft(draftId, (value) => ({
						...value,
						files: value.files.map((entry) =>
							entry.id === id ? { ...entry, state: "done" } : entry
						),
					}));
				}, 350)
			);
			return { id, file, state: "uploading", url };
		});
		updateDraft(draftId, (value) => ({ ...value, files: [...value.files, ...added] }));
	}

	function removeFile(id: number) {
		const removed = draft.files.find((entry) => entry.id === id);
		clearTimeout(fileTimers.get(id));
		fileTimers.delete(id);
		if (removed?.url) {
			URL.revokeObjectURL(removed.url);
			urls.delete(removed.url);
		}
		updateDraft(activeId, (value) => ({
			...value,
			files: value.files.filter((entry) => entry.id !== id),
		}));
		focus();
	}

	function updateTurn(chatId: string, turnId: string, patch: Partial<Turn>) {
		setChats((current) =>
			current.map((item) =>
				item.id === chatId
					? {
							...item,
							turns: item.turns.map((turn) => (turn.id === turnId ? { ...turn, ...patch } : turn)),
						}
					: item
			)
		);
	}

	function runTurn(chatId: string, turn: Turn) {
		const started = Date.now();
		const paragraphs = turn.example?.reply ?? [
			turn.files.length ? attachmentIntro : checklistIntro,
		];
		const reply: string[] = [];
		let paragraph = 0,
			offset = 0,
			items = 0;
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
				const text = paragraphs[paragraph];
				offset += 18;
				reply[paragraph] = text.slice(0, offset);
				if (offset >= text.length) {
					paragraph++;
					offset = 0;
				}
				updateTurn(chatId, turn.id, { phase: "streaming", reply: [...reply] });
				schedule(advance, 80);
			} else if (!turn.example && items < checklist.length) {
				updateTurn(chatId, turn.id, { items: ++items });
				schedule(advance, 110);
			} else updateTurn(chatId, turn.id, { phase: "done" });
		}
		schedule(() => {
			if (!turn.tool) {
				advance();
				return;
			}
			updateTurn(chatId, turn.id, { phase: "working" });
			schedule(() => {
				updateTurn(chatId, turn.id, {
					seconds: Math.max(1, Math.round((Date.now() - started) / 1000)),
				});
				advance();
			}, 780);
		}, 430);
	}

	function send(example?: Example) {
		if (running || (!example && !ready)) return;
		const prompt = example?.title ?? draft.text.trim();
		const files = example ? [] : draft.files;
		const id = chat?.id ?? `chat-${++serial.current}`;
		const turn: Turn = {
			id: `turn-${++serial.current}`,
			prompt,
			files,
			example,
			phase: "thinking",
			tool: example ? null : files.length ? "file" : "search",
			reply: [],
			items: 0,
		};
		if (chat)
			setChats((current) =>
				current.map((item) => (item.id === id ? { ...item, turns: [...item.turns, turn] } : item))
			);
		else {
			const next = {
				id,
				title: prompt.split("\n")[0].slice(0, 68) || files[0].file.name,
				date: new Date().toISOString(),
				turns: [turn],
			};
			setChats((current) => [next, ...current]);
			setActiveId(id);
		}
		if (!example) updateDraft(activeId, () => emptyDraft);
		runTurn(id, turn);
		focus();
	}

	function stop() {
		if (!running || !latest) return;
		clearTimeout(turnTimers.get(latest.id));
		turnTimers.delete(latest.id);
		updateTurn(activeId, latest.id, { phase: "stopped" });
		focus();
	}

	function selectChat(id: string, viaMenu = false) {
		setActiveId(id);
		if (viaMenu) {
			restoreComposer.current = true;
			setHistoryOpen(false);
		} else focus();
	}

	const smallButton = "size-6 shrink-0 rounded-full p-0 shadow-none [&_svg]:size-3.5";
	return (
		<section
			ref={section}
			aria-label="Agent chat"
			style={tokens}
			className="@container/agent flex h-[min(79svh,860px)] min-h-[480px] min-w-0 flex-col overflow-hidden rounded-[10px] border border-border bg-(--agent-panel) text-foreground [color-scheme:light] dark:[color-scheme:dark]"
		>
			<header className="flex h-11 shrink-0 items-center border-b border-border px-2.5">
				<h2 className="max-w-full min-w-0" aria-label={chat?.title ?? "New chat"}>
					<Popover open={historyOpen} onOpenChange={setHistoryOpen}>
						<PopoverTrigger
							aria-label="Switch chat"
							title="Switch chat"
							className="flex h-7 max-w-full items-center gap-1.5 rounded-full px-2 text-[13px] font-medium hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
						>
							<span className="truncate">{chat?.title ?? "New chat"}</span>
							<span className="text-muted-foreground">
								<Icon name="chevron" />
							</span>
						</PopoverTrigger>
						<PopoverContent
							appearance="surface"
							align="start"
							portalProps={{ container: section.current }}
							aria-label="Chat history"
							className="w-[264px] max-w-[calc(100vw-2rem)] gap-0 p-0"
							onOpenAutoFocus={(event) => {
								event.preventDefault();
								search.current?.focus();
							}}
							onCloseAutoFocus={(event) => {
								if (restoreComposer.current) {
									event.preventDefault();
									restoreComposer.current = false;
									focus();
								}
							}}
						>
							<Command className="rounded-xl bg-transparent">
								<CommandInput ref={search} aria-label="Search chats" placeholder="Search chats…" />
								<CommandList aria-label="Chat results">
									<CommandEmpty>No matching chats</CommandEmpty>
									<CommandGroup>
										<CommandItem
											value="new"
											keywords={["New chat"]}
											onSelect={() => selectChat("new", true)}
										>
											<Icon name="plus" />
											New chat
										</CommandItem>
									</CommandGroup>
									<CommandSeparator />
									<CommandGroup heading="Recent chats">
										{chats.map((item) => (
											<CommandItem
												key={item.id}
												value={item.id}
												keywords={[item.title]}
												className="justify-between"
												onSelect={() => selectChat(item.id, true)}
											>
												<span className="min-w-0 truncate">{item.title}</span>
												<span className="shrink-0 text-xs text-muted-foreground">
													{label(item)}
												</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</h2>
			</header>
			<div
				className={
					chat
						? "flex min-h-0 flex-1 flex-col"
						: "min-h-0 flex-1 overflow-y-auto bg-linear-to-b from-(--agent-panel) to-(--agent-base)"
				}
			>
				<div
					className={
						chat
							? "contents"
							: "mx-auto flex min-h-full w-full max-w-[744px] flex-col justify-center gap-3 px-3 py-6 sm:px-4"
					}
				>
					{chat && (
						<MessageScroller.Provider key={chat.id} defaultScrollPosition="start">
							<MessageScroller.Root className="min-h-0 flex-1">
								<MessageScroller.Viewport aria-label="Conversation messages">
									<MessageScroller.Content
										aria-busy={running}
										className="mx-auto w-full max-w-[824px] gap-6 px-3 pt-4 pb-8 sm:px-4"
									>
										{chat.date && (
											<MessageScroller.Item messageId={`${chat.id}-time`}>
												<time
													dateTime={chat.date}
													className="block text-center text-xs text-muted-foreground"
												>
													{dateFormat.format(new Date(chat.date))}
												</time>
											</MessageScroller.Item>
										)}
										{chat.turns.map((turn) => (
											<Fragment key={turn.id}>
												<MessageScroller.Item messageId={`${turn.id}-user`} scrollAnchor>
													<Message align="end" role="group" aria-label="Your message">
														<MessageContent className="items-end">
															<Bubble
																variant="muted"
																align="end"
																className="max-w-[92%] sm:max-w-[77%]"
															>
																<BubbleContent className="space-y-2 rounded-lg border-0 bg-(--agent-bubble) px-3 py-2 text-[15px] leading-6">
																	<Attachments files={turn.files} />
																	{turn.example ? (
																		<span className="inline-flex items-center gap-1 rounded border border-border px-1">
																			<Icon name={turn.example.id} />
																			{turn.prompt}
																		</span>
																	) : (
																		turn.prompt && (
																			<p className="wrap-anywhere whitespace-pre-wrap">
																				{turn.prompt}
																			</p>
																		)
																	)}
																</BubbleContent>
															</Bubble>
														</MessageContent>
													</Message>
												</MessageScroller.Item>
												<MessageScroller.Item messageId={`${turn.id}-reply`}>
													<Reply turn={turn} />
												</MessageScroller.Item>
											</Fragment>
										))}
									</MessageScroller.Content>
								</MessageScroller.Viewport>
								<MessageScroller.Button
									aria-label="Scroll to latest"
									size="xs"
									className="h-7 w-auto gap-1 rounded-full border bg-(--agent-bubble) px-2.5 text-xs shadow-sm data-[direction=end]:bottom-2"
								>
									<Icon name="down" />
									Latest
								</MessageScroller.Button>
							</MessageScroller.Root>
						</MessageScroller.Provider>
					)}
					<form
						aria-label="Chat composer"
						className={chat ? "mx-auto w-full max-w-[848px] shrink-0 px-3 pb-3 sm:px-4" : "w-full"}
						onSubmit={(event) => {
							event.preventDefault();
							send();
						}}
						onDragOver={(event) => {
							if (event.dataTransfer.types.includes("Files")) {
								event.preventDefault();
								event.dataTransfer.dropEffect = "copy";
							}
						}}
						onDrop={(event) => {
							if (event.dataTransfer.files.length) {
								event.preventDefault();
								addFiles(Array.from(event.dataTransfer.files));
								focus();
							}
						}}
					>
						<span className="sr-only" role="status">
							{running ? "Agent is responding" : ""}
						</span>
						<InputGroup
							appearance="composer"
							className={`flex h-auto flex-col items-stretch gap-2 rounded-xl border border-border px-3 pt-4 pb-2.5 shadow-none sm:px-4 ${chat ? "bg-(--agent-reply)" : "bg-(--agent-composer)"}`}
						>
							<div className="flex max-h-[min(35svh,17rem)] min-w-0 flex-col gap-2 overflow-y-auto">
								<Attachments files={draft.files} onRemove={removeFile} />
								<InputGroupTextarea
									ref={compose}
									value={draft.text}
									aria-label="Message Agent"
									placeholder={chat ? "Reply…" : "Ask Agent…"}
									rows={1}
									className={`field-sizing-content max-h-36 w-full flex-none rounded-none border-0 bg-transparent p-0 text-[15px] leading-6 shadow-none outline-none placeholder:text-(--agent-placeholder) focus-visible:ring-0 md:text-[15px] ${chat ? "min-h-[68px]" : "min-h-11"}`}
									onChange={(event) => {
										const text = event.currentTarget.value;
										updateDraft(activeId, (value) => ({ ...value, text }));
									}}
									onKeyDown={(event) => {
										if (event.nativeEvent.isComposing || event.keyCode === 229) return;
										if (event.key === "Enter" && !event.shiftKey) {
											event.preventDefault();
											if (!event.repeat) send();
										}
										if (
											event.key.toLowerCase() === "u" &&
											(event.ctrlKey || event.metaKey) &&
											event.shiftKey
										) {
											event.preventDefault();
											picker.current?.click();
										}
									}}
									onPaste={(event) => addFiles(Array.from(event.clipboardData.files))}
								/>
							</div>
							<div className="flex items-center justify-end gap-2">
								<input
									ref={picker}
									type="file"
									hidden
									multiple
									onChange={(event) => {
										addFiles(Array.from(event.currentTarget.files ?? []));
										event.currentTarget.value = "";
										focus();
									}}
								/>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-label="Add files"
											title="Add files"
											className={`${smallButton} text-muted-foreground`}
										>
											<Icon name="plus" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										appearance="surface"
										align="end"
										className="w-48"
										portalProps={{ container: section.current }}
									>
										<DropdownMenuItem
											aria-keyshortcuts="Meta+Shift+U Control+Shift+U"
											aria-label="File"
											onSelect={() => picker.current?.click()}
										>
											<Icon name="file" />
											File
											<DropdownMenuShortcut aria-hidden="true" className="tracking-normal">
												Ctrl/⌘ Shift U
											</DropdownMenuShortcut>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								{running ? (
									<Button
										type="button"
										size="icon-xs"
										className={`${smallButton} bg-(--agent-send) text-white hover:bg-(--agent-send)/85`}
										aria-label="Stop responding"
										title="Stop responding"
										onClick={stop}
									>
										<span aria-hidden="true" className="size-2 rounded-[2px] bg-current" />
									</Button>
								) : (
									<Button
										type="submit"
										size="icon-xs"
										disabled={!ready}
										className={`${smallButton} bg-(--agent-send) text-white hover:bg-(--agent-send)/85 ${chat ? "disabled:bg-accent disabled:text-muted-foreground disabled:opacity-100" : "disabled:opacity-80"}`}
										aria-label="Send message"
										title="Send message"
									>
										<Icon name="up" />
									</Button>
								)}
							</div>
						</InputGroup>
					</form>
					{!chat && (
						<>
							{showExamples && (
								<>
									<div className="mt-2 flex items-center justify-between px-2">
										<p className="text-xs text-muted-foreground">Get started with some examples</p>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-label="Dismiss examples"
											onClick={() => {
												setShowExamples(false);
												focus();
											}}
										>
											<Icon name="close" />
										</Button>
									</div>
									<div className="grid gap-2 @min-[525px]/agent:grid-cols-3">
										{examples.map((example) => (
											<Card
												key={example.id}
												size="sm"
												className="min-w-0 rounded-lg border border-border bg-transparent p-0 shadow-none ring-0 hover:bg-accent"
											>
												<button
													type="button"
													className="flex min-h-19 w-full items-center gap-3 rounded-lg p-3 text-start focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring @min-[525px]/agent:min-h-[132px] @min-[525px]/agent:flex-col @min-[525px]/agent:items-start @min-[525px]/agent:justify-between @min-[525px]/agent:p-4"
													onClick={() => send(example)}
												>
													<span className="grid size-5 shrink-0 place-items-center text-muted-foreground">
														<Icon name={example.id} />
													</span>
													<span className="space-y-1">
														<span className="block text-[13px] leading-4 font-medium">
															{example.title}
														</span>
														<span className="block text-xs leading-[18px] text-muted-foreground">
															{example.description}
														</span>
													</span>
												</button>
											</Card>
										))}
									</div>
								</>
							)}
							<nav aria-label="Recent chats" className="flex flex-col">
								{chats.slice(0, 4).map((item) => (
									<Button
										key={item.id}
										variant="ghost"
										size="sm"
										className="h-8 w-full justify-between rounded-md px-3 text-[13px] font-normal text-muted-foreground"
										onClick={() => selectChat(item.id)}
									>
										<span className="min-w-0 truncate">{item.title}</span>
										<span className="shrink-0 text-xs">{label(item)}</span>
									</Button>
								))}
							</nav>
						</>
					)}
				</div>
			</div>
		</section>
	);
}
