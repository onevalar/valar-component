"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "./button.tsx";
import { composingCommandInputs, isCommandComposing } from "./command-keyboard.ts";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
	type DialogContentProps,
	type DialogPortalProps,
	type DialogProps,
} from "./dialog.tsx";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group.tsx";

type DivProps = React.ComponentProps<"div">;
type ItemElement = HTMLDivElement | HTMLAnchorElement;
type Filter = (value: string, search: string, keywords: readonly string[]) => number;

export type CommandProps = Omit<DivProps, "defaultValue"> & {
	appearance?: "default" | "compact";
	label?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	shouldFilter?: boolean;
	filter?: Filter;
	loop?: boolean;
	vimBindings?: boolean;
	disablePointerSelection?: boolean;
	disableInitialScroll?: boolean;
};

type Entry = {
	id: string;
	value: string;
	textValue: string;
	keywords: readonly string[];
	element: ItemElement;
	group?: string;
	disabled: boolean;
	hidden: boolean;
	forceMount: boolean;
};

const noKeywords: readonly string[] = [];

function defaultFilter(value: string, search: string, keywords: readonly string[]) {
	const query = search.trim().toLowerCase();
	let best = 0;
	for (const source of [value, ...keywords]) {
		const text = source.trim().toLowerCase();
		if (text === query) return 1;
		if (text.startsWith(query)) best = Math.max(best, 0.8);
		else if (text.includes(query)) best = Math.max(best, 0.6);
		else if (best === 0) {
			let start = 0;
			for (const char of query) {
				start = text.indexOf(char, start);
				if (start === -1) break;
				start += char.length;
			}
			if (start !== -1) best = 0.3;
		}
	}
	return best;
}

function inDocumentOrder(a: Entry, b: Entry) {
	const position = a.element.compareDocumentPosition(b.element);
	return position & Node.DOCUMENT_POSITION_PRECEDING
		? 1
		: position & Node.DOCUMENT_POSITION_FOLLOWING
			? -1
			: 0;
}

type CommandContextValue = {
	label: string;
	labelId?: string;
	listId: string;
	setQuery: (query: string) => void;
	register: (entry: Entry) => () => void;
	visible: ReadonlySet<string>;
	groups: ReadonlySet<string>;
	ready: boolean;
	filtering: boolean;
	activeId?: string;
	highlight: (value: string, scroll: boolean) => void;
	handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	disablePointerSelection: boolean;
};

const CommandContext = React.createContext<CommandContextValue | null>(null);
const GroupContext = React.createContext<{ id: string; hidden: boolean } | null>(null);

function useCommand() {
	const context = React.useContext(CommandContext);
	if (!context) throw new Error("Command parts must be rendered inside Command.");
	return context;
}

export function Command({
	appearance = "default",
	label = "搜索命令",
	value,
	defaultValue,
	onValueChange,
	shouldFilter = true,
	filter = defaultFilter,
	loop = false,
	vimBindings = true,
	disablePointerSelection = false,
	disableInitialScroll = false,
	className,
	children,
	...props
}: CommandProps) {
	const listId = React.useId();
	const [{ query, requestedValue }, setSearch] = React.useState({
		requestedValue: defaultValue,
		query: "",
	});
	const setQuery = React.useCallback((query: string) => {
		setSearch((previous) =>
			previous.query === query ? previous : { query, requestedValue: undefined }
		);
	}, []);
	const [ready, setReady] = React.useState(false);
	const entries = React.useRef(new Map<string, Entry>());
	const [revision, update] = React.useReducer((count: number) => count + 1, 0);
	const skipScroll = React.useRef(false);
	const hadActive = React.useRef(false);
	const register = React.useCallback((entry: Entry) => {
		entries.current.set(entry.id, entry);
		update();
		return () => {
			entries.current.delete(entry.id);
			update();
		};
	}, []);
	React.useLayoutEffect(() => setReady(true), []);

	const filtering = shouldFilter && query.trim() !== "";
	const { visible, groups, candidates, best } = React.useMemo(() => {
		const visible = new Set<string>();
		const groups = new Set<string>();
		const candidates: Entry[] = [];
		let best: Entry | undefined;
		let bestScore = 0;
		for (const entry of [...entries.current.values()].sort(inDocumentOrder)) {
			if (entry.hidden) continue;
			const score =
				filtering && !entry.forceMount ? filter(entry.textValue, query, entry.keywords) : 1;
			if (!(score > 0)) continue;
			visible.add(entry.id);
			if (entry.group) groups.add(entry.group);
			if (entry.disabled) continue;
			candidates.push(entry);
			if (score > bestScore) {
				best = entry;
				bestScore = score;
			}
		}
		return { visible, groups, candidates, best };
	}, [revision, filtering, query, filter]);
	const active = candidates.find((item) => item.value === (value ?? requestedValue)) ?? best;

	React.useLayoutEffect(() => {
		if (!active) return;
		const shouldScroll = !skipScroll.current && (hadActive.current || !disableInitialScroll);
		skipScroll.current = false;
		hadActive.current = true;
		if (!shouldScroll) return;
		const item = active.element;
		const list = item.closest<HTMLElement>('[data-slot="command-list"]');
		if (!list) return;
		const bounds = list.getBoundingClientRect();
		const row = item.getBoundingClientRect();
		if (row.top < bounds.top) list.scrollTop += row.top - bounds.top;
		else if (row.bottom > bounds.bottom) list.scrollTop += row.bottom - bounds.bottom;
	}, [active?.id, disableInitialScroll]);

	function highlight(next: string, scroll: boolean) {
		if (next === active?.value) return;
		if (value === undefined) {
			skipScroll.current = !scroll;
			setSearch((previous) => ({ ...previous, requestedValue: next }));
		}
		onValueChange?.(next);
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.defaultPrevented || isCommandComposing(event.nativeEvent) || event.shiftKey) return;
		const vim = vimBindings && event.ctrlKey && !event.metaKey && !event.altKey;
		const down = event.key === "ArrowDown" || (vim && ["j", "n"].includes(event.key));
		const up = event.key === "ArrowUp" || (vim && ["k", "p"].includes(event.key));
		if (event.key === "Enter" && !event.ctrlKey && !event.metaKey && !event.altKey) {
			event.preventDefault();
			if (!event.repeat) active?.element.click();
			return;
		}
		if (event.ctrlKey && !vim) return;
		const ordered = [...candidates].sort(inDocumentOrder);
		let next: Entry | undefined;
		if (down || up) {
			const step = down ? 1 : -1;
			const index = ordered.findIndex((item) => item.id === active?.id);
			if (event.metaKey) next = down ? ordered.at(-1) : ordered[0];
			else if (event.altKey && active?.group) {
				const adjacent = (down ? ordered.slice(index + 1) : ordered.slice(0, index).reverse()).find(
					(item) => item.group && item.group !== active.group
				);
				if (adjacent) next = ordered.find((item) => item.group === adjacent.group);
			}
			next ??= ordered[index + step] ?? (loop ? ordered.at(down ? 0 : -1) : undefined);
		} else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
			if (event.key === "Home") next = ordered[0];
			else if (event.key === "End") next = ordered.at(-1);
			else return;
		} else return;
		event.preventDefault();
		if (next) highlight(next.value, true);
	}

	return (
		<CommandContext.Provider
			value={{
				label,
				labelId: props["aria-labelledby"],
				listId,
				setQuery,
				register,
				visible,
				groups,
				ready,
				filtering,
				activeId: active?.id,
				highlight,
				handleKeyDown,
				disablePointerSelection,
			}}
		>
			<div
				{...props}
				data-slot="command"
				data-command-compact={appearance === "compact" ? "" : undefined}
				className={cn(
					"cn-command flex size-full flex-col overflow-hidden",
					appearance === "compact" && "cn-command-compact",
					className
				)}
			>
				{children}
			</div>
		</CommandContext.Provider>
	);
}

export type CommandInputProps = Omit<
	React.ComponentProps<"input">,
	"type" | "value" | "defaultValue"
> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
};

export function CommandInput({
	className,
	value,
	defaultValue = "",
	onChange,
	onValueChange,
	onKeyDown,
	onCompositionStart,
	onCompositionEnd,
	onBlur,
	...props
}: CommandInputProps) {
	const { activeId, handleKeyDown, label, labelId, listId, setQuery } = useCommand();
	const [localValue, setLocalValue] = React.useState(defaultValue);
	const query = value ?? localValue;
	React.useLayoutEffect(() => setQuery(query), [query, setQuery]);

	return (
		<div
			data-slot="command-input-wrapper"
			className="cn-command-input-wrapper in-data-[command-close]:pe-10!"
		>
			<InputGroup className="cn-command-input-group">
				<InputGroupInput
					autoComplete="off"
					spellCheck={false}
					aria-label={label}
					aria-labelledby={props["aria-label"] === undefined ? labelId : undefined}
					{...props}
					data-slot="command-input"
					className={cn(
						"cn-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
						className
					)}
					type="text"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded="true"
					aria-controls={listId}
					aria-activedescendant={activeId}
					value={query}
					onChange={(event) => {
						onChange?.(event);
						if (event.defaultPrevented) return;
						const next = event.currentTarget.value;
						if (value === undefined) setLocalValue(next);
						onValueChange?.(next);
					}}
					onKeyDown={(event) => {
						onKeyDown?.(event);
						handleKeyDown(event);
					}}
					onCompositionStart={(event) => {
						composingCommandInputs.add(event.currentTarget);
						onCompositionStart?.(event);
					}}
					onCompositionEnd={(event) => {
						composingCommandInputs.delete(event.currentTarget);
						onCompositionEnd?.(event);
					}}
					onBlur={(event) => {
						composingCommandInputs.delete(event.currentTarget);
						onBlur?.(event);
					}}
				/>
				<InputGroupAddon>
					<SearchIcon aria-hidden="true" className="cn-command-input-icon" />
				</InputGroupAddon>
			</InputGroup>
		</div>
	);
}

export function CommandList({ className, children, ...props }: DivProps) {
	const { label, listId, visible, ready } = useCommand();
	return (
		<div
			aria-label={label}
			tabIndex={-1}
			{...props}
			id={listId}
			role="listbox"
			data-slot="command-list"
			data-empty={ready && !visible.size ? "" : undefined}
			className={cn("cn-command-list overflow-x-hidden overflow-y-auto", className)}
		>
			<div data-slot="command-viewport">{children}</div>
		</div>
	);
}

export type CommandGroupProps = DivProps & {
	heading?: React.ReactNode;
	value?: string;
	forceMount?: boolean;
};

export function CommandGroup({
	heading,
	value,
	forceMount,
	hidden,
	className,
	children,
	...props
}: CommandGroupProps) {
	const headingId = React.useId();
	const { groups, filtering, ready } = useCommand();
	return (
		<GroupContext.Provider value={{ id: headingId, hidden: Boolean(hidden) }}>
			<div
				aria-labelledby={heading != null ? headingId : undefined}
				{...props}
				role="group"
				data-slot="command-group"
				data-value={value ?? (typeof heading === "string" ? heading : undefined)}
				hidden={hidden || (ready && filtering && !forceMount && !groups.has(headingId))}
				className={cn("cn-command-group", className)}
			>
				{heading != null && (
					<div
						id={headingId}
						data-slot="command-group-heading"
						className="px-2 py-1.5 text-xs font-medium text-muted-foreground in-data-[command-dialog]:px-3 in-data-[command-dialog]:py-2 in-data-[command-dialog]:text-[color:var(--valar-command-heading)]"
					>
						{heading}
					</div>
				)}
				<div data-slot="command-group-items">{children}</div>
			</div>
		</GroupContext.Provider>
	);
}

type ItemOptions = {
	value?: string;
	textValue?: string;
	keywords?: readonly string[];
	disabled?: boolean;
	forceMount?: boolean;
	onSelect?: (value: string) => void;
};

type ItemProps<T extends "div" | "a"> = Omit<React.ComponentProps<T>, "onSelect"> & ItemOptions;
export type CommandItemProps = ItemProps<"div"> & { checked?: boolean; showIndicator?: boolean };
export type CommandLinkItemProps = ItemProps<"a"> & { href: string };

function useItem<T extends ItemElement>(
	{
		id,
		value,
		textValue,
		keywords = noKeywords,
		disabled = false,
		hidden,
		forceMount = false,
		ref,
		onSelect,
		onClick,
		onPointerMove,
		onMouseDown,
	}: ItemOptions & {
		id?: string;
		hidden?: boolean;
		ref?: React.Ref<T>;
		onClick?: React.MouseEventHandler<T>;
		onPointerMove?: React.PointerEventHandler<T>;
		onMouseDown?: React.MouseEventHandler<T>;
	},
	inferredText: React.ReactNode
) {
	const generatedId = React.useId();
	const itemId = id ?? generatedId;
	const group = React.useContext(GroupContext);
	const { register, visible, ready, activeId, highlight, disablePointerSelection } = useCommand();
	const element = React.useRef<T>(null);
	React.useImperativeHandle(ref, () => element.current!, []);
	const excluded = Boolean(hidden || group?.hidden);
	const [inferred, setInferred] = React.useState("");
	React.useLayoutEffect(() => {
		if (value === undefined) setInferred(element.current?.textContent?.trim() ?? "");
	}, [value, inferredText]);
	const itemValue = value ?? inferred;
	const groupId = group?.id;
	React.useLayoutEffect(() => {
		if (element.current)
			return register({
				id: itemId,
				value: itemValue,
				textValue: textValue ?? itemValue,
				keywords,
				element: element.current,
				group: groupId,
				disabled,
				hidden: excluded,
				forceMount,
			});
	}, [register, itemId, itemValue, textValue, keywords, groupId, disabled, excluded, forceMount]);
	const active = activeId === itemId;
	return {
		active,
		bindings: {
			ref: element,
			id: itemId,
			hidden: hidden || (ready && !visible.has(itemId)),
			role: "option",
			tabIndex: -1,
			"aria-disabled": disabled,
			"data-slot": "command-item",
			"data-value": itemValue,
			"data-disabled": disabled ? "" : undefined,
			"data-selected": active ? "" : undefined,
			onMouseDown(event: React.MouseEvent<T>) {
				onMouseDown?.(event);
				// Clicking a row should not take DOM focus from the search field.
				if (event.button === 0) event.preventDefault();
			},
			onPointerMove(event: React.PointerEvent<T>) {
				onPointerMove?.(event);
				if (
					!event.defaultPrevented &&
					!disabled &&
					!disablePointerSelection &&
					event.pointerType !== "touch"
				) {
					highlight(itemValue, false);
				}
			},
			onClick(event: React.MouseEvent<T>) {
				if (disabled) {
					event.preventDefault();
					return;
				}
				onClick?.(event);
				if (!event.defaultPrevented) {
					highlight(itemValue, false);
					onSelect?.(itemValue);
				}
			},
		},
	};
}

const itemClass =
	"cn-command-item group/command-item min-h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-disabled:pointer-events-none data-disabled:opacity-50";

export function CommandItem({
	id,
	value,
	textValue,
	keywords,
	disabled,
	hidden,
	forceMount,
	ref,
	onSelect,
	onClick,
	onPointerMove,
	onMouseDown,
	checked,
	showIndicator = true,
	className,
	children,
	...props
}: CommandItemProps) {
	const { active, bindings } = useItem(
		{
			id,
			value,
			textValue,
			keywords,
			disabled,
			hidden,
			forceMount,
			ref,
			onSelect,
			onClick,
			onPointerMove,
			onMouseDown,
		},
		children
	);
	return (
		<div
			{...props}
			{...bindings}
			aria-selected={checked ?? props["aria-selected"] ?? active}
			data-checked={checked}
			className={cn(itemClass, className)}
		>
			{children}
			{showIndicator && (
				<CheckIcon
					aria-hidden="true"
					className="cn-command-item-indicator ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100"
				/>
			)}
		</div>
	);
}

export function CommandLinkItem({
	id,
	value,
	textValue,
	keywords,
	disabled,
	hidden,
	forceMount,
	ref,
	onSelect,
	onClick,
	onPointerMove,
	onMouseDown,
	href,
	className,
	children,
	...props
}: CommandLinkItemProps) {
	const { active, bindings } = useItem(
		{
			id,
			value,
			textValue,
			keywords,
			disabled,
			hidden,
			forceMount,
			ref,
			onSelect,
			onClick,
			onPointerMove,
			onMouseDown,
		},
		children
	);
	return (
		<a
			{...props}
			{...bindings}
			href={disabled ? undefined : href}
			aria-selected={active}
			className={cn(itemClass, className)}
		>
			{children}
		</a>
	);
}

export function CommandEmpty({
	className,
	forceMount,
	...props
}: DivProps & { forceMount?: boolean }) {
	const { ready, visible } = useCommand();
	if (!forceMount && (!ready || visible.size > 0)) return null;
	return (
		<div
			role="status"
			{...props}
			data-slot="command-empty"
			className={cn("cn-command-empty", className)}
		/>
	);
}

export function CommandLoading({
	label = "Loading...",
	progress,
	className,
	...props
}: DivProps & { label?: string; progress?: number }) {
	return (
		<div
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={progress}
			aria-label={label}
			{...props}
			data-slot="command-loading"
			className={cn("cn-command-loading", className)}
		/>
	);
}

export function CommandSeparator({
	className,
	forceMount,
	...props
}: DivProps & { forceMount?: boolean }) {
	const { filtering } = useCommand();
	if (filtering && !forceMount) return null;
	return (
		<div
			role="separator"
			{...props}
			data-slot="command-separator"
			className={cn("cn-command-separator", className)}
		/>
	);
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			{...props}
			data-slot="command-shortcut"
			className={cn("cn-command-shortcut", className)}
		/>
	);
}

export type CommandDialogProps = CommandProps &
	Omit<DialogProps, "children"> & {
		description?: string;
		trigger?: React.ReactElement;
		showCloseButton?: boolean;
		closeLabel?: string;
		portalProps?: Omit<DialogPortalProps, "children" | "forceMount">;
		contentProps?: Omit<DialogContentProps, "asChild" | "children" | "forceMount">;
	};

export function CommandDialog({
	open,
	defaultOpen,
	onOpenChange,
	modal,
	title = "命令面板",
	description = "搜索要执行的命令",
	label = title,
	trigger,
	showCloseButton = false,
	closeLabel = "关闭",
	portalProps,
	className,
	contentProps,
	children,
	...props
}: CommandDialogProps) {
	const previousFocus = React.useRef<HTMLElement | null>(null);
	return (
		<Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
			{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
			<DialogOverlay className="bg-transparent! backdrop-blur-none!" />
			<DialogContent
				{...contentProps}
				portalProps={portalProps}
				showOverlay={false}
				showCloseButton={false}
				data-slot="dialog-content"
				data-command-dialog=""
				data-command-close={showCloseButton ? "" : undefined}
				className={cn(
					"cn-dialog-content cn-command-dialog top-auto left-1/2 z-50 flex! w-full -translate-x-1/2 translate-y-0 flex-col overflow-hidden! p-0! outline-none",
					className,
					contentProps?.className
				)}
				onOpenAutoFocus={(event) => {
					if (event.target instanceof HTMLElement) {
						const focused = event.target.ownerDocument.activeElement;
						previousFocus.current = focused instanceof HTMLElement ? focused : null;
					}
					contentProps?.onOpenAutoFocus?.(event);
				}}
				onCloseAutoFocus={(event) => {
					contentProps?.onCloseAutoFocus?.(event);
					if (
						!event.defaultPrevented &&
						!trigger &&
						modal !== false &&
						previousFocus.current?.isConnected
					) {
						event.preventDefault();
						previousFocus.current.focus({ preventScroll: true });
					}
					previousFocus.current = null;
				}}
				onEscapeKeyDown={(event) => {
					if (isCommandComposing(event)) event.preventDefault();
					else contentProps?.onEscapeKeyDown?.(event);
				}}
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">{description}</DialogDescription>
				<Command {...props} label={label}>
					{children}
				</Command>
				{showCloseButton && (
					<DialogClose asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className="cn-dialog-close"
							aria-label={closeLabel}
						>
							<XIcon aria-hidden="true" />
						</Button>
					</DialogClose>
				)}
			</DialogContent>
		</Dialog>
	);
}
