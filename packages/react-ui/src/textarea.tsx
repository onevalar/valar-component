import { Textarea as SdkTextarea } from "@ui-sdk/react/textarea";
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type TextareaProps = Omit<ComponentProps<"textarea">, "children"> & {
	appearance?: "default" | "settings";
	"data-slot"?: string;
};

export function Textarea({
	className,
	appearance = "default",
	"data-slot": slot = "textarea",
	value,
	defaultValue,
	onSubmit,
	...props
}: TextareaProps) {
	const classes = cn(
		"cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		appearance === "settings" && "cn-textarea-appearance-settings",
		className
	);
	// SDK `onSubmit` represents a keyboard shortcut, not the native submit event prop.
	return (
		<SdkTextarea
			data-appearance={appearance}
			className={classes}
			{...props}
			value={value == null ? undefined : String(value)}
			defaultValue={defaultValue == null ? undefined : String(defaultValue)}
			autoResize={appearance === "default"}
			render={(attributes) => <textarea {...attributes} data-slot={slot} onSubmit={onSubmit} />}
		/>
	);
}
