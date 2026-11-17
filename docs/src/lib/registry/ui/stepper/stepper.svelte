<script lang="ts" module>
	import type { WithElementRef } from "$lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	export type StepperStep = {
		id: string;
		title: string;
		description?: string;
		disabled?: boolean;
		completed?: boolean;
		error?: string;
	};
	export type StepperContext = {
		step: StepperStep;
		index: number;
		active: boolean;
		pending: boolean;
		error: string;
		next: () => Promise<boolean>;
		previous: () => Promise<boolean>;
		goTo: (id: string) => Promise<boolean>;
	};
	export type StepperProps = WithElementRef<
		Omit<HTMLAttributes<HTMLDivElement>, "children" | "onchange">,
		HTMLDivElement
	> & {
		steps: StepperStep[];
		value?: string;
		defaultValue?: string;
		linear?: boolean;
		disabled?: boolean;
		orientation?: "horizontal" | "vertical";
		/** Read-only horizontal stage indicators with navigation in the step content. */
		appearance?: "default" | "import";
		beforeChange?: (
			from: string,
			to: string,
			signal: AbortSignal
		) => boolean | string | Promise<boolean | string>;
		onValueChange?: (value: string) => void;
		children?: Snippet<[StepperContext]>;
		/** Error and screen reader texts; each one replaces the Chinese default. */
		messages?: Partial<StepperMessages>;
	};
	export type StepperMessages = {
		incomplete: string;
		failed: string;
		validating: string;
		progress: (current: number, total: number) => string;
	};
	const DEFAULT_MESSAGES: StepperMessages = {
		incomplete: "请先完成此步骤再继续。",
		failed: "无法继续，请重试。",
		validating: "正在验证此步骤",
		progress: (current, total) => `第 ${current} 步，共 ${total} 步`
	};
</script>

<script lang="ts">
	import { onDestroy, tick, untrack } from "svelte";
	import { ScrollArea } from "$lib/registry/ui/scroll-area/index.js";
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		steps,
		defaultValue = steps.find((step) => !step.disabled)?.id ?? "",
		value = $bindable(defaultValue),
		linear = true,
		disabled = false,
		orientation = "horizontal",
		appearance = "default",
		beforeChange,
		onValueChange,
		children,
		messages: messageOverrides,
		class: className,
		...restProps
	}: StepperProps = $props();
	const uid = $props.id();
	const messages = $derived({ ...DEFAULT_MESSAGES, ...messageOverrides });
	const importRail = $derived(appearance === "import" && orientation === "horizontal");
	const topology = $derived(JSON.stringify(steps.map(({ id, disabled }) => [id, !!disabled])));
	const currentIndex = $derived(steps.findIndex((step) => step.id === value));
	let pending = $state(false);
	let error = $state("");
	const currentError = $derived(error || steps[currentIndex]?.error || "");
	let completed = $state<string[]>([]);
	let focused = $state("");
	let request = 0;
	let controller: AbortController | undefined;
	let lastValue = untrack(() => value);
	let lastTopology = untrack(() => topology);
	let lastGuard = untrack(() => beforeChange);
	let lastLinear = untrack(() => linear);
	let lastDisabled = untrack(() => disabled);
	let lastIndex = untrack(() => Math.max(0, currentIndex));
	let viewport = $state<HTMLElement | null>(null);

	function cancel() {
		request++;
		controller?.abort();
		controller = undefined;
		pending = false;
	}
	function update(id: string) {
		lastValue = id;
		value = id;
		focused = id;
		error = "";
		onValueChange?.(id);
	}
	$effect(() => {
		const current = value,
			signature = topology,
			guard = beforeChange,
			mode = linear,
			inactive = disabled;
		untrack(() => {
			if (
				current !== lastValue ||
				signature !== lastTopology ||
				guard !== lastGuard ||
				mode !== lastLinear ||
				inactive !== lastDisabled
			) {
				cancel();
				error = "";
				focused = "";
			}
			lastValue = current;
			lastTopology = signature;
			lastGuard = guard;
			lastLinear = mode;
			lastDisabled = inactive;
			if (currentIndex < 0 || steps[currentIndex]?.disabled) {
				const fallback =
					steps.slice(0, lastIndex).findLast((step) => !step.disabled) ??
					steps.find((step) => !step.disabled);
				if (value !== (fallback?.id ?? "")) update(fallback?.id ?? "");
			}
			lastIndex = Math.max(
				0,
				steps.findIndex((step) => step.id === value)
			);
			completed = completed.filter((id) => steps.some((step) => step.id === id));
		});
	});
	function reachable(index: number) {
		return index >= 0 && !steps[index]?.disabled && (!linear || index <= currentIndex + 1);
	}

	// All user and imperative navigation uses this gate; direct prop updates are trusted app state.
	export async function goTo(id: string): Promise<boolean> {
		const target = steps.findIndex((step) => step.id === id);
		if (disabled || !reachable(target)) return false;
		if (id === value) {
			if (pending) cancel();
			return false;
		}
		const forward = target > currentIndex;
		if (forward && pending) return false;
		cancel();
		const token = request;
		const origin = value;
		const signature = topology;
		if (forward) {
			controller = new AbortController();
			pending = true;
			error = "";
			try {
				const result = await (beforeChange?.(origin, id, controller.signal) ?? true);
				if (token !== request || value !== origin || topology !== signature || disabled)
					return false;
				if (result !== true) {
					error = typeof result === "string" ? result : messages.incomplete;
					return false;
				}
				completed = [...new Set([...completed, origin])];
			} catch (cause) {
				if (token === request && value === origin && topology === signature)
					error = cause instanceof Error ? cause.message : messages.failed;
				return false;
			} finally {
				if (token === request) {
					pending = false;
					controller = undefined;
				}
			}
		}
		if (token !== request) return false;
		update(id);
		await tick();
		if (token === request && value === id) document.getElementById(panelId(id))?.focus();
		return true;
	}
	export function next() {
		return goTo(steps[currentIndex + 1]?.id ?? "");
	}
	export function previous() {
		return goTo(steps[currentIndex - 1]?.id ?? "");
	}
	function triggerId(id: string) {
		return `${uid}-trigger-${encodeURIComponent(id)}`;
	}
	function panelId(id: string) {
		return `${uid}-panel-${encodeURIComponent(id)}`;
	}
	function stateOf(step: StepperStep) {
		if (step.error || (step.id === value && error)) return "error";
		if (step.id === value) return "active";
		return step.completed || completed.includes(step.id) ? "completed" : "inactive";
	}
	$effect(() => {
		const track = viewport;
		const active = value;
		if (!track || !active) return;
		const marker = document.getElementById(triggerId(active));
		if (!marker || !track.contains(marker)) return;
		const outer = track.getBoundingClientRect();
		const inner = marker.getBoundingClientRect();
		if (inner.left < outer.left) track.scrollLeft += inner.left - outer.left;
		else if (inner.right > outer.right) track.scrollLeft += inner.right - outer.right;
	});
	function keydown(event: KeyboardEvent, index: number) {
		if (event.isComposing) return;
		const rtl = ref && getComputedStyle(ref).direction === "rtl";
		const nextKey = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const prevKey = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		if (![nextKey, prevKey, "Home", "End"].includes(event.key)) return;
		event.preventDefault();
		const available = steps
			.map((_, i) => i)
			.filter((i) => reachable(i) && !(pending && i > currentIndex));
		const position = available.indexOf(index);
		const target =
			event.key === "Home"
				? available[0]
				: event.key === "End"
					? available.at(-1)
					: available[position + (event.key === nextKey ? 1 : -1)];
		if (target !== undefined) document.getElementById(triggerId(steps[target].id))?.focus();
	}
	onDestroy(() => {
		request++;
		controller?.abort();
	});
</script>

<div
	{...restProps}
	bind:this={ref}
	role="group"
	aria-label={restProps["aria-label"] ?? "步骤进度"}
	aria-busy={pending}
	data-slot="stepper"
	data-orientation={orientation}
	data-appearance={importRail ? "import" : undefined}
	class={cn("grid w-full min-w-0 gap-5 text-foreground", "cn-stepper", className)}
>
	{#if importRail}
		<ScrollArea
			bind:viewportRef={viewport}
			dir={restProps.dir === "rtl" ? "rtl" : undefined}
			orientation="horizontal"
			type="hover"
			viewportLabel={restProps["aria-label"] ?? "步骤进度"}
			class="w-full min-w-0"
		>
			<ol
				data-slot="stepper-rail"
				class="grid w-full grid-flow-col auto-cols-[minmax(5.5rem,1fr)] pt-[29px] pb-5 [--stepper-rail-accent:lch(53%_52.26_286.91)] [--stepper-rail-line:lch(86.5%_0_282)] [--stepper-rail-surface:white] [--stepper-rail-muted:lch(40%_1_282)] [--stepper-rail-current:lch(20%_1_282)] dark:[--stepper-rail-accent:lch(47.918%_59.303_288.421)] dark:[--stepper-rail-line:lch(20.032%_1.93_272)] dark:[--stepper-rail-surface:lch(9.232%_.85_272)] dark:[--stepper-rail-muted:lch(63.304%_1.425_272)] dark:[--stepper-rail-current:lch(90.826%_1.425_272)]"
			>
				{#each steps as step, index (step.id)}
					{@const state = stateOf(step)}
					{@const selected = step.id === value}
					<li
						id={triggerId(step.id)}
						data-slot="stepper-stage"
						data-state={state}
						aria-current={selected ? "step" : undefined}
						aria-describedby={selected && currentError ? `${uid}-error` : undefined}
						class="relative grid min-w-0 grid-rows-[1fr_auto] gap-[10px] text-center"
					>
						<div
							data-slot="stepper-stage-label"
							class={cn(
								"min-w-0 self-end px-2 text-[11px]/[13px] font-medium wrap-anywhere",
								selected
									? "text-(color:--stepper-rail-current)"
									: "text-(color:--stepper-rail-muted)"
							)}
						>
							{step.title}
							{#if step.description}<span class="sr-only">{step.description}</span>{/if}
						</div>
						<div aria-hidden="true" class="relative grid place-items-center">
							{#if index < steps.length - 1}
								<span
									data-slot="stepper-connector"
									class={cn(
										"absolute start-1/2 top-1/2 h-0.5 w-full -translate-y-1/2",
										state === "completed"
											? "bg-(--stepper-rail-accent)"
											: "bg-(--stepper-rail-line)"
									)}
								></span>
							{/if}
							<span
								data-slot="stepper-marker"
								class={cn(
									"relative z-10 grid size-3 place-items-center rounded-full border",
									state === "completed"
										? "border-(--stepper-rail-accent) bg-(--stepper-rail-accent) text-white"
										: "bg-(--stepper-rail-surface)",
									selected && "border-(--stepper-rail-accent)",
									!selected && state !== "completed" && "border-(--stepper-rail-line)"
								)}
							>
								{#if state === "completed"}
									<span class="h-1.5 w-1 -translate-y-px rotate-45 border-r border-b border-current"></span>
								{:else if selected}
									<span class="size-[2.25px] rounded-full bg-(--stepper-rail-current)"></span>
								{/if}
							</span>
						</div>
					</li>
				{/each}
			</ol>
		</ScrollArea>
	{:else}
		<ol
			class={cn(
				"flex min-w-0 gap-3",
				orientation === "vertical" ? "flex-col" : "flex-col sm:flex-row"
			)}
		>
			{#each steps as step, index (step.id)}
				{@const state = stateOf(step)}
				<li class="min-w-0 flex-1">
					<button
						type="button"
						id={triggerId(step.id)}
						data-slot="stepper-trigger"
						data-state={state}
						aria-current={step.id === value ? "step" : undefined}
						aria-controls={panelId(step.id)}
						aria-describedby={[
							step.description ? `${triggerId(step.id)}-description` : "",
							step.id === value && currentError ? `${uid}-error` : ""
						]
							.filter(Boolean)
							.join(" ") || undefined}
						disabled={disabled || !reachable(index) || (pending && index > currentIndex)}
						tabindex={(focused || value) === step.id ? 0 : -1}
						class={cn(
							"flex w-full items-start gap-3 rounded-md border border-border bg-background p-3 text-start text-sm outline-none hover:bg-muted focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40 data-[state=active]:border-primary data-[state=error]:border-destructive",
							"cn-stepper-trigger"
						)}
						onclick={() => goTo(step.id)}
						onkeydown={(event) => keydown(event, index)}
						onfocus={() => (focused = step.id)}
					>
						<span
							aria-hidden="true"
							class={cn(
								"flex size-7 shrink-0 items-center justify-center rounded-full border",
								state === "active" || state === "completed"
									? "border-primary bg-primary text-primary-foreground"
									: state === "error"
										? "border-destructive text-destructive"
										: "border-border text-muted-foreground"
							)}>{state === "completed" ? "✓" : state === "error" ? "!" : index + 1}</span
						>
						<span class="grid min-w-0 gap-1"
							><span class="font-medium break-words">{step.title}</span>{#if step.description}<span
									id={`${triggerId(step.id)}-description`}
									class="text-xs break-words text-muted-foreground">{step.description}</span
								>{/if}</span
						>
					</button>
				</li>
			{/each}
		</ol>
	{/if}
	<p class="sr-only" aria-live="polite">
		{pending ? messages.validating : messages.progress(currentIndex + 1, steps.length)}
	</p>
	{#if currentError}<p id={`${uid}-error`} role="alert" class="text-sm text-destructive">
			{currentError}
		</p>{/if}
	{#each steps as step, index (step.id)}
		<section
			id={panelId(step.id)}
			aria-labelledby={triggerId(step.id)}
			tabindex="-1"
			hidden={step.id !== value}
			class="min-w-0 rounded-md outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
			data-slot="stepper-content"
		>
			{@render children?.({
				step,
				index,
				active: step.id === value,
				pending,
				error: step.id === value ? currentError : (step.error ?? ""),
				next,
				previous,
				goTo
			})}
		</section>
	{/each}
</div>
