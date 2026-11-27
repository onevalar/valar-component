"use client";

import * as React from "react";
import { cn } from "cn";
import { MinusIcon } from "lucide-react";

export const REGEXP_ONLY_DIGITS = "^\\d+$";
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$";
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$";

export type InputOTPProps = Omit<
	React.ComponentProps<"input">,
	"value" | "defaultValue" | "type" | "children" | "pattern"
> & {
	value?: string;
	defaultValue?: string;
	inputId?: string;
	pattern?: string | RegExp;
	onValueChange?: (value: string) => void;
	onComplete?: (value: string) => void;
	pasteTransformer?: (text: string) => string;
	children?: React.ReactNode;
};

type Selection = [start: number, end: number];
type OTPContext = {
	value: string;
	selection: Selection | null;
	maxLength: number;
	invalid: boolean;
};
const OTPContext = React.createContext<OTPContext | null>(null);

function compilePattern(pattern: InputOTPProps["pattern"]) {
	if (pattern instanceof RegExp)
		return new RegExp(`^(?:${pattern.source})$`, pattern.flags.replace(/[gy]/g, ""));
	if (!pattern) return;
	try {
		return new RegExp(`^(?:${pattern})$`, "v");
	} catch {
		/* An invalid HTML pattern imposes no constraint. */
	}
}

export function InputOTP({
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	onComplete,
	pasteTransformer,
	maxLength = 6,
	pattern,
	ref,
	inputId,
	id,
	className,
	children,
	autoComplete = "one-time-code",
	inputMode = "numeric",
	spellCheck = false,
	autoCapitalize = "none",
	disabled,
	readOnly,
	dir,
	"aria-invalid": invalid,
	onInput,
	onPaste,
	onFocus,
	onBlur,
	onClick,
	onCompositionStart,
	onCompositionEnd,
	...props
}: InputOTPProps) {
	const limit = Math.max(1, Math.trunc(maxLength) || 1);
	const [initial] = React.useState(() => controlledValue ?? defaultValue);
	const [localValue, setLocalValue] = React.useState(initial);
	const value = (controlledValue ?? localValue).slice(0, limit);
	const input = React.useRef<HTMLInputElement>(null);
	const [selection, setSelection] = React.useState<Selection | null>(null);
	const [compositionDraft, setCompositionDraft] = React.useState<string | null>(null);
	const composing = React.useRef(false);
	const beforeEdit = React.useRef<Selection | null>(null);
	const previous = React.useRef(value);
	const regex = React.useMemo(() => compilePattern(pattern), [pattern]);
	const isInvalid = invalid === true || invalid === "true";

	React.useImperativeHandle(ref, () => input.current!, []);
	React.useEffect(() => {
		const previousValue = previous.current;
		previous.current = value;
		if (previousValue.length < limit && value.length === limit) onComplete?.(value);
	}, [limit, onComplete, value]);
	React.useLayoutEffect(() => {
		if (!input.current || !(pattern instanceof RegExp)) return;
		const control = input.current;
		control.setCustomValidity(
			value && !regex?.test(value) ? "Please match the requested format." : ""
		);
		return () => control.setCustomValidity("");
	}, [pattern, regex, value]);

	function syncSelection(control: HTMLInputElement) {
		if (!control.matches(":focus") || control.matches(":disabled")) {
			setSelection(null);
			return;
		}
		const start = control.selectionStart ?? 0;
		const end = control.selectionEnd ?? start;
		setSelection((current) =>
			current?.[0] === start && current[1] === end ? current : [start, end]
		);
	}

	React.useEffect(() => {
		const control = input.current;
		if (!control) return;
		const trackSelection = () => syncSelection(control);
		function saveSelection(event: Event) {
			if (!composing.current && !(event as InputEvent).isComposing) {
				beforeEdit.current = [control!.selectionStart ?? 0, control!.selectionEnd ?? 0];
			}
		}
		control.ownerDocument.addEventListener("selectionchange", trackSelection);
		control.addEventListener("beforeinput", saveSelection);
		trackSelection();
		return () => {
			control.ownerDocument.removeEventListener("selectionchange", trackSelection);
			control.removeEventListener("beforeinput", saveSelection);
		};
	}, []);

	function update(next: string) {
		if (controlledValue === undefined) setLocalValue(next);
		if (value !== next) onValueChange?.(next);
	}

	const resetState = React.useEffectEvent(() => {
		composing.current = false;
		setCompositionDraft(null);
		beforeEdit.current = null;
		update(initial.slice(0, limit));
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

	function acceptEdit(control: HTMLInputElement) {
		const text = control.value.slice(0, limit);
		if (text && regex && !regex.test(text)) {
			const [start, end] = beforeEdit.current ?? [value.length, value.length];
			control.value = value;
			control.setSelectionRange(start, end);
		} else {
			if (control.value !== text) control.value = text;
			update(text);
		}
		beforeEdit.current = null;
		syncSelection(control);
	}

	return (
		<div
			dir={dir}
			data-slot="input-otp-container"
			data-disabled={disabled || undefined}
			className={cn(
				"cn-input-otp relative inline-flex w-fit max-w-full flex-wrap items-center gap-2 has-disabled:opacity-50",
				className
			)}
		>
			<OTPContext.Provider
				value={{
					value: compositionDraft ?? value,
					selection,
					maxLength: limit,
					invalid: isInvalid,
				}}
			>
				{children ?? (
					<InputOTPGroup>
						{Array.from({ length: limit }, (_, index) => (
							<InputOTPSlot key={index} index={index} />
						))}
					</InputOTPGroup>
				)}
			</OTPContext.Provider>
			{/* A single overlay keeps native selection, form validation and OTP autofill. */}
			<input
				{...props}
				ref={input}
				id={inputId ?? id}
				type="text"
				data-slot="input-otp"
				className="absolute inset-0 z-20 size-full cursor-text border-0 p-0 font-mono text-[32px] leading-none tracking-[0.4em] opacity-0 disabled:cursor-not-allowed"
				aria-invalid={invalid}
				maxLength={limit}
				pattern={typeof pattern === "string" ? pattern : undefined}
				autoComplete={autoComplete}
				inputMode={inputMode}
				spellCheck={spellCheck}
				autoCapitalize={autoCapitalize}
				disabled={disabled}
				readOnly={readOnly}
				value={compositionDraft ?? value}
				onInput={(event) => {
					const control = event.currentTarget;
					if (!control.matches(":disabled") && !readOnly) {
						if (composing.current || (event.nativeEvent as InputEvent).isComposing) {
							setCompositionDraft(control.value);
							syncSelection(control);
						} else acceptEdit(control);
					}
					onInput?.(event);
				}}
				onPaste={(event) => {
					onPaste?.(event);
					const control = event.currentTarget;
					if (
						event.defaultPrevented ||
						!pasteTransformer ||
						composing.current ||
						control.matches(":disabled") ||
						readOnly ||
						!event.clipboardData
					)
						return;
					event.preventDefault();
					const start = control.selectionStart ?? value.length;
					const end = control.selectionEnd ?? start;
					const text = pasteTransformer(event.clipboardData.getData("text/plain")).replace(
						/[\r\n]/g,
						""
					);
					const next = (value.slice(0, start) + text + value.slice(end)).slice(0, limit);
					if (next && regex && !regex.test(next)) return;
					control.setRangeText(next, 0, control.value.length);
					const caret = Math.min(start + text.length, next.length);
					control.setSelectionRange(caret, caret);
					control.dispatchEvent(
						new InputEvent("input", { bubbles: true, inputType: "insertFromPaste" })
					);
				}}
				onFocus={(event) => {
					syncSelection(event.currentTarget);
					onFocus?.(event);
				}}
				onBlur={(event) => {
					setSelection(null);
					onBlur?.(event);
				}}
				onClick={(event) => {
					onClick?.(event);
					const control = event.currentTarget;
					if (
						!event.defaultPrevented &&
						!event.shiftKey &&
						event.detail === 1 &&
						control.selectionStart === control.selectionEnd
					) {
						const slot = control.ownerDocument
							.elementsFromPoint(event.clientX, event.clientY)
							.find(
								(node) =>
									node.matches('[data-slot="input-otp-slot"]') &&
									control.parentElement?.contains(node)
							);
						if (slot) {
							const rect = slot.getBoundingClientRect();
							const trailing =
								event.clientX >= rect.left + rect.width / 2 !==
								(getComputedStyle(control).direction === "rtl");
							const caret = Math.min(
								Number(slot.getAttribute("data-index")) + Number(trailing),
								control.value.length
							);
							control.setSelectionRange(caret, caret);
						}
					}
					syncSelection(control);
				}}
				onCompositionStart={(event) => {
					composing.current = true;
					beforeEdit.current = [
						event.currentTarget.selectionStart ?? 0,
						event.currentTarget.selectionEnd ?? 0,
					];
					onCompositionStart?.(event);
				}}
				onCompositionEnd={(event) => {
					composing.current = false;
					setCompositionDraft(null);
					if (!event.currentTarget.matches(":disabled") && !readOnly)
						acceptEdit(event.currentTarget);
					onCompositionEnd?.(event);
				}}
			/>
		</div>
	);
}

export function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-slot="input-otp-group"
			className={cn("cn-input-otp-group flex items-center", className)}
		/>
	);
}

export type InputOTPSlotProps = React.ComponentProps<"div"> & { index: number };

export function InputOTPSlot({
	index,
	className,
	children,
	"aria-invalid": invalid,
	...props
}: InputOTPSlotProps) {
	const context = React.useContext(OTPContext);
	const char = context?.value[index];
	const [start, end] = context?.selection ?? [-1, -1];
	const active =
		!!context?.selection &&
		(start === end
			? index === Math.min(start, context.maxLength - 1)
			: index >= start && index < end);
	return (
		<div
			{...props}
			data-slot="input-otp-slot"
			data-index={index}
			data-active={active}
			aria-hidden="true"
			aria-invalid={invalid ?? (context?.invalid || undefined)}
			className={cn(
				"cn-input-otp-slot relative flex shrink-0 items-center justify-center data-[active=true]:z-10",
				className
			)}
		>
			{children ?? char}
			{active && !char && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<div className="cn-input-otp-caret-line motion-reduce:animate-none" />
				</div>
			)}
		</div>
	);
}

export function InputOTPSeparator({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-slot="input-otp-separator"
			role="separator"
			aria-hidden="true"
			className={cn("cn-input-otp-separator flex items-center", className)}
		>
			{children ?? <MinusIcon className="size-4" />}
		</div>
	);
}
