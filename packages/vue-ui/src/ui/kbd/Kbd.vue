<script setup lang="ts">
withDefaults(defineProps<{ appearance?: "default" | "inline" | "compact" }>(), { appearance: "default" });
</script>

<template>
	<kbd data-slot="kbd" :data-appearance="appearance" class="cn-kbd pointer-events-none inline-flex items-center justify-center select-none"><slot /></kbd>
</template>
