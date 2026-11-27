"use client";

import * as React from "react";
import { cn } from "cn";
import {
	CheckIcon,
	ChevronRightIcon,
	MaximizeIcon,
	MinimizeIcon,
	PaperclipIcon,
	XIcon,
} from "lucide-react";
import { Button } from "./button.tsx";
import { composingCommandInputs, isCommandComposing } from "./command-keyboard.ts";
import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandShortcut,
} from "./command.tsx";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
} from "./dialog.tsx";
import { Input } from "./input.tsx";
import {
	issueLabels,
	priorities,
	statuses,
	type IssueDraft,
	type IssuePriority,
	type IssueStatus,
} from "./issue-composer-options.ts";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";
import { Switch } from "./switch.tsx";
import { Textarea } from "./textarea.tsx";
import { TooltipHint, TooltipProvider } from "./tooltip.tsx";

export {
	issueLabels,
	priorities,
	statuses,
	type IssueDraft,
	type IssuePriority,
	type IssueStatus,
} from "./issue-composer-options.ts";

const statusStyles = {
	backlog: "border-dashed border-current",
	todo: "border-current",
	progress:
		"border-amber-500 bg-[linear-gradient(90deg,var(--color-amber-500)_50%,transparent_50%)]",
	done: "border-indigo-500 bg-indigo-500 text-white",
	canceled: "border-current",
};
const levels = { high: 3, medium: 2, low: 1 };

export function IssueGlyph({ value }: { value: IssueStatus | IssuePriority }) {
	if (value in statusStyles) {
		return (
			<span
				className={cn(
					"inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border",
					statusStyles[value as IssueStatus]
				)}
				aria-hidden="true"
			>
				{value === "done" && <CheckIcon className="size-2.5" />}
				{value === "canceled" && <XIcon className="size-2.5" />}
			</span>
		);
	}
	return (
		<span className="inline-flex size-3.5 shrink-0 items-center justify-center" aria-hidden="true">
			{value === "urgent" ? (
				<span className="grid size-3.5 place-items-center rounded-[3px] bg-orange-600 text-[10px] leading-none font-semibold text-white">
					!
				</span>
			) : value === "none" ? (
				<span className="text-xs leading-none tracking-tighter">···</span>
			) : value === "high" || value === "medium" || value === "low" ? (
				[1, 2, 3].map((bar) => (
					<span
						key={bar}
						className="mx-px w-0.5 self-end rounded-full bg-current"
						style={{ height: 3 + bar * 3, opacity: bar <= levels[value] ? 1 : 0.25 }}
					/>
				))
			) : null}
		</span>
	);
}

const fields = ["status", "priority"] as const;
type Field = (typeof fields)[number];
const options = { status: statuses, priority: priorities };
const iconButton =
	"size-8 min-w-0 shrink-0 rounded-full p-0 text-foreground hover:bg-accent motion-reduce:transition-none";
const editorField =
	"rounded-none border-0 bg-transparent! px-0 text-foreground ring-0! shadow-none! focus-visible:outline-solid! focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive placeholder:text-(--composer-placeholder)! transition-none";
const tokens = {
	"--composer-surface": "light-dark(lch(100% 0 282), lch(9.232% .85 272))",
	"--composer-accent": "light-dark(lch(46% 70 267), lch(48% 72 267))",
	"--composer-placeholder": "light-dark(lch(57% 1.25 282), lch(42% 1.2 272))",
	"--composer-chip": "light-dark(white, lch(13.861% 1.139 272))",
	"--foreground": "light-dark(lch(9.794% 0 282), white)",
	"--muted-foreground": "light-dark(lch(39.176% 1.25 282), lch(61.803% 1.2 272))",
	"--border": "light-dark(lch(89% .5 282), lch(22% .85 272))",
	"--accent": "light-dark(lch(94.854% .5 282), lch(24% 1.3 272))",
	"--ring": "var(--composer-accent)",
	"--settings-focus": "var(--composer-accent)",
	"--settings-switch-on": "var(--composer-accent)",
	"--settings-switch-off": "light-dark(lch(86.75% .5 282), lch(25.69% 1.975 272))",
} as React.CSSProperties;

export type IssueComposerProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	chinese?: boolean;
	workspace?: string;
	onCreate: (draft: IssueDraft) => void;
	returnFocus?: () => HTMLElement | null;
};

export function IssueComposer({
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	chinese = false,
	workspace = "Valar",
	onCreate,
	returnFocus,
}: IssueComposerProps) {
	const id = React.useId();
	const [localOpen, setLocalOpen] = React.useState(defaultOpen);
	const open = controlledOpen ?? localOpen;
	const [title, setTitle] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [status, setStatus] = React.useState<IssueStatus>("backlog");
	const [priority, setPriority] = React.useState<IssuePriority>("none");
	const [attachments, setAttachments] = React.useState<File[]>([]);
	const [createMore, setCreateMore] = React.useState(false);
	const [expanded, setExpanded] = React.useState(false);
	const [invalidTitle, setInvalidTitle] = React.useState(false);
	const [activeMenu, setActiveMenu] = React.useState<Field>();
	const [floatingRoot, setFloatingRoot] = React.useState<HTMLDivElement | null>(null);
	const titleInput = React.useRef<HTMLInputElement>(null);
	const menuInput = React.useRef<HTMLInputElement>(null);
	const fileInput = React.useRef<HTMLInputElement>(null);
	const attachmentsList = React.useRef<HTMLUListElement>(null);
	const addAttachment = React.useRef<HTMLButtonElement>(null);
	const removedAttachment = React.useRef<number>(null);
	const previousFocus = React.useRef<HTMLElement | null>(null);
	const text = (zh: string, en: string) => (chinese ? zh : en);
	const label = (key: keyof typeof issueLabels) => issueLabels[key][chinese ? 0 : 1];
	const expandLabel = expanded
		? text("收起编辑区", "Collapse editor")
		: text("展开编辑区", "Expand editor");
	const closeLabel = text("关闭", "Close");
	const attachmentLabel = text("添加附件", "Add attachment");

	React.useEffect(() => {
		if (!open) setActiveMenu(undefined);
	}, [open]);
	React.useLayoutEffect(() => {
		const index = removedAttachment.current;
		if (index === null) return;
		removedAttachment.current = null;
		const controls = attachmentsList.current?.querySelectorAll("button");
		(controls?.[index] ?? controls?.[index - 1] ?? addAttachment.current)?.focus();
	}, [attachments]);

	function changeOpen(next: boolean) {
		if (controlledOpen === undefined) setLocalOpen(next);
		onOpenChange?.(next);
	}

	function selectOption(field: Field, index: number) {
		if (field === "status") setStatus(statuses[index]);
		else setPriority(priorities[index]);
		setActiveMenu(undefined);
	}

	function pickWithNumber(event: React.KeyboardEvent<HTMLInputElement>, field: Field) {
		if (
			isCommandComposing(event.nativeEvent) ||
			event.ctrlKey ||
			event.metaKey ||
			event.altKey ||
			event.currentTarget.value ||
			!/^\d$/.test(event.key)
		)
			return;
		const index = Number(event.key) - (field === "status" ? 1 : 0);
		if (index < 0 || index >= options[field].length) return;
		event.preventDefault();
		if (!event.repeat) selectOption(field, index);
	}

	function createIssue(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (activeMenu) return;
		const trimmedTitle = title.trim();
		if (!trimmedTitle) {
			setInvalidTitle(true);
			titleInput.current?.focus();
			return;
		}
		onCreate({
			title: trimmedTitle,
			description: description.trim(),
			status,
			priority,
			attachments: [...attachments],
		});
		setTitle("");
		setDescription("");
		setAttachments([]);
		setInvalidTitle(false);
		if (createMore) titleInput.current?.focus();
		else {
			setStatus("backlog");
			setPriority("none");
			changeOpen(false);
		}
	}

	function editorKeyDown(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
		if (
			event.key !== "Enter" ||
			!(event.metaKey || event.ctrlKey) ||
			event.altKey ||
			isCommandComposing(event.nativeEvent) ||
			activeMenu
		)
			return;
		event.preventDefault();
		if (!event.repeat) event.currentTarget.form?.requestSubmit();
	}

	const editorEvents = {
		onKeyDown: editorKeyDown,
		onCompositionStart: (event: React.CompositionEvent) => {
			composingCommandInputs.add(event.target);
		},
		onCompositionEnd: (event: React.CompositionEvent) => {
			composingCommandInputs.delete(event.target);
		},
		onBlur: (event: React.FocusEvent) => {
			composingCommandInputs.delete(event.target);
		},
	};

	function removeAttachment(index: number) {
		removedAttachment.current = index;
		setAttachments((current) => current.filter((_, item) => item !== index));
	}

	return (
		<Dialog open={open} onOpenChange={changeOpen}>
			<DialogPortal>
				<DialogOverlay />
				<DialogContent
					showOverlay={false}
					showCloseButton={false}
					data-slot="dialog-content"
					data-expanded={expanded}
					style={tokens}
					className={cn(
						"fixed left-1/2 z-50 w-[calc(100%-24px)] -translate-x-1/2 translate-y-0 rounded-[21px] bg-(--composer-surface) text-foreground [color-scheme:light] shadow-[0_12px_36px_#0003] outline-none dark:[color-scheme:dark]",
						"transition-[max-width,top] [transition-duration:220ms,300ms] ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:animate-none! motion-reduce:transition-none motion-reduce:duration-0! data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
						expanded
							? "top-[max(8px,6svh)] max-w-[820px]"
							: "top-[clamp(8px,13svh,calc(100svh-274px))] max-w-[750px]"
					)}
					onOpenAutoFocus={(event) => {
						event.preventDefault();
						const focused = titleInput.current?.ownerDocument.activeElement;
						previousFocus.current = focused instanceof HTMLElement ? focused : null;
						setExpanded(false);
						setInvalidTitle(false);
						titleInput.current?.focus();
					}}
					onCloseAutoFocus={(event) => {
						const target = returnFocus?.();
						const focus = target?.isConnected ? target : previousFocus.current;
						if (!focus?.isConnected) return;
						event.preventDefault();
						focus.focus();
					}}
					onEscapeKeyDown={(event) => {
						if (isCommandComposing(event)) event.preventDefault();
					}}
				>
					<TooltipProvider delayDuration={500} skipDelayDuration={150}>
						<form
							className={cn(
								"flex flex-col transition-[height] duration-300 ease-[cubic-bezier(0.43,0.07,0.59,0.94)] motion-reduce:transition-none motion-reduce:duration-0!",
								expanded ? "h-[min(88svh,800px)]" : "h-[min(262px,calc(100svh-16px))]"
							)}
							onSubmit={createIssue}
						>
							<header className="flex h-14 shrink-0 items-center justify-between gap-2 ps-[19px] pe-2.5">
								<div className="flex min-w-0 items-center gap-2">
									<span className="max-w-32 truncate rounded-full border-[0.5px] border-border px-2 py-0.5 text-xs leading-4 font-medium text-muted-foreground">
										{workspace}
									</span>
									<ChevronRightIcon
										className="size-3.5 shrink-0 text-muted-foreground rtl:rotate-180"
										aria-hidden="true"
									/>
									<DialogTitle className="truncate text-[13px]! leading-5 font-medium!">
										{text("新建问题", "New issue")}
									</DialogTitle>
								</div>
								<DialogDescription className="sr-only">
									{text(
										"填写问题标题和描述，并选择状态和优先级。",
										"Write a title and description, then choose a status and priority."
									)}
								</DialogDescription>
								<div className="flex shrink-0 items-center">
									<TooltipHint
										label={expandLabel}
										portalProps={floatingRoot ? { container: floatingRoot } : false}
									>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className={iconButton}
											aria-label={expandLabel}
											aria-controls={`${id}-editor`}
											aria-expanded={expanded}
											onClick={() => setExpanded(!expanded)}
										>
											{expanded ? (
												<MinimizeIcon className="size-4" aria-hidden="true" />
											) : (
												<MaximizeIcon className="size-4" aria-hidden="true" />
											)}
										</Button>
									</TooltipHint>
									<TooltipHint
										label={closeLabel}
										portalProps={floatingRoot ? { container: floatingRoot } : false}
									>
										<DialogClose asChild>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className={iconButton}
												aria-label={closeLabel}
											>
												<XIcon className="size-4" aria-hidden="true" />
											</Button>
										</DialogClose>
									</TooltipHint>
								</div>
							</header>

							<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
								<div className="flex min-h-full flex-col">
									<div
										id={`${id}-editor`}
										className="flex flex-1 flex-col gap-1.5 px-[19px] pt-1.5"
									>
										<Input
											ref={titleInput}
											value={title}
											onChange={(event) => {
												setTitle(event.target.value);
												setInvalidTitle(false);
											}}
											{...editorEvents}
											aria-label={text("标题", "Title")}
											aria-required="true"
											aria-invalid={invalidTitle}
											aria-describedby={invalidTitle ? `${id}-error` : undefined}
											placeholder={text("问题标题", "Issue title")}
											maxLength={160}
											className={cn(
												editorField,
												"h-6 shrink-0 py-0 text-lg leading-6 font-semibold md:text-lg"
											)}
										/>
										{invalidTitle && (
											<p
												id={`${id}-error`}
												role="alert"
												className="shrink-0 text-xs text-destructive"
											>
												{text("请输入问题标题。", "Enter an issue title.")}
											</p>
										)}
										<Textarea
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											{...editorEvents}
											aria-label={text("描述", "Description")}
											placeholder={text("添加描述…", "Add description…")}
											className={cn(
												editorField,
												"field-sizing-fixed min-h-8 flex-1 resize-none pt-1.5 pb-3 text-[15px] leading-5 font-[450] md:text-[15px]"
											)}
										/>
									</div>
									<div className="flex shrink-0 flex-wrap gap-1.5 px-[19px] pt-1.5 pb-2">
										{fields.map((field) => {
											const selected = field === "status" ? status : priority;
											return (
												<Popover
													key={field}
													open={open && activeMenu === field}
													onOpenChange={(next) =>
														setActiveMenu((current) =>
															next ? field : current === field ? undefined : current
														)
													}
												>
													<PopoverTrigger
														type="button"
														aria-label={`${label(field)} · ${label(selected)}`}
														className="inline-flex h-6 items-center gap-1.5 rounded-full border-[0.5px] border-border bg-(--composer-chip) px-2 text-xs leading-none font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent"
													>
														<IssueGlyph value={selected} />
														{selected === "none" ? label("priority") : label(selected)}
													</PopoverTrigger>
													{floatingRoot && (
														<PopoverContent
															appearance="surface"
															portalProps={{ container: floatingRoot }}
															align="start"
															collisionPadding={12}
															aria-label={label(field)}
															className="w-[204px] gap-0 p-0"
															onOpenAutoFocus={(event) => {
																event.preventDefault();
																menuInput.current?.focus();
															}}
															onEscapeKeyDown={(event) => {
																if (isCommandComposing(event)) event.preventDefault();
															}}
														>
															<Command
																appearance="compact"
																defaultValue={label(selected)}
																label={text("搜索选项", "Search options")}
																className="h-auto bg-transparent"
															>
																<CommandInput
																	ref={menuInput}
																	placeholder={
																		field === "status"
																			? text("更改状态…", "Change status…")
																			: text("更改优先级…", "Change priority…")
																	}
																	onKeyDown={(event) => pickWithNumber(event, field)}
																	className="focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
																/>
																<CommandList className="max-h-[min(192px,max(32px,calc(var(--radix-popover-content-available-height)-36px)))] overscroll-contain p-1">
																	<CommandEmpty>
																		{text("没有匹配的选项", "No matching options")}
																	</CommandEmpty>
																	{options[field].map((option, index) => (
																		<CommandItem
																			key={option}
																			value={label(option)}
																			checked={selected === option}
																			showIndicator={false}
																			className="px-2! py-0 font-[450]!"
																			onSelect={() => selectOption(field, index)}
																		>
																			<IssueGlyph value={option} />
																			{label(option)}
																			{selected === option ? (
																				<CheckIcon
																					className="ms-auto size-3.5"
																					aria-hidden="true"
																				/>
																			) : (
																				<CommandShortcut aria-hidden="true">
																					{index + (field === "status" ? 1 : 0)}
																				</CommandShortcut>
																			)}
																		</CommandItem>
																	))}
																</CommandList>
															</Command>
														</PopoverContent>
													)}
												</Popover>
											);
										})}
									</div>
									{attachments.length > 0 && (
										<ul
											ref={attachmentsList}
											aria-label={text("附件", "Attachments")}
											className="flex max-h-16 shrink-0 flex-wrap gap-1 overflow-y-auto px-[19px] pb-2"
										>
											{attachments.map((file, index) => (
												<li
													key={index}
													className="inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border-[0.5px] border-border px-2 text-xs"
												>
													<span className="truncate">{file.name}</span>
													<Button
														type="button"
														variant="ghost"
														size="icon-xs"
														aria-label={`${text("移除附件", "Remove attachment")} ${file.name}`}
														className="size-4 min-w-0 shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent"
														onClick={() => removeAttachment(index)}
													>
														<XIcon className="size-3" aria-hidden="true" />
													</Button>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>

							<footer className="flex h-14 shrink-0 items-center justify-between gap-2 border-t-[0.5px] border-border/60 ps-3 pe-[15px]">
								<input
									type="file"
									multiple
									hidden
									ref={fileInput}
									onChange={(event) => {
										const files = Array.from(event.currentTarget.files ?? []);
										setAttachments((previous) => [...previous, ...files]);
										event.currentTarget.value = "";
									}}
								/>
								<TooltipHint
									label={attachmentLabel}
									side="top"
									portalProps={floatingRoot ? { container: floatingRoot } : false}
								>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className={iconButton}
										ref={addAttachment}
										aria-label={attachmentLabel}
										onClick={() => fileInput.current?.click()}
									>
										<PaperclipIcon className="size-4" aria-hidden="true" />
									</Button>
								</TooltipHint>
								<div className="flex min-w-0 items-center gap-3">
									<div className="flex items-center gap-1.5">
										<label
											htmlFor={`${id}-more`}
											className="cursor-pointer text-xs whitespace-nowrap text-muted-foreground"
										>
											{text("继续创建", "Create more")}
										</label>
										<Switch
											id={`${id}-more`}
											checked={createMore}
											onCheckedChange={setCreateMore}
											size="sm"
											appearance="settings"
											className="shrink-0 after:inset-x-0 after:inset-y-0"
										/>
									</div>
									<Button
										type="submit"
										size="sm"
										shape="pill"
										aria-keyshortcuts="Meta+Enter Control+Enter"
										className="h-7 shrink-0 rounded-full bg-(--composer-accent)! px-2.5 text-xs leading-none font-medium whitespace-nowrap text-white! shadow-none hover:bg-(--composer-accent)/90!"
									>
										{text("创建问题", "Create issue")}
									</Button>
								</div>
							</footer>
						</form>
					</TooltipProvider>
					<div ref={setFloatingRoot} />
				</DialogContent>
			</DialogPortal>
		</Dialog>
	);
}
