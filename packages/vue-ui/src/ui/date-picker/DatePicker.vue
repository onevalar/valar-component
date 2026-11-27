<script setup lang="ts">
import { parseDate } from "@internationalized/date";
import { CalendarIcon } from "@lucide/vue";
import { createReusableTemplate } from "@vueuse/core";
import { cn } from "cn";
import {
	computed,
	getCurrentInstance,
	ref,
	shallowRef,
	useAttrs,
	useId,
	type HTMLAttributes,
} from "vue";
import DatePickerCalendar from "./DatePickerCalendar.vue";
import {
	dateLabel,
	examples,
	grains,
	inferTimeframe,
	inputValue,
	labels,
	periodOptions,
	rangeError,
	timeframeEnd,
	type Grain,
	type Timeframe,
} from "./date-value";
import { Button } from "../button";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import type { CalendarRootEmits, PopoverPortalProps } from "reka-ui";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		label: string;
		placeholder?: string;
		modelValue?: Timeframe;
		defaultValue?: Timeframe;
		min?: Timeframe;
		max?: Timeframe;
		locale?: string;
		precisions?: readonly Grain[];
		allowClear?: boolean;
		dir?: "ltr" | "rtl";
		portalProps?: PopoverPortalProps;
		class?: HTMLAttributes["class"];
	}>(),
	{ locale: "en", allowClear: true }
);

const emit = defineEmits<{ "update:modelValue": [value: Timeframe | undefined] }>();
const attrs = useAttrs();
const vnodeProps = getCurrentInstance()?.vnode.props ?? {};
const controlled = "modelValue" in vnodeProps || "model-value" in vnodeProps;
const localValue = shallowRef(props.defaultValue);
const value = computed(() => (controlled ? props.modelValue : localValue.value));
const currentLabel = computed(() => value.value && dateLabel(value.value, props.locale));
const valueId = useId();
const chinese = computed(() => props.locale.toLowerCase().startsWith("zh"));
const available = computed(() => (props.precisions?.length ? props.precisions : grains));
const open = ref(false);
const activeGrain = ref<Grain>("day");
const grain = computed(() =>
	available.value.includes(activeGrain.value) ? activeGrain.value : available.value[0]
);
const year = ref(1);
const typed = ref("");
const error = ref("");
const input = ref<InstanceType<typeof Input> | null>(null);
const composing = ref(false);
const prompt = computed(() =>
	available.value.length === 1
		? examples[available.value[0]]
		: chinese.value
			? "试试 2027-05、Q4 或 2027-05-20"
			: "Try: May 2027, Q4, 05/20/2027"
);
const minDate = computed(() => props.min?.date);
const maxDate = computed(() => props.max && timeframeEnd(props.max));
const reversed = computed(() =>
	Boolean(minDate.value && maxDate.value && minDate.value > maxDate.value)
);
const calendarMin = computed(() => parseDate(minDate.value ?? "0001-01-01"));
const calendarMax = computed(() =>
	reversed.value ? calendarMin.value : parseDate(maxDate.value ?? "9999-12-31")
);
const calendarValue = computed(() =>
	value.value?.grain === "day" ? parseDate(value.value.date) : undefined
);
const anchor = computed(() => {
	const date = value.value?.date ?? minDate.value ?? maxDate.value;
	if (!date) return;
	if (minDate.value && date < minDate.value) return calendarMin.value;
	if (maxDate.value && date > maxDate.value) return calendarMax.value;
	return parseDate(date);
});
const periods = computed(() => periodOptions(year.value, grain.value, props.locale));
const [DefineChoices, ReuseChoices] = createReusableTemplate();

function changeOpen(next: boolean) {
	composing.value = false;
	if (next) {
		const current = value.value;
		const initial = current ?? props.min ?? props.max;
		year.value = initial ? Number(initial.date.slice(0, 4)) : new Date().getFullYear();
		activeGrain.value =
			current && available.value.includes(current.grain) ? current.grain : available.value[0];
		typed.value = current ? inputValue(current) : "";
		error.value = "";
	}
	open.value = next;
}

function commit(next: Timeframe | undefined) {
	if (!controlled) localValue.value = next;
	emit("update:modelValue", next);
	changeOpen(false);
}

function outOfRange(next: Timeframe) {
	return rangeError(next, minDate.value, maxDate.value, chinese.value);
}

function choose(next: Timeframe) {
	error.value = outOfRange(next);
	if (!error.value) commit(next);
}

function chooseDay(next: CalendarRootEmits["update:modelValue"][0]) {
	if (next && !Array.isArray(next)) choose({ date: next.toString(), grain: "day" });
}

function chooseTyped(event: KeyboardEvent) {
	if (event.key !== "Enter" || isComposing(event)) return;
	event.preventDefault();
	if (!(event.currentTarget instanceof HTMLInputElement)) return;
	const text = event.currentTarget.value;
	if (!text.trim() && value.value && props.allowClear) return commit(undefined);
	const next = inferTimeframe(text, year.value);
	if (!next) error.value = chinese.value ? "请输入有效日期。" : "Enter a valid date.";
	else if (!available.value.includes(next.grain))
		error.value = chinese.value ? "请选择允许的日期精度。" : "Choose an available date precision.";
	else choose(next);
}

function isComposing(event: KeyboardEvent) {
	return composing.value || event.isComposing || event.keyCode === 229;
}

function changeGrain(next: Grain) {
	activeGrain.value = next;
	typed.value = value.value?.grain === next ? inputValue(value.value) : "";
	error.value = "";
}

function focusInput(event: Event) {
	const element: unknown = input.value?.$el;
	if (!(element instanceof HTMLInputElement)) return;
	event.preventDefault();
	element.focus();
	element.select();
}

function isSelected(option: Timeframe) {
	return value.value?.date === option.date && value.value.grain === option.grain;
}
</script>

<template>
	<DefineChoices>
		<DatePickerCalendar
			v-if="grain === 'day'"
			:label="label"
			:locale="locale"
			:dir="dir"
			:value="calendarValue"
			:anchor="anchor"
			:min="calendarMin"
			:max="calendarMax"
			:disabled="reversed"
			@update:model-value="chooseDay"
		/>
		<div v-else class="space-y-2 pb-2">
			<div class="flex justify-between">
				<Button
					size="sm"
					variant="ghost"
					:disabled="year <= 1"
					:aria-label="chinese ? '前几年' : 'Previous years'"
					@click="year = Math.max(1, year - 3)"
				>
					<span class="rtl:rotate-180" aria-hidden="true">‹</span>
				</Button>
				<Button
					size="sm"
					variant="ghost"
					:disabled="year + 2 >= 9999"
					:aria-label="chinese ? '后几年' : 'Next years'"
					@click="year += 3"
				>
					<span class="rtl:rotate-180" aria-hidden="true">›</span>
				</Button>
			</div>
			<div v-for="{ year: periodYear, options } in periods" :key="periodYear" class="space-y-1">
				<div v-if="grain !== 'year'" class="text-xs text-muted-foreground">{{ periodYear }}</div>
				<div :class="cn('grid gap-2', grain === 'half' ? 'grid-cols-2' : 'grid-cols-4')">
					<Button
						v-for="{ value: option, label: optionLabel, text } in options"
						:key="option.date"
						:variant="isSelected(option) ? 'secondary' : 'outline'"
						shape="pill"
						size="xs"
						class="cn-date-picker-period"
						:disabled="Boolean(outOfRange(option))"
						:aria-label="optionLabel"
						:aria-pressed="isSelected(option)"
						@click="choose(option)"
						><span class="min-w-0 truncate">{{ text }}</span></Button
					>
				</div>
			</div>
		</div>
	</DefineChoices>
	<Popover :open="open" @update:open="changeOpen">
		<PopoverTrigger
			v-bind="$attrs"
			:dir="dir"
			:aria-label="label"
			:aria-describedby="
				[attrs['aria-describedby'], value && valueId].filter(Boolean).join(' ') || undefined
			"
			data-slot="date-picker-trigger"
			:class="
				cn(
					'inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border border-border bg-card px-2 text-xs text-muted-foreground hover:bg-accent focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-50 aria-expanded:bg-accent',
					props.class
				)
			"
		>
			<CalendarIcon class="size-3.5 shrink-0" aria-hidden="true" />
			<span class="truncate">{{ currentLabel ?? placeholder ?? label }}</span>
		</PopoverTrigger>
		<span v-if="value" :id="valueId" class="sr-only">{{ currentLabel }}</span>
		<PopoverContent
			appearance="surface"
			role="dialog"
			:aria-label="label"
			:dir="dir"
			:portal-props="portalProps"
			data-slot="date-picker-content"
			:side-offset="5"
			align="start"
			class="cn-date-picker-content gap-0 pb-0"
			@open-auto-focus="focusInput"
			@escape-key-down="
				(event) => {
					if (isComposing(event)) event.preventDefault();
				}
			"
		>
			<div class="grid shrink-0 gap-2">
				<div class="text-xs font-medium text-muted-foreground">{{ label }}</div>
				<Input
					ref="input"
					:model-value="typed"
					type="text"
					:aria-label="chinese ? '输入日期' : 'Enter date'"
					:aria-invalid="Boolean(error)"
					:aria-describedby="error ? `${valueId}-error` : undefined"
					:placeholder="prompt"
					class="cn-date-picker-input"
					@update:model-value="
						(next) => {
							typed = String(next);
							error = '';
						}
					"
					@compositionstart="composing = true"
					@compositionend="composing = false"
					@keydown="chooseTyped"
				/>
				<p v-if="error" :id="`${valueId}-error`" role="alert" class="text-xs text-destructive">
					{{ error }}
				</p>
			</div>
			<Tabs
				v-if="available.length > 1"
				:model-value="grain"
				:dir="dir"
				activation-mode="automatic"
				class="mt-3.5 min-w-0 shrink-0"
				@update:model-value="changeGrain"
			>
				<TabsList
					variant="capsule"
					:aria-label="chinese ? '日期粒度' : 'Date precision'"
					class="cn-date-picker-precision h-8 w-full overflow-x-auto"
				>
					<TabsTrigger
						v-for="item in available"
						:key="item"
						:value="item"
						class="flex-[1_0_auto] text-center leading-tight whitespace-nowrap"
						>{{ labels[item][chinese ? 0 : 1] }}</TabsTrigger
					>
				</TabsList>
				<TabsContent
					v-for="item in available"
					:key="item"
					:value="item"
					class="min-w-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
				>
					<ReuseChoices v-if="item === grain" />
				</TabsContent>
			</Tabs>
			<ReuseChoices v-else />
			<div v-if="value && allowClear" class="flex shrink-0 justify-end border-t border-border py-2">
				<Button size="sm" variant="ghost" @click="commit(undefined)">{{
					chinese ? "清除日期" : "Clear date"
				}}</Button>
			</div>
		</PopoverContent>
	</Popover>
</template>
