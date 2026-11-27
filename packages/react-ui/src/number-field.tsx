"use client";

import * as React from "react";
import { NumberParser } from "@internationalized/number";
import { cn } from "cn";

export type NumberFieldProps = Omit<
	React.ComponentProps<"input">,
	"value" | "defaultValue" | "type" | "min" | "max" | "step" | "children"
> & {
	value?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	step?: number;
	locale?: string;
	formatOptions?: Intl.NumberFormatOptions;
	onValueChange?: (value: number | undefined) => void;
	decrementLabel?: string;
	incrementLabel?: string;
	invalidMessage?: string;
};

const buttonClass =
	"inline-flex size-full w-auto aspect-square shrink-0 items-center justify-center border-input text-[14px] text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-accent hover:text-foreground focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-40";

export function NumberField(props: NumberFieldProps) {
	const {
		ref,
		value: controlledValue,
		defaultValue,
		min,
		max,
		step = 1,
		locale = "zh-CN",
		formatOptions,
		onValueChange,
		decrementLabel = "减小",
		incrementLabel = "增大",
		invalidMessage = "请输入有效的数字。",
		className,
		name,
		form,
		disabled = false,
		readOnly = false,
		onChange,
		onBlur,
		onKeyDown,
		onCompositionStart,
		onCompositionEnd,
		...inputProps
	} = props;
	// Explicit undefined is a controlled empty value; omission opts into local state.
	const controlled = Object.hasOwn(props, "value");
	const [local, setLocal] = React.useState(defaultValue);
	const value = controlled ? controlledValue : local;
	const initialValue = React.useRef(value);
	const input = React.useRef<HTMLInputElement>(null);
	const composing = React.useRef(false);
	React.useImperativeHandle(ref, () => input.current!, []);
	// Equivalent inline options must not reformat a draft when the parent echoes an edit.
	const optionsKey = JSON.stringify(formatOptions ?? {});
	const { formatter, parser } = React.useMemo(() => {
		const options: Intl.NumberFormatOptions = JSON.parse(optionsKey);
		return {
			formatter: new Intl.NumberFormat(locale, {
				...(!options.style || options.style === "decimal" ? { maximumFractionDigits: 12 } : {}),
				...options,
			}),
			parser: new NumberParser(locale, options),
		};
	}, [locale, optionsKey]);
	const format = (next: number | undefined) => (next === undefined ? "" : formatter.format(next));
	const [draft, setDraft] = React.useState(() => ({
		text: format(value),
		value,
		candidate: value,
		formatter,
	}));
	let text = draft.text;
	if (!Object.is(draft.value, value) || draft.formatter !== formatter) {
		if (!Object.is(draft.candidate, value) || draft.formatter !== formatter) text = format(value);
		setDraft({ text, value, candidate: value, formatter });
	}
	function parse(raw: string) {
		if (!raw.trim()) return undefined;
		const parsed = parser.parse(raw);
		return Number.isFinite(parsed) ? parsed : undefined;
	}
	function isInvalid(raw: string) {
		if (!raw.trim()) return false;
		const parsed = parse(raw);
		return (
			parsed === undefined ||
			(min !== undefined && parsed < min) ||
			(max !== undefined && parsed > max)
		);
	}
	const invalid = isInvalid(text);
	React.useLayoutEffect(() => {
		input.current?.setCustomValidity(!disabled && !readOnly && invalid ? invalidMessage : "");
	}, [disabled, readOnly, invalid, invalidMessage]);

	function write(raw: string, next: number | undefined) {
		setDraft({ text: raw, value, candidate: next, formatter });
		// Native implicit submission after Enter must see validity for the committed text.
		input.current?.setCustomValidity(
			!disabled && !readOnly && isInvalid(raw) ? invalidMessage : ""
		);
		if (Object.is(next, value)) return;
		if (!controlled) setLocal(next);
		onValueChange?.(next);
	}
	function edit(raw: string) {
		if (disabled || readOnly) return;
		if (composing.current) setDraft({ text: raw, value, candidate: value, formatter });
		else write(raw, parse(raw));
	}
	const increment = Number.isFinite(step) && step > 0 ? step : 1;
	const base = min ?? 0;
	function normalize(number: number) {
		const snapped = base + Math.round((number - base) / increment) * increment;
		return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Number(snapped.toPrecision(15))));
	}
	function apply(number: number) {
		const formatted = format(normalize(number));
		write(formatted, parse(formatted));
	}
	function commit(raw: string) {
		if (composing.current || disabled || readOnly) return;
		const parsed = parse(raw);
		if (parsed !== undefined) apply(parsed);
		else if (!raw.trim()) write(raw, undefined);
	}
	function spin(direction: number) {
		if (composing.current || disabled || readOnly) return;
		const current = parse(text);
		const position = ((current ?? base) - base) / increment;
		const grid =
			direction > 0
				? Math.floor(position + 1e-10) + direction
				: Math.ceil(position - 1e-10) + direction;
		apply(current === undefined ? (min ?? Math.min(0, max ?? 0)) : base + grid * increment);
		input.current?.focus();
	}
	function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
		onKeyDown?.(event);
		if (
			event.defaultPrevented ||
			event.nativeEvent.isComposing ||
			event.keyCode === 229 ||
			composing.current ||
			disabled ||
			readOnly
		)
			return;
		if (event.key === "ArrowUp" || event.key === "ArrowDown") {
			event.preventDefault();
			spin(event.key === "ArrowUp" ? 1 : -1);
		} else if (event.key === "PageUp" || event.key === "PageDown") {
			event.preventDefault();
			spin(event.key === "PageUp" ? 10 : -10);
		} else if (event.key === "Home" && min !== undefined) {
			event.preventDefault();
			write(format(min), min);
		} else if (event.key === "End" && max !== undefined) {
			event.preventDefault();
			write(format(max), max);
		} else if (event.key === "Enter") commit(event.currentTarget.value);
	}
	const reset = React.useEffectEvent((control: HTMLInputElement) => {
		composing.current = false;
		const next = initialValue.current;
		const formatted = format(next);
		control.value = formatted;
		write(formatted, next);
	});
	React.useEffect(() => {
		const control = input.current;
		if (!control) return;
		const owner = control.ownerDocument;
		let timer: ReturnType<typeof setTimeout>;
		function handleReset(event: Event) {
			if (control!.form !== event.target) return;
			clearTimeout(timer);
			// Wait for the browser to finish restoring the native inputs.
			timer = setTimeout(() => {
				if (!event.defaultPrevented) reset(control!);
			}, 0);
		}
		owner.addEventListener("reset", handleReset, true);
		return () => {
			clearTimeout(timer);
			owner.removeEventListener("reset", handleReset, true);
		};
	}, []);

	return (
		<>
			<div
				data-slot="number-field"
				data-disabled={disabled || undefined}
				className={cn(
					"flex h-8 min-h-8 w-full items-center rounded-md border-[0.5px] border-input bg-white text-foreground transition-colors duration-150 has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive/20 has-aria-invalid:ring-inset has-[>[data-slot=number-field-input]:focus-visible]:border-ring has-[>[data-slot=number-field-input]:focus-visible]:outline-1 has-[>[data-slot=number-field-input]:focus-visible]:-outline-offset-1 has-[>[data-slot=number-field-input]:focus-visible]:outline-ring has-[>[data-slot=number-field-input]:focus-visible]:outline-solid motion-reduce:transition-none dark:bg-[#141518] dark:has-aria-invalid:ring-destructive/40",
					className
				)}
			>
				<button
					type="button"
					data-slot="number-field-decrement"
					aria-label={decrementLabel}
					disabled={
						disabled || readOnly || (value !== undefined && min !== undefined && value <= min)
					}
					className={`${buttonClass} rounded-s-md border-e-[0.5px]`}
					onPointerDown={(event) => event.preventDefault()}
					onClick={() => spin(-1)}
				>
					−
				</button>
				<input
					{...inputProps}
					ref={input}
					type="text"
					role="spinbutton"
					inputMode="decimal"
					data-slot="number-field-input"
					className="h-full w-full min-w-0 bg-transparent px-2 text-center text-[13px] tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-50"
					form={form}
					disabled={disabled}
					readOnly={readOnly}
					value={text}
					aria-valuemin={min}
					aria-valuemax={max}
					aria-valuenow={value}
					aria-valuetext={text}
					aria-invalid={invalid || inputProps["aria-invalid"] || undefined}
					onChange={(event) => {
						edit(event.currentTarget.value);
						onChange?.(event);
					}}
					onBlur={(event) => {
						commit(event.currentTarget.value);
						onBlur?.(event);
					}}
					onKeyDown={keydown}
					onCompositionStart={(event) => {
						composing.current = true;
						onCompositionStart?.(event);
					}}
					onCompositionEnd={(event) => {
						composing.current = false;
						edit(event.currentTarget.value);
						onCompositionEnd?.(event);
					}}
				/>
				<button
					type="button"
					data-slot="number-field-increment"
					aria-label={incrementLabel}
					disabled={
						disabled || readOnly || (value !== undefined && max !== undefined && value >= max)
					}
					className={`${buttonClass} rounded-e-md border-s-[0.5px]`}
					onPointerDown={(event) => event.preventDefault()}
					onClick={() => spin(1)}
				>
					+
				</button>
			</div>
			{name && (
				<input type="hidden" name={name} form={form} disabled={disabled} value={value ?? ""} />
			)}
		</>
	);
}
