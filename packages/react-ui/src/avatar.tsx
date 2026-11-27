"use client";

import * as React from "react";
import {
	Avatar as SdkAvatar,
	AvatarImage as SdkAvatarImage,
	AvatarFallback as SdkAvatarFallback,
	type AvatarLoadingStatus,
} from "@ui-sdk/react/avatar";
import { cn } from "cn";
import { Avatar as AvatarPrimitive, Slot } from "radix-ui";

const LegacyAvatar = React.createContext(true);

export type AvatarProps = React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: "default" | "sm" | "lg";
	appearance?: "default" | "subscriber" | "member";
	style?: React.CSSProperties & { "--valar-avatar-subscriber-color"?: string };
};

export function Avatar({
	className,
	size = "default",
	appearance = "default",
	asChild,
	...props
}: AvatarProps) {
	const shared = {
		"data-slot": "avatar",
		"data-size": size,
		"data-appearance": appearance,
		className: cn(
			"cn-avatar group/avatar relative flex shrink-0 select-none after:pointer-events-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
			appearance === "subscriber" && "cn-avatar-subscriber",
			appearance === "member" && "cn-avatar-member",
			className
		),
	};
	const { children, ...root } = props;
	return (
		<LegacyAvatar.Provider value={false}>
			<SdkAvatar
				{...shared}
				{...root}
				render={asChild ? (attributes) => <Slot.Root {...attributes} /> : undefined}
			>
				{children}
			</SdkAvatar>
		</LegacyAvatar.Provider>
	);
}

export type AvatarImageProps = React.ComponentProps<typeof AvatarPrimitive.Image> & { alt: string };
export type AvatarFallbackProps = React.ComponentProps<typeof AvatarPrimitive.Fallback>;
export type AvatarBadgeProps = React.ComponentProps<"span">;
export type AvatarGroupProps = React.ComponentProps<"div">;
export type AvatarGroupCountProps = React.ComponentProps<"div">;

export function AvatarImage({ className, ...props }: AvatarImageProps) {
	const legacy = React.useContext(LegacyAvatar);
	const classes = cn("cn-avatar-image aspect-square size-full object-cover", className);
	if (legacy)
		return <AvatarPrimitive.Image data-slot="avatar-image" className={classes} {...props} />;
	const { asChild, onLoadingStatusChange, src, ...image } = props;
	return (
		<SdkAvatarImage
			data-slot="avatar-image"
			className={classes}
			{...image}
			src={src || undefined}
			render={
				onLoadingStatusChange
					? (attributes, state) => (
							<AvatarImageStatus
								attributes={attributes}
								status={state.loadingStatus}
								asChild={asChild}
								onChange={onLoadingStatusChange}
							/>
						)
					: asChild
						? (attributes) => <Slot.Root {...attributes} />
						: undefined
			}
		/>
	);
}

function AvatarImageStatus({
	attributes,
	status,
	asChild,
	onChange,
}: {
	attributes: React.ComponentProps<"img">;
	status: AvatarLoadingStatus;
	asChild?: boolean;
	onChange: NonNullable<AvatarImageProps["onLoadingStatusChange"]>;
}) {
	const previous = React.useRef<AvatarLoadingStatus>("idle");
	React.useEffect(() => {
		if (previous.current === status) return;
		previous.current = status;
		onChange(status);
	}, [status, onChange]);
	const Element = asChild ? Slot.Root : "img";
	return <Element {...attributes} />;
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
	const legacy = React.useContext(LegacyAvatar);
	const classes = cn(
		"cn-avatar-fallback flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
		className
	);
	if (legacy)
		return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={classes} {...props} />;
	const { delayMs, asChild, ...fallback } = props;
	return (
		<SdkAvatarFallback
			data-slot="avatar-fallback"
			className={classes}
			{...fallback}
			delay={delayMs}
			render={asChild ? (attributes) => <Slot.Root {...attributes} /> : undefined}
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
