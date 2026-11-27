<script lang="ts">
import type { HTMLAttributes } from "vue";

export interface RulerSliderProps {
	label: string;
	modelValue?: number;
	defaultValue?: number;
	min?: number;
	max?: number;
	step?: number;
	largeStep?: number;
	majorEvery?: number;
	spacing?: number;
	format?: (value: number) => string;
	/** The tape moves; the readout is synchronous. Rolling digits are not supported. */
	animateReadout?: false;
	unit?: string;
	name?: string;
	disabled?: boolean;
	class?: HTMLAttributes["class"];
}
</script>

<script setup lang="ts">
import { cn } from "cn";
import {
	computed,
	onBeforeUnmount,
	onMounted,
	ref,
	useAttrs,
	useId,
	useTemplateRef,
	watch,
} from "vue";
import { createRulerMotion, formatRulerValue, rulerMarks, snapRulerValue } from "./motion";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<RulerSliderProps>(), {
	min: 0,
	max: 100,
	step: 1,
	majorEvery: 10,
	spacing: 10,
	disabled: false,
});
const emit = defineEmits<{
	"update:modelValue": [value: number];
	"value-commit": [value: number];
}>();
const attrs = useAttrs() as HTMLAttributes;

function rootAttributes() {
	const {
		"aria-label": _label,
		"aria-labelledby": _labelledBy,
		"aria-describedby": _describedBy,
		"aria-errormessage": _errorMessage,
		"aria-invalid": _invalid,
		...rootAttrs
	} = attrs;
	return rootAttrs;
}

const labelId = `${useId()}-label`;
const root = useTemplateRef<HTMLDivElement>("root");
const viewport = useTemplateRef<HTMLDivElement>("viewport");
defineExpose({ root, viewport });

const local = ref(props.defaultValue ?? props.min);
const safeStep = computed(() => (props.step > 0 ? props.step : 1));
const current = computed(() =>
	snapRulerValue(props.modelValue ?? local.value, props.min, props.max, safeStep.value)
);
const position = ref(current.value);
const dragging = ref(false);
const settlement = ref(0);
const readout = computed(() =>
	props.format
		? props.format(current.value)
		: formatRulerValue(current.value, props.min, safeStep.value)
);
const majorSpacing = computed(() => props.spacing * props.majorEvery);
const labels = computed(() =>
	rulerMarks(props.min, props.max, safeStep.value, props.majorEvery).map(({ value, text }) =>
		props.format ? props.format(value) : text
	)
);

let motion: ReturnType<typeof createRulerMotion> | undefined;
onMounted(() => {
	motion = createRulerMotion(viewport.value!, current.value, {
		get: () => ({
			min: props.min,
			max: props.max,
			step: safeStep.value,
			spacing: props.spacing,
			largeStep: props.largeStep ?? safeStep.value * props.majorEvery,
			disabled: props.disabled,
		}),
		position: (next) => {
			position.value = next;
		},
		dragging: (next) => {
			dragging.value = next;
		},
		change(next) {
			if (props.modelValue === undefined) local.value = next;
			emit("update:modelValue", next);
		},
		commit(next) {
			emit("value-commit", next);
			// Reconcile a rejected controlled proposal after the parent's render.
			if (props.modelValue !== undefined) settlement.value++;
		},
	});
});
watch(
	[
		current,
		() => props.disabled,
		() => props.min,
		() => props.max,
		safeStep,
		() => props.spacing,
		settlement,
	],
	() => motion?.sync(current.value),
	{ flush: "post" }
);
onBeforeUnmount(() => motion?.destroy());
</script>

<template>
	<div
		v-bind="rootAttributes()"
		ref="root"
		data-slot="ruler-slider"
		:data-disabled="disabled || undefined"
		:data-dragging="dragging || undefined"
		:class="
			cn(
				'grid w-full min-w-0 justify-items-center gap-1 text-[13px] text-foreground select-none data-disabled:opacity-50',
				props.class
			)
		"
	>
		<span :id="labelId" class="text-[13px] font-medium text-muted-foreground">{{ label }}</span>
		<div
			aria-hidden="true"
			class="mb-2.5 inline-flex items-baseline gap-[0.25em] text-xl leading-[1.15] font-semibold tracking-tight tabular-nums"
		>
			<span>{{ readout }}</span>
			<span v-if="unit" class="text-xs font-normal text-muted-foreground">{{ unit }}</span>
		</div>
		<div
			ref="viewport"
			data-slot="ruler-slider-viewport"
			role="slider"
			:tabindex="disabled ? -1 : 0"
			:aria-label="attrs['aria-label']"
			:aria-labelledby="attrs['aria-labelledby'] ?? (attrs['aria-label'] ? undefined : labelId)"
			:aria-describedby="attrs['aria-describedby']"
			:aria-errormessage="attrs['aria-errormessage']"
			:aria-invalid="attrs['aria-invalid']"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-valuenow="current"
			:aria-valuetext="unit ? `${readout} ${unit}` : readout"
			aria-orientation="horizontal"
			:aria-disabled="disabled || undefined"
			class="relative h-16 w-full cursor-grab touch-pan-y overflow-hidden rounded-[10px] border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white outline-none [-webkit-tap-highlight-color:transparent] focus-visible:border-ring focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid in-data-[disabled]:cursor-not-allowed in-data-[dragging]:cursor-grabbing dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]"
		>
			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_right,transparent,#000_22%,#000_78%,transparent)]"
			>
				<div
					data-slot="ruler-slider-tape"
					class="absolute inset-y-0 left-[calc(50%-0.5px)] will-change-transform"
					:style="{
						width: `${((max - min) * spacing) / safeStep + 1}px`,
						transform: `translateX(${(-(position - min) * spacing) / safeStep}px)`,
					}"
				>
					<span
						class="absolute inset-x-0 top-0 h-7"
						:style="{
							backgroundImage:
								'linear-gradient(to right, color-mix(in oklab, var(--foreground) 48%, transparent) 0 1px, transparent 1px), linear-gradient(to right, color-mix(in oklab, var(--foreground) 20%, transparent) 0 1px, transparent 1px), linear-gradient(to right, color-mix(in oklab, var(--foreground) 20%, transparent) 0 1px, transparent 1px)',
							backgroundRepeat: 'repeat-x',
							backgroundSize: `${majorSpacing}px 1.75rem, ${majorEvery % 2 === 0 ? majorSpacing / 2 : 0}px 1.25rem, ${spacing}px 0.75rem`,
						}"
					/>
					<span
						v-for="(text, index) in labels"
						:key="index"
						class="absolute top-8 -translate-x-1/2 font-mono text-[11px] whitespace-nowrap text-muted-foreground tabular-nums"
						:style="{ left: `${index * majorSpacing}px` }"
						>{{ text }}</span
					>
				</div>
			</div>
			<span
				aria-hidden="true"
				data-slot="ruler-slider-needle"
				class="pointer-events-none absolute top-0 left-[calc(50%-1px)] h-9 w-0.5 rounded-b-full bg-primary"
			/>
		</div>
		<input v-if="name" type="hidden" :name="name" :value="current" :disabled="disabled" />
	</div>
</template>
