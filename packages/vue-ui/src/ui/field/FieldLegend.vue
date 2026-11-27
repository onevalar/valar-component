<script setup lang="ts">
withDefaults(defineProps<{ variant?: "legend" | "label" }>(), { variant: "legend" });
</script>

<template>
	<legend data-slot="field-legend" :data-variant="variant" class="cn-field-legend"><slot /></legend>
</template>
