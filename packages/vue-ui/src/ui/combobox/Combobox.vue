<script lang="ts">
import type { PopoverContentProps, PopoverPortalProps } from "reka-ui";
import type { ButtonHTMLAttributes, HTMLAttributes } from "vue";

export interface ComboboxOption {
	id: string;
	label: string;
	group?: string;
	keywords?: readonly string[];
	disabled?: boolean;
}

export interface ComboboxProps {
	label: string;
	placeholder: string;
	options: readonly ComboboxOption[];
	modelValue?: readonly string[];
	defaultValue?: readonly string[];
	open?: boolean;
	defaultOpen?: boolean;
	query?: string;
	defaultQuery?: string;
	multiple?: boolean;
	disabled?: boolean;
	clearable?: boolean;
	clearLabel?: string;
	empty?: string;
	loading?: boolean;
	loadingLabel?: string;
	error?: string;
	filter?: boolean;
	triggerProps?: Omit<ButtonHTMLAttributes, "class" | "disabled" | "type">;
	contentClass?: HTMLAttributes["class"];
	class?: HTMLAttributes["class"];
	align?: PopoverContentProps["align"];
	side?: PopoverContentProps["side"];
	sideOffset?: number;
	portalProps?: PopoverPortalProps;
}
</script>

<script setup lang="ts">
import { CheckIcon, ChevronDownIcon } from "@lucide/vue";
import { cn } from "cn";
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import { Button, buttonVariants } from "../button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../command";
import { matchesCommand } from "../command/context";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<ComboboxProps>(), {
	open: undefined,
	clearLabel: "清空选择",
	empty: "没有匹配的选项",
	loadingLabel: "正在加载…",
	filter: true,
	align: "start",
	side: "bottom",
	sideOffset: 4,
});
const emit = defineEmits<{
	"update:modelValue": [value: readonly string[]];
	"update:open": [value: boolean];
	"update:query": [value: string];
	select: [id: string];
	clear: [];
}>();
const slots = defineSlots<{
	default?: (props: { label: string; value: readonly string[] }) => unknown;
	option?: (props: { option: ComboboxOption; selected: boolean }) => unknown;
	footer?: (props: { clear: () => void; value: readonly string[] }) => unknown;
}>();

const localValue = ref(props.defaultValue ?? []);
const localOpen = ref(props.defaultOpen ?? false);
const localQuery = ref(props.defaultQuery ?? "");
const value = computed(() => props.modelValue ?? localValue.value);
const open = computed(() => props.open ?? localOpen.value);
const query = computed(() => props.query ?? localQuery.value);

function changeValue(next: readonly string[]) {
	if (next.length === value.value.length && next.every((id, i) => id === value.value[i])) return;
	if (props.modelValue === undefined) localValue.value = next;
	emit("update:modelValue", next);
}

function changeOpen(next: boolean) {
	if (next === open.value || (next && props.disabled)) return;
	if (props.open === undefined) localOpen.value = next;
	emit("update:open", next);
}

function changeQuery(next: string) {
	if (next === query.value) return;
	if (props.query === undefined) localQuery.value = next;
	emit("update:query", next);
}

watch(open, (isOpen) => {
	if (!isOpen) changeQuery("");
});
watch(
	() => props.disabled,
	(disabled) => {
		if (disabled) changeOpen(false);
	}
);

const command = useTemplateRef("command");
const panelLabelId = `valar-combobox-label-${useId()}`;
const selection = computed(() => new Set(value.value));
const selectedLabel = computed(() => {
	if (!value.value.length) return props.label;
	const labels = new Map(props.options.map((item) => [item.id, item.label]));
	return value.value.map((id) => labels.get(id) ?? id).join(", ");
});
const triggerLabel = computed(() =>
	slots.default || !value.value.length ? props.label : `${props.label}: ${selectedLabel.value}`
);
const groups = computed(() => {
	const groups = new Map<string, ComboboxOption[]>();
	for (const option of props.options) {
		const name = option.group ?? "";
		const group = groups.get(name);
		if (group) group.push(option);
		else groups.set(name, [option]);
	}
	return [...groups];
});

function choose(option: ComboboxOption) {
	if (props.disabled || option.disabled || props.loading || props.error) return;
	changeValue(
		props.multiple
			? selection.value.has(option.id)
				? value.value.filter((id) => id !== option.id)
				: [...value.value, option.id]
			: [option.id]
	);
	emit("select", option.id);
	if (!props.multiple) changeOpen(false);
	else command.value?.focus({ preventScroll: true });
}

function clear() {
	if (props.disabled || !value.value.length) return;
	changeValue([]);
	emit("clear");
	if (!props.multiple) changeOpen(false);
	else command.value?.focus({ preventScroll: true });
}

function focusSearch(event: Event) {
	if (command.value?.focus({ preventScroll: true })) event.preventDefault();
}
</script>

<template>
	<Popover :open="open && !disabled" @update:open="changeOpen">
		<PopoverTrigger as-child>
			<button
				:aria-label="triggerLabel"
				v-bind="{ ...$attrs, ...triggerProps }"
				type="button"
				:disabled="disabled"
				data-slot="combobox-trigger"
				:class="
					props.class ??
					cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'cn-combobox-button')
				"
			>
				<slot :label="selectedLabel" :value="value">
					<span class="min-w-0 truncate">{{ selectedLabel }}</span>
					<ChevronDownIcon aria-hidden="true" />
				</slot>
			</button>
		</PopoverTrigger>
		<PopoverContent
			as-child
			appearance="surface"
			data-slot="combobox-content"
			:portal-props="portalProps"
			:align="align"
			:side="side"
			:side-offset="sideOffset"
			:class="cn('cn-combobox-panel', contentClass)"
			@open-auto-focus="focusSearch"
		>
			<div :aria-labelledby="panelLabelId">
				<span :id="panelLabelId" class="sr-only">{{ label }}</span>
				<Command
					ref="command"
					:label="label"
					:should-filter="filter"
					:filter="(_id, term, keywords) => matchesCommand(term, keywords)"
					disable-initial-scroll
					:vim-bindings="false"
					class="cn-combobox-command"
				>
					<CommandInput
						:model-value="query"
						:placeholder="placeholder"
						:aria-label="placeholder"
						class="cn-combobox-search"
						@update:model-value="changeQuery"
					/>
					<CommandList
						:aria-multiselectable="multiple || undefined"
						:aria-busy="loading || undefined"
						class="cn-combobox-results"
					>
						<template v-if="!loading && !error">
							<CommandEmpty class="cn-combobox-message">{{ empty }}</CommandEmpty>
							<component
								:is="name ? CommandGroup : 'div'"
								v-for="[name, items] of groups"
								:key="name"
								v-bind="name ? { heading: name } : { role: 'presentation' }"
								class="p-0"
							>
								<CommandItem
									v-for="item of items"
									:key="item.id"
									:value="item.id"
									:keywords="[item.label, ...(item.keywords ?? [])]"
									:disabled="item.disabled"
									:checked="selection.has(item.id)"
									class="cn-combobox-option"
									@select="choose(item)"
								>
									<slot name="option" :option="item" :selected="selection.has(item.id)">
										<span class="min-w-0 flex-1 wrap-anywhere">{{ item.label }}</span>
									</slot>
									<template #indicator="{ checked }">
										<CheckIcon v-if="checked" class="cn-combobox-check" aria-hidden="true" />
										<span v-else class="cn-combobox-check" aria-hidden="true" />
									</template>
								</CommandItem>
							</component>
						</template>
					</CommandList>
					<p v-if="loading" class="cn-combobox-message" role="status">{{ loadingLabel }}</p>
					<p v-else-if="error" class="cn-combobox-message" role="alert">{{ error }}</p>
					<div v-if="$slots.footer || (clearable && value.length)" class="cn-combobox-footer">
						<Button v-if="clearable && value.length" variant="ghost" size="sm" @click="clear">{{
							clearLabel
						}}</Button>
						<slot name="footer" :clear="clear" :value="value" />
					</div>
				</Command>
			</div>
		</PopoverContent>
	</Popover>
</template>
