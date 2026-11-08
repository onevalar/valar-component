import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "radix-ui";

const buttonVariants = cva(
	"cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "cn-button-variant-default",
				outline: "cn-button-variant-outline",
				secondary: "cn-button-variant-secondary",
				ghost: "cn-button-variant-ghost",
				destructive: "cn-button-variant-destructive",
				link: "cn-button-variant-link",
			},
			size: {
				default: "cn-button-size-default",
				xs: "cn-button-size-xs",
				sm: "cn-button-size-sm",
				lg: "cn-button-size-lg",
				icon: "cn-button-size-icon",
				"icon-xs": "cn-button-size-icon-xs",
				"icon-sm": "cn-button-size-icon-sm",
				"icon-lg": "cn-button-size-icon-lg",
			},
			shape: {
				auto: "",
				pill: "not-in-data-[slot=button-group]:rounded-full",
				square: "",
			},
		},
		compoundVariants: [
			{
				size: ["icon", "icon-xs", "icon-sm", "icon-lg"],
				shape: "auto",
				className: "not-in-data-[slot=button-group]:rounded-full",
			},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
			shape: "auto",
		},
	}
);

type ButtonProps = VariantProps<typeof buttonVariants> & { asChild?: boolean } & (
		| (React.ComponentProps<"button"> & { href?: never })
		| (React.ComponentProps<"a"> & { href: string; disabled?: boolean })
	);

function Button({
	className,
	variant = "default",
	size = "default",
	shape = "auto",
	asChild = false,
	...props
}: ButtonProps) {
	const classes = cn(
		buttonVariants({ variant, size, shape, className }),
		props.disabled && "opacity-50"
	);
	if (props.href !== undefined) {
		const { disabled, href, onClick, tabIndex, ...anchor } = props;
		return (
			<a
				{...anchor}
				data-slot="button"
				data-variant={variant}
				data-size={size}
				className={classes}
				href={disabled ? undefined : href}
				aria-disabled={disabled || undefined}
				role={disabled ? "link" : anchor.role}
				tabIndex={disabled ? -1 : tabIndex}
				onClick={
					disabled
						? (event) => {
								event.preventDefault();
							}
						: onClick
				}
			/>
		);
	}

	const Comp = asChild ? Slot.Root : "button";
	// Slot normally lets child props win. Remove a disabled anchor's actual href
	// and click callback as well, so asChild cannot accidentally restore navigation.
	const { children, type = "button", onClick, ...button } = props as React.ComponentProps<"button">;
	const anchorChild =
		asChild &&
		React.isValidElement<React.ComponentProps<"a">>(children) &&
		(children.type === "a" || children.props.href !== undefined);
	const child =
		anchorChild && button.disabled
			? React.cloneElement(children, {
					href: undefined,
					"aria-disabled": true,
					role: "link",
					tabIndex: -1,
					onClick: (event) => {
						event.preventDefault();
					},
				})
			: children;

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={classes}
			{...button}
			disabled={anchorChild ? undefined : button.disabled}
			onClick={
				asChild && button.disabled
					? (event) => {
							event.preventDefault();
						}
					: onClick
			}
			type={asChild ? props.type : type}
		>
			{child}
		</Comp>
	);
}

export { Button, buttonVariants };
export type { ButtonProps };
