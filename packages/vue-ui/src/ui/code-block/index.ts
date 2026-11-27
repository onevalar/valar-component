import { cn } from "cn";
import { computed, defineComponent, h, onMounted, shallowRef, toValue, watch, type MaybeRefOrGetter } from "vue";
import type { createCodeStream, HighlightedLine } from "../../lib/code-highlighter";

export { default as CodeBlock } from "./CodeBlock.vue";
export { default as CodeBlockContent } from "./CodeBlockContent.vue";
export { default as CodeBlockLine, type CodeBlockLineToken } from "./CodeBlockLine.vue";
export { default as CodeBlockCopyButton } from "./CodeBlockCopyButton.vue";

export type CodeBlockVariant = "default" | "destructive";
export type CodeBlockSize = "default" | "sm";
export type CodeBlockLineVariant = "default" | "added" | "removed" | "highlighted";

function area(slot: string, classes: string) {
	return defineComponent({
		inheritAttrs: false,
		setup(_, { attrs, slots }) {
			return () => h("div", { ...attrs, "data-slot": slot, class: cn(classes, attrs.class) }, slots.default?.());
		},
	});
}

export const CodeBlockHeader = area("code-block-header", "cn-code-block-header flex min-w-0 shrink-0 items-center *:has-[>[data-slot=code-block-title]]:min-w-0");
export const CodeBlockTitle = area("code-block-title", "cn-code-block-title min-w-0 truncate [&_svg]:pointer-events-none [&_svg]:inline-block [&_svg]:align-middle");
export const CodeBlockActions = area("code-block-actions", "cn-code-block-actions ms-auto flex shrink-0 items-center [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:group-focus-within/code-block:opacity-100 [[data-slot=code-block]>&]:group-hover/code-block:opacity-100 [[data-slot=code-block]>&]:pointer-coarse:opacity-100");
export const CodeBlockFooter = area("code-block-footer", "cn-code-block-footer flex min-w-0 shrink-0 items-center");

/** Returns plain lines until the requested grammar is ready. */
export function useHighlightedCode(code: MaybeRefOrGetter<string>, language: MaybeRefOrGetter<string>) {
	const loaded = shallowRef<{ language: string; stream: ReturnType<typeof createCodeStream<HighlightedLine, unknown>> }>();
	onMounted(() => {
		watch(() => toValue(language), (lang, _, onCleanup) => {
			let active = true;
			onCleanup(() => { active = false; });
			void import("../../lib/code-highlighter").then(async ({ createCodeStream, loadHighlighter }) => {
				const highlighter = await loadHighlighter(lang);
				if (active && highlighter) loaded.value = { language: lang, stream: createCodeStream(highlighter) };
			}).catch(() => {});
		}, { immediate: true });
	});
	return computed<HighlightedLine[]>(() => {
		const text = toValue(code);
		try {
			if (loaded.value?.language === toValue(language)) return loaded.value.stream(text);
		} catch {
			// Keep the code readable if the optional grammar cannot tokenize it.
		}
		return text.replace(/\n$/, "").split("\n");
	});
}
