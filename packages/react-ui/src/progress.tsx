import { cn } from "cn";
import React, { type ComponentProps } from "react";

export type ProgressAppearance = "default" | "project";
export type ProgressProps = Omit<ComponentProps<"div">, "children"> & {
	appearance?: ProgressAppearance;
	min?: number;
	max?: number;
	value?: number | null;
};

export function Progress({
	className,
	appearance = "default",
	min = 0,
	max = 100,
	value = 0,
	...props
}: ProgressProps) {
	const lower = Number.isFinite(min) ? min : 0;
	const upper = Math.max(lower, Number.isFinite(max) ? max : 100);
	const current =
		value === null ? null : Math.min(upper, Math.max(lower, Number.isNaN(value) ? lower : value));
	const indeterminate = current === null;
	const fraction = !indeterminate && upper > lower ? (current - lower) / (upper - lower) : 0;
	const project = appearance === "project";
	return (
		<div
			role="progressbar"
			aria-valuemin={lower}
			aria-valuemax={upper}
			aria-valuenow={current ?? undefined}
			data-slot="progress"
			data-appearance={project ? "project" : undefined}
			data-state={indeterminate ? "indeterminate" : current === upper ? "loaded" : "loading"}
			data-value={current ?? undefined}
			data-min={lower}
			data-max={upper}
			data-indeterminate={indeterminate ? "" : undefined}
			className={cn(
				"cn-progress relative flex w-full items-center overflow-x-hidden",
				project && "cn-progress-project",
				className
			)}
			{...props}
		>
			{project ? (
				<span aria-hidden="true">{indeterminate ? "—" : `${Math.round(fraction * 100)}%`}</span>
			) : (
				<div
					data-slot="progress-indicator"
					data-indeterminate={indeterminate ? "" : undefined}
					className="cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none"
					style={{ width: indeterminate ? "35%" : `${fraction * 100}%` }}
				/>
			)}
		</div>
	);
}
