<script lang="ts">
import type { HTMLAttributes } from "vue";

export type TagsInputMessages = {
	empty: string;
	duplicate: string;
	max: (max: number) => string;
	invalid: string;
	added: (tag: string) => string;
	removed: (tag: string) => string;
	selected: (tag: string) => string;
};

export type TagsInputProps = {
	modelValue?: readonly string[];
	defaultValue?: readonly string[];
	inputValue?: string;
	defaultInputValue?: string;
	delimiter?: string | RegExp;
	max?: number;
	allowDuplicates?: boolean;
	addOnPaste?: boolean;
	addOnTab?: boolean;
	addOnBlur?: boolean;
	validate?: (tag: string) => boolean | string;
	removeLabel?: (tag: string) => string;
	requiredMessage?: string;
	messages?: Partial<TagsInputMessages>;
	tagsLabel?: string;
	name?: string;
	form?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	dir?: HTMLAttributes["dir"];
	class?: HTMLAttributes["class"];
};

const defaultMessages: TagsInputMessages = {
	empty: "标签不能为空。",
	duplicate: "标签已存在。",
	max: (max) => `最多 ${max} 个标签。`,
	invalid: "标签无效。",
	added: (tag) => `已添加 ${tag}`,
	removed: (tag) => `已移除 ${tag}`,
	selected: (tag) => `已选中 ${tag}，按 Delete 删除。`,
};
</script>

<script setup lang="ts">
import { cn } from "cn";
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	useAttrs,
	useId,
	watch,
	watchEffect,
} from "vue";

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();
const props = withDefaults(defineProps<TagsInputProps>(), {
	defaultValue: () => [],
	defaultInputValue: "",
	delimiter: ",",
	max: 0,
	addOnPaste: true,
	removeLabel: (tag: string) => `移除 ${tag}`,
	requiredMessage: "请至少添加一个标签。",
	tagsLabel: "标签",
});
const emit = defineEmits<{
	"update:modelValue": [value: string[]];
	"update:inputValue": [value: string];
	add: [tag: string];
	remove: [tag: string];
	"invalid-tag": [tag: string, reason: string];
}>();

const uid = useId();
const initialTags = [...(props.modelValue ?? props.defaultValue)];
const initialDraft = props.inputValue ?? props.defaultInputValue;
const localValue = ref(initialTags);
const localDraft = ref(initialDraft);
const value = computed(() => props.modelValue ?? localValue.value);
const draft = computed(() => props.inputValue ?? localDraft.value);
const messages = computed(() => ({ ...defaultMessages, ...props.messages }));
const input = ref<HTMLInputElement | null>(null);
const root = ref<HTMLDivElement | null>(null);
const selected = ref(-1);
const selectedTag = computed(() => (selected.value < 0 ? undefined : value.value[selected.value]));
const error = ref("");
const announcement = ref("");
let composition: object | null = null;
let expectedValue = value.value;

defineExpose({ input });

watch(value, (next) => {
	if (
		expectedValue.length !== next.length ||
		expectedValue.some((tag, index) => tag !== next[index])
	) {
		selected.value = -1;
		error.value = "";
	}
	expectedValue = next;
});
watchEffect(
	() => {
		input.value?.setCustomValidity(
			props.disabled || props.readonly
				? ""
				: error.value || (props.required && !value.value.length ? props.requiredMessage : "")
		);
	},
	{ flush: "post" }
);

function update(next: string[]) {
	expectedValue = next;
	if (props.modelValue === undefined) localValue.value = next;
	emit("update:modelValue", [...next]);
}

function updateDraft(next: string) {
	const previous = draft.value;
	if (props.inputValue === undefined) localDraft.value = next;
	if (next !== previous) emit("update:inputValue", next);
	if (props.inputValue !== undefined) {
		void nextTick(() => {
			const control = input.value;
			if (control && !composition && control.value !== draft.value) control.value = draft.value;
		});
	}
}

let resetTimer: ReturnType<typeof setTimeout>;
function reset(event: Event) {
	const control = input.value;
	if (!control || event.target !== control.form) return;
	clearTimeout(resetTimer);
	resetTimer = setTimeout(() => {
		if (event.defaultPrevented || input.value !== control) return;
		composition = null;
		update([...initialTags]);
		updateDraft(initialDraft);
		control.value = draft.value;
		selected.value = -1;
		error.value = "";
		announcement.value = "";
	}, 0);
}

let ownerDocument: Document | undefined;
onMounted(() => {
	ownerDocument = input.value?.ownerDocument;
	ownerDocument?.addEventListener("reset", reset, true);
});
onUnmounted(() => {
	clearTimeout(resetTimer);
	ownerDocument?.removeEventListener("reset", reset, true);
});

function add(text: string, tags: readonly string[]) {
	const tag = text.trim();
	const texts = messages.value;
	const custom = tag ? props.validate?.(tag) : undefined;
	const reason = !tag
		? texts.empty
		: !props.allowDuplicates && tags.includes(tag)
			? texts.duplicate
			: props.max > 0 && tags.length >= props.max
				? texts.max(props.max)
				: custom === false
					? texts.invalid
					: typeof custom === "string"
						? custom
						: "";
	if (reason) {
		emit("invalid-tag", tag, reason);
		return { tags, error: reason };
	}
	const next = [...tags, tag];
	update(next);
	selected.value = -1;
	emit("add", tag);
	announcement.value = texts.added(tag);
	return { tags: next, error: "" };
}

function commitDraft(text: string) {
	const result = add(text, value.value);
	error.value = result.error;
	if (!result.error) updateDraft("");
}

function addMany(text: string, complete: boolean) {
	const delimiter = props.delimiter;
	const parts = delimiter ? text.split(delimiter) : [text];
	const tail = complete ? "" : parts.pop();
	const rejected: string[] = [];
	let tags = value.value;
	let rejection = "";
	for (const part of parts) {
		if (!part.trim()) continue;
		const result = add(part, tags);
		tags = result.tags;
		if (result.error) {
			rejected.push(part);
			rejection = result.error;
		}
	}
	error.value = rejection;
	updateDraft(
		[...rejected, tail].filter(Boolean).join(typeof delimiter === "string" ? delimiter : ",")
	);
}

function remove(index: number) {
	const tags = value.value;
	if (props.disabled || props.readonly || composition || index < 0 || index >= tags.length) return;
	const tag = tags[index];
	const next = tags.filter((_, i) => i !== index);
	update(next);
	error.value = "";
	selected.value = Math.min(index, next.length - 1);
	emit("remove", tag);
	announcement.value = messages.value.removed(tag);
	input.value?.focus();
}

function keydown(event: KeyboardEvent) {
	if (
		event.defaultPrevented ||
		event.isComposing ||
		event.keyCode === 229 ||
		composition ||
		props.disabled ||
		props.readonly
	)
		return;
	if ((event.key === "Enter" || (event.key === "Tab" && props.addOnTab)) && draft.value.trim()) {
		event.preventDefault();
		commitDraft(draft.value);
		return;
	}
	if (event.key === "Escape") {
		selected.value = -1;
		error.value = "";
		return;
	}
	const control = event.currentTarget as HTMLInputElement;
	if (control.selectionStart !== 0 || control.selectionEnd !== 0) {
		selected.value = -1;
		return;
	}
	const length = value.value.length;
	if (!length || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
	const rtl = getComputedStyle(control).direction === "rtl";
	if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
		event.preventDefault();
		selected.value = selectedTag.value === undefined ? length - 1 : Math.max(0, selected.value - 1);
	} else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight") && selectedTag.value !== undefined) {
		event.preventDefault();
		selected.value = selected.value === length - 1 ? -1 : selected.value + 1;
	} else if (
		event.key === "Backspace" ||
		(event.key === "Delete" && selectedTag.value !== undefined)
	) {
		event.preventDefault();
		if (selectedTag.value === undefined) selected.value = length - 1;
		else remove(selected.value);
	} else if ((event.key === "Home" || event.key === "End") && selectedTag.value !== undefined) {
		event.preventDefault();
		selected.value = event.key === "Home" ? 0 : length - 1;
	}
}

function edit(event: Event) {
	const inputEvent = event as InputEvent;
	if (props.disabled || props.readonly) return;
	const text = (event.currentTarget as HTMLInputElement).value;
	selected.value = -1;
	error.value = "";
	if (
		!composition &&
		!inputEvent.isComposing &&
		(props.addOnPaste || inputEvent.inputType !== "insertFromPaste") &&
		props.delimiter &&
		text.split(props.delimiter).length > 1
	)
		addMany(text, false);
	else updateDraft(text);
}

function paste(event: ClipboardEvent) {
	if (
		event.defaultPrevented ||
		!props.addOnPaste ||
		composition ||
		props.disabled ||
		props.readonly ||
		!event.clipboardData
	)
		return;
	event.preventDefault();
	const { value: text, selectionStart, selectionEnd } = event.currentTarget as HTMLInputElement;
	const start = selectionStart ?? text.length;
	addMany(
		text.slice(0, start) +
			event.clipboardData.getData("text/plain") +
			text.slice(selectionEnd ?? start),
		true
	);
}

function blur(event: FocusEvent) {
	if (
		!root.value?.contains(event.relatedTarget as Node | null) &&
		props.addOnBlur &&
		!props.disabled &&
		!props.readonly &&
		!composition &&
		draft.value.trim()
	)
		commitDraft(draft.value);
	selected.value = -1;
}

function compositionEnd(event: CompositionEvent) {
	if (!props.disabled && !props.readonly)
		updateDraft((event.currentTarget as HTMLInputElement).value);
	const token = composition;
	queueMicrotask(() => {
		if (composition === token) composition = null;
	});
}
</script>

<template>
	<div
		ref="root"
		:dir="dir"
		data-slot="tags-input"
		:data-disabled="disabled || undefined"
		:class="
			cn(
				'cn-tags-input flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-md border-[0.5px] border-[color:lch(86.5%_0_282)] bg-white p-1.5 text-[13px] text-foreground transition-colors duration-150 has-aria-invalid:border-destructive has-aria-invalid:outline-destructive not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-1 not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:-outline-offset-1 not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-ring not-has-[[data-selected]]:has-[>[data-slot=tags-input-input]:focus-visible]:outline-solid motion-reduce:transition-none dark:border-[color:lch(30.833%_1.93_272)] dark:bg-[lch(9.232%_.85_272)]',
				props.class
			)
		"
	>
		<ul :aria-label="tagsLabel" class="contents">
			<li
				v-for="(tag, index) in value"
				:key="index"
				data-slot="tags-input-item"
				:data-selected="selected === index || undefined"
				class="inline-flex min-h-[18px] max-w-full min-w-0 items-center gap-1 rounded-[5px] border-[0.5px] border-border bg-[#F4F4F6] px-1.5 text-xs leading-4 font-medium text-foreground data-selected:border-ring data-selected:bg-primary/10 data-selected:outline-1 data-selected:-outline-offset-1 data-selected:outline-ring data-selected:outline-solid dark:bg-[#1C1D21]"
			>
				<span class="min-w-0 break-all">{{ tag }}</span>
				<button
					type="button"
					:aria-label="removeLabel(tag)"
					:disabled="disabled || readonly"
					class="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring focus-visible:outline-solid disabled:opacity-40 motion-reduce:transition-none"
					@click="remove(index)"
				>
					×
				</button>
			</li>
		</ul>
		<input
			v-bind="attrs"
			ref="input"
			type="text"
			data-slot="tags-input-input"
			class="h-4.5 min-w-20 flex-1 bg-transparent px-1 text-[13px] outline-none placeholder:text-[color:lch(66%_1_282)] disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-[color:lch(39.452%_1.425_272)]"
			:form="form"
			:disabled="disabled"
			:readonly="readonly"
			:required="required && !value.length"
			:value="draft"
			:aria-invalid="!!error || (attrs['aria-invalid'] as HTMLAttributes['aria-invalid'])"
			:aria-describedby="
				[attrs['aria-describedby'], `${uid}-status`, error && `${uid}-error`]
					.filter(Boolean)
					.join(' ')
			"
			@input="edit"
			@keydown="keydown"
			@paste="paste"
			@blur="blur"
			@compositionstart="composition = {}"
			@compositionend="compositionEnd"
		/>
	</div>
	<span :id="`${uid}-status`" class="sr-only" aria-live="polite">{{
		selectedTag !== undefined ? messages.selected(selectedTag) : announcement
	}}</span>
	<span :id="`${uid}-error`" class="block text-xs text-destructive not-empty:mt-1" role="status">{{
		error
	}}</span>
	<template v-if="name">
		<input
			v-for="(tag, index) in value"
			:key="index"
			type="hidden"
			:name="name"
			:form="form"
			:disabled="disabled"
			:value="tag"
		/>
	</template>
</template>
