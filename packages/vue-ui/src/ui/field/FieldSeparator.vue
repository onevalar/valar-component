<script setup lang="ts">
import { Separator } from "../separator";
</script>

<template>
	<div data-slot="field-separator" :data-content="!!$slots.default" class="cn-field-separator relative">
		<Separator decorative class="absolute inset-0 top-1/2" />
		<span v-if="$slots.default" data-slot="field-separator-content" class="cn-field-separator-content relative mx-auto block w-fit bg-background"><slot /></span>
	</div>
</template>
