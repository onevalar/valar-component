<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ errors?: readonly ({ message?: string } | undefined | null)[] }>();
const messages = computed(() => [...new Set((props.errors ?? []).map(error => error?.message?.trim()).filter(Boolean))]);
</script>

<template>
	<div v-if="$slots.default || messages.length" role="alert" data-slot="field-error" class="cn-field-error font-normal">
		<slot>
			<template v-if="messages.length === 1">{{ messages[0] }}</template>
			<ul v-else class="ml-4 flex list-disc flex-col gap-1">
				<li v-for="message in messages" :key="message">{{ message }}</li>
			</ul>
		</slot>
	</div>
</template>
