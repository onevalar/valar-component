import { inject } from "vue";
import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { HTMLAttributes } from "vue";

export type CommandFilter = (value: string, query: string, keywords: readonly string[]) => number;

export interface CommandProps {
	modelValue?: string;
	defaultValue?: string;
	appearance?: "default" | "compact";
	label?: string;
	shouldFilter?: boolean;
	filter?: CommandFilter;
	loop?: boolean;
	disablePointerSelection?: boolean;
	disableInitialScroll?: boolean;
	vimBindings?: boolean;
	class?: HTMLAttributes["class"];
}

export interface CommandItemProps {
	value?: string;
	keywords?: readonly string[];
	disabled?: boolean;
	forceMount?: boolean;
	/** Committed selection. When absent, aria-selected follows the active command. */
	checked?: boolean;
	class?: HTMLAttributes["class"];
}

export interface CommandEntry {
	id: string;
	group?: string;
	value: string;
	keywords: readonly string[];
	disabled: boolean;
	forceMount: boolean;
}

export interface CommandContext {
	label: ComputedRef<string | undefined>;
	query: Ref<string>;
	activeId: Ref<string | undefined>;
	listId: Ref<string>;
	list: Ref<HTMLElement | null>;
	input: Ref<HTMLInputElement | null>;
	mounted: Ref<boolean>;
	visible: ComputedRef<Set<string>>;
	groups: ComputedRef<Set<string>>;
	register: (entry: CommandEntry) => () => void;
	activate: (id: string, scroll?: boolean) => void;
	pointerSelection: ComputedRef<boolean>;
	onInputKeydown: (event: KeyboardEvent) => void;
}

export const commandKey: InjectionKey<CommandContext> = Symbol("ValarCommand");
export const commandGroupKey: InjectionKey<string | undefined> = Symbol("ValarCommandGroup");

export function useCommand() {
	const command = inject(commandKey);
	if (!command) throw new Error("Command parts must be rendered inside Command or CommandDialog.");
	return command;
}

function normalize(text: string) {
	return text
		.normalize("NFD")
		.replace(/\p{Mark}/gu, "")
		.toLowerCase()
		.trim();
}

export function matchesCommand(term: string, fields: readonly string[]) {
	const text = normalize(fields.join(" "));
	const words = normalize(term).split(/\s+/);
	return Number(
		words.every((word) => {
			if (text.includes(word)) return true;
			let start = 0;
			for (const char of word) {
				const next = text.indexOf(char, start);
				if (next < 0) return false;
				start = next + char.length;
			}
			return true;
		})
	);
}
