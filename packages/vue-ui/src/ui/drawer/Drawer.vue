<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import { DrawerRoot, DrawerRootNested } from "vaul-vue";
import type { DrawerRootEmits, DrawerRootProps } from "vaul-vue";

const props = withDefaults(defineProps<DrawerRootProps>(), { shouldScaleBackground: true });
const emits = defineEmits<DrawerRootEmits>();
const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
	<component :is="nested ? DrawerRootNested : DrawerRoot" v-bind="forwarded">
		<slot />
	</component>
</template>
