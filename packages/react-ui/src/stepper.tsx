"use client";

import { isComposing } from "@ui-sdk/core";
import * as React from "react";
import { cn } from "cn";

export interface StepperStep {
	id: string;
	title: string;
	description?: string;
	disabled?: boolean;
	completed?: boolean;
	error?: string;
}

export interface StepperHandle {
	goTo: (id: string) => Promise<boolean>;
	next: () => Promise<boolean>;
	previous: () => Promise<boolean>;
}

export interface StepperContext extends StepperHandle {
	step: StepperStep;
	index: number;
	active: boolean;
	pending: boolean;
	error: string;
}

export interface StepperMessages {
	incomplete: string;
	failed: string;
	validating: string;
	progress: (current: number, total: number) => string;
}

export interface StepperProps extends Omit<React.ComponentProps<"div">, "children" | "onChange"> {
	steps: readonly StepperStep[];
	value?: string;
	defaultValue?: string;
	linear?: boolean;
	disabled?: boolean;
	orientation?: "horizontal" | "vertical";
	beforeChange?: (
		from: string,
		to: string,
		signal: AbortSignal
	) => boolean | string | Promise<boolean | string>;
	onValueChange?: (value: string) => void;
	children?: (context: StepperContext) => React.ReactNode;
	messages?: Partial<StepperMessages>;
	/** Validated navigation actions; the regular ref points to the root div. */
	apiRef?: React.Ref<StepperHandle>;
}

const DEFAULT_MESSAGES: StepperMessages = {
	incomplete: "请先完成此步骤再继续。",
	failed: "无法继续，请重试。",
	validating: "正在验证此步骤",
	progress: (current, total) => `第 ${current} 步，共 ${total} 步`,
};

export function Stepper({
	steps,
	value: controlledValue,
	defaultValue,
	linear = true,
	disabled = false,
	orientation = "horizontal",
	beforeChange,
	onValueChange,
	messages: overrides,
	children,
	apiRef,
	ref,
	className,
	"aria-label": label = "步骤进度",
	...props
}: StepperProps) {
	const uid = React.useId();
	const root = React.useRef<HTMLDivElement>(null);
	const [uncontrolledValue, setValue] = React.useState(
		() => defaultValue ?? steps.find((step) => !step.disabled)?.id ?? ""
	);
	const value = controlledValue ?? uncontrolledValue;
	const topology = JSON.stringify(steps.map(({ id, disabled }) => [id, !!disabled]));
	const currentIndex = steps.findIndex((step) => step.id === value);
	const messages = { ...DEFAULT_MESSAGES, ...overrides };
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState("");
	const [focused, setFocused] = React.useState("");
	const [completed, setCompleted] = React.useState<string[]>([]);
	const [arrival, setArrival] = React.useState<{ id: string; token: number; complete?: string }>();
	const request = React.useRef(0);
	const controller = React.useRef<AbortController | undefined>(undefined);
	const lastIndex = React.useRef(Math.max(0, currentIndex));
	const lastRepair = React.useRef<string | undefined>(undefined);
	const currentError = error || steps[currentIndex]?.error || "";
	const frame = {
		steps,
		value,
		controlledValue,
		topology,
		currentIndex,
		linear,
		disabled,
		beforeChange,
		onValueChange,
		messages,
	};
	const latest = React.useRef(frame);
	const triggerId = (id: string) => `${uid}-trigger-${encodeURIComponent(id)}`;
	const panelId = (id: string) => `${uid}-panel-${encodeURIComponent(id)}`;

	const invalidate = React.useCallback(() => {
		request.current++;
		controller.current?.abort();
		controller.current = undefined;
	}, []);

	React.useLayoutEffect(() => invalidate, [invalidate]);
	React.useLayoutEffect(() => {
		const last = latest.current;
		latest.current = frame;
		const arrived = arrival?.token === request.current && arrival.id === value;
		const criteriaChanged =
			last.topology !== topology ||
			last.beforeChange !== beforeChange ||
			last.linear !== linear ||
			last.disabled !== disabled;
		if (criteriaChanged || last.value !== value) {
			invalidate();
			setPending(false);
			setError("");
			if (!arrived) setFocused("");
		}
		if (last.topology !== topology) {
			setCompleted((ids) => ids.filter((id) => steps.some((step) => step.id === id)));
		}
		if (currentIndex < 0 || steps[currentIndex]?.disabled) {
			const fallback =
				steps
					.slice(0, lastIndex.current)
					.reverse()
					.find((step) => !step.disabled) ?? steps.find((step) => !step.disabled);
			const next = fallback?.id ?? "";
			const repair = JSON.stringify([value, topology]);
			if (next !== value && lastRepair.current !== repair) {
				lastRepair.current = repair;
				if (controlledValue === undefined) setValue(next);
				onValueChange?.(next);
			}
			lastIndex.current = Math.max(
				0,
				steps.findIndex((step) => step.id === next)
			);
		} else {
			lastRepair.current = undefined;
			lastIndex.current = currentIndex;
			if (arrived && !disabled) {
				const origin = arrival.complete;
				if (origin && steps.some((step) => step.id === origin)) {
					setCompleted((ids) => (ids.includes(origin) ? ids : [...ids, origin]));
				}
				root.current?.querySelector<HTMLElement>(`[id="${panelId(value)}"]`)?.focus();
			}
		}
		if (arrival) setArrival(undefined);
	});

	const goTo = React.useCallback(
		async (id: string) => {
			const start = latest.current;
			const target = start.steps.findIndex((step) => step.id === id);
			if (!root.current || start.disabled || !reachable(start, target)) return false;
			if (id === start.value) {
				if (controller.current) {
					invalidate();
					setPending(false);
				}
				return false;
			}
			const forward = target > start.currentIndex;
			if (forward && controller.current) return false;
			invalidate();
			const token = request.current;
			setError("");
			if (forward) {
				const validation = new AbortController();
				controller.current = validation;
				setPending(true);
				try {
					const result = await (start.beforeChange?.(start.value, id, validation.signal) ?? true);
					if (token !== request.current) return false;
					if (result !== true) {
						setError(typeof result === "string" ? result : latest.current.messages.incomplete);
						return false;
					}
				} catch (cause) {
					if (token === request.current)
						setError(cause instanceof Error ? cause.message : latest.current.messages.failed);
					return false;
				} finally {
					if (token === request.current) {
						controller.current = undefined;
						setPending(false);
					}
				}
			} else {
				setPending(false);
			}
			const current = latest.current;
			setArrival({
				id,
				token,
				complete: forward && current.controlledValue !== undefined ? start.value : undefined,
			});
			setFocused(id);
			if (current.controlledValue === undefined) {
				if (forward && start.value) {
					setCompleted((ids) => (ids.includes(start.value) ? ids : [...ids, start.value]));
				}
				latest.current = { ...current, value: id, currentIndex: target };
				setValue(id);
			}
			current.onValueChange?.(id);
			return true;
		},
		[invalidate]
	);
	const actions = React.useMemo<StepperHandle>(
		() => ({
			goTo,
			next: () => goTo(latest.current.steps[latest.current.currentIndex + 1]?.id ?? ""),
			previous: () => goTo(latest.current.steps[latest.current.currentIndex - 1]?.id ?? ""),
		}),
		[goTo]
	);
	React.useImperativeHandle(apiRef, () => actions, [actions]);
	React.useImperativeHandle(ref, () => root.current!, []);

	const available = (index: number) =>
		!disabled && reachable(frame, index) && !(pending && index > currentIndex);
	const roving = available(steps.findIndex((step) => step.id === focused)) ? focused : value;
	function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
		if (event.defaultPrevented || isComposing(event.nativeEvent)) return;
		const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
		const nextKey = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const previousKey = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		if (![nextKey, previousKey, "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const indices = steps.map((_, i) => i).filter(available);
		const position = indices.indexOf(index);
		const target =
			event.key === "Home"
				? indices[0]
				: event.key === "End"
					? indices.at(-1)
					: indices[position + (event.key === nextKey ? 1 : -1)];
		if (target !== undefined)
			root.current?.querySelector<HTMLElement>(`[id="${triggerId(steps[target].id)}"]`)?.focus();
	}

	return (
		<div
			{...props}
			ref={root}
			role="group"
			aria-label={label}
			aria-busy={pending}
			data-slot="stepper"
			data-orientation={orientation}
			className={cn("grid w-full min-w-0 gap-4 text-foreground", className)}
		>
			<ol
				className={cn(
					"flex min-w-0 gap-2",
					orientation === "vertical" ? "flex-col" : "flex-col sm:flex-row"
				)}
			>
				{steps.map((step, index) => {
					const active = step.id === value;
					const state = (active ? currentError : step.error)
						? "error"
						: active
							? "active"
							: step.completed || completed.includes(step.id)
								? "completed"
								: "inactive";
					const id = triggerId(step.id);
					return (
						<li key={step.id} className="min-w-0 flex-1">
							<button
								type="button"
								id={id}
								data-slot="stepper-trigger"
								data-state={state}
								aria-current={active ? "step" : undefined}
								aria-controls={panelId(step.id)}
								aria-labelledby={`${id}-title`}
								aria-describedby={
									[
										step.description && `${id}-description`,
										active && currentError && `${uid}-error`,
									]
										.filter(Boolean)
										.join(" ") || undefined
								}
								disabled={!available(index)}
								tabIndex={available(index) && roving === step.id ? 0 : -1}
								className="flex w-full items-start gap-2.5 rounded-[10px] border-[0.5px] border-border bg-card p-3 text-start text-[13px] transition-colors duration-150 outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-45 data-[state=active]:border-primary data-[state=active]:bg-primary/[0.04] data-[state=error]:border-destructive motion-reduce:transition-none dark:data-[state=active]:bg-primary/[0.08]"
								onClick={() => void goTo(step.id)}
								onKeyDown={(event) => onKeyDown(event, index)}
								onFocus={() => setFocused(step.id)}
							>
								<span
									aria-hidden="true"
									className={cn(
										"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[0.5px] text-[11px] font-medium tabular-nums",
										state === "active" || state === "completed"
											? "border-primary bg-primary text-primary-foreground"
											: state === "error"
												? "border-destructive text-destructive"
												: "border-border text-muted-foreground"
									)}
								>
									{state === "completed" ? "✓" : state === "error" ? "!" : index + 1}
								</span>
								<span className="grid min-w-0 gap-0.5">
									<span
										id={`${id}-title`}
										className="text-[13px] leading-[18px] font-medium wrap-anywhere"
									>
										{step.title}
									</span>
									{step.description && (
										<span
											id={`${id}-description`}
											className="text-xs leading-[16px] wrap-anywhere text-muted-foreground"
										>
											{step.description}
										</span>
									)}
								</span>
							</button>
						</li>
					);
				})}
			</ol>
			<p className="sr-only" aria-live="polite">
				{pending ? messages.validating : messages.progress(currentIndex + 1, steps.length)}
			</p>
			{currentError && (
				<p id={`${uid}-error`} role="alert" className="text-xs text-destructive">
					{currentError}
				</p>
			)}
			{steps.map((step, index) => (
				<section
					key={step.id}
					id={panelId(step.id)}
					aria-labelledby={triggerId(step.id)}
					tabIndex={-1}
					hidden={step.id !== value}
					data-slot="stepper-content"
					className="min-w-0 rounded-[8px] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
				>
					{children?.({
						step,
						index,
						active: step.id === value,
						pending,
						error: step.id === value ? currentError : (step.error ?? ""),
						...actions,
					})}
				</section>
			))}
		</div>
	);
}

function reachable(
	{
		steps,
		linear,
		currentIndex,
	}: { steps: readonly StepperStep[]; linear: boolean; currentIndex: number },
	index: number
) {
	return index >= 0 && !steps[index]?.disabled && (!linear || index <= currentIndex + 1);
}
