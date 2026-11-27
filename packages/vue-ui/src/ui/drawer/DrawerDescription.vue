<script setup lang="ts">
import { cn } from "cn";
import { DrawerDescription } from "vaul-vue";
import type { DrawerDescriptionProps } from "vaul-vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<DrawerDescriptionProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
	<DrawerDescription
		:as="as"
		:as-child="asChild"
		data-slot="drawer-description"
		:class="cn('cn-drawer-description', props.class)"
		><slot
	/></DrawerDescription>
</template>
