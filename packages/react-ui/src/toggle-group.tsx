"use client";

import { cn } from "cn";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import React, { createContext, useContext, type ComponentProps, type CSSProperties } from "react";
import { toggleVariants, type ToggleVariants } from "./toggle.tsx";

type ToggleGroupAppearance = "default" | "toolbar";
type ToggleGroupStyles = ToggleVariants & { appearance?: ToggleGroupAppearance; spacing?: number };
const ToggleGroupContext = createContext<ToggleGroupStyles>({});

export function ToggleGroup({
	className,
	style,
	appearance = "default",
	variant = "default",
	size = "default",
	spacing = appearance === "toolbar" ? 1.5 : 0,
	orientation = "horizontal",
	role,
	...props
}: ComponentProps<typeof ToggleGroupPrimitive.Root> & ToggleGroupStyles) {
	return (
		<ToggleGroupContext.Provider value={{ appearance, variant, size, spacing }}>
			<ToggleGroupPrimitive.Root
				data-slot="toggle-group"
				data-appearance={appearance}
				data-variant={variant}
				data-size={size}
				data-spacing={spacing}
				data-orientation={orientation}
				orientation={orientation}
				role={role ?? (props.type === "single" ? "radiogroup" : "group")}
				className={cn(
					"cn-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch",
					className
				)}
				style={{ "--gap": spacing, ...style } as CSSProperties}
				{...props}
			/>
		</ToggleGroupContext.Provider>
	);
}

export function ToggleGroupItem({
	className,
	variant: itemVariant,
	size: itemSize,
	...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> & ToggleVariants) {
	const {
		appearance,
		variant = itemVariant,
		size = itemSize,
		spacing,
	} = useContext(ToggleGroupContext);
	return (
		<ToggleGroupPrimitive.Item
			data-slot="toggle-group-item"
			data-variant={variant}
			data-size={size}
			data-spacing={spacing}
			className={
				appearance === "toolbar"
					? cn("cn-toggle-group-toolbar-item", className)
					: cn(
							"cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s-[0.5px] group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t-[0.5px]",
							"rtl:group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-r-lg rtl:group-data-horizontal/toggle-group:data-[spacing=0]:first:not-last:rounded-l-none rtl:group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-l-lg rtl:group-data-horizontal/toggle-group:data-[spacing=0]:last:not-first:rounded-r-none",
							toggleVariants({ variant, size }),
							className
						)
			}
			{...props}
		/>
	);
}
