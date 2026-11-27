<script lang="ts">
import type { HTMLAttributes, InputHTMLAttributes } from "vue";

export type InputOTPProps = {
	modelValue?: string;
	defaultValue?: string;
	inputId?: string;
	maxlength?: number;
	pattern?: string | RegExp;
	pasteTransformer?: (text: string) => string;
	disabled?: boolean;
	readonly?: boolean;
	autocomplete?: string;
	inputmode?: InputHTMLAttributes["inputmode"];
	spellcheck?: InputHTMLAttributes["spellcheck"];
	autocapitalize?: string;
	dir?: HTMLAttributes["dir"];
	ariaInvalid?: HTMLAttributes["aria-invalid"];
	class?: HTMLAttributes["class"];
};
</script>

<script setup lang="ts">
import { cn } from "cn";
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	provide,
	ref,
	useAttrs,
	watch,
	watchEffect,
} from "vue";
import InputOTPGroup from "./InputOTPGroup.vue";
import InputOTPSlot from "./InputOTPSlot.vue";
import { otpContext, type Selection } from "./context";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const props = defineProps<InputOTPProps>();
const emit = defineEmits<{
	"update:modelValue": [value: string];
	complete: [value: string];
}>();
const limit = computed(() => Math.max(1, Math.trunc(props.maxlength ?? 6) || 1));
const initial = props.modelValue ?? props.defaultValue ?? "";
const localValue = ref(initial);
const value = computed(() => (props.modelValue ?? localValue.value).slice(0, limit.value));
const input = ref<HTMLInputElement | null>(null);
const selection = ref<Selection | null>(null);
const compositionDraft = ref<string | null>(null);
let composing = false;
let beforeEdit: Selection | null = null;

const regex = computed(() => {
	const pattern = props.pattern;
	if (pattern instanceof RegExp)
		return new RegExp(`^(?:${pattern.source})$`, pattern.flags.replace(/[gy]/g, ""));
	if (!pattern) return;
	try {
		return new RegExp(`^(?:${pattern})$`, "v");
	} catch {
		/* An invalid HTML pattern imposes no constraint. */
	}
});

provide(
	otpContext,
	computed(() => ({
		value: compositionDraft.value ?? value.value,
		selection: selection.value,
		maxLength: limit.value,
		invalid: props.ariaInvalid === true || props.ariaInvalid === "true",
	}))
);

defineExpose({ input });
watch(
	value,
	(next, previous) => {
		if (previous.length < limit.value && next.length === limit.value) emit("complete", next);
	},
	{ flush: "post" }
);
watchEffect(
	(cleanup) => {
		const control = input.value;
		if (!control || !(props.pattern instanceof RegExp)) return;
		control.setCustomValidity(
			value.value && !regex.value?.test(value.value) ? "Please match the requested format." : ""
		);
		cleanup(() => control.setCustomValidity(""));
	},
	{ flush: "post" }
);

function syncSelection() {
	const control = input.value;
	if (!control?.matches(":focus") || control.matches(":disabled")) {
		selection.value = null;
		return;
	}
	const start = control.selectionStart ?? 0;
	const end = control.selectionEnd ?? start;
	if (selection.value?.[0] !== start || selection.value?.[1] !== end)
		selection.value = [start, end];
}

function update(next: string) {
	const previous = value.value;
	if (props.modelValue === undefined) localValue.value = next;
	if (next !== previous) emit("update:modelValue", next);
	if (props.modelValue !== undefined) {
		void nextTick(() => {
			const control = input.value;
			if (control && !composing && control.value !== value.value) {
				control.value = value.value;
				syncSelection();
			}
		});
	}
}

let resetTimer: ReturnType<typeof setTimeout>;
function reset(event: Event) {
	const control = input.value;
	if (!control || event.target !== control.form) return;
	clearTimeout(resetTimer);
	resetTimer = setTimeout(() => {
		if (event.defaultPrevented || input.value !== control) return;
		composing = false;
		compositionDraft.value = null;
		beforeEdit = null;
		update(initial.slice(0, limit.value));
		control.value = value.value;
		syncSelection();
	}, 0);
}

let ownerDocument: Document | undefined;
onMounted(() => {
	ownerDocument = input.value?.ownerDocument;
	ownerDocument?.addEventListener("reset", reset, true);
	ownerDocument?.addEventListener("selectionchange", syncSelection);
	syncSelection();
});
onUnmounted(() => {
	clearTimeout(resetTimer);
	ownerDocument?.removeEventListener("reset", reset, true);
	ownerDocument?.removeEventListener("selectionchange", syncSelection);
});

function acceptEdit(control: HTMLInputElement) {
	const text = control.value.slice(0, limit.value);
	if (text && regex.value && !regex.value.test(text)) {
		const [start, end] = beforeEdit ?? [value.value.length, value.value.length];
		control.value = value.value;
		control.setSelectionRange(start, end);
	} else {
		if (control.value !== text) control.value = text;
		update(text);
	}
	beforeEdit = null;
	syncSelection();
}

function beforeInput(event: Event) {
	const control = event.currentTarget as HTMLInputElement;
	if (!composing && !(event as InputEvent).isComposing)
		beforeEdit = [control.selectionStart ?? 0, control.selectionEnd ?? 0];
}

function edit(event: Event) {
	const control = event.currentTarget as HTMLInputElement;
	if (control.matches(":disabled") || props.readonly) return;
	if (composing || (event as InputEvent).isComposing) {
		compositionDraft.value = control.value;
		syncSelection();
	} else acceptEdit(control);
}

function paste(event: ClipboardEvent) {
	const control = event.currentTarget as HTMLInputElement;
	if (
		event.defaultPrevented ||
		!props.pasteTransformer ||
		composing ||
		control.matches(":disabled") ||
		props.readonly ||
		!event.clipboardData
	)
		return;
	event.preventDefault();
	const current = value.value;
	const start = control.selectionStart ?? current.length;
	const end = control.selectionEnd ?? start;
	const text = props
		.pasteTransformer(event.clipboardData.getData("text/plain"))
		.replace(/[\r\n]/g, "");
	const next = (current.slice(0, start) + text + current.slice(end)).slice(0, limit.value);
	if (next && regex.value && !regex.value.test(next)) return;
	control.setRangeText(next, 0, control.value.length);
	const caret = Math.min(start + text.length, next.length);
	control.setSelectionRange(caret, caret);
	control.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertFromPaste" }));
}

function click(event: MouseEvent) {
	const control = event.currentTarget as HTMLInputElement;
	if (
		!event.defaultPrevented &&
		!event.shiftKey &&
		event.detail === 1 &&
		control.selectionStart === control.selectionEnd
	) {
		const slot = control.ownerDocument
			.elementsFromPoint(event.clientX, event.clientY)
			.find(
				(node) =>
					node.matches('[data-slot="input-otp-slot"]') && control.parentElement?.contains(node)
			);
		if (slot) {
			const rect = slot.getBoundingClientRect();
			const trailing =
				event.clientX >= rect.left + rect.width / 2 !==
				(getComputedStyle(control).direction === "rtl");
			const caret = Math.min(
				Number(slot.getAttribute("data-index")) + Number(trailing),
				control.value.length
			);
			control.setSelectionRange(caret, caret);
		}
	}
	syncSelection();
}

function compositionStart(event: CompositionEvent) {
	const control = event.currentTarget as HTMLInputElement;
	composing = true;
	beforeEdit = [control.selectionStart ?? 0, control.selectionEnd ?? 0];
}

function compositionEnd(event: CompositionEvent) {
	const control = event.currentTarget as HTMLInputElement;
	composing = false;
	compositionDraft.value = null;
	if (!control.matches(":disabled") && !props.readonly) acceptEdit(control);
}
</script>

<template>
	<div
		:dir="dir"
		data-slot="input-otp-container"
		:data-disabled="disabled || undefined"
		:class="
			cn(
				'cn-input-otp relative inline-flex w-fit max-w-full flex-wrap items-center gap-2 has-disabled:opacity-50',
				props.class
			)
		"
	>
		<slot>
			<InputOTPGroup>
				<InputOTPSlot v-for="index in limit" :key="index" :index="index - 1" />
			</InputOTPGroup>
		</slot>
		<!-- A single overlay keeps native selection, form validation and OTP autofill. -->
		<input
			v-bind="attrs"
			ref="input"
			:id="inputId ?? (attrs.id as string | undefined)"
			type="text"
			data-slot="input-otp"
			class="absolute inset-0 z-20 size-full cursor-text border-0 p-0 font-mono text-[32px] leading-none tracking-[0.4em] opacity-0 disabled:cursor-not-allowed"
			:maxlength="limit"
			:aria-invalid="ariaInvalid"
			:pattern="typeof pattern === 'string' ? pattern : undefined"
			:autocomplete="(autocomplete ?? 'one-time-code') as InputHTMLAttributes['autocomplete']"
			:inputmode="inputmode ?? 'numeric'"
			:spellcheck="spellcheck ?? false"
			:autocapitalize="autocapitalize ?? 'none'"
			:disabled="disabled"
			:readonly="readonly"
			:value="compositionDraft ?? value"
			@beforeinput="beforeInput"
			@input="edit"
			@paste="paste"
			@focus="syncSelection"
			@blur="selection = null"
			@click="click"
			@compositionstart="compositionStart"
			@compositionend="compositionEnd"
		/>
	</div>
</template>
