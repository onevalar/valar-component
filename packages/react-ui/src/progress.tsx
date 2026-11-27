import { Progress as SdkProgress, ProgressIndicator, ProgressValue } from "@ui-sdk/react/progress";
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
	const project = appearance === "project";
	return (
		<SdkProgress
			min={lower}
			max={upper}
			value={current}
			getValueLabel={upper === lower && !indeterminate ? () => "0%" : undefined}
			data-slot="progress"
			data-appearance={project ? "project" : undefined}
			data-state={indeterminate ? "indeterminate" : current === upper ? "loaded" : "loading"}
			data-value={current ?? undefined}
			data-min={lower}
			data-max={upper}
			className={cn(
				"cn-progress relative flex w-full items-center overflow-x-hidden",
				project && "cn-progress-project",
				className
			)}
			{...props}
		>
			{project ? (
				<ProgressValue aria-hidden="true">
					{({ percent }) =>
						percent === null ? "—" : `${upper === lower ? 0 : Math.round(percent)}%`
					}
				</ProgressValue>
			) : (
				<ProgressIndicator
					data-slot="progress-indicator"
					className={cn(
						"cn-progress-indicator h-full shrink-0 rounded-[inherit] transition-[width] duration-150 data-indeterminate:mx-auto motion-safe:data-indeterminate:animate-pulse motion-reduce:transition-none",
						upper === lower && !indeterminate && "w-0!"
					)}
					style={indeterminate ? { width: "35%" } : undefined}
				/>
			)}
		</SdkProgress>
	);
}
