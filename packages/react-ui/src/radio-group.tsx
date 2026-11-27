"use client";

import { renderElement } from "@ui-sdk/react/primitive";
import { Radio, RadioGroup as SdkRadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import { cn } from "cn";
import React, { type ComponentProps, type ReactNode } from "react";

type RadioGroupProps = Omit<
	ComponentProps<typeof SdkRadioGroup>,
	"className" | "style" | "children" | "render" | "onValueChange"
> & {
	className?: string;
	style?: React.CSSProperties;
	children?: ReactNode;
	asChild?: boolean;
	orientation?: "vertical" | "horizontal";
	onValueChange?: (value: string) => void;
};

export function RadioGroup({
	className,
	orientation = "vertical",
	asChild,
	children,
	name,
	required,
	onValueChange,
	...props
}: RadioGroupProps) {
	return (
		<SdkRadioGroup
			{...props}
			name={name || undefined}
			required={Boolean(name) && required}
			aria-required={required || undefined}
			aria-orientation={orientation}
			data-orientation={orientation}
			className={cn("cn-radio-group w-full", className)}
			onValueChange={(value) => onValueChange?.(value ?? "")}
			render={(part, state) =>
				renderElement(
					"div",
					{ ...part, "data-slot": "radio-group" },
					asChild ? (React.Children.only(children) as React.ReactElement) : undefined,
					state
				)
			}
		>
			{asChild ? undefined : children}
		</SdkRadioGroup>
	);
}

export function RadioGroupItem({
	className,
	onKeyDown,
	value,
	...props
}: Omit<ComponentProps<"button">, "children" | "value"> & { value: string }) {
	return (
		<Radio
			{...props}
			value={value}
			className={cn(
				"cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			onKeyDown={(event) => {
				onKeyDown?.(event);
				const { currentTarget, key } = event;
				const horizontal =
					currentTarget.closest('[data-slot="radio-group"]')?.getAttribute("aria-orientation") ===
					"horizontal";
				// Valar uses one arrow axis and does not submit on Enter; the SDK handles the remaining keys.
				if (
					key === "Enter" ||
					(horizontal
						? key === "ArrowUp" || key === "ArrowDown"
						: key === "ArrowLeft" || key === "ArrowRight")
				) {
					event.preventDefault();
				}
			}}
			render={(part, state) => (
				<button
					{...part}
					value={value}
					disabled={state.disabled}
					data-slot="radio-group-item"
					data-state={state.checked ? "checked" : "unchecked"}
				>
					<RadioIndicator
						className="cn-radio-group-indicator"
						aria-hidden="true"
						render={(indicator) => <span {...indicator} data-slot="radio-group-indicator" />}
					>
						<span className="cn-radio-group-indicator-icon" />
					</RadioIndicator>
				</button>
			)}
		/>
	);
}
