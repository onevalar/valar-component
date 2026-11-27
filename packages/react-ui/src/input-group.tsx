"use client";

import { cva } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";
import { Button, type ButtonProps } from "./button.tsx";
import { Input } from "./input.tsx";
import { Textarea, type TextareaProps } from "./textarea.tsx";

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";
export type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm";
export type InputGroupButtonShape = ButtonProps["shape"];

const addonVariants = cva(
	"cn-input-group-addon flex cursor-text items-center justify-center select-none",
	{
		variants: {
			align: {
				"inline-start": "cn-input-group-addon-align-inline-start order-first",
				"inline-end": "cn-input-group-addon-align-inline-end order-last",
				"block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
				"block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start",
			},
		},
		defaultVariants: { align: "inline-start" },
	}
);

const buttonVariants = cva("cn-input-group-button flex items-center shadow-none", {
	variants: {
		size: {
			xs: "cn-input-group-button-size-xs",
			sm: "cn-input-group-button-size-sm",
			"icon-xs": "cn-input-group-button-size-icon-xs",
			"icon-sm": "cn-input-group-button-size-icon-sm",
		},
	},
	defaultVariants: { size: "xs" },
});

export function InputGroup({
	className,
	appearance = "default",
	...props
}: ComponentProps<"div"> & {
	appearance?: "default" | "settings-search" | "settings-name" | "composer";
}) {
	return (
		<div
			data-slot="input-group"
			data-appearance={appearance}
			role="group"
			className={cn(
				"group/input-group cn-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
				appearance === "settings-search" && "cn-input-group-settings-search",
				appearance === "settings-name" && "cn-input-group-settings-name",
				appearance === "composer" && "cn-input-group-composer",
				className
			)}
			{...props}
		/>
	);
}

export function InputGroupAddon({
	className,
	align = "inline-start",
	onClick,
	...props
}: ComponentProps<"div"> & { align?: InputGroupAddonAlign }) {
	return (
		<div
			data-slot="input-group-addon"
			data-align={align}
			role="group"
			className={cn(addonVariants({ align }), className)}
			onClick={(event) => {
				onClick?.(event);
				const { target, currentTarget } = event;
				if (event.defaultPrevented || !(target instanceof Element)) return;
				const interactive = target.closest(
					"button, a[href], label, input, textarea, select, [tabindex], [contenteditable]"
				);
				if (interactive && currentTarget.contains(interactive)) return;
				const groupSelector = '[data-slot="input-group"]';
				const root = currentTarget.closest(groupSelector);
				if (!root) return;
				const findOwned = (selector: string) =>
					Array.from(root.querySelectorAll<HTMLElement>(selector)).find(
						(element) => element.closest(groupSelector) === root
					);
				const control =
					findOwned('[data-slot="input-group-control"]') ??
					findOwned('input:not([type="hidden"]), textarea');
				control?.focus();
			}}
			{...props}
		/>
	);
}

export function InputGroupButton({
	className,
	type = "button",
	variant = "ghost",
	size = "xs",
	shape = "auto",
	...props
}: Extract<ButtonProps, { href?: never }> & { size?: InputGroupButtonSize }) {
	return (
		<Button
			type={type}
			variant={variant}
			size={size}
			shape={shape === "auto" ? "square" : shape}
			className={cn(buttonVariants({ size }), className)}
			{...props}
		/>
	);
}

export function InputGroupText({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			className={cn("cn-input-group-text flex items-center [&_svg]:pointer-events-none", className)}
			{...props}
		/>
	);
}

export function InputGroupInput({ className, ...props }: ComponentProps<typeof Input>) {
	return (
		<Input
			data-slot="input-group-control"
			className={cn("cn-input-group-input flex-1", className)}
			{...props}
		/>
	);
}

export function InputGroupTextarea({ className, ...props }: TextareaProps) {
	return (
		<Textarea
			data-slot="input-group-control"
			className={cn("cn-input-group-textarea flex-1 resize-none", className)}
			{...props}
		/>
	);
}
