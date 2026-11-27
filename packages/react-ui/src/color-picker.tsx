"use client";

import * as React from "react";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

export type ColorPickerContentProps = Omit<React.ComponentProps<typeof PopoverContent>, "children">;

export interface ColorPickerProps extends Omit<
	React.ComponentProps<"div">,
	"children" | "onChange"
> {
	label: string;
	value?: string;
	defaultValue?: string;
	presets?: readonly string[];
	disabled?: boolean;
	name?: string;
	contentProps?: ColorPickerContentProps;
	onValueChange?: (value: string) => void;
}

const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;
const FULL_HEX = /^#?[\da-f]{6}$/i;
const HEX_DRAFT = /^#?[\da-f]{0,6}$/i;

/** Returns lowercase #rrggbb; anything other than three- or six-digit HEX is invalid. */
export function normalizeHex(input: string): string | undefined {
	const digits = HEX.exec(input.trim())?.[1];
	if (!digits) return undefined;
	return `#${(digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits).toLowerCase()}`;
}

const field =
	"h-8 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-foreground outline-none transition-colors duration-150 motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";

export function ColorPicker({
	label,
	value,
	defaultValue = "#000000",
	presets = [],
	disabled = false,
	name,
	contentProps,
	onValueChange,
	id: idProp,
	className,
	...props
}: ColorPickerProps) {
	const fallbackId = React.useId();
	const id = idProp ?? fallbackId;
	const [localValue, setValue] = React.useState(defaultValue);
	const current = normalizeHex(value ?? localValue) ?? "#000000";
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string>();
	const composing = React.useRef(false);
	const text = draft ?? current;
	const invalid = !HEX_DRAFT.test(text.trim());
	const { className: contentClass, ...content } = contentProps ?? {};

	React.useEffect(() => {
		if (disabled) setOpen(false);
	}, [disabled]);

	function update(next: string | undefined) {
		if (disabled || !next || next === current) return;
		if (value === undefined) setValue(next);
		onValueChange?.(next);
	}

	function onOpenChange(next: boolean) {
		if (next && disabled) return;
		if (next) {
			setDraft(undefined);
			composing.current = false;
		}
		setOpen(next);
	}

	function edit(next: string, isComposing: boolean) {
		setDraft(next);
		if (!isComposing && FULL_HEX.test(next.trim())) update(normalizeHex(next));
	}

	function commit(next: string) {
		if (!composing.current) update(normalizeHex(next));
		setDraft(undefined);
	}

	return (
		<div
			{...props}
			id={idProp}
			data-slot="color-picker"
			data-disabled={disabled || undefined}
			className={cn("grid gap-2", className)}
		>
			<span id={`${id}-label`} className="text-[13px] leading-[17px] font-medium text-foreground">
				{label}
			</span>
			<Popover open={open && !disabled} onOpenChange={onOpenChange}>
				<PopoverTrigger
					disabled={disabled}
					aria-labelledby={`${id}-label ${id}-value`}
					className={cn(
						field,
						"flex items-center gap-2 text-[13px] hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-[lch(12%_1_272)]"
					)}
				>
					<span
						data-slot="color-picker-swatch"
						aria-hidden="true"
						className="size-4 shrink-0 rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20"
						style={{ backgroundColor: current }}
					/>
					<span id={`${id}-value`} className="font-mono text-xs tabular-nums">
						{current}
					</span>
				</PopoverTrigger>
				<PopoverContent
					aria-labelledby={`${id}-label`}
					{...content}
					data-slot="color-picker-content"
					className={cn("grid w-64 gap-3", contentClass)}
				>
					<input
						type="color"
						aria-label={`${label}：色盘`}
						value={current}
						onChange={(event) => {
							update(normalizeHex(event.currentTarget.value));
							setDraft(undefined);
						}}
						className="h-24 w-full cursor-pointer overflow-hidden rounded-md border-[0.5px] border-border bg-transparent p-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
					/>
					<label className="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
						十六进制
						<input
							type="text"
							aria-label={`${label}：十六进制`}
							aria-invalid={invalid || undefined}
							aria-describedby={invalid ? `${id}-error` : undefined}
							spellCheck={false}
							autoComplete="off"
							maxLength={7}
							value={text}
							className={cn(
								field,
								"font-mono text-xs tabular-nums aria-invalid:border-destructive"
							)}
							onCompositionStart={() => {
								composing.current = true;
							}}
							onCompositionEnd={(event) => {
								composing.current = false;
								edit(event.currentTarget.value, false);
							}}
							onChange={(event) => edit(event.currentTarget.value, composing.current)}
							onKeyDown={(event) => {
								if (event.key !== "Enter" || event.nativeEvent.isComposing || composing.current)
									return;
								event.preventDefault();
								commit(event.currentTarget.value);
							}}
							onBlur={(event) => commit(event.currentTarget.value)}
						/>
					</label>
					{invalid && (
						<p id={`${id}-error`} className="text-xs text-destructive">
							只能输入十六进制字符 0-9、a-f，如 #1e40af。
						</p>
					)}
					{presets.length > 0 && (
						<div role="group" aria-label={`${label}：预设`} className="flex flex-wrap gap-1.5">
							{presets.map((preset, index) => {
								const hex = normalizeHex(preset);
								return (
									hex && (
										<button
											key={`${preset}-${index}`}
											type="button"
											aria-label={hex}
											aria-pressed={hex === current}
											className="size-6 rounded-[5px] border-[0.5px] border-black/15 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid aria-pressed:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.45)] aria-pressed:outline-2 aria-pressed:-outline-offset-2 aria-pressed:outline-white aria-pressed:outline-solid aria-pressed:focus-visible:outline-ring dark:border-white/20"
											style={{ backgroundColor: hex }}
											onClick={() => {
												update(hex);
												setDraft(undefined);
											}}
										/>
									)
								);
							})}
						</div>
					)}
				</PopoverContent>
			</Popover>
			{name && <input type="hidden" name={name} value={current} disabled={disabled} />}
		</div>
	);
}
