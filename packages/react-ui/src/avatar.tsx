"use client";

import * as React from "react";
import { cn } from "cn";
import { Avatar as AvatarPrimitive } from "radix-ui";

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: "default" | "sm" | "lg";
	appearance?: "default" | "subscriber" | "member";
	style?: React.CSSProperties & { "--valar-avatar-subscriber-color"?: string };
};

export function Avatar({
	className,
	size = "default",
	appearance = "default",
	...props
}: AvatarProps) {
	return (
		<AvatarPrimitive.Root
			data-slot="avatar"
			data-size={size}
			data-appearance={appearance}
			className={cn(
				"cn-avatar group/avatar relative flex shrink-0 select-none after:pointer-events-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
				appearance === "subscriber" && "cn-avatar-subscriber",
				appearance === "member" && "cn-avatar-member",
				className
			)}
			{...props}
		/>
	);
}

export type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image> & { alt: string };
export type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback>;
export type AvatarBadgeProps = React.ComponentProps<"span">;
export type AvatarGroupProps = React.ComponentProps<"div">;
export type AvatarGroupCountProps = React.ComponentProps<"div">;

export function AvatarImage({ className, ...props }: AvatarImageProps) {
	return (
		<AvatarPrimitive.Image
			data-slot="avatar-image"
			className={cn("cn-avatar-image aspect-square size-full object-cover", className)}
			{...props}
		/>
	);
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
	return (
		<AvatarPrimitive.Fallback
			data-slot="avatar-fallback"
			className={cn(
				"cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
				className
			)}
			{...props}
		/>
	);
}

export function AvatarBadge({ className, ...props }: AvatarBadgeProps) {
	return (
		<span
			data-slot="avatar-badge"
			className={cn(
				"cn-avatar-badge absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-blend-color ring-2 select-none",
				"group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
				"group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
				"group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
				className
			)}
			{...props}
		/>
	);
}

export function AvatarGroup({ className, ...props }: AvatarGroupProps) {
	return (
		<div
			data-slot="avatar-group"
			className={cn(
				"cn-avatar-group group/avatar-group flex max-w-full flex-wrap gap-y-1 ps-2 *:-ms-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
				className
			)}
			{...props}
		/>
	);
}

export function AvatarGroupCount({ className, ...props }: AvatarGroupCountProps) {
	return (
		<div
			data-slot="avatar-group-count"
			className={cn(
				"cn-avatar-group-count relative flex shrink-0 items-center justify-center ring-2 ring-background",
				className
			)}
			{...props}
		/>
	);
}
