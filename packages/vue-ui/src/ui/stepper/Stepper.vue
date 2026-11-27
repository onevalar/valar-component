<script lang="ts">
import type { HTMLAttributes } from "vue";

export interface StepperStep {
	id: string;
	title: string;
	description?: string;
	disabled?: boolean;
	completed?: boolean;
	error?: string;
}

export interface StepperHandle {
	element: HTMLDivElement | null;
	goTo: (id: string) => Promise<boolean>;
	next: () => Promise<boolean>;
	previous: () => Promise<boolean>;
}

export interface StepperContext extends Omit<StepperHandle, "element"> {
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

export interface StepperProps {
	steps: readonly StepperStep[];
	modelValue?: string;
	defaultValue?: string;
	linear?: boolean;
	disabled?: boolean;
	orientation?: "horizontal" | "vertical";
	beforeChange?: (
		from: string,
		to: string,
		signal: AbortSignal
	) => boolean | string | Promise<boolean | string>;
	messages?: Partial<StepperMessages>;
	class?: HTMLAttributes["class"];
}

const DEFAULT_MESSAGES: StepperMessages = {
	incomplete: "请先完成此步骤再继续。",
	failed: "无法继续，请重试。",
	validating: "正在验证此步骤",
	progress: (current, total) => `第 ${current} 步，共 ${total} 步`,
};
</script>

<script setup lang="ts">
import { cn } from "cn";
import {
	computed,
	nextTick,
	onBeforeMount,
	onBeforeUnmount,
	ref,
	useId,
	useTemplateRef,
	watch,
} from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<StepperProps>(), {
	linear: true,
	orientation: "horizontal",
});
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();
defineSlots<{ default?: (props: StepperContext) => unknown }>();

const uid = useId();
const element = useTemplateRef<HTMLDivElement>("root");
const localValue = ref(props.defaultValue ?? props.steps.find((step) => !step.disabled)?.id ?? "");
const value = computed(() => props.modelValue ?? localValue.value);
const topology = computed(() =>
	JSON.stringify(props.steps.map(({ id, disabled }) => [id, !!disabled]))
);
const currentIndex = computed(() => props.steps.findIndex((step) => step.id === value.value));
const messages = computed(() => ({ ...DEFAULT_MESSAGES, ...props.messages }));
const pending = ref(false);
const error = ref("");
const currentError = computed(() => error.value || props.steps[currentIndex.value]?.error || "");
const completed = ref<string[]>([]);
const focused = ref("");
let lastIndex = Math.max(0, currentIndex.value);
let lastRepair: string | undefined;
let request = 0;
let controller: AbortController | undefined;
let arrival: { id: string; token: number } | undefined;

function cancel() {
	request++;
	controller?.abort();
	controller = undefined;
	pending.value = false;
}

function update(id: string) {
	if (props.modelValue === undefined) localValue.value = id;
	emit("update:modelValue", id);
	emit("valueChange", id);
}

function repair() {
	if (currentIndex.value >= 0 && !props.steps[currentIndex.value]?.disabled) {
		lastIndex = currentIndex.value;
		lastRepair = undefined;
		return;
	}
	const fallback =
		props.steps
			.slice(0, lastIndex)
			.reverse()
			.find((step) => !step.disabled) ?? props.steps.find((step) => !step.disabled);
	const id = fallback?.id ?? "";
	const key = JSON.stringify([value.value, topology.value]);
	if (id !== value.value && lastRepair !== key) {
		lastRepair = key;
		update(id);
	}
	lastIndex = Math.max(
		0,
		props.steps.findIndex((step) => step.id === id)
	);
}

onBeforeMount(repair);
watch(
	[value, topology, () => props.beforeChange, () => props.linear, () => props.disabled],
	(now, last) => {
		const internalArrival = arrival?.id === value.value && arrival.token === request;
		if (!internalArrival) {
			cancel();
			error.value = "";
			focused.value = "";
		}
		if (now[1] !== last[1])
			completed.value = completed.value.filter((id) => props.steps.some((step) => step.id === id));
		repair();
	}
);
onBeforeUnmount(cancel);

function reachable(index: number) {
	return (
		index >= 0 &&
		!props.steps[index]?.disabled &&
		(!props.linear || index <= currentIndex.value + 1)
	);
}

async function goTo(id: string): Promise<boolean> {
	const target = props.steps.findIndex((step) => step.id === id);
	if (!element.value || props.disabled || !reachable(target)) return false;
	if (id === value.value) {
		if (pending.value) cancel();
		return false;
	}
	const forward = target > currentIndex.value;
	if (forward && pending.value) return false;
	cancel();
	const token = request;
	const origin = value.value;
	const signature = topology.value;
	const guard = props.beforeChange;
	const mode = props.linear;
	const isCurrent = () =>
		token === request &&
		origin === value.value &&
		signature === topology.value &&
		guard === props.beforeChange &&
		mode === props.linear &&
		!props.disabled;
	error.value = "";
	if (forward) {
		const validation = new AbortController();
		controller = validation;
		pending.value = true;
		try {
			const result = await (guard?.(origin, id, validation.signal) ?? true);
			if (!isCurrent()) return false;
			if (result !== true) {
				error.value = typeof result === "string" ? result : messages.value.incomplete;
				return false;
			}
		} catch (cause) {
			if (isCurrent()) error.value = cause instanceof Error ? cause.message : messages.value.failed;
			return false;
		} finally {
			if (token === request) {
				controller = undefined;
				pending.value = false;
			}
		}
	}
	const nextArrival = { id, token };
	arrival = nextArrival;
	const controlled = props.modelValue !== undefined;
	if (!controlled && forward && origin && !completed.value.includes(origin))
		completed.value.push(origin);
	focused.value = id;
	update(id);
	await nextTick();
	if (
		arrival === nextArrival &&
		token === request &&
		value.value === id &&
		!props.disabled &&
		props.steps.some((step) => step.id === id && !step.disabled)
	) {
		if (
			controlled &&
			forward &&
			props.steps.some((step) => step.id === origin) &&
			!completed.value.includes(origin)
		) {
			completed.value.push(origin);
		}
		element.value?.querySelector<HTMLElement>(`[id="${panelId(id)}"]`)?.focus();
	}
	if (arrival === nextArrival) arrival = undefined;
	return true;
}

function next() {
	return goTo(props.steps[currentIndex.value + 1]?.id ?? "");
}
function previous() {
	return goTo(props.steps[currentIndex.value - 1]?.id ?? "");
}
defineExpose({ element, goTo, next, previous });

const triggerId = (id: string) => `${uid}-trigger-${encodeURIComponent(id)}`;
const panelId = (id: string) => `${uid}-panel-${encodeURIComponent(id)}`;
const available = (index: number) =>
	!props.disabled && reachable(index) && !(pending.value && index > currentIndex.value);
const roving = computed(() =>
	available(props.steps.findIndex((step) => step.id === focused.value))
		? focused.value
		: value.value
);

function onKeyDown(event: KeyboardEvent, index: number) {
	if (event.isComposing) return;
	const rtl = getComputedStyle(event.currentTarget as HTMLButtonElement).direction === "rtl";
	const nextKey = props.orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
	const previousKey =
		props.orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
	if (![nextKey, previousKey, "Home", "End"].includes(event.key)) return;
	event.preventDefault();
	const indices = props.steps.map((_, i) => i).filter(available);
	const position = indices.indexOf(index);
	const target =
		event.key === "Home"
			? indices[0]
			: event.key === "End"
				? indices.at(-1)
				: indices[position + (event.key === nextKey ? 1 : -1)];
	if (target !== undefined)
		element.value
			?.querySelector<HTMLElement>(`[id="${triggerId(props.steps[target].id)}"]`)
			?.focus();
}

const items = computed(() =>
	props.steps.map((step, index) => {
		const active = step.id === value.value;
		const state = (active ? currentError.value : step.error)
			? "error"
			: active
				? "active"
				: step.completed || completed.value.includes(step.id)
					? "completed"
					: "inactive";
		const trigger = triggerId(step.id);
		return {
			step,
			index,
			state,
			active,
			trigger,
			panel: panelId(step.id),
			description:
				[
					step.description && `${trigger}-description`,
					active && currentError.value && `${uid}-error`,
				]
					.filter(Boolean)
					.join(" ") || undefined,
		};
	})
);
</script>

<template>
	<div
		ref="root"
		v-bind="$attrs"
		role="group"
		:aria-label="($attrs['aria-label'] as string) ?? '步骤进度'"
		:aria-busy="pending"
		data-slot="stepper"
		:data-orientation="orientation"
		:class="cn('grid w-full min-w-0 gap-4 text-foreground', props.class)"
	>
		<ol
			:class="
				cn('flex min-w-0 gap-2', orientation === 'vertical' ? 'flex-col' : 'flex-col sm:flex-row')
			"
		>
			<li
				v-for="{ step, index, state, active, trigger, panel, description } of items"
				:key="step.id"
				class="min-w-0 flex-1"
			>
				<button
					type="button"
					:id="trigger"
					data-slot="stepper-trigger"
					:data-state="state"
					:aria-current="active ? 'step' : undefined"
					:aria-controls="panel"
					:aria-labelledby="`${trigger}-title`"
					:aria-describedby="description"
					:disabled="!available(index)"
					:tabindex="available(index) && roving === step.id ? 0 : -1"
					class="flex w-full items-start gap-2.5 rounded-[10px] border-[0.5px] border-border bg-card p-3 text-start text-[13px] transition-colors duration-150 outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-45 data-[state=active]:border-primary data-[state=active]:bg-primary/[0.04] data-[state=error]:border-destructive motion-reduce:transition-none dark:data-[state=active]:bg-primary/[0.08]"
					@click="goTo(step.id)"
					@keydown="onKeyDown($event, index)"
					@focus="focused = step.id"
				>
					<span
						aria-hidden="true"
						:class="
							cn(
								'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-[0.5px] text-[11px] font-medium tabular-nums',
								state === 'active' || state === 'completed'
									? 'border-primary bg-primary text-primary-foreground'
									: state === 'error'
										? 'border-destructive text-destructive'
										: 'border-border text-muted-foreground'
							)
						"
					>
						{{ state === "completed" ? "✓" : state === "error" ? "!" : index + 1 }}
					</span>
					<span class="grid min-w-0 gap-0.5">
						<span
							:id="`${trigger}-title`"
							class="text-[13px] leading-[18px] font-medium wrap-anywhere"
							>{{ step.title }}</span
						>
						<span
							v-if="step.description"
							:id="`${trigger}-description`"
							class="text-xs leading-[16px] wrap-anywhere text-muted-foreground"
							>{{ step.description }}</span
						>
					</span>
				</button>
			</li>
		</ol>
		<p class="sr-only" aria-live="polite">
			{{ pending ? messages.validating : messages.progress(currentIndex + 1, steps.length) }}
		</p>
		<p v-if="currentError" :id="`${uid}-error`" role="alert" class="text-xs text-destructive">
			{{ currentError }}
		</p>
		<section
			v-for="{ step, index, trigger, panel, active } of items"
			:key="step.id"
			:id="panel"
			:aria-labelledby="trigger"
			tabindex="-1"
			:hidden="!active"
			data-slot="stepper-content"
			class="min-w-0 rounded-[8px] outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
		>
			<slot
				v-bind="{
					step,
					index,
					active,
					pending,
					error: active ? currentError : (step.error ?? ''),
					goTo,
					next,
					previous,
				}"
			/>
		</section>
	</div>
</template>
