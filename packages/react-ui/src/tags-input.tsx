"use client";

import * as React from "react";
import { cn } from "cn";

export type TagsInputMessages = {
	empty: string;
	duplicate: string;
	max: (max: number) => string;
	invalid: string;
	added: (tag: string) => string;
	removed: (tag: string) => string;
	selected: (tag: string) => string;
};

export type TagsInputProps = Omit<
	React.ComponentProps<"input">,
	"value" | "defaultValue" | "type" | "max" | "children"
> & {
	value?: readonly string[];
	defaultValue?: readonly string[];
	inputValue?: string;
	defaultInputValue?: string;
	delimiter?: string | RegExp;
	max?: number;
	allowDuplicates?: boolean;
	addOnPaste?: boolean;
	addOnTab?: boolean;
	addOnBlur?: boolean;
	validate?: (tag: string) => boolean | string;
	onValueChange?: (value: string[]) => void;
	onInputValueChange?: (value: string) => void;
	onAdd?: (tag: string) => void;
	onRemove?: (tag: string) => void;
	onInvalidTag?: (tag: string, reason: string) => void;
	removeLabel?: (tag: string) => string;
	requiredMessage?: string;
	messages?: Partial<TagsInputMessages>;
	tagsLabel?: string;
};

const defaultMessages: TagsInputMessages = {
	empty: "标签不能为空。",
	duplicate: "标签已存在。",
	max: (max) => `最多 ${max} 个标签。`,
	invalid: "标签无效。",
	added: (tag) => `已添加 ${tag}`,
	removed: (tag) => `已移除 ${tag}`,
	selected: (tag) => `已选中 ${tag}，按 Delete 删除。`,
};

export function TagsInput({
	value: controlledValue,
	defaultValue = [],
	inputValue,
	defaultInputValue = "",
	delimiter = ",",
	max = 0,
	allowDuplicates = false,
	addOnPaste = true,
	addOnTab = false,
	addOnBlur = false,
	validate,
	onValueChange,
	onInputValueChange,
	onAdd,
	onRemove,
	onInvalidTag,
	removeLabel = (tag) => `移除 ${tag}`,
	requiredMessage = "请至少添加一个标签。",
	messages: messageOverrides,
	tagsLabel = "标签",
	name,
	form,
	disabled,
	readOnly,
	required,
	dir,
	className,
	ref,
	onKeyDown,
	onInput,
	onPaste,
	onBlur,
	onCompositionStart,
	onCompositionEnd,
	"aria-invalid": invalid,
	"aria-describedby": describedBy,
	...props
}: TagsInputProps) {
	const uid = React.useId();
	const messages = { ...defaultMessages, ...messageOverrides };
	const [initial] = React.useState(() => ({
		tags: [...(controlledValue ?? defaultValue)],
		draft: inputValue ?? defaultInputValue,
	}));
	const [localValue, setLocalValue] = React.useState(initial.tags);
	const [localDraft, setLocalDraft] = React.useState(initial.draft);
	const value = controlledValue ?? localValue;
	const draft = inputValue ?? localDraft;
	const input = React.useRef<HTMLInputElement>(null);
	const root = React.useRef<HTMLDivElement>(null);
	const [selected, setSelected] = React.useState(-1);
	const [error, setError] = React.useState("");
	const [announcement, setAnnouncement] = React.useState("");
	const composition = React.useRef<object | null>(null);
	const expectedValue = React.useRef(value);
	const selectedTag = selected < 0 ? undefined : value[selected];

	React.useImperativeHandle(ref, () => input.current!, []);
	React.useLayoutEffect(() => {
		const previous = expectedValue.current;
		if (previous.length !== value.length || previous.some((tag, index) => tag !== value[index])) {
			setSelected(-1);
			setError("");
		}
		expectedValue.current = value;
	});
	React.useLayoutEffect(() => {
		input.current?.setCustomValidity(
			disabled || readOnly ? "" : error || (required && !value.length ? requiredMessage : "")
		);
	}, [disabled, error, readOnly, required, requiredMessage, value.length]);

	function update(next: string[]) {
		expectedValue.current = next;
		if (controlledValue === undefined) setLocalValue(next);
		onValueChange?.([...next]);
	}
	function updateDraft(next: string) {
		if (inputValue === undefined) setLocalDraft(next);
		if (next !== draft) onInputValueChange?.(next);
	}
	const resetState = React.useEffectEvent(() => {
		composition.current = null;
		update([...initial.tags]);
		updateDraft(initial.draft);
		setSelected(-1);
		setError("");
		setAnnouncement("");
	});
	React.useEffect(() => {
		const control = input.current;
		if (!control) return;
		let timer: ReturnType<typeof setTimeout>;
		function reset(event: Event) {
			if (event.target !== control?.form) return;
			clearTimeout(timer);
			// Reset default actions and other listeners (which can cancel them) must run first.
			timer = setTimeout(() => {
				if (!event.defaultPrevented) resetState();
			}, 0);
		}
		control.ownerDocument.addEventListener("reset", reset, true);
		return () => {
			clearTimeout(timer);
			control.ownerDocument.removeEventListener("reset", reset, true);
		};
	}, []);

	function add(text: string, tags: readonly string[]) {
		const tag = text.trim();
		const custom = tag ? validate?.(tag) : undefined;
		const reason = !tag
			? messages.empty
			: !allowDuplicates && tags.includes(tag)
				? messages.duplicate
				: max > 0 && tags.length >= max
					? messages.max(max)
					: custom === false
						? messages.invalid
						: typeof custom === "string"
							? custom
							: "";
		if (reason) {
			onInvalidTag?.(tag, reason);
			return { tags, error: reason };
		}
		const next = [...tags, tag];
		update(next);
		setSelected(-1);
		onAdd?.(tag);
		setAnnouncement(messages.added(tag));
		return { tags: next, error: "" };
	}
	function commitDraft(text: string) {
		const result = add(text, value);
		setError(result.error);
		if (!result.error) updateDraft("");
	}
	function addMany(text: string, complete: boolean) {
		const parts = delimiter ? text.split(delimiter) : [text];
		const tail = complete ? "" : parts.pop();
		const rejected: string[] = [];
		let tags = value;
		let rejection = "";
		for (const part of parts) {
			if (!part.trim()) continue;
			const result = add(part, tags);
			tags = result.tags;
			if (result.error) {
				rejected.push(part);
				rejection = result.error;
			}
		}
		setError(rejection);
		updateDraft(
			[...rejected, tail].filter(Boolean).join(typeof delimiter === "string" ? delimiter : ",")
		);
	}
	function remove(index: number) {
		if (disabled || readOnly || composition.current || index < 0 || index >= value.length) return;
		const tag = value[index];
		const next = value.filter((_, i) => i !== index);
		update(next);
		setError("");
		setSelected(Math.min(index, next.length - 1));
		onRemove?.(tag);
		setAnnouncement(messages.removed(tag));
		input.current?.focus();
	}
	function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
		onKeyDown?.(event);
		if (
			event.defaultPrevented ||
			event.nativeEvent.isComposing ||
			event.keyCode === 229 ||
			composition.current ||
			disabled ||
			readOnly
		)
			return;
		if ((event.key === "Enter" || (event.key === "Tab" && addOnTab)) && draft.trim()) {
			event.preventDefault();
			commitDraft(draft);
			return;
		}
		if (event.key === "Escape") {
			setSelected(-1);
			setError("");
			return;
		}
		const control = event.currentTarget;
		if (control.selectionStart !== 0 || control.selectionEnd !== 0) {
			setSelected(-1);
			return;
		}
		if (!value.length || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
		const rtl = getComputedStyle(control).direction === "rtl";
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
			event.preventDefault();
			setSelected(selectedTag === undefined ? value.length - 1 : Math.max(0, selected - 1));
		} else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && selectedTag !== undefined) {
			event.preventDefault();
			setSelected(selected === value.length - 1 ? -1 : selected + 1);
		} else if (event.key === "Backspace" || (event.key === "Delete" && selectedTag !== undefined)) {
			event.preventDefault();
			if (selectedTag === undefined) setSelected(value.length - 1);
			else remove(selected);
		} else if ((event.key === "Home" || event.key === "End") && selectedTag !== undefined) {
			event.preventDefault();
			setSelected(event.key === "Home" ? 0 : value.length - 1);
		}
	}

	return (
		<>
			<div
				ref={root}
				dir={dir}
				data-slot="tags-input"
				data-disabled={disabled || undefined}
				className={cn(
					"cn-tags-input flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white p-1.5 text-[13px] text-foreground transition-colors duration-150 has-aria-invalid:border-destructive has-aria-invalid:outline-destructive not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-1 not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:-outline-offset-1 not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-ring not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-solid motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]",
					className
				)}
			>
				<ul aria-label={tagsLabel} className="contents">
					{value.map((tag, index) => (
						<li
							key={index}
							data-slot="tags-input-item"
							data-selected={selected === index || undefined}
							className="inline-flex min-h-[18px] max-w-full min-w-0 items-center gap-1 rounded-[5px] border-[0.5px] border-border bg-[#F4F4F6] px-1.5 text-xs leading-4 font-medium text-foreground data-selected:border-ring data-selected:bg-primary/10 data-selected:outline-1 data-selected:-outline-offset-1 data-selected:outline-ring data-selected:outline-solid dark:bg-[#1C1D21]"
						>
							<span className="min-w-0 break-all">{tag}</span>
							<button
								type="button"
								aria-label={removeLabel(tag)}
								disabled={disabled || readOnly}
								className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:opacity-40 motion-reduce:transition-none"
								onClick={() => remove(index)}
							>
								×
							</button>
						</li>
					))}
				</ul>
				<input
					{...props}
					ref={input}
					type="text"
					data-slot="tags-input-input"
					className="h-4.5 min-w-20 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-[color:lch(66%_1_282)] disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-[color:lch(39.452%_1.425_272)]"
					form={form}
					disabled={disabled}
					readOnly={readOnly}
					required={required && !value.length}
					value={draft}
					aria-invalid={!!error || invalid}
					aria-describedby={[describedBy, `${uid}-status`, error && `${uid}-error`]
						.filter(Boolean)
						.join(" ")}
					onInput={(event) => {
						onInput?.(event);
						if (disabled || readOnly) return;
						const text = event.currentTarget.value;
						const edit = event.nativeEvent as InputEvent;
						setSelected(-1);
						setError("");
						if (
							!composition.current &&
							!edit.isComposing &&
							(addOnPaste || edit.inputType !== "insertFromPaste") &&
							delimiter &&
							text.split(delimiter).length > 1
						)
							addMany(text, false);
						else updateDraft(text);
					}}
					onKeyDown={keydown}
					onPaste={(event) => {
						onPaste?.(event);
						if (
							event.defaultPrevented ||
							!addOnPaste ||
							composition.current ||
							disabled ||
							readOnly ||
							!event.clipboardData
						)
							return;
						event.preventDefault();
						const { value: text, selectionStart, selectionEnd } = event.currentTarget;
						const start = selectionStart ?? text.length;
						addMany(
							text.slice(0, start) +
								event.clipboardData.getData("text/plain") +
								text.slice(selectionEnd ?? start),
							true
						);
					}}
					onBlur={(event) => {
						onBlur?.(event);
						if (
							!root.current?.contains(event.relatedTarget) &&
							addOnBlur &&
							!disabled &&
							!readOnly &&
							!composition.current &&
							draft.trim()
						)
							commitDraft(draft);
						setSelected(-1);
					}}
					onCompositionStart={(event) => {
						composition.current = {};
						onCompositionStart?.(event);
					}}
					onCompositionEnd={(event) => {
						if (!disabled && !readOnly) updateDraft(event.currentTarget.value);
						const token = composition.current;
						queueMicrotask(() => {
							if (composition.current === token) composition.current = null;
						});
						onCompositionEnd?.(event);
					}}
				/>
			</div>
			<span id={`${uid}-status`} className="sr-only" aria-live="polite">
				{selectedTag !== undefined ? messages.selected(selectedTag) : announcement}
			</span>
			<span
				id={`${uid}-error`}
				className="block text-xs text-destructive not-empty:mt-1"
				role="status"
			>
				{error}
			</span>
			{name &&
				value.map((tag, index) => (
					<input
						key={index}
						type="hidden"
						name={name}
						form={form}
						disabled={disabled}
						value={tag}
					/>
				))}
		</>
	);
}
