// Adapted from Valar's MIT Svelte questionnaire, which credits shadcn-ui/ui.
// Keep in sync with vue-ui/src/ui/questionnaire/state.ts. DOM and state, no framework runtime.
export type QuestionnaireItemStatus = "answered" | "unanswered" | "skipped";
export type QuestionnaireShortcutMode = "letters" | "numbers";
export type QuestionnaireChoiceDefinition = { value: string; disabled?: boolean };
export type QuestionnaireItemDefinition = {
	name: string;
	required?: boolean;
	disabled?: boolean;
	choices?: readonly QuestionnaireChoiceDefinition[];
};
export type QuestionnaireInputType =
	| "date"
	| "datetime-local"
	| "email"
	| "month"
	| "number"
	| "password"
	| "search"
	| "tel"
	| "text"
	| "time"
	| "url"
	| "week";
export type QuestionnaireMessages = {
	progressLabel: string;
	progress: (current: number, total: number) => string;
	requiredError: string;
	optionalError: string;
};
const defaults: QuestionnaireMessages = {
	progressLabel: "问卷进度",
	progress: (current, total) => `第 ${current} 题，共 ${total} 题`,
	requiredError: "请选择一个答案后继续。",
	optionalError: "请选择一个答案或跳过此题。",
};
export type QuestionnaireOptions = {
	item?: string;
	defaultItem?: string;
	items?: readonly QuestionnaireItemDefinition[];
	noValidate?: boolean;
	shortcuts?: QuestionnaireShortcutMode;
	messages?: Partial<QuestionnaireMessages>;
	onItemChange?: (name: string) => void;
};
export type QuestionnaireRootState = {
	current: number;
	total: number;
	first: boolean;
	last: boolean;
};
export type QuestionnaireNavigation = "previous" | "next" | "skip" | "submit";
export type QuestionnaireNavigationState = {
	visible: boolean;
	disabled: boolean;
	shortcut: "Enter" | null;
	status: QuestionnaireItemStatus | null;
};
export type QuestionnaireItemState = {
	active: boolean;
	disabled: boolean;
	invalid: boolean;
	multiple: boolean;
	required: boolean;
	status: QuestionnaireItemStatus;
};
type ItemOptions = {
	name: string;
	disabled?: boolean;
	required?: boolean;
	invalid?: boolean;
	multiple?: boolean;
};
export type AnswerOptions = {
	kind: "choice" | "input";
	value?: string;
	disabled?: boolean;
	checked?: boolean;
	defaultChecked?: boolean;
	defaultValue?: string;
};
export type Answer = { id: string; props: AnswerOptions; element: HTMLInputElement; draft: string };
const sameItems = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) =>
	a === b || JSON.stringify(a) === JSON.stringify(b);
const order = (a: { element: Element | null }, b: { element: Element | null }) =>
	a.element && b.element ? (a.element.compareDocumentPosition(b.element) & 2 ? 1 : -1) : 0;
const filled = (value: string | undefined) => !!value?.trim();
export const present = (value: unknown) => (value ? "" : undefined);
export const joinIds = (...values: (string | undefined | false)[]) =>
	values.filter(Boolean).join(" ") || undefined;

export class QuestionnaireModel {
	element: HTMLFormElement | null = null;
	private local: string | undefined;
	private mounted = new Set<QuestionnaireItemModel>();
	private listeners = new Set<() => void>();
	private revision = 0;
	private pending?: { name: string; invalid: boolean };
	private repairRequest?: string;
	private previousName?: string;
	private initialized = false;
	constructor(public options: QuestionnaireOptions) {
		this.local = options.defaultItem;
	}
	snapshot = () => this.revision;
	subscribe = (listener: () => void) => {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	};
	changed = () => {
		this.revision++;
		this.listeners.forEach((listener) => listener());
	};
	setOptions(options: QuestionnaireOptions) {
		const last = this.options;
		this.options = options;
		if (
			last.item !== options.item ||
			last.shortcuts !== options.shortcuts ||
			last.noValidate !== options.noValidate ||
			!sameItems(last.items, options.items) ||
			last.messages?.progress !== options.messages?.progress ||
			last.messages?.progressLabel !== options.messages?.progressLabel ||
			last.messages?.requiredError !== options.messages?.requiredError ||
			last.messages?.optionalError !== options.messages?.optionalError
		)
			this.changed();
	}
	register(item: QuestionnaireItemModel) {
		this.mounted.add(item);
		this.changed();
		return () => {
			this.mounted.delete(item);
			this.changed();
		};
	}
	definition(name: string) {
		return this.options.items?.find((item) => item.name === name);
	}
	get available() {
		return (
			this.options.items?.filter((item) => !item.disabled) ??
			[...this.mounted]
				.filter((item) => !item.disabled)
				.sort(order)
				.map((item) => item.props)
		);
	}
	get name() {
		const available = this.available;
		const requested = this.options.item ?? this.local;
		return available.find((item) => item.name === requested)?.name ?? available[0]?.name;
	}
	get view(): QuestionnaireRootState {
		const available = this.available;
		const current = available.findIndex((item) => item.name === this.name) + 1;
		const total = available.length;
		return { current, total, first: current === 1, last: current > 0 && current === total };
	}
	get messages() {
		return { ...defaults, ...this.options.messages };
	}
	get current() {
		return [...this.mounted].find((item) => item.props.name === this.name && !item.disabled);
	}
	private setName(name: string, invalid = false) {
		this.pending = { name, invalid };
		if (name !== this.name) {
			if (this.options.item === undefined) this.local = name;
			this.options.onItemChange?.(name);
		}
		this.changed();
	}
	settle = () => {
		const name = this.name;
		if (!name) return;
		const requested = this.options.item ?? this.local;
		if (requested !== name) {
			if (this.options.item === undefined) this.local = name;
			if (this.initialized && requested && this.repairRequest !== requested) {
				this.repairRequest = requested;
				this.options.onItemChange?.(name);
			}
		} else this.repairRequest = undefined;
		const current = this.current;
		// A controlled prop can arrive one commit before the destination is visible.
		// Keep the requested focus (including error focus) until its DOM is ready.
		if (!current?.element || current.element.hidden) return;
		if (this.pending?.name === name) {
			const invalid = this.pending.invalid;
			this.pending = undefined;
			current.focus(invalid);
		} else if (this.initialized && this.previousName !== name && this.options.item !== undefined) {
			this.pending = undefined;
			current.focus(false);
		}
		this.previousName = name;
		this.initialized = true;
	};
	navigation(action: QuestionnaireNavigation, disabled = false): QuestionnaireNavigationState {
		const { current, total } = this.view;
		const required = this.name && (this.definition(this.name)?.required ?? this.current?.required);
		const visible =
			current > 0 &&
			(action === "previous"
				? current > 1
				: action === "next"
					? current < total
					: action === "submit"
						? current === total
						: !required);
		return {
			visible,
			disabled: disabled || !current,
			status: current ? (this.current?.status ?? "unanswered") : null,
			shortcut: visible && !disabled && (action === "next" || action === "submit") ? "Enter" : null,
		};
	}
	act(action: QuestionnaireNavigation, afterRender: (fn: () => void) => void) {
		const item = this.current;
		const { current, last } = this.view;
		if (!item || !current) return;
		const actionButton = (name: QuestionnaireNavigation) =>
			this.element?.querySelector<HTMLButtonElement>(
				`button[data-slot="questionnaire-${name}"]:not([hidden])`
			);
		const trigger = actionButton(action === "next" && last ? "submit" : action);
		if (trigger?.matches(":disabled")) return;
		if (action === "previous") {
			const previous = this.available[current - 2];
			if (previous) this.setName(previous.name);
			return;
		}
		if (action === "skip") {
			if (item.required) return;
			item.selected.clear();
			item.skipped = true;
			this.changed();
		} else if (!item.validate()) {
			this.setName(item.props.name, true);
			return;
		}
		if (last)
			afterRender(() => {
				const submit = actionButton("submit");
				if (this.current !== item || submit?.matches(":disabled")) return;
				this.element?.requestSubmit(submit?.type === "submit" ? submit : undefined);
			});
		else this.setName(this.available[current].name);
	}
	validateSubmit() {
		for (const { name } of this.available) {
			const item = [...this.mounted].find((item) => item.props.name === name && !item.disabled);
			if (item && !item.validate()) {
				this.setName(name, true);
				return false;
			}
		}
		return true;
	}
	nativeInvalid(target: EventTarget | null) {
		const item = [...this.mounted].find(
			(item) => target instanceof Element && item.element?.contains(target)
		);
		if (item && !item.disabled && !item.active && !this.pending?.invalid)
			this.setName(item.props.name, true);
	}
	reset() {
		this.pending = undefined;
		for (const item of this.mounted) item.reset();
		const initial =
			this.available.find((item) => item.name === this.options.defaultItem) ?? this.available[0];
		if (initial && initial.name !== this.name) this.setName(initial.name);
		else this.changed();
	}
	keyDown(event: KeyboardEvent, afterRender: (fn: () => void) => void) {
		const item = this.current;
		const target = event.target;
		if (
			!item ||
			!(target instanceof HTMLElement) ||
			event.defaultPrevented ||
			event.isComposing ||
			event.keyCode === 229 ||
			target.closest("form") !== this.element
		)
			return;
		const { key } = event;
		if (key === "Enter" && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
			event.preventDefault();
			if (!event.repeat) this.act("next", afterRender);
			return;
		}
		if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
		const answers = item.answers;
		const index = answers.findIndex((answer) => answer.element === target);
		const answer = answers[index];
		const radio = target instanceof HTMLInputElement && target.type === "radio";
		const text = !!target.closest(
			"input:not([type=radio]):not([type=checkbox]):not([type=button]):not([type=submit]):not([type=reset]), textarea, select, [contenteditable]:not([contenteditable=false])"
		);
		const emptyText =
			answer?.props.kind === "input" &&
			["email", "password", "search", "tel", "text", "url"].includes(answer.element.type) &&
			!filled(answer.element.value);
		if (
			(key === "ArrowDown" || key === "ArrowUp") &&
			(!text || emptyText) &&
			(answer || target === item.element) &&
			answers.length
		) {
			const step = key === "ArrowDown" ? 1 : -1;
			const next =
				index < 0
					? (answers.find((answer) => item.selected.has(answer.id)) ??
						answers[step > 0 ? 0 : answers.length - 1])
					: answers[(index + step + answers.length) % answers.length];
			if (next.element !== target && !(radio && next.element.type === "radio")) {
				event.preventDefault();
				next.element.focus();
				if (next.element.type === "radio") next.element.click();
			}
			return;
		}
		if ((key === "ArrowLeft" || key === "ArrowRight") && !text && !radio) {
			event.preventDefault();
			const forward =
				(key === "ArrowRight") !== (getComputedStyle(this.element!).direction === "rtl");
			if (!event.repeat && (!forward || (item.status !== "unanswered" && !this.view.last)))
				this.act(forward ? "next" : "previous", afterRender);
			return;
		}
		if (key === "Enter" && answer) {
			event.preventDefault();
			if (!event.repeat && item.selected.has(answer.id)) this.act("next", afterRender);
			return;
		}
		const mode = this.options.shortcuts;
		if (text || !mode) return;
		const shortcut = mode === "letters" ? key.toUpperCase() : key;
		const choice = answers.find(
			(answer) =>
				answer.props.kind === "choice" && item.shortcut(answer.props.value!, answer.id) === shortcut
		);
		if (!choice) return;
		event.preventDefault();
		if (!event.repeat) {
			choice.element.focus();
			choice.element.click();
		}
	}
}

export class QuestionnaireItemModel {
	element: HTMLFieldSetElement | null = null;
	controls = new Map<string, Answer>();
	selected = new Set<string>();
	skipped = false;
	private attempted = false;
	private descriptions = new Set<string>();
	private errors = new Set<string>();
	constructor(
		public root: QuestionnaireModel,
		public props: ItemOptions
	) {}
	setProps(props: ItemOptions) {
		const old = this.props;
		this.props = props;
		if (!props.multiple && this.selected.size > 1) {
			const first = this.answers.find((answer) => this.selected.has(answer.id));
			this.selected.clear();
			if (first) this.selected.add(first.id);
		}
		if (
			old.name !== props.name ||
			old.multiple !== props.multiple ||
			old.disabled !== props.disabled ||
			old.required !== props.required ||
			old.invalid !== props.invalid
		)
			this.root.changed();
	}
	get disabled() {
		return !!(
			this.props.disabled ||
			this.root.definition(this.props.name)?.disabled ||
			(this.root.options.items && !this.root.definition(this.props.name))
		);
	}
	get required() {
		return !!(this.props.required ?? this.root.definition(this.props.name)?.required);
	}
	get active() {
		return !this.disabled && this.root.name === this.props.name;
	}
	get answers() {
		return [...this.controls.values()].filter((answer) => !answer.props.disabled).sort(order);
	}
	get status(): QuestionnaireItemStatus {
		return this.skipped
			? "skipped"
			: this.answers.some((answer) => this.selected.has(answer.id))
				? "answered"
				: "unanswered";
	}
	get invalid() {
		return (
			!this.disabled &&
			!(this.skipped && !this.required) &&
			(!!this.props.invalid || (this.attempted && this.status !== "answered"))
		);
	}
	get view(): QuestionnaireItemState {
		return {
			active: this.active,
			disabled: this.disabled,
			invalid: this.invalid,
			multiple: !!this.props.multiple,
			required: this.required,
			status: this.status,
		};
	}
	get describedBy() {
		return joinIds(...this.descriptions, ...(this.invalid ? this.errors : []));
	}
	get keyShortcuts() {
		const rtl = !!this.element && getComputedStyle(this.element).direction === "rtl";
		return this.active
			? joinIds(
					"Meta+Enter Control+Enter",
					this.answers.length > 0 && "ArrowUp ArrowDown",
					!this.root.view.first && (rtl ? "ArrowRight" : "ArrowLeft"),
					!this.root.view.last && this.status !== "unanswered" && (rtl ? "ArrowLeft" : "ArrowRight")
				)
			: undefined;
	}
	associate(kind: "description" | "error", id: string) {
		const ids = kind === "description" ? this.descriptions : this.errors;
		ids.add(id);
		this.root.changed();
		return () => {
			ids.delete(id);
			this.root.changed();
		};
	}
	shortcut(value: string, id: string) {
		const mode = this.root.options.shortcuts;
		if (!mode) return;
		const definition = this.root.definition(this.props.name);
		const index = this.root.options.items
			? (definition?.choices
					?.filter((choice) => !choice.disabled)
					.findIndex((choice) => choice.value === value) ?? -1)
			: this.answers
					.filter((answer) => answer.props.kind === "choice")
					.findIndex((answer) => answer.id === id);
		if (index < 0 || index >= (mode === "numbers" ? 9 : 26)) return;
		return mode === "numbers" ? String(index + 1) : String.fromCharCode(65 + index);
	}
	register(id: string, element: HTMLInputElement, props: AnswerOptions) {
		const answer = { id, element, props, draft: props.defaultValue ?? "" };
		this.controls.set(id, answer);
		if (
			this.isSelectedDefault(answer) &&
			(props.checked !== undefined ||
				(props.value !== undefined && props.kind === "input") ||
				this.props.multiple ||
				!this.selected.size)
		)
			this.select(id, true);
		this.root.changed();
		return () => {
			this.controls.delete(id);
			this.selected.delete(id);
			this.root.changed();
		};
	}
	update(id: string, props: AnswerOptions) {
		const answer = this.controls.get(id);
		if (!answer) return;
		const old = answer.props;
		answer.props = props;
		if (props.kind === "choice" && props.checked !== undefined && props.checked !== old.checked)
			this.select(id, props.checked);
		if (props.kind === "input" && props.value !== undefined && props.value !== old.value)
			this.select(id, filled(props.value));
		if (
			old.checked !== props.checked ||
			old.value !== props.value ||
			old.disabled !== props.disabled
		)
			this.root.changed();
	}
	edit(id: string, value: string | boolean) {
		const answer = this.controls.get(id);
		if (!answer || answer.props.disabled || this.disabled) return;
		if (typeof value === "boolean") {
			if (answer.props.checked === undefined || (this.skipped && answer.props.checked === value))
				this.select(id, value);
		} else if (answer.props.value === undefined) {
			answer.draft = value;
			this.select(id, filled(value));
		}
		this.root.changed();
	}
	private isSelectedDefault(answer: Answer) {
		return answer.props.kind === "choice"
			? !!(answer.props.checked ?? answer.props.defaultChecked)
			: filled(answer.props.value ?? answer.props.defaultValue);
	}
	private select(id: string, selected: boolean) {
		this.skipped = false;
		if (!selected) this.selected.delete(id);
		else {
			if (!this.props.multiple) this.selected.clear();
			this.selected.add(id);
		}
	}
	reset() {
		this.skipped = this.attempted = false;
		this.selected.clear();
		for (const answer of [...this.controls.values()].sort(order)) {
			answer.draft = answer.props.defaultValue ?? "";
			if (this.isSelectedDefault(answer) && (this.props.multiple || !this.selected.size))
				this.selected.add(answer.id);
			// Native reset runs after the event; align native defaults with the state being restored.
			if (answer.props.kind === "choice")
				answer.element.defaultChecked = this.selected.has(answer.id);
			else answer.element.defaultValue = answer.props.value ?? answer.draft;
		}
	}
	validate() {
		if (!this.attempted) {
			this.attempted = true;
			this.root.changed();
		}
		if (this.disabled || (this.skipped && !this.required)) return true;
		if (this.invalid || this.status !== "answered") return false;
		return this.root.options.noValidate !== false || !this.nativeInvalid;
	}
	private get nativeInvalid() {
		return this.answers.find(
			(answer) =>
				this.selected.has(answer.id) &&
				answer.element.willValidate &&
				!answer.element.validity.valid
		)?.element;
	}
	focus(invalid: boolean) {
		const native =
			invalid && this.root.options.noValidate === false ? this.nativeInvalid : undefined;
		const control = invalid
			? (native ??
				this.answers.find((answer) => answer.props.kind === "input" && this.selected.has(answer.id))
					?.element ??
				this.answers[0]?.element)
			: undefined;
		(control ?? this.element)?.focus();
		native?.reportValidity();
	}
}

export function answerView(item: QuestionnaireItemModel, id: string, props: AnswerOptions) {
	const registered = item.controls.get(id);
	const value = props.value ?? registered?.draft ?? props.defaultValue ?? "";
	const disabled = item.disabled || !!props.disabled;
	const selected =
		!item.skipped &&
		(registered
			? item.selected.has(id)
			: props.kind === "choice"
				? !!(props.checked ?? props.defaultChecked)
				: filled(value));
	const shortcut =
		!disabled && props.kind === "choice" ? item.shortcut(props.value!, id) : undefined;
	return {
		value,
		disabled,
		selected,
		shortcut,
		invalid: item.invalid,
		filled: filled(value),
		keyShortcuts: item.active && !disabled ? joinIds(shortcut, selected && "Enter") : undefined,
	};
}
