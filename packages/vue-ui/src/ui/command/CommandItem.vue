<script setup lang="ts">
import { CheckIcon } from "@lucide/vue";
import { cn } from "cn";
import {
	computed,
	inject,
	onMounted,
	onScopeDispose,
	shallowReactive,
	shallowRef,
	useId,
} from "vue";
import { commandGroupKey, useCommand } from "./context";
import type { CommandEntry, CommandItemProps } from "./context";

const props = withDefaults(defineProps<CommandItemProps & { as?: "div" | "a" }>(), {
	as: "div",
	checked: undefined,
});
const emit = defineEmits<{ select: [value: string, event: MouseEvent] }>();
const { activeId, activate, visible, register, pointerSelection, input } = useCommand();
const id = `valar-command-item-${useId()}`;
const group = inject(commandGroupKey, undefined);
const element = shallowRef<HTMLElement | null>(null);
const text = shallowRef("");
const entry = shallowReactive<CommandEntry>({
	id,
	group,
	get value() {
		return props.value ?? text.value;
	},
	get keywords() {
		return props.keywords ?? [];
	},
	get disabled() {
		return !!props.disabled;
	},
	get forceMount() {
		return !!props.forceMount;
	},
});
onScopeDispose(register(entry));
onMounted(() => {
	if (props.value === undefined) text.value = element.value?.textContent?.trim() ?? "";
});

const highlighted = computed(() => activeId.value === id);

function onClick(event: MouseEvent) {
	if (props.disabled || !visible.value.has(id)) {
		event.preventDefault();
		return;
	}
	if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey)
		return;
	activate(id, false);
	emit("select", entry.value, event);
}

function keepInputFocus(event: MouseEvent) {
	if (input.value && input.value === input.value.ownerDocument.activeElement)
		event.preventDefault();
}
</script>

<template>
	<component
		:is="as"
		v-show="visible.has(id)"
		:id="id"
		ref="element"
		role="option"
		tabindex="-1"
		:aria-selected="checked ?? highlighted"
		:aria-disabled="disabled || undefined"
		data-slot="command-item"
		:data-selected="highlighted ? '' : undefined"
		:data-disabled="disabled ? '' : undefined"
		:data-checked="checked"
		:data-value="entry.value"
		:class="
			cn(
				'cn-command-item group/command-item min-h-8 data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
				props.class
			)
		"
		@mousedown.left="keepInputFocus"
		@pointermove="
			(event: PointerEvent) => {
				if (event.pointerType !== 'touch' && pointerSelection) activate(id, false);
			}
		"
		@click="onClick"
	>
		<slot />
		<slot v-if="checked !== undefined" name="indicator" :checked="checked">
			<CheckIcon
				aria-hidden="true"
				:class="cn('ms-auto size-4 shrink-0', !checked && 'invisible')"
			/>
		</slot>
	</component>
</template>
