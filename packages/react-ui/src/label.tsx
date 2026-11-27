import * as React from "react";
import { cn } from "cn";
import { Label as LabelPrimitive } from "radix-ui";

export type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> & {
	appearance?: "default" | "settings";
	required?: boolean;
};

export function Label({
	className,
	appearance = "default",
	required = false,
	asChild,
	children,
	...props
}: LabelProps) {
	const marker = required && (
		<span data-slot="label-required" aria-hidden="true" className="text-destructive">
			*
		</span>
	);
	return (
		<LabelPrimitive.Root
			data-slot="label"
			data-appearance={appearance}
			className={cn(
				"cn-label cn-label-layout flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
				appearance === "settings" && "cn-label-appearance-settings",
				className
			)}
			asChild={asChild}
			{...props}
		>
			{asChild ? (
				marker && React.isValidElement<{ children?: React.ReactNode }>(children) ? (
					React.cloneElement(children, {}, children.props.children, marker)
				) : (
					children
				)
			) : (
				<>
					{children}
					{marker}
				</>
			)}
		</LabelPrimitive.Root>
	);
}
