import * as React from "react";
import { Input as SdkInput } from "@ui-sdk/react/input";
import { cn } from "cn";

function Input({
	className,
	type,
	value,
	defaultValue,
	"data-slot": slot = "input",
	...props
}: React.ComponentProps<"input"> & { "data-slot"?: string }) {
	const classes = cn(
		"cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		className
	);
	// The SDK Input controls strings, not checked state, file selections or numeric inputs.
	if (
		(!type || /^(text|search|email|tel|url|password)$/i.test(type)) &&
		(value === undefined || typeof value === "string") &&
		(defaultValue === undefined || typeof defaultValue === "string")
	) {
		return (
			<SdkInput
				type={type}
				className={classes}
				{...props}
				value={value}
				defaultValue={defaultValue}
				render={(attributes) => <input {...attributes} data-slot={slot} />}
			/>
		);
	}
	return (
		<input
			type={type}
			data-slot={slot}
			className={classes}
			{...props}
			value={value}
			defaultValue={defaultValue}
		/>
	);
}

export { Input };
