import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type TextareaProps = Omit<ComponentProps<"textarea">, "children"> & {
	appearance?: "default" | "settings";
};

export function Textarea({ className, appearance = "default", ...props }: TextareaProps) {
	return (
		<textarea
			data-slot="textarea"
			data-appearance={appearance}
			className={cn(
				"cn-textarea flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
				appearance === "settings" && "cn-textarea-appearance-settings",
				className
			)}
			{...props}
		/>
	);
}
