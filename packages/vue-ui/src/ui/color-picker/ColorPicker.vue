<script lang="ts">
import type { PopoverContent as PopoverPanel } from "../popover";
import type { HTMLAttributes } from "vue";

export type ColorPickerContentProps = Omit<
	InstanceType<typeof PopoverPanel>["$props"],
	"key" | "ref" | "as" | "asChild"
> &
	HTMLAttributes;

export interface ColorPickerProps {
	label: string;
	modelValue?: string;
	defaultValue?: string;
	presets?: readonly string[];
	disabled?: boolean;
	name?: string;
	id?: string;
	class?: HTMLAttributes["class"];
	contentProps?: ColorPickerContentProps;
}

const HEX = /^#?([\da-f]{3}|[\da-f]{6})$/i;
const FULL_HEX = /^#?[\da-f]{6}$/i;
const HEX_DRAFT = /^#?[\da-f]{0,6}$/i;

/** Returns lowercase #rrggbb; anything other than three- or six-digit HEX is invalid. */
export function normalizeHex(input: string): string | undefined {
	const digits = HEX.exec(input.trim())?.[1];
	if (!digits) return undefined;
	return `#${(digits.length === 3 ? [...digits].map((digit) => digit + digit).join("") : digits).toLowerCase()}`;
}
</script>

<script setup lang="ts">
import { ColorPicker as SdkColorPicker, createColorPickerController } from "@ui-sdk/vue/color-picker";
import { cn } from "cn";
import { computed, ref, useId, watch } from "vue";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ColorPickerProps>(), {
	defaultValue: "#000000",
	presets: () => [],
});
const emit = defineEmits<{ "update:modelValue": [value: string]; valueChange: [value: string] }>();

const fallbackId = useId();
const id = computed(() => props.id ?? fallbackId);
const panelLabelId = `valar-color-picker-panel-${fallbackId}`;
const localValue = ref(props.defaultValue);
const controller = createColorPickerController();
const current = computed(() => normalizeHex(props.modelValue ?? localValue.value) ?? "#000000");
const open = ref(false);
const draft = ref<string>();
const text = computed(() => draft.value ?? current.value);
const invalid = computed(() => !HEX_DRAFT.test(text.value.trim()));
const presets = computed(() => props.presets.map(normalizeHex).filter((hex) => hex !== undefined));
const content = computed(() => {
	const { class: _, ...options } = props.contentProps ?? {};
	return options;
});
let composing = false;

const field =
	"h-8 w-full min-w-0 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white px-2.5 text-foreground outline-none transition-colors duration-150 motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)] focus-visible:border-ring focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring";

watch(
	() => props.disabled,
	(disabled) => {
		if (disabled) open.value = false;
	}
);

function onColorChange(next: string) {
	if (props.modelValue === undefined) localValue.value = next;
	emit("update:modelValue", next);
	emit("valueChange", next);
}

function update(next: string | undefined) {
	if (!props.disabled && next && next !== current.value)
		controller.setValue(next, { reason: "input-commit" });
}

function setOpen(next: boolean) {
	if (next && props.disabled) return;
	if (next) {
		draft.value = undefined;
		composing = false;
	}
	open.value = next;
}

function edit(event: Event) {
	const next = (event.currentTarget as HTMLInputElement).value;
	draft.value = next;
	if (!composing && !(event as InputEvent).isComposing && FULL_HEX.test(next.trim()))
		update(normalizeHex(next));
}

function commit(event: Event) {
	if (!composing) update(normalizeHex((event.currentTarget as HTMLInputElement).value));
	draft.value = undefined;
}

function onKeyDown(event: KeyboardEvent) {
	if (event.key !== "Enter" || event.isComposing || composing) return;
	event.preventDefault();
	commit(event);
}

function select(hex: string | undefined) {
	update(hex);
	draft.value = undefined;
}
</script>

<template>
	<SdkColorPicker
		v-bind="$attrs"
		:id="props.id"
		:controller="controller"
		:value="current"
		space="srgb"
		format="hex"
		:disabled="disabled"
		:name="name"
		@value-change="onColorChange"
		data-slot="color-picker"
		:data-disabled="disabled || undefined"
		:class="cn('grid gap-2', props.class)"
	>
		<span :id="`${id}-label`" class="text-[13px] leading-[17px] font-medium text-foreground">{{
			label
		}}</span>
		<Popover :open="open && !disabled" @update:open="setOpen">
			<PopoverTrigger
				:disabled="disabled"
				:aria-labelledby="`${id}-label ${id}-value`"
				:class="
					cn(
						field,
						'flex items-center gap-2 text-[13px] hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-[lch(12%_1_272)]'
					)
				"
			>
				<span
					data-slot="color-picker-swatch"
					aria-hidden="true"
					class="size-4 shrink-0 rounded-[4px] border-[0.5px] border-black/15 dark:border-white/20"
					:style="{ backgroundColor: current }"
				/>
				<span :id="`${id}-value`" class="font-mono text-xs tabular-nums">{{ current }}</span>
			</PopoverTrigger>
			<PopoverContent
				v-bind="content"
				as-child
				data-slot="color-picker-content"
				:class="cn('grid w-64 gap-3', props.contentProps?.class)"
			>
				<!-- The slotted root overrides Reka's trigger-derived dialog name. -->
				<div
					:aria-labelledby="
						content['aria-labelledby'] ?? (content['aria-label'] ? undefined : panelLabelId)
					"
				>
					<span :id="panelLabelId" class="sr-only">{{ label }}</span>
					<input
						type="color"
						:aria-label="`${label}：色盘`"
						:value="current"
						@input="select(normalizeHex(($event.currentTarget as HTMLInputElement).value))"
						class="h-24 w-full cursor-pointer overflow-hidden rounded-md border-[0.5px] border-border bg-transparent p-0 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid"
					/>
					<label class="grid min-w-0 gap-1 text-xs font-medium text-muted-foreground">
						十六进制
						<input
							type="text"
							:aria-label="`${label}：十六进制`"
							:aria-invalid="invalid || undefined"
							:aria-describedby="invalid ? `${id}-error` : undefined"
							spellcheck="false"
							autocomplete="off"
							maxlength="7"
							:value="text"
							:class="cn(field, 'font-mono text-xs tabular-nums aria-invalid:border-destructive')"
							@compositionstart="composing = true"
							@compositionend="
								composing = false;
								edit($event);
							"
							@input="edit"
							@keydown="onKeyDown"
							@blur="commit"
						/>
					</label>
					<p v-if="invalid" :id="`${id}-error`" class="text-xs text-destructive">
						只能输入十六进制字符 0-9、a-f，如 #1e40af。
					</p>
					<div
						v-if="props.presets.length"
						role="group"
						:aria-label="`${label}：预设`"
						class="flex flex-wrap gap-1.5"
					>
						<button
							v-for="(hex, index) of presets"
							:key="`${hex}-${index}`"
							type="button"
							:aria-label="hex"
							:aria-pressed="hex === current"
							class="size-6 rounded-[5px] border-[0.5px] border-black/15 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid aria-pressed:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.45)] aria-pressed:outline-2 aria-pressed:-outline-offset-2 aria-pressed:outline-white aria-pressed:outline-solid aria-pressed:focus-visible:outline-ring dark:border-white/20"
							:style="{ backgroundColor: hex }"
							@click="select(hex)"
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	</SdkColorPicker>
</template>
