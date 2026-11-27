<script setup lang="ts">
import { inject } from "vue";
import { initialSelection } from "./context";

const props = withDefaults(defineProps<{ value?: string | number; selected?: boolean }>(), { selected: undefined });
const initial = inject(initialSelection, undefined);
</script>

<template>
	<option data-slot="native-select-option" class="bg-[Canvas] text-[CanvasText]" :value="value"
		:selected="initial !== undefined && props.value !== undefined ? (Array.isArray(initial) ? initial.includes(String(props.value)) : initial === String(props.value)) : selected"><slot /></option>
</template>
