<script lang="ts">
import type { HTMLAttributes } from "vue";

export interface NumberFieldProps {
	modelValue?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	step?: number;
	locale?: string;
	formatOptions?: Intl.NumberFormatOptions;
	decrementLabel?: string;
	incrementLabel?: string;
	invalidMessage?: string;
	class?: HTMLAttributes["class"];
	name?: string;
	form?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
}
</script>

<script setup lang="ts">
import { NumberParser } from "@internationalized/number";
import { cn } from "cn";
import {
	computed,
	getCurrentInstance,
	onMounted,
	onUnmounted,
	ref,
	useTemplateRef,
	watch,
	watchPostEffect,
} from "vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<NumberFieldProps>(), {
	step: 1,
	locale: "zh-CN",
	decrementLabel: "减小",
	incrementLabel: "增大",
	invalidMessage: "请输入有效的数字。",
});
const emit = defineEmits<{
	"update:modelValue": [value: number | undefined];
	input: [event: Event];
	blur: [event: FocusEvent];
	keydown: [event: KeyboardEvent];
	compositionstart: [event: CompositionEvent];
	compositionend: [event: CompositionEvent];
}>();

const input = useTemplateRef<HTMLInputElement>("input");
defineExpose({ input });
// An explicitly bound undefined model is empty, not uncontrolled.
const vnodeProps = getCurrentInstance()?.vnode.props ?? {};
const controlled =
	Object.hasOwn(vnodeProps, "modelValue") || Object.hasOwn(vnodeProps, "model-value");
const local = ref(props.defaultValue);
const value = computed(() => (controlled ? props.modelValue : local.value));
const initialValue = value.value;
const optionsKey = computed(() => JSON.stringify(props.formatOptions ?? {}));
const formatters = computed(() => {
	const options: Intl.NumberFormatOptions = JSON.parse(optionsKey.value);
	return {
		formatter: new Intl.NumberFormat(props.locale, {
			...(!options.style || options.style === "decimal" ? { maximumFractionDigits: 12 } : {}),
			...options,
		}),
		parser: new NumberParser(props.locale, options),
	};
});
function format(next: number | undefined) {
	return next === undefined ? "" : formatters.value.formatter.format(next);
}
function parse(raw: string) {
	if (!raw.trim()) return undefined;
	const parsed = formatters.value.parser.parse(raw);
	return Number.isFinite(parsed) ? parsed : undefined;
}
const text = ref(format(value.value));
let candidate = value.value;
let composing = false;
watch([value, formatters], ([next, formats], [, previousFormats]) => {
	if (!Object.is(candidate, next) || formats !== previousFormats) text.value = format(next);
	candidate = next;
});

function isInvalid(raw: string) {
	if (!raw.trim()) return false;
	const parsed = parse(raw);
	return (
		parsed === undefined ||
		(props.min !== undefined && parsed < props.min) ||
		(props.max !== undefined && parsed > props.max)
	);
}
const invalid = computed(() => isInvalid(text.value));
function setValidity(invalid: boolean) {
	input.value?.setCustomValidity(
		!props.disabled && !props.readonly && invalid ? props.invalidMessage : ""
	);
}
watchPostEffect(() => setValidity(invalid.value));

function write(raw: string, next: number | undefined) {
	text.value = raw;
	candidate = next;
	// Native implicit submission after Enter must see validity for the committed text.
	setValidity(invalid.value);
	if (Object.is(next, value.value)) return;
	if (!controlled) local.value = next;
	emit("update:modelValue", next);
}
function edit(raw: string) {
	if (props.disabled || props.readonly) return;
	if (composing) text.value = raw;
	else write(raw, parse(raw));
}

const increment = computed(() => (Number.isFinite(props.step) && props.step > 0 ? props.step : 1));
const base = computed(() => props.min ?? 0);
function normalize(number: number) {
	const snapped =
		base.value + Math.round((number - base.value) / increment.value) * increment.value;
	return Math.min(
		props.max ?? Infinity,
		Math.max(props.min ?? -Infinity, Number(snapped.toPrecision(15)))
	);
}
function apply(number: number) {
	const formatted = format(normalize(number));
	write(formatted, parse(formatted));
}
function commit(raw: string) {
	if (composing || props.disabled || props.readonly) return;
	const parsed = parse(raw);
	if (parsed !== undefined) apply(parsed);
	else if (!raw.trim()) write(raw, undefined);
}
function spin(direction: number) {
	if (composing || props.disabled || props.readonly) return;
	const current = parse(text.value);
	const position = ((current ?? base.value) - base.value) / increment.value;
	const grid =
		direction > 0
			? Math.floor(position + 1e-10) + direction
			: Math.ceil(position - 1e-10) + direction;
	apply(
		current === undefined
			? (props.min ?? Math.min(0, props.max ?? 0))
			: base.value + grid * increment.value
	);
	input.value?.focus();
}
function keydown(event: KeyboardEvent) {
	emit("keydown", event);
	if (
		event.defaultPrevented ||
		event.isComposing ||
		event.keyCode === 229 ||
		composing ||
		props.disabled ||
		props.readonly
	)
		return;
	if (event.key === "ArrowUp" || event.key === "ArrowDown") {
		event.preventDefault();
		spin(event.key === "ArrowUp" ? 1 : -1);
	} else if (event.key === "PageUp" || event.key === "PageDown") {
		event.preventDefault();
		spin(event.key === "PageUp" ? 10 : -10);
	} else if (event.key === "Home" && props.min !== undefined) {
		event.preventDefault();
		write(format(props.min), props.min);
	} else if (event.key === "End" && props.max !== undefined) {
		event.preventDefault();
		write(format(props.max), props.max);
	} else if (event.key === "Enter" && input.value) commit(input.value.value);
}
function onInput(event: Event) {
	edit((event.currentTarget as HTMLInputElement).value);
	emit("input", event);
}
function onBlur(event: FocusEvent) {
	commit((event.currentTarget as HTMLInputElement).value);
	emit("blur", event);
}
function onCompositionStart(event: CompositionEvent) {
	composing = true;
	emit("compositionstart", event);
}
function onCompositionEnd(event: CompositionEvent) {
	composing = false;
	edit((event.currentTarget as HTMLInputElement).value);
	emit("compositionend", event);
}

let timer: ReturnType<typeof setTimeout>;
let ownerDocument: Document | undefined;
function handleReset(event: Event) {
	const control = input.value;
	if (!control || control.form !== event.target) return;
	clearTimeout(timer);
	// Wait for the browser to finish restoring the native inputs.
	timer = setTimeout(() => {
		if (event.defaultPrevented) return;
		composing = false;
		const formatted = format(initialValue);
		control.value = formatted;
		write(formatted, initialValue);
	}, 0);
}
onMounted(() => {
	ownerDocument = input.value?.ownerDocument;
	ownerDocument?.addEventListener("reset", handleReset, true);
});
onUnmounted(() => {
	clearTimeout(timer);
	ownerDocument?.removeEventListener("reset", handleReset, true);
});

const buttonClass =
	"inline-flex size-full w-auto aspect-square shrink-0 items-center justify-center border-input text-[14px] text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-accent hover:text-foreground focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-40";
</script>

<template>
	<div
		data-slot="number-field"
		:data-disabled="disabled || undefined"
		:class="
			cn(
				'flex h-8 min-h-8 w-full items-center rounded-md border-[0.5px] border-input bg-white text-foreground transition-colors duration-150 has-aria-invalid:border-destructive has-aria-invalid:ring-1 has-aria-invalid:ring-destructive/20 has-aria-invalid:ring-inset has-[>[data-slot=number-field-input]:focus-visible]:border-ring has-[>[data-slot=number-field-input]:focus-visible]:outline-1 has-[>[data-slot=number-field-input]:focus-visible]:-outline-offset-1 has-[>[data-slot=number-field-input]:focus-visible]:outline-ring has-[>[data-slot=number-field-input]:focus-visible]:outline-solid motion-reduce:transition-none dark:bg-[#141518] dark:has-aria-invalid:ring-destructive/40',
				props.class
			)
		"
	>
		<button
			type="button"
			data-slot="number-field-decrement"
			:aria-label="decrementLabel"
			:disabled="disabled || readonly || (value !== undefined && min !== undefined && value <= min)"
			:class="[buttonClass, 'rounded-s-md border-e-[0.5px]']"
			@pointerdown.prevent
			@click="spin(-1)"
		>
			−
		</button>
		<input
			v-bind="$attrs"
			ref="input"
			type="text"
			role="spinbutton"
			inputmode="decimal"
			data-slot="number-field-input"
			class="h-full w-full min-w-0 bg-transparent px-2 text-center text-[13px] tabular-nums outline-none disabled:cursor-not-allowed disabled:opacity-50"
			:form="form"
			:disabled="disabled"
			:readonly="readonly"
			:required="required"
			:value="text"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-valuenow="value"
			:aria-valuetext="text"
			:aria-invalid="
				invalid || ($attrs['aria-invalid'] as HTMLAttributes['aria-invalid']) || undefined
			"
			@input="onInput"
			@blur="onBlur"
			@keydown="keydown"
			@compositionstart="onCompositionStart"
			@compositionend="onCompositionEnd"
		/>
		<button
			type="button"
			data-slot="number-field-increment"
			:aria-label="incrementLabel"
			:disabled="disabled || readonly || (value !== undefined && max !== undefined && value >= max)"
			:class="[buttonClass, 'rounded-e-md border-s-[0.5px]']"
			@pointerdown.prevent
			@click="spin(1)"
		>
			+
		</button>
	</div>
	<input
		v-if="name"
		type="hidden"
		:name="name"
		:form="form"
		:disabled="disabled"
		:value="value ?? ''"
	/>
</template>
