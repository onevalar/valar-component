<script setup lang="ts">
import { cn } from "cn";
import {
	computed,
	nextTick,
	onMounted,
	provide,
	ref,
	shallowReactive,
	shallowRef,
	useId,
	watchPostEffect,
} from "vue";
import { commandGroupKey, commandKey, matchesCommand } from "./context";
import type { CommandEntry, CommandProps } from "./context";

const props = withDefaults(defineProps<CommandProps>(), {
	appearance: "default",
	shouldFilter: true,
	vimBindings: true,
});
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const entries = shallowReactive(new Map<string, CommandEntry>());
const query = ref("");
const list = shallowRef<HTMLElement | null>(null);
const listId = ref(`valar-command-list-${useId()}`);
const input = shallowRef<HTMLInputElement | null>(null);
const activeId = ref<string>();
const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});

// A slot can allocate fresh keywords on each render. Do not invalidate the
// parent list when those new props produce exactly the same membership.
function keepMembership(next: Set<string>, previous?: Set<string>) {
	return previous && next.size === previous.size && [...next].every((id) => previous.has(id))
		? previous
		: next;
}

const visible = computed<Set<string>>((previous) => {
	const term = query.value.trim();
	const visible = new Set<string>();
	for (const item of entries.values()) {
		if (
			item.forceMount ||
			!props.shouldFilter ||
			!term ||
			(props.filter
				? props.filter(item.value, term, item.keywords) > 0
				: matchesCommand(term, [item.value, ...item.keywords]))
		) {
			visible.add(item.id);
		}
	}
	return keepMembership(visible, previous);
});
const groups = computed<Set<string>>((previous) => {
	const groups = new Set<string>();
	for (const id of visible.value) {
		const group = entries.get(id)?.group;
		if (group) groups.add(group);
	}
	return keepMembership(groups, previous);
});

// Read DOM order, not component mount order: keyed slots can move or replace rows.
function navigable() {
	const visibleIds = visible.value;
	return [
		...(list.value?.querySelectorAll<HTMLElement>('[data-slot="command-item"]') ?? []),
	].filter((el) => visibleIds.has(el.id) && !entries.get(el.id)?.disabled);
}

function scrollActive(id: string) {
	const viewport = list.value;
	const item = navigable().find((el) => el.id === id);
	if (!viewport || !item) return;
	const row = item.getBoundingClientRect();
	const bounds = viewport.getBoundingClientRect();
	const top = bounds.top + viewport.clientTop;
	const bottom = top + viewport.clientHeight;
	if (row.top < top) viewport.scrollTop += row.top - top;
	else if (row.bottom > bottom) viewport.scrollTop += row.bottom - bottom;
}

function activate(id: string, scroll = true) {
	const entry = entries.get(id);
	if (!entry || entry.disabled || !visible.value.has(id) || id === activeId.value) return;
	if (props.modelValue === undefined) activeId.value = id;
	if (entry.value !== props.modelValue) emit("update:modelValue", entry.value);
	if (scroll)
		void nextTick(() => {
			if (activeId.value === id) scrollActive(id);
		});
}

let initialized = false;
let lastQuery = "";
watchPostEffect(() => {
	const items = navigable();
	const changedQuery = lastQuery !== query.value;
	lastQuery = query.value;
	const previous = activeId.value;
	const controlled = props.modelValue !== undefined;
	const requested = controlled ? props.modelValue : initialized ? undefined : props.defaultValue;
	const requestedItem =
		requested === undefined
			? undefined
			: items.find((item) => entries.get(item.id)?.value === requested);
	const next =
		requestedItem ?? ((!changedQuery && items.find((item) => item.id === previous)) || items[0]);
	activeId.value = next?.id;
	if (activeId.value !== previous) {
		const value = next ? (entries.get(next.id)?.value ?? "") : "";
		if (value !== props.modelValue) emit("update:modelValue", value);
		if (next && (initialized || !props.disableInitialScroll)) scrollActive(next.id);
	}
	if (items.length) initialized = true;
});

function onInputKeydown(event: KeyboardEvent) {
	if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.shiftKey)
		return;
	const { key, ctrlKey, metaKey, altKey } = event;
	if (key === "Enter" && !ctrlKey && !metaKey && !altKey) {
		event.preventDefault();
		if (!event.repeat)
			navigable()
				.find((el) => el.id === activeId.value)
				?.click();
		return;
	}
	const vim = props.vimBindings && ctrlKey && !metaKey && !altKey;
	const step =
		key === "ArrowDown" || (vim && (key === "n" || key === "j"))
			? 1
			: key === "ArrowUp" || (vim && (key === "p" || key === "k"))
				? -1
				: 0;
	// Ctrl/Meta shortcuts belong to the host; Ctrl+J/N/P/K are the optional exception.
	if (metaKey || (ctrlKey && (!vim || key.startsWith("Arrow")))) return;
	if (!step && (altKey || ctrlKey || (key !== "Home" && key !== "End"))) return;
	event.preventDefault();
	const items = navigable();
	const current = items.findIndex((el) => el.id === activeId.value);
	let index = step ? current + step : key === "Home" ? 0 : items.length - 1;
	if (step < 0 && current < 0) index = items.length - 1;
	if (step && altKey && current >= 0) {
		const group = entries.get(items[current]!.id)?.group;
		for (let i = current + step; i >= 0 && i < items.length; i += step) {
			const otherGroup = entries.get(items[i]!.id)?.group;
			if (otherGroup && otherGroup !== group) {
				index = items.findIndex((el) => entries.get(el.id)?.group === otherGroup);
				break;
			}
		}
	}
	if (props.loop && items.length && step) index = (index + items.length) % items.length;
	if (items[index]) activate(items[index].id);
}

provide(commandGroupKey, undefined);
provide(commandKey, {
	label: computed(() => props.label),
	query,
	list,
	listId,
	input,
	activeId,
	mounted,
	visible,
	groups,
	pointerSelection: computed(() => !props.disablePointerSelection),
	activate,
	onInputKeydown,
	register(entry) {
		entries.set(entry.id, entry);
		return () => entries.delete(entry.id);
	},
});

function focus(options?: FocusOptions) {
	const el = input.value;
	if (!el || el.disabled) return false;
	el.focus(options);
	return true;
}

defineExpose({ focus });
</script>

<template>
	<div
		data-slot="command"
		:data-command-compact="appearance === 'compact' ? '' : undefined"
		:class="
			cn(
				'cn-command flex size-full flex-col overflow-hidden',
				appearance === 'compact' && 'cn-command-compact',
				props.class
			)
		"
	>
		<slot />
	</div>
</template>
