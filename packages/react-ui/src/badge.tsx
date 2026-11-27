import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import React, { type ComponentProps } from "react";

export const badgeVariants = cva(
	"cn-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
	{
		variants: {
			variant: {
				default: "cn-badge-variant-default",
				secondary: "cn-badge-variant-secondary",
				destructive: "cn-badge-variant-destructive",
				outline: "cn-badge-variant-outline",
				ghost: "cn-badge-variant-ghost",
				link: "cn-badge-variant-link",
				label: "cn-badge-variant-label",
			},
		},
		defaultVariants: { variant: "default" },
	}
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
export type BadgeProps = { variant?: BadgeVariant; labelColor?: string } & (
	| (ComponentProps<"span"> & { href?: never })
	| (ComponentProps<"a"> & { href: string })
);

export function Badge({
	className,
	variant = "default",
	labelColor,
	children,
	...props
}: BadgeProps) {
	const classes = cn(badgeVariants({ variant }), className);
	const content = (
		<>
			{variant === "label" && labelColor && (
				<span
					aria-hidden="true"
					data-slot="badge-label-marker"
					className="grid size-3.5 shrink-0 place-items-center before:size-[9px] before:rounded-full before:bg-current"
					style={{ color: labelColor }}
				/>
			)}
			{children}
		</>
	);
	return props.href !== undefined ? (
		<a data-slot="badge" className={classes} {...props}>
			{content}
		</a>
	) : (
		<span data-slot="badge" className={classes} {...props}>
			{content}
		</span>
	);
}
