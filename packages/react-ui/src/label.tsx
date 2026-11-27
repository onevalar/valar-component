"use client";

import * as React from "react";
import { Label as SdkLabel } from "@ui-sdk/react/label";
import { renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

export type LabelProps = React.ComponentPropsWithRef<"label"> & {
	appearance?: "default" | "settings";
	required?: boolean;
	asChild?: boolean;
	"data-slot"?: string;
};

export function Label({
	className,
	appearance = "default",
	required = false,
	asChild,
	children,
	"data-slot": dataSlot = "label",
	...props
}: LabelProps) {
	const marker = required && (
		<span data-slot="label-required" aria-hidden="true" className="text-destructive">
			*
		</span>
	);
	let render: React.ReactElement | undefined;
	if (asChild) {
		if (!React.isValidElement<{ children?: React.ReactNode }>(children)) {
			throw new Error("Label asChild expects a single React element");
		}
		render = marker ? React.cloneElement(children, {}, children.props.children, marker) : children;
	}
	return (
		<SdkLabel
			data-appearance={appearance}
			className={cn(
				"cn-label cn-label-layout flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
				appearance === "settings" && "cn-label-appearance-settings",
				className
			)}
			{...props}
			render={(slot, state) =>
				renderElement("label", { ...slot, "data-slot": dataSlot }, render, state)
			}
		>
			{!asChild && (
				<>
					{children}
					{marker}
				</>
			)}
		</SdkLabel>
	);
}
