"use client";

import { cn } from "cn";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import React, { createContext, useContext, useEffect, useRef, type ComponentProps } from "react";

const ReadOnlyContext = createContext(false);

export function RadioGroup({
	className,
	orientation = "vertical",
	disabled,
	readOnly = false,
	onKeyDown,
	onClickCapture,
	...props
}: ComponentProps<typeof RadioGroupPrimitive.Root> & { readOnly?: boolean }) {
	const pendingSelection = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const activated = useRef<EventTarget | null>(null);
	useEffect(
		() => () => {
			clearTimeout(pendingSelection.current);
			pendingSelection.current = undefined;
			activated.current = null;
		},
		[disabled, readOnly]
	);

	return (
		<ReadOnlyContext.Provider value={readOnly}>
			<RadioGroupPrimitive.Root
				data-slot="radio-group"
				aria-disabled={disabled || undefined}
				aria-readonly={readOnly || undefined}
				data-readonly={readOnly || undefined}
				orientation={orientation}
				disabled={disabled}
				className={cn("cn-radio-group w-full", className)}
				onClickCapture={(event) => {
					if (pendingSelection.current !== undefined) activated.current = event.target;
					onClickCapture?.(event);
				}}
				onKeyDown={(event) => {
					const roving = event.defaultPrevented;
					onKeyDown?.(event);
					const { key, target, currentTarget } = event;
					if (
						!roving ||
						disabled ||
						readOnly ||
						!(
							orientation === "vertical" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"]
						).includes(key) ||
						!(target instanceof HTMLElement) ||
						target.closest('[data-slot="radio-group"]') !== currentTarget ||
						target.dataset.slot !== "radio-group-item"
					)
						return;
					// Radix defers roving focus and only selects if the key is still held.
					// Run after its focus move, and select only if Radix did not already do so.
					clearTimeout(pendingSelection.current);
					activated.current = null;
					pendingSelection.current = setTimeout(() => {
						pendingSelection.current = undefined;
						const previousActivation = activated.current;
						activated.current = null;
						const next = currentTarget.ownerDocument.activeElement;
						if (
							next instanceof HTMLButtonElement &&
							next !== target &&
							next !== previousActivation &&
							!next.disabled &&
							next.dataset.slot === "radio-group-item" &&
							next.getAttribute("aria-checked") === "false" &&
							next.closest('[data-slot="radio-group"]') === currentTarget
						)
							next.click();
					});
				}}
				{...props}
			/>
		</ReadOnlyContext.Provider>
	);
}

export function RadioGroupItem({
	className,
	onClick,
	...props
}: Omit<ComponentProps<typeof RadioGroupPrimitive.Item>, "asChild" | "children">) {
	const readOnly = useContext(ReadOnlyContext);
	return (
		<RadioGroupPrimitive.Item
			data-slot="radio-group-item"
			data-readonly={readOnly || undefined}
			className={cn(
				"cn-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
			onClick={(event) => {
				onClick?.(event);
				// Radix also clicks a newly focused item during arrow-key navigation.
				if (readOnly) event.preventDefault();
			}}
			{...props}
		>
			<RadioGroupPrimitive.Indicator
				data-slot="radio-group-indicator"
				className="cn-radio-group-indicator"
				aria-hidden="true"
			>
				<span className="cn-radio-group-indicator-icon" />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}
