import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type SkeletonProps = Omit<ComponentProps<"div">, "children">;

export function Skeleton({ className, ...props }: SkeletonProps) {
	return (
		<div
			data-slot="skeleton"
			aria-hidden="true"
			className={cn("cn-skeleton animate-pulse motion-reduce:animate-none", className)}
			{...props}
		/>
	);
}
