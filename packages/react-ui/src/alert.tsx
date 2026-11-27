import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export const alertVariants = cva("cn-alert group/alert relative w-full", {
	variants: {
		variant: {
			default: "cn-alert-variant-default",
			destructive: "cn-alert-variant-destructive",
		},
	},
	defaultVariants: { variant: "default" },
});

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;
export type AlertProps = ComponentProps<"div"> & {
	variant?: AlertVariant;
	appearance?: "connection";
};

export function Alert({ className, variant, appearance, ...props }: AlertProps) {
	return (
		<div
			data-slot="alert"
			data-appearance={appearance}
			role="alert"
			className={cn(
				appearance === "connection"
					? "cn-alert-connection group/alert"
					: alertVariants({ variant }),
				className
			)}
			{...props}
		/>
	);
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"cn-alert-title [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"cn-alert-description [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
				className
			)}
			{...props}
		/>
	);
}

export function AlertAction({ className, ...props }: ComponentProps<"div">) {
	return <div data-slot="alert-action" className={cn("cn-alert-action", className)} {...props} />;
}
