<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";
	export type TagsInputProps = WithElementRef<
		Omit<HTMLInputAttributes, "value" | "defaultValue" | "type" | "max" | "children">,
		HTMLInputElement
	> & {
		value?: string[];
		defaultValue?: string[];
		inputValue?: string;
		delimiter?: string | RegExp;
		max?: number;
		allowDuplicates?: boolean;
		addOnPaste?: boolean;
		addOnTab?: boolean;
		addOnBlur?: boolean;
		validate?: (tag: string) => boolean | string;
		onValueChange?: (value: string[]) => void;
		onAdd?: (tag: string) => void;
		onRemove?: (tag: string) => void;
		onInvalid?: (tag: string, reason: string) => void;
		removeLabel?: (tag: string) => string;
		requiredMessage?: string;
		/** Error and screen reader texts; each one replaces the Chinese default. */
		messages?: Partial<TagsInputMessages>;
	};
	export type TagsInputMessages = {
		empty: string;
		duplicate: string;
		max: (max: number) => string;
		invalid: string;
		added: (tag: string) => string;
		removed: (tag: string) => string;
		selected: (tag: string) => string;
	};
	const DEFAULT_MESSAGES: TagsInputMessages = {
		empty: "标签不能为空。",
		duplicate: "标签已存在。",
		max: (max) => `最多 ${max} 个标签。`,
		invalid: "标签无效。",
		added: (tag) => `已添加 ${tag}`,
		removed: (tag) => `已移除 ${tag}`,
		selected: (tag) => `已选中 ${tag}，按 Delete 删除。`,
	};
</script>

<script lang="ts">
	import { onMount, tick, untrack } from "svelte";
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		defaultValue = [],
		value = $bindable<string[]>(defaultValue),
		inputValue = $bindable(""),
		delimiter = ",",
		max = 0,
		allowDuplicates = false,
		addOnPaste = true,
		addOnTab = false,
		addOnBlur = false,
		validate,
		onValueChange,
		onAdd,
		onRemove,
		onInvalid,
		removeLabel = (tag) => `移除 ${tag}`,
		requiredMessage = "请至少添加一个标签。",
		messages: messageOverrides,
		name,
		form,
		disabled = false,
		readonly = false,
		required = false,
		class: className,
		dir,
		oninput,
		onkeydown,
		onpaste,
		onblur,
		oncompositionstart,
		oncompositionend,
		...restProps
	}: TagsInputProps = $props();
	const uid = $props.id();
	const messages = $derived({ ...DEFAULT_MESSAGES, ...messageOverrides });
	const initialValue = untrack(() => [...value]);
	const initialInput = untrack(() => inputValue);
	let root: HTMLDivElement;
	let selected = $state(-1);
	let error = $state("");
	let announcement = $state("");
	let composing = false;
	let composition = 0;
	let lastValue = untrack(() => value);
	$effect(() => {
		const current = value;
		untrack(() => {
			if (current !== lastValue) {
				selected = -1;
				error = "";
			}
			lastValue = current;
		});
	});
	$effect(() => {
		if (ref)
			ref.setCustomValidity(
				!disabled && !readonly
					? error || (required && value.length === 0 ? requiredMessage : "")
					: ""
			);
	});
	function update(next: string[]) {
		value = next;
		lastValue = value;
		onValueChange?.([...next]);
	}
	function add(text: string) {
		if (disabled || readonly || composing) return false;
		const tag = text.trim();
		const custom = tag ? validate?.(tag) : undefined;
		const reason = !tag
			? messages.empty
			: !allowDuplicates && value.includes(tag)
				? messages.duplicate
				: max > 0 && value.length >= max
					? messages.max(max)
					: custom === false
						? messages.invalid
						: typeof custom === "string"
							? custom
							: "";
		if (reason) {
			error = reason;
			onInvalid?.(tag, reason);
			return false;
		}
		update([...value, tag]);
		error = "";
		selected = -1;
		onAdd?.(tag);
		announcement = messages.added(tag);
		return true;
	}
	async function remove(index: number) {
		if (disabled || readonly || composing) return;
		const tag = value[index];
		update(value.filter((_, i) => i !== index));
		error = "";
		selected = Math.min(index, value.length - 1);
		onRemove?.(tag);
		announcement = messages.removed(tag);
		await tick();
		ref?.focus();
	}
	function addMany(text: string, complete: boolean) {
		const parts = delimiter ? text.split(delimiter) : [text];
		const tail = complete ? "" : (parts.pop() ?? "");
		const rejected: string[] = [];
		let rejection = "";
		for (const part of parts) {
			if (part.trim() && !add(part)) {
				rejected.push(part);
				rejection = error;
			}
		}
		if (rejection) error = rejection;
		inputValue = [...rejected, tail]
			.filter(Boolean)
			.join(typeof delimiter === "string" ? delimiter : ",");
	}
	function keydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			event.isComposing ||
			event.keyCode === 229 ||
			composing ||
			disabled ||
			readonly
		)
			return;
		if ((event.key === "Enter" || (event.key === "Tab" && addOnTab)) && inputValue.trim()) {
			event.preventDefault();
			if (add(inputValue)) inputValue = "";
			return;
		}
		const input = event.currentTarget;
		if (input.selectionStart !== 0 || input.selectionEnd !== 0) {
			selected = -1;
			return;
		}
		const rtl = getComputedStyle(input).direction === "rtl";
		if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
			event.preventDefault();
			selected = selected < 0 ? value.length - 1 : Math.max(0, selected - 1);
		} else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && selected >= 0) {
			event.preventDefault();
			selected = selected === value.length - 1 ? -1 : selected + 1;
		} else if ((event.key === "Backspace" || event.key === "Delete") && value.length) {
			if (selected >= 0) {
				event.preventDefault();
				void remove(selected);
			} else if (event.key === "Backspace") {
				event.preventDefault();
				selected = value.length - 1;
			}
		} else if (event.key === "Home" && selected >= 0) {
			event.preventDefault();
			selected = 0;
		} else if (event.key === "End" && selected >= 0) {
			event.preventDefault();
			selected = value.length - 1;
		} else if (event.key === "Escape") {
			selected = -1;
			error = "";
		}
	}
	onMount(() => {
		const owner = ref?.form;
		let resetTimer: ReturnType<typeof setTimeout>;
		function reset(event: Event) {
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => {
				if (event.defaultPrevented) return;
				update([...initialValue]);
				inputValue = initialInput;
				if (ref) ref.value = initialInput;
				selected = -1;
				error = "";
			}, 0);
		}
		owner?.addEventListener("reset", reset);
		return () => {
			composition++;
			clearTimeout(resetTimer);
			owner?.removeEventListener("reset", reset);
		};
	});
</script>

<div
	bind:this={root}
	{dir}
	data-slot="tags-input"
	data-disabled={disabled || undefined}
	data-readonly={readonly || undefined}
	class={cn(
		"flex min-h-8 w-full min-w-0 flex-wrap items-center gap-1 rounded-md border bg-(--tags-input-surface) p-1 text-foreground",
		"border-(--tags-input-border) [--tags-input-border:lch(86.5%_0_282)] [--tags-input-surface:white] [--tags-input-focus:lch(53%_52.26_286.91)] dark:[--tags-input-border:lch(30.833%_1.93_272)] dark:[--tags-input-surface:lch(9.232%_.85_272)] dark:[--tags-input-focus:lch(47.918%_59.303_288.421)]",
		"has-[input:focus:not([aria-invalid=true])]:border-(--tags-input-focus) has-[input[aria-invalid=true]]:border-destructive data-readonly:bg-muted/40 data-disabled:bg-input/50 data-disabled:opacity-50 dark:data-disabled:bg-input/80 motion-safe:transition-colors motion-safe:duration-150",
		"cn-tags-input",
		className
	)}
>
	<ul id={`${uid}-tags`} aria-label="标签" class="contents">
		{#each value as tag, index (index)}
			<li
				data-slot="tags-input-item"
				data-selected={selected === index || undefined}
				class="inline-flex min-h-6 max-w-full min-w-0 items-center gap-1 rounded-full bg-secondary ps-2 pe-0.5 text-xs/4 font-medium text-secondary-foreground data-selected:ring-1 data-selected:ring-inset data-selected:ring-(--tags-input-focus)"
			>
				<span class={cn("min-w-0 wrap-anywhere", (disabled || readonly) && "pe-1.5")}>{tag}</span>
				{#if !disabled && !readonly}
					<button
						type="button"
						aria-label={removeLabel(tag)}
						class="size-5 shrink-0 rounded-full text-base/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground active:bg-foreground/15 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-(--tags-input-focus) motion-safe:transition-colors motion-safe:duration-150"
						onclick={() => remove(index)}>×</button
					>
				{/if}
			</li>
		{/each}
	</ul>
	<input
		{...restProps}
		bind:this={ref}
		type="text"
		data-slot="tags-input-input"
		class="h-6 min-w-[min(100%,5rem)] flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-[13px]"
		{dir}
		{form}
		{disabled}
		{readonly}
		required={required && value.length === 0}
		value={inputValue}
		aria-invalid={!!error || restProps["aria-invalid"] || undefined}
		aria-describedby={[restProps["aria-describedby"], `${uid}-status`, error ? `${uid}-error` : ""]
			.filter(Boolean)
			.join(" ")}
		oninput={(event) => {
			inputValue = event.currentTarget.value;
			error = "";
			selected = -1;
			if (
				!composing &&
				!(event instanceof InputEvent && event.inputType === "insertFromPaste" && !addOnPaste) &&
				delimiter &&
				inputValue.split(delimiter).length > 1
			)
				addMany(inputValue, false);
			oninput?.(event);
		}}
		onkeydown={keydown}
		onpaste={(event) => {
			onpaste?.(event);
			if (event.defaultPrevented || !addOnPaste || composing || disabled || readonly) return;
			const clipboard = event.clipboardData?.getData("text");
			if (clipboard === undefined) return;
			event.preventDefault();
			const start = event.currentTarget.selectionStart ?? inputValue.length;
			const end = event.currentTarget.selectionEnd ?? start;
			addMany(inputValue.slice(0, start) + clipboard + inputValue.slice(end), true);
		}}
		onblur={(event) => {
			if (
				!root.contains(event.relatedTarget as Node) &&
				addOnBlur &&
				inputValue.trim() &&
				add(inputValue)
			)
				inputValue = "";
			selected = -1;
			onblur?.(event);
		}}
		oncompositionstart={(event) => {
			composition++;
			composing = true;
			oncompositionstart?.(event);
		}}
		oncompositionend={(event) => {
			inputValue = event.currentTarget.value;
			const token = composition;
			queueMicrotask(() => {
				if (token === composition) composing = false;
			});
			oncompositionend?.(event);
		}}
	/>
</div>
<span id={`${uid}-status`} class="sr-only" aria-live="polite"
	>{selected >= 0 ? messages.selected(value[selected]) : announcement}</span
>
<span id={`${uid}-error`} class="mt-1 block text-xs text-destructive" role="status">{error}</span>
{#if name}
	{#each value as tag, index (index)}<input
			type="hidden"
			{name}
			{form}
			{disabled}
			value={tag}
		/>{/each}
{/if}
