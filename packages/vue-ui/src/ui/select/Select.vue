<script setup lang="ts">
import {
	Select as SdkSelect,
	type ListData,
	type SelectController,
	type SelectOpenChangeReason,
	type SelectValueChangeReason,
} from "@ui-sdk/vue/select";
import type { ChangeDetails } from "@ui-sdk/core";
import { computed } from "vue";

export interface SelectProps {
	modelValue?: string | string[] | null;
	defaultValue?: string | string[] | null;
	open?: boolean;
	defaultOpen?: boolean;
	multiple?: boolean;
	items?: ListData<string>;
	name?: string;
	form?: string;
	autocomplete?: string;
	disabled?: boolean;
	readOnly?: boolean;
	required?: boolean;
	placeholder?: string;
	loop?: boolean;
	virtualFocus?: boolean;
	modal?: boolean | "pointer";
	presentation?: "auto" | "popover" | "sheet";
	controller?: SelectController<string, boolean>;
	dismissible?: boolean;
	container?: Element | DocumentFragment | null;
	dir?: "ltr" | "rtl";
}

const props = withDefaults(defineProps<SelectProps>(), {
	modelValue: undefined,
	defaultValue: undefined,
	open: undefined,
	defaultOpen: undefined,
	multiple: false,
	disabled: undefined,
	readOnly: undefined,
	required: undefined,
	loop: true,
	virtualFocus: false,
	dismissible: undefined,
});

const emit = defineEmits<{
	"update:modelValue": [value: any];
	"update:open": [open: boolean];
	valueChange: [value: any, details: ChangeDetails<SelectValueChangeReason>];
	openChange: [open: boolean, details: ChangeDetails<SelectOpenChangeReason>];
}>();

const sdkValue = computed(() => {
	if (props.multiple) {
		return Array.isArray(props.modelValue) ? props.modelValue : undefined;
	}
	if (props.modelValue === undefined) return undefined;
	return props.modelValue === "" || props.modelValue === null ? null : String(props.modelValue);
});

const sdkDefaultValue = computed(() => {
	if (props.defaultValue === undefined) return undefined;
	if (props.multiple) {
		return Array.isArray(props.defaultValue) ? props.defaultValue : [];
	}
	return props.defaultValue === "" || props.defaultValue === null
		? null
		: String(props.defaultValue);
});

function handleValueChange(
	next: string | string[] | null,
	details: ChangeDetails<SelectValueChangeReason>
) {
	const emitted = props.multiple
		? Array.isArray(next)
			? next
			: []
		: typeof next === "string"
			? next
			: "";
	emit("valueChange", emitted, details);
	if (!details.canceled) {
		emit("update:modelValue", emitted);
	}
}

function handleOpenChange(next: boolean, details: ChangeDetails<SelectOpenChangeReason>) {
	emit("openChange", next, details);
	if (!next && !details.canceled && details.reason === "escape-key") {
		details.event?.stopPropagation();
	}
	if (!details.canceled) {
		emit("update:open", next);
	}
}
</script>

<template>
	<SdkSelect
		:multiple="props.multiple"
		:value="sdkValue as never"
		:default-value="sdkDefaultValue as never"
		:open="props.open"
		:default-open="props.defaultOpen"
		:items="props.items"
		:name="props.name"
		:form="props.form"
		:auto-complete="props.autocomplete"
		:disabled="props.disabled"
		:read-only="props.readOnly"
		:required="props.required"
		:placeholder="props.placeholder"
		:loop="props.loop"
		:virtual-focus="props.virtualFocus"
		:modal="props.modal"
		:presentation="props.presentation"
		:controller="props.controller"
		:dismissible="props.dismissible"
		:container="props.container"
		@value-change="handleValueChange as never"
		@open-change="handleOpenChange"
	>
		<slot />
	</SdkSelect>
</template>
