// Adapted from Valar's MIT Svelte registry (cfd989c). See LICENSE.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";
import React, { type ComponentProps } from "react";

export const markerVariants = cva(
	"cn-marker group/marker relative flex w-full items-center [button,a]:focus-visible:outline-1 [button,a]:focus-visible:-outline-offset-1 [button,a]:focus-visible:outline-ring",
	{
		variants: {
			variant: {
				default: "",
				separator:
					"cn-marker-variant-separator rtl:before:mr-0 rtl:before:ml-1 rtl:after:ml-0 rtl:after:mr-1",
				border: "cn-marker-variant-border",
			},
		},
		defaultVariants: { variant: "default" },
	}
);

export type MarkerVariant = NonNullable<VariantProps<typeof markerVariants>["variant"]>;
export type MarkerProps = ComponentProps<"div"> & { asChild?: boolean; variant?: MarkerVariant };
export function Marker({ className, asChild = false, variant = "default", ...props }: MarkerProps) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="marker"
			data-variant={variant}
			className={cn(markerVariants({ variant }), className)}
			{...props}
		/>
	);
}

export function MarkerIcon({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="marker-icon"
			className={cn("cn-marker-icon shrink-0", className)}
			{...props}
			aria-hidden="true"
		/>
	);
}

export function MarkerContent({ className, ...props }: ComponentProps<"span">) {
	return (
		<span
			data-slot="marker-content"
			className={cn("cn-marker-content max-w-full min-w-0 wrap-break-word", className)}
			{...props}
		/>
	);
}
