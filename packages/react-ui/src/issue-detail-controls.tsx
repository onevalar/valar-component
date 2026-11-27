"use client";

import * as React from "react";
import { SmileIcon } from "lucide-react";
import { Button } from "./button.tsx";
import { Input } from "./input.tsx";
import { isComposing } from "./issue-detail-editor-core.ts";
import { emojiMatches, emojiName } from "./issue-detail-emoji.ts";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";
import type { IssueReaction } from "./issue-detail-activity-model.ts";

export const IssuePortal = React.createContext<HTMLElement | null>(null);
export const iconControl =
	"inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring aria-expanded:bg-accent [&_svg]:size-3.5";

export function IssueReactions({
	label,
	reactions,
	viewerId,
	chinese,
	onReaction,
	render,
}: {
	label: string;
	reactions: readonly IssueReaction[];
	viewerId: string;
	chinese: boolean;
	onReaction: (emoji: string, active: boolean) => void;
	render?: (trigger: React.ReactNode, chips: React.ReactNode) => React.ReactNode;
}) {
	const portal = React.useContext(IssuePortal);
	const t = (zh: string, en: string) => (chinese ? zh : en);
	const trigger = React.useRef<HTMLButtonElement>(null);
	const input = React.useRef<HTMLInputElement>(null);
	const results = React.useRef<HTMLDivElement>(null);
	const removed = React.useRef<HTMLButtonElement | null>(null);
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const matches = emojiMatches(query);
	const isActive = (reaction: IssueReaction) => reaction.users.some((user) => user.id === viewerId);

	React.useLayoutEffect(() => {
		if (removed.current && !removed.current.isConnected) {
			// Preserve focus on a deleted chip, but do not pull it from another control
			// when a host confirms a delayed update.
			if (removed.current.ownerDocument.activeElement === removed.current.ownerDocument.body)
				trigger.current?.focus();
			removed.current = null;
		}
	}, [reactions]);
	function pick(emoji: string) {
		onReaction(emoji, !reactions.some((item) => item.emoji === emoji && isActive(item)));
		setOpen(false);
	}
	function keys(event: React.KeyboardEvent) {
		if (isComposing(event.nativeEvent) || event.altKey || event.metaKey || event.ctrlKey) return;
		const buttons = [...(results.current?.querySelectorAll("button") ?? [])];
		const index = buttons.indexOf(event.target as HTMLButtonElement);
		if (index < 0) {
			if (event.key === "Enter" && matches.length) {
				event.preventDefault();
				if (!event.repeat) pick(matches[0]);
			} else if (event.key === "ArrowDown" && buttons.length) {
				event.preventDefault();
				buttons[0].focus();
			}
			return;
		}
		const side = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
		const step = { ArrowLeft: -side, ArrowRight: side, ArrowUp: -8, ArrowDown: 8 }[event.key];
		if (!step) return;
		event.preventDefault();
		const next = index + step;
		if (event.key === "ArrowUp" && next < 0) input.current?.focus();
		else buttons[Math.min(Math.max(next, 0), buttons.length - 1)]?.focus();
	}
	const chips = reactions.length > 0 && (
		<div
			role="group"
			aria-label={t("表情回应", "Reactions")}
			className="flex min-w-0 flex-wrap items-center gap-1"
		>
			{reactions.map((reaction) => (
				<Button
					key={reaction.emoji}
					type="button"
					variant="outline"
					size="xs"
					shape="pill"
					aria-pressed={isActive(reaction)}
					aria-label={`${emojiName(reaction.emoji, chinese)} ${reaction.users.length}`}
					title={reaction.users.map(({ name }) => name).join(t("、", ", "))}
					className="h-6 min-w-9 gap-1 rounded-full border-(--activity-border,var(--border)) bg-(--detail-control) px-1.5 text-xs font-normal text-muted-foreground shadow-none hover:bg-accent aria-pressed:border-(--detail-accent)/55 aria-pressed:bg-(--detail-accent)/15 aria-pressed:text-foreground"
					onClick={(event) => {
						const active = isActive(reaction);
						removed.current = active && reaction.users.length === 1 ? event.currentTarget : null;
						onReaction(reaction.emoji, !active);
					}}
				>
					<span aria-hidden="true" className="text-sm">
						{reaction.emoji}
					</span>
					{reaction.users.length}
				</Button>
			))}
		</div>
	);
	const picker = (
		<Popover
			open={open}
			onOpenChange={(next) => {
				if (next) setQuery("");
				setOpen(next);
			}}
		>
			<PopoverTrigger
				ref={trigger}
				type="button"
				title={label}
				aria-label={label}
				className={`${iconControl} size-7`}
			>
				<SmileIcon aria-hidden="true" />
			</PopoverTrigger>
			<PopoverContent
				appearance="surface"
				portalProps={{ container: portal }}
				align="end"
				aria-label={t("选择表情", "Choose emoji")}
				className="w-[272px]! max-w-[calc(100vw-24px)] gap-0 p-0!"
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					input.current?.focus({ preventScroll: true });
				}}
				onEscapeKeyDown={(event) => {
					if (isComposing(event)) event.preventDefault();
				}}
				onKeyDown={keys}
			>
				<Input
					ref={input}
					type="search"
					aria-label={t("搜索表情", "Search emoji")}
					placeholder={t("搜索或粘贴表情…", "Search or paste emoji…")}
					value={query}
					onChange={(event) => setQuery(event.currentTarget.value)}
					className="h-9 rounded-b-none border-x-0 border-t-0 bg-transparent px-3 text-xs shadow-none"
				/>
				<div className="max-h-60 overflow-auto px-2 pt-2 pb-2.5">
					{matches.length ? (
						<>
							<p className="px-1 pb-1 text-xs text-muted-foreground">
								{query.trim() ? t("搜索结果", "Search results") : t("常用表情", "Common emoji")}
							</p>
							<div ref={results} className="grid grid-cols-8">
								{matches.map((emoji) => (
									<Button
										key={emoji}
										type="button"
										variant="ghost"
										size="icon-xs"
										aria-label={emojiName(emoji, chinese)}
										title={emojiName(emoji, chinese)}
										className="grid aspect-square size-auto place-items-center rounded text-base font-normal hover:bg-accent"
										onClick={() => pick(emoji)}
									>
										{emoji}
									</Button>
								))}
							</div>
						</>
					) : (
						<p role="status" className="px-2 py-3 text-center text-xs text-muted-foreground">
							{t("没有匹配的表情", "No matching emoji")}
						</p>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
	return render ? (
		render(picker, chips)
	) : (
		<>
			{chips}
			{picker}
		</>
	);
}
