"use client";

import * as React from "react";
import {
	Select as SdkSelect,
	SelectContent as SdkContent,
	SelectGroup as SdkGroup,
	SelectGroupLabel as SdkGroupLabel,
	SelectItem as SdkItem,
	SelectItemText as SdkItemText,
	SelectSeparator as SdkSeparator,
	SelectTrigger as SdkTrigger,
	SelectValue as SdkValue,
	type ListData,
	type SelectController,
	type SelectOpenChangeReason,
	type SelectValueChangeReason,
} from "@ui-sdk/react/select";
import type { Anchor, ChangeDetails, Side } from "@ui-sdk/core";
import { cn } from "cn";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Slot } from "radix-ui";

const SelectGroupContext = React.createContext(false);

type SelectSharedProps = {
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean, details?: ChangeDetails<SelectOpenChangeReason>) => void;
	items?: ListData<string>;
	name?: string;
	form?: string;
	autoComplete?: string;
	disabled?: boolean;
	readOnly?: boolean;
	required?: boolean;
	placeholder?: string;
	loop?: boolean;
	virtualFocus?: boolean;
	modal?: boolean | "pointer";
	presentation?: "auto" | "popover" | "sheet";
	controller?: SelectController<string, boolean>;
	dismissible?: boolean;
	container?: Element | DocumentFragment | null;
	dir?: "ltr" | "rtl";
	children?: React.ReactNode;
};

export type SelectProps = SelectSharedProps &
	(
		| {
				multiple?: false;
				value?: string;
				defaultValue?: string;
				onValueChange?: (value: string, details?: ChangeDetails<SelectValueChangeReason>) => void;
		  }
		| {
				multiple: true;
				value?: string[];
				defaultValue?: string[];
				onValueChange?: (
					value: string[],
					details?: ChangeDetails<SelectValueChangeReason>
				) => void;
		  }
	);

function Select({
	value,
	defaultValue,
	onValueChange,
	onOpenChange,
	multiple = false,
	dir: _dir,
	children,
	...props
}: SelectProps) {
	const sdkValue = React.useMemo(() => {
		if (multiple) return Array.isArray(value) ? value : undefined;
		if (value === undefined) return undefined;
		return value === "" ? null : (value as string);
	}, [multiple, value]);

	const sdkDefaultValue = React.useMemo(() => {
		if (defaultValue === undefined) return undefined;
		if (multiple) return Array.isArray(defaultValue) ? defaultValue : [];
		return defaultValue === "" ? null : (defaultValue as string);
	}, [multiple, defaultValue]);

	function handleValueChange(
		next: string | string[] | null,
		details: ChangeDetails<SelectValueChangeReason>
	) {
		if (multiple) {
			(
				onValueChange as
					| ((value: string[], details?: ChangeDetails<SelectValueChangeReason>) => void)
					| undefined
			)?.(Array.isArray(next) ? next : [], details);
		} else {
			(
				onValueChange as
					| ((value: string, details?: ChangeDetails<SelectValueChangeReason>) => void)
					| undefined
			)?.(typeof next === "string" ? next : "", details);
		}
	}

	return (
		<SdkSelect
			{...(props as Record<string, unknown>)}
			multiple={multiple}
			value={sdkValue as never}
			defaultValue={sdkDefaultValue as never}
			onValueChange={handleValueChange as never}
			onOpenChange={(next, details) => {
				onOpenChange?.(next, details);
				if (!next && !details.canceled && details.reason === "escape-key") {
					details.event?.stopPropagation();
				}
			}}
		>
			{children}
		</SdkSelect>
	);
}

function SelectGroup({
	className,
	children,
	...props
}: React.ComponentPropsWithRef<"div">) {
	return (
		<SelectGroupContext.Provider value={true}>
			<SdkGroup
				data-slot="select-group"
				className={cn("cn-select-group", className)}
				{...props}
			>
				{children}
			</SdkGroup>
		</SelectGroupContext.Provider>
	);
}

export type SelectValueProps = Omit<React.ComponentPropsWithRef<"span">, "children"> & {
	placeholder?: string;
	maxLabels?: number;
	getMoreLabel?: (count: number) => string;
	children?: React.ReactNode;
};

function SelectValue({
	className,
	placeholder,
	maxLabels,
	getMoreLabel,
	children,
	...props
}: SelectValueProps) {
	return (
		<SdkValue
			placeholder={placeholder}
			maxLabels={maxLabels}
			getMoreLabel={getMoreLabel}
			data-slot="select-value"
			className={cn("truncate text-start", className)}
			{...props}
			render={(attrs, state) => (
				<span {...attrs}>
					{children !== undefined
						? children
						: state.placeholder
							? (placeholder ?? "")
							: state.label}
				</span>
			)}
		/>
	);
}

export type SelectTriggerProps = React.ComponentPropsWithRef<"button"> & {
	size?: "sm" | "default" | "settings";
	asChild?: boolean;
	controller?: SelectController<string, boolean>;
};

function SelectTrigger({
	className,
	size = "default",
	asChild,
	children,
	"aria-labelledby": ariaLabelledBy,
	...props
}: SelectTriggerProps) {
	const Element = asChild ? Slot.Root : "button";
	return (
		<SdkTrigger
			aria-labelledby={ariaLabelledBy}
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				"cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(attrs, state) => {
				const sdkLabelledBy = attrs["aria-labelledby"] as string | undefined;
				const resolvedLabelledBy =
					ariaLabelledBy ?? (sdkLabelledBy?.endsWith("-label") ? undefined : sdkLabelledBy);
				return (
					<Element
						{...attrs}
						aria-labelledby={resolvedLabelledBy}
						data-state={state.open ? "open" : "closed"}
					>
						{children}
						<ChevronDownIcon
							aria-hidden="true"
							className="cn-select-trigger-icon pointer-events-none"
						/>
					</Element>
				);
			}}
		/>
	);
}

export type SelectContentProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	children?: React.ReactNode;
	position?: "item-aligned" | "popper";
	side?: Side;
	align?: "start" | "center" | "end";
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?: number;
	arrowPadding?: number;
	anchor?: Anchor | string | null;
	keepMounted?: boolean;
	container?: Element | DocumentFragment | null;
	appearance?: "default" | "settings";
};

function revealHighlightedOption(container: HTMLElement | null) {
	if (!container || container.scrollHeight <= container.clientHeight) return;
	const el = container.querySelector<HTMLElement>("[data-highlighted]");
	if (!el) return;
	const containerRect = container.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	const scaleY = container.offsetHeight > 0 ? containerRect.height / container.offsetHeight : 1;
	const safeScaleY = scaleY > 0.1 ? scaleY : 1;
	const top =
		(elRect.top - containerRect.top) / safeScaleY - container.clientTop + container.scrollTop;
	const bottom = top + el.offsetHeight;
	const pad = 4;
	if (top - pad < container.scrollTop) {
		container.scrollTop = Math.max(0, top - pad);
	} else if (bottom + pad > container.scrollTop + container.clientHeight) {
		container.scrollTop = Math.min(
			container.scrollHeight - container.clientHeight,
			bottom + pad - container.clientHeight
		);
	}
}

function SelectContent({
	className,
	style,
	children,
	position = "popper",
	side = "bottom",
	align = "start",
	sideOffset = 4,
	alignOffset = 0,
	collisionPadding = 8,
	arrowPadding,
	anchor,
	keepMounted,
	container,
	appearance = "default",
	...props
}: SelectContentProps) {
	const [contentNode, setContentNode] = React.useState<HTMLDivElement | null>(null);

	React.useEffect(() => {
		if (!contentNode) return;
		const sync = () => revealHighlightedOption(contentNode);
		const observer = new MutationObserver(sync);
		observer.observe(contentNode, {
			attributes: true,
			attributeFilter: ["data-highlighted"],
			subtree: true,
		});
		contentNode.addEventListener("animationend", sync);
		return () => {
			observer.disconnect();
			contentNode.removeEventListener("animationend", sync);
		};
	}, [contentNode]);

	return (
		<SdkContent
			side={side}
			align={align}
			sideOffset={sideOffset}
			alignOffset={alignOffset}
			collisionPadding={collisionPadding}
			arrowPadding={arrowPadding}
			anchor={anchor}
			alignItemWithTrigger={position === "item-aligned"}
			keepMounted={keepMounted}
			container={container}
			data-slot="select-content"
			data-align-trigger={position === "item-aligned"}
			className={cn(
				"cn-select-content cn-overlay-surface relative z-50 max-h-(--available-height) min-w-[min(max(8rem,var(--anchor-width,8rem)),calc(100vw-1rem))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto data-[align-trigger=true]:animate-none",
				appearance === "settings" && "cn-select-content-settings animate-none!",
				className
			)}
			style={
				{
					"--radix-select-content-available-height": "var(--available-height)",
					"--radix-select-content-transform-origin": "var(--transform-origin)",
					"--radix-select-trigger-width": "var(--anchor-width)",
					...style,
				} as React.CSSProperties
			}
			{...props}
			render={(attrs, state) => {
				const sdkRef = attrs.ref as React.Ref<HTMLDivElement> | undefined;
				const mergedRef = (node: HTMLDivElement | null) => {
					setContentNode(node);
					if (typeof sdkRef === "function") sdkRef(node);
					else if (sdkRef && "current" in sdkRef)
						(sdkRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
				};
				return (
					<div {...attrs} ref={mergedRef} data-state={state.open ? "open" : "closed"}>
						<div
							data-position={position}
							className="cn-select-viewport w-full min-w-(--anchor-width) scroll-my-1 px-1.5 py-1"
						>
							{children}
						</div>
					</div>
				);
			}}
		/>
	);
}

function SelectLabel({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	const inGroup = React.useContext(SelectGroupContext);
	if (inGroup) {
		return (
			<SdkGroupLabel
				data-slot="select-label"
				className={cn("cn-select-label", className)}
				{...props}
			/>
		);
	}
	return <div data-slot="select-label" className={cn("cn-select-label", className)} {...props} />;
}

export type SelectItemProps = Omit<React.ComponentPropsWithRef<"div">, "children"> & {
	value: string;
	disabled?: boolean;
	textValue?: string;
	label?: string;
	index?: number;
	children?: React.ReactNode;
};

function SelectItem({
	className,
	value,
	disabled = false,
	textValue,
	label,
	index,
	children,
	...props
}: SelectItemProps) {
	const resolvedLabel = label ?? textValue ?? (typeof children === "string" ? children : undefined);
	return (
		<SdkItem
			value={value}
			label={resolvedLabel}
			disabled={disabled}
			index={index}
			data-slot="select-item"
			className={cn(
				"cn-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className
			)}
			{...props}
			render={(attrs, state) => (
				<div
					{...attrs}
					aria-disabled={disabled || state.disabled ? "true" : undefined}
					data-disabled={disabled || state.disabled ? "" : undefined}
				>
					<span className="cn-select-item-indicator" aria-hidden="true">
						{state.selected && (
							<CheckIcon className="cn-select-item-indicator-icon pointer-events-none" />
						)}
					</span>
					<SdkItemText className="cn-select-item-text">{children}</SdkItemText>
				</div>
			)}
		/>
	);
}

function SelectSeparator({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<SdkSeparator
			data-slot="select-separator"
			className={cn("cn-select-separator pointer-events-none h-[0.5px] bg-border", className)}
			{...props}
		/>
	);
}

function SelectScrollUpButton({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="select-scroll-up-button"
			aria-hidden="true"
			className={cn("cn-select-scroll-up-button hidden", className)}
			{...props}
		>
			<ChevronUpIcon />
		</div>
	);
}

function SelectScrollDownButton({ className, ...props }: React.ComponentPropsWithRef<"div">) {
	return (
		<div
			data-slot="select-scroll-down-button"
			aria-hidden="true"
			className={cn("cn-select-scroll-down-button hidden", className)}
			{...props}
		>
			<ChevronDownIcon />
		</div>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
