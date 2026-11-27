<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import Drawer from "./Drawer.vue";
import type { DrawerRootEmits, DrawerRootProps } from "vaul-vue";

const props = defineProps<DrawerRootProps>();
const emit = defineEmits<DrawerRootEmits>();
const forwarded = useForwardPropsEmits(props, emit);
</script>

<template>
	<Drawer v-bind="forwarded" nested><slot /></Drawer>
</template>
