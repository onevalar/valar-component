<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@valar/vue-ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@valar/vue-ui/marker";

const ready = ref(false);
</script>

<template>
	<div class="grid gap-3">
		<Marker variant="separator"><MarkerContent>November 27</MarkerContent></Marker>
		<Marker variant="border" role="status"><MarkerIcon aria-hidden="true">{{ ready ? '✓' : '◌' }}</MarkerIcon><MarkerContent>{{ ready ? 'Files checked' : 'Checking files' }}</MarkerContent></Marker>
		<Button class="w-fit" variant="outline" size="sm" @click="ready = !ready">Toggle result</Button>
	</div>
</template>
