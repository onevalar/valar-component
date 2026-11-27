<script setup lang="ts">
import { cn } from "cn";
import { DrawerTitle } from "vaul-vue";
import type { DrawerTitleProps } from "vaul-vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<DrawerTitleProps & { class?: HTMLAttributes["class"] }>();
</script>

<template>
	<DrawerTitle
		:as="as"
		:as-child="asChild"
		data-slot="drawer-title"
		:class="cn('cn-font-heading cn-drawer-title', props.class)"
		><slot
	/></DrawerTitle>
</template>
