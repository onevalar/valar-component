"use client";

import * as React from "react";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "./button.tsx";
import { isCommandComposing } from "./command-keyboard.ts";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx";

export type ComboboxOption = {
	id: string;
	label: string;
	group?: string;
	keywords?: readonly string[];
	disabled?: boolean;
};

type ContentProps = React.ComponentProps<typeof PopoverContent>;

export type ComboboxProps = Pick<ContentProps, "align" | "side" | "sideOffset" | "portalProps"> & {
	label: string;
	placeholder: string;
	options: readonly ComboboxOption[];
	value?: readonly string[];
	defaultValue?: readonly string[];
	onValueChange?: (value: readonly string[]) => void;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	query?: string;
	defaultQuery?: string;
	onQueryChange?: (query: string) => void;
	multiple?: boolean;
	disabled?: boolean;
	filter?: boolean;
	empty?: React.ReactNode;
	loading?: boolean;
	loadingLabel?: string;
	error?: string;
	clearLabel?: string;
	onSelect?: (id: string) => void;
	ref?: React.Ref<HTMLButtonElement>;
	triggerProps?: Omit<
		React.ComponentProps<"button">,
		"children" | "className" | "disabled" | "ref" | "type"
	>;
	contentClassName?: string;
	className?: string;
	children?: React.ReactNode;
	renderOption?: (option: ComboboxOption) => React.ReactNode;
	footer?: React.ReactNode;
};

export function Combobox({
	label,
	placeholder,
	options,
	value: controlledValue,
	defaultValue = [],
	onValueChange,
	open: controlledOpen,
	defaultOpen = false,
	onOpenChange,
	query: controlledQuery,
	defaultQuery = "",
	onQueryChange,
	multiple = false,
	disabled = false,
	empty = "没有匹配的选项",
	loading = false,
	loadingLabel = "正在加载…",
	error,
	filter = true,
	clearLabel,
	onSelect,
	triggerProps,
	contentClassName,
	className,
	align = "start",
	side = "bottom",
	sideOffset = 4,
	portalProps,
	ref,
	children,
	renderOption,
	footer,
}: ComboboxProps) {
	const [localValue, setLocalValue] = React.useState(defaultValue);
	const [localOpen, setLocalOpen] = React.useState(defaultOpen);
	const [localQuery, setLocalQuery] = React.useState(defaultQuery);
	const open = controlledOpen ?? localOpen;
	const value = controlledValue ?? localValue;
	const query = controlledQuery ?? localQuery;
	const search = React.useRef<HTMLInputElement>(null);
	const wasOpen = React.useRef(open);

	function changeOpen(next: boolean) {
		if (next === open || (disabled && next)) return;
		if (controlledOpen === undefined) setLocalOpen(next);
		onOpenChange?.(next);
	}

	const changeQuery = React.useCallback(
		(next: string) => {
			if (next === query) return;
			if (controlledQuery === undefined) setLocalQuery(next);
			onQueryChange?.(next);
		},
		[query, controlledQuery, onQueryChange]
	);

	React.useLayoutEffect(() => {
		if (wasOpen.current && !open) changeQuery("");
		wasOpen.current = open;
	}, [open, changeQuery]);

	function changeValue(next: readonly string[]) {
		if (next.length === value.length && next.every((id, index) => id === value[index])) return;
		if (controlledValue === undefined) setLocalValue(next);
		onValueChange?.(next);
	}

	const groups = React.useMemo(() => {
		const groups = new Map<string, ComboboxOption[]>();
		const labels = new Map<string, string>();
		for (const option of options) {
			const key = option.group ?? "";
			const group = groups.get(key);
			if (group) group.push(option);
			else groups.set(key, [option]);
			labels.set(option.id, option.label);
		}
		return { groups, labels };
	}, [options]);
	const selectedLabel = value.length
		? value.map((id) => groups.labels.get(id) ?? id).join(", ")
		: label;
	const triggerLabel = children != null || !value.length ? label : `${label}: ${selectedLabel}`;
	const selectedIds = new Set(value);

	function choose(option: ComboboxOption) {
		if (disabled || option.disabled || loading || error) return;
		changeValue(
			multiple
				? selectedIds.has(option.id)
					? value.filter((id) => id !== option.id)
					: [...value, option.id]
				: [option.id]
		);
		onSelect?.(option.id);
		if (!multiple) changeOpen(false);
	}

	function renderRow(option: ComboboxOption) {
		const selected = selectedIds.has(option.id);
		return (
			<CommandItem
				key={option.id}
				value={option.id}
				textValue={option.label}
				keywords={option.keywords}
				checked={selected}
				showIndicator={false}
				disabled={disabled || option.disabled}
				onSelect={() => choose(option)}
				className="cn-combobox-option"
			>
				{renderOption ? (
					renderOption(option)
				) : (
					<span className="min-w-0 flex-1 wrap-anywhere">{option.label}</span>
				)}
				{selected ? (
					<CheckIcon aria-hidden="true" className="cn-combobox-check" />
				) : (
					<span aria-hidden="true" className="cn-combobox-check" />
				)}
			</CommandItem>
		);
	}

	return (
		<Popover open={open} onOpenChange={changeOpen}>
			<PopoverTrigger asChild>
				<Button
					aria-label={triggerLabel}
					{...triggerProps}
					ref={ref}
					data-slot="combobox-trigger"
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					className={cn("cn-combobox-button", className)}
				>
					{children ?? (
						<>
							<span className="min-w-0 truncate">{selectedLabel}</span>
							<ChevronDownIcon aria-hidden="true" />
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				appearance="surface"
				data-slot="combobox-content"
				aria-label={label}
				align={align}
				side={side}
				sideOffset={sideOffset}
				portalProps={portalProps}
				className={cn("cn-combobox-panel", contentClassName)}
				onOpenAutoFocus={(event) => {
					if (!search.current?.disabled && search.current) {
						event.preventDefault();
						search.current.focus({ preventScroll: true });
					}
				}}
				onEscapeKeyDown={(event) => {
					if (isCommandComposing(event)) event.preventDefault();
				}}
			>
				<Command
					label={label}
					className="cn-combobox-command"
					shouldFilter={filter}
					disableInitialScroll
				>
					<CommandInput
						ref={search}
						value={query}
						onValueChange={changeQuery}
						placeholder={placeholder}
						aria-label={label}
						disabled={disabled}
						className="cn-combobox-search"
					/>
					<CommandList
						aria-multiselectable={multiple || undefined}
						aria-busy={loading || undefined}
						className="cn-combobox-results"
					>
						{!loading &&
							!error &&
							[...groups.groups].map(([heading, items]) =>
								heading ? (
									<CommandGroup key={heading} heading={heading} className="p-0">
										{items.map(renderRow)}
									</CommandGroup>
								) : (
									<React.Fragment key="">{items.map(renderRow)}</React.Fragment>
								)
							)}
					</CommandList>
					{loading ? (
						<p role="status" className="cn-combobox-message">
							{loadingLabel}
						</p>
					) : error ? (
						<p role="alert" className="cn-combobox-message">
							{error}
						</p>
					) : (
						<CommandEmpty className="cn-combobox-message">{empty}</CommandEmpty>
					)}
					{(clearLabel || footer != null) && (
						<div className="cn-combobox-footer">
							{clearLabel && (
								<Button
									variant="ghost"
									size="sm"
									disabled={disabled || !value.length}
									onClick={() => {
										changeValue([]);
										if (multiple) search.current?.focus({ preventScroll: true });
										else changeOpen(false);
									}}
								>
									{clearLabel}
								</Button>
							)}
							{footer}
						</div>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	);
}
