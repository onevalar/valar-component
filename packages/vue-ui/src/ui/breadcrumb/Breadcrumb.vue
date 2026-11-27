<script setup lang="ts">
import { cn } from "cn";
import type { HTMLAttributes } from "vue";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
		appearance?: "default" | "workspace";
	}>(),
	{ appearance: "default" }
);
</script>

<template>
	<nav
		aria-label="面包屑导航"
		data-slot="breadcrumb"
		:data-appearance="appearance"
		:class="cn(appearance === 'workspace' && `cn-breadcrumb-workspace`, props.class)"
	>
		<slot />
	</nav>
</template>
