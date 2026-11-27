import { CheckIcon } from "@lucide/vue";
import { cn } from "cn";
import {
	defineComponent,
	h,
	inject,
	nextTick,
	onMounted,
	onScopeDispose,
	provide,
	shallowRef,
	useId,
	watch,
	watchEffect,
	type InjectionKey,
	type InputHTMLAttributes,
	type PropType,
	type ShallowRef,
	type SlotsType,
} from "vue";
import {
	QuestionnaireItemModel,
	QuestionnaireModel,
	answerView,
	joinIds,
	present,
	type AnswerOptions,
	type QuestionnaireInputType,
	type QuestionnaireItemDefinition,
	type QuestionnaireItemState,
	type QuestionnaireItemStatus,
	type QuestionnaireMessages,
	type QuestionnaireNavigation,
	type QuestionnaireNavigationState,
	type QuestionnaireRootState,
	type QuestionnaireShortcutMode,
} from "./state";
import { buttonVariants, type ButtonVariants } from "../button";

export type {
	QuestionnaireChoiceDefinition,
	QuestionnaireInputType,
	QuestionnaireItemDefinition,
	QuestionnaireItemState,
	QuestionnaireItemStatus,
	QuestionnaireMessages,
	QuestionnaireNavigationState,
	QuestionnaireRootState,
	QuestionnaireShortcutMode,
} from "./state";

const rootKey: InjectionKey<{ model: QuestionnaireModel; revision: ShallowRef<number> }> =
	Symbol("Questionnaire");
const itemKey: InjectionKey<QuestionnaireItemModel> = Symbol("QuestionnaireItem");
function useRoot() {
	const state = inject(rootKey);
	if (!state) throw new Error("Questionnaire parts require QuestionnaireRoot.");
	return state;
}
function useItem() {
	const item = inject(itemKey);
	if (!item) throw new Error("Questionnaire answer parts require QuestionnaireItem.");
	return { item, revision: useRoot().revision };
}
function useElement<T extends HTMLElement>() {
	const element = shallowRef<T | null>(null);
	return {
		element,
		ref: (node: unknown) => {
			element.value = node as T | null;
		},
	};
}
const afterRender = (callback: () => void) => {
	void nextTick(callback);
};
function progressData(view: QuestionnaireRootState) {
	return {
		"data-current": view.current || undefined,
		"data-total": view.total || undefined,
		"data-first": present(view.first),
		"data-last": present(view.last),
	};
}

export const QuestionnaireRoot = defineComponent({
	name: "QuestionnaireRoot",
	inheritAttrs: false,
	props: {
		items: Array as PropType<readonly QuestionnaireItemDefinition[]>,
		item: String,
		defaultItem: String,
		noValidate: { type: Boolean, default: true },
		shortcuts: String as PropType<QuestionnaireShortcutMode>,
		messages: Object as PropType<Partial<QuestionnaireMessages>>,
	},
	slots: Object as SlotsType<{ default: QuestionnaireRootState }>,
	emits: {
		"update:item": (_name: string) => true,
		itemChange: (_name: string) => true,
		submit: (_event: SubmitEvent) => true,
		reset: (_event: Event) => true,
		keydown: (_event: KeyboardEvent) => true,
	},
	setup(props, { attrs, slots, emit, expose }) {
		const options = () => ({
			...props,
			onItemChange: (name: string) => {
				emit("update:item", name);
				emit("itemChange", name);
			},
		});
		const model = new QuestionnaireModel(options());
		const { element, ref } = useElement<HTMLFormElement>();
		const revision = shallowRef(model.snapshot());
		provide(rootKey, { model, revision });
		expose({ element });
		onScopeDispose(
			model.subscribe(() => {
				revision.value = model.snapshot();
			})
		);
		watch(options, (value) => model.setOptions(value));
		watch(
			element,
			(node) => {
				model.element = node;
			},
			{ flush: "sync" }
		);
		watch(revision, model.settle, { flush: "post" });
		let observer: MutationObserver | undefined;
		onMounted(() => {
			if (element.value && typeof MutationObserver !== "undefined") {
				observer = new MutationObserver(model.changed);
				observer.observe(element.value, { childList: true, subtree: true });
			}
			model.settle();
		});
		onScopeDispose(() => {
			observer?.disconnect();
			model.element = null;
		});
		return () => {
			void revision.value;
			const view = model.view;
			return h(
				"form",
				{
					...attrs,
					ref,
					novalidate: props.noValidate,
					"data-slot": "questionnaire",
					...progressData(view),
					"data-shortcuts": props.shortcuts,
					class: cn("cn-questionnaire flex w-full min-w-0 flex-col", attrs.class),
					onKeydown: (event: KeyboardEvent) => {
						emit("keydown", event);
						model.keyDown(event, afterRender);
					},
					onInvalidCapture: (event: Event) => {
						if (typeof attrs.onInvalidCapture === "function") attrs.onInvalidCapture(event);
						if (!event.defaultPrevented) model.nativeInvalid(event.target);
					},
					onReset: (event: Event) => {
						emit("reset", event);
						if (!event.defaultPrevented) model.reset();
					},
					onSubmit: (event: SubmitEvent) => {
						if (event.target !== event.currentTarget) return;
						if (!model.validateSubmit()) event.preventDefault();
						else emit("submit", event);
					},
				},
				slots.default?.(view)
			);
		};
	},
});

export const QuestionnaireProgress = defineComponent({
	name: "QuestionnaireProgress",
	inheritAttrs: false,
	slots: Object as SlotsType<{ default: QuestionnaireRootState }>,
	setup(_, { attrs, slots }) {
		const { model, revision } = useRoot();
		return () => {
			void revision.value;
			const view = model.view;
			const label = view.total ? model.messages.progress(view.current, view.total) : undefined;
			return h(
				"div",
				{
					role: "progressbar",
					"aria-live": "polite",
					"aria-label": model.messages.progressLabel,
					...attrs,
					...progressData(view),
					"data-slot": "questionnaire-progress",
					"aria-valuemin": view.total ? 1 : undefined,
					"aria-valuenow": view.current || undefined,
					"aria-valuemax": view.total || undefined,
					"aria-valuetext": label,
					class: cn(
						"cn-questionnaire-progress min-h-[1lh] w-fit min-w-[14ch] font-medium text-muted-foreground tabular-nums",
						attrs.class
					),
				},
				slots.default?.(view) ?? label
			);
		};
	},
});

export const QuestionnaireItem = defineComponent({
	name: "QuestionnaireItem",
	inheritAttrs: false,
	props: {
		name: { type: String, required: true },
		disabled: Boolean,
		multiple: Boolean,
		invalid: Boolean,
		required: { type: Boolean, default: undefined },
	},
	emits: { statusChange: (_status: QuestionnaireItemStatus) => true },
	slots: Object as SlotsType<{ default: QuestionnaireItemState }>,
	setup(props, { attrs, slots, emit, expose }) {
		const { model, revision } = useRoot();
		const item = new QuestionnaireItemModel(model, { ...props });
		const { element, ref } = useElement<HTMLFieldSetElement>();
		provide(itemKey, item);
		expose({ element });
		watch(
			() => ({ ...props }),
			(options) => item.setProps(options)
		);
		watch(
			element,
			(node, _, cleanup) => {
				item.element = node;
				if (node) cleanup(model.register(item));
			},
			{ flush: "sync" }
		);
		let lastStatus: QuestionnaireItemStatus | undefined;
		onMounted(() => {
			lastStatus = item.status;
		});
		watch(
			() => {
				void revision.value;
				return item.status;
			},
			(status) => {
				if (lastStatus !== undefined && status !== lastStatus) emit("statusChange", status);
				lastStatus = status;
			},
			{ flush: "post" }
		);
		return () => {
			void revision.value;
			const view = item.view;
			return h(
				"fieldset",
				{
					...attrs,
					ref,
					name: props.name,
					tabindex: -1,
					disabled: view.disabled,
					hidden: !view.active,
					inert: !view.active,
					"data-slot": "questionnaire-item",
					"data-active": present(view.active),
					"data-disabled": present(view.disabled),
					"data-invalid": present(view.invalid),
					"data-multiple": present(view.multiple),
					"data-required": present(view.required),
					"data-status": view.status,
					"aria-invalid": view.invalid || undefined,
					"aria-describedby": joinIds(item.describedBy, attrs["aria-describedby"] as string),
					"aria-keyshortcuts": joinIds(attrs["aria-keyshortcuts"] as string, item.keyShortcuts),
					class: cn(
						"cn-questionnaire-item min-w-0 rounded-lg border-0 p-0 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring [&[hidden]]:hidden",
						attrs.class
					),
				},
				slots.default?.(view)
			);
		};
	},
});

function staticPart(name: string, tag: "div" | "span" | "legend", slot: string, styles: string) {
	return defineComponent({
		name,
		inheritAttrs: false,
		setup(_, { attrs, slots }) {
			return () =>
				h(tag, { ...attrs, "data-slot": slot, class: cn(styles, attrs.class) }, slots.default?.());
		},
	});
}
export const QuestionnaireTitle = staticPart(
	"QuestionnaireTitle",
	"legend",
	"questionnaire-title",
	"cn-questionnaire-title font-heading text-pretty"
);
export const QuestionnaireChoiceDescription = staticPart(
	"QuestionnaireChoiceDescription",
	"span",
	"questionnaire-choice-description",
	"cn-questionnaire-choice-description"
);
export const QuestionnaireActions = staticPart(
	"QuestionnaireActions",
	"div",
	"questionnaire-actions",
	"cn-questionnaire-actions grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center"
);

function associatedPart(kind: "description" | "error") {
	return defineComponent({
		name: kind === "description" ? "QuestionnaireDescription" : "QuestionnaireError",
		inheritAttrs: false,
		props: { id: String },
		slots: Object as SlotsType<{ default: { invalid: boolean } }>,
		setup(props, { attrs, slots }) {
			const { item, revision } = useItem();
			const uid = useId();
			const id = () => props.id ?? uid;
			onMounted(() =>
				watch(id, (value, _, cleanup) => cleanup(item.associate(kind, value)), { immediate: true })
			);
			return () => {
				void revision.value;
				if (kind === "description")
					return h(
						"p",
						{
							...attrs,
							id: id(),
							"data-slot": "questionnaire-description",
							class: cn(
								"cn-questionnaire-description text-pretty text-muted-foreground",
								attrs.class
							),
						},
						slots.default?.({ invalid: item.invalid })
					);
				return h(
					"p",
					{
						...attrs,
						id: id(),
						"data-slot": "questionnaire-error",
						"data-invalid": present(item.invalid),
						hidden: !item.invalid,
						role: item.invalid ? "alert" : undefined,
						class: cn("cn-questionnaire-error text-destructive", attrs.class),
					},
					slots.default?.({ invalid: item.invalid }) ??
						(item.required ? item.root.messages.requiredError : item.root.messages.optionalError)
				);
			};
		},
	});
}
export const QuestionnaireDescription = associatedPart("description");
export const QuestionnaireError = associatedPart("error");

export const QuestionnaireChoices = defineComponent({
	name: "QuestionnaireChoices",
	inheritAttrs: false,
	slots: Object as SlotsType<{ default: { shortcuts: QuestionnaireShortcutMode | null } }>,
	setup(_, { attrs, slots }) {
		const { item, revision } = useItem();
		return () => {
			void revision.value;
			return h(
				"div",
				{
					...attrs,
					"data-slot": "questionnaire-choices",
					class: cn(
						"cn-questionnaire-choices group/questionnaire-choices grid min-w-0",
						attrs.class
					),
				},
				slots.default?.({ shortcuts: item.root.options.shortcuts ?? null })
			);
		};
	},
});

function useAnswer(id: () => string, options: () => AnswerOptions) {
	const { item, revision } = useItem();
	const { element, ref } = useElement<HTMLInputElement>();
	watch(
		[element, id],
		([node, key], _, cleanup) => {
			if (node) cleanup(item.register(key, node, options()));
		},
		{ flush: "sync" }
	);
	watchEffect(() => {
		item.update(id(), options());
	});
	return {
		item,
		element,
		ref,
		view: () => {
			void revision.value;
			return answerView(item, id(), options());
		},
	};
}

type ChoiceInputProps = Omit<
	InputHTMLAttributes,
	| "value"
	| "name"
	| "checked"
	| "disabled"
	| "type"
	| "onChange"
	| "defaultChecked"
	| "defaultValue"
	| "required"
>;
export type QuestionnaireChoiceState = {
	checked: boolean;
	disabled: boolean;
	invalid: boolean;
	shortcut: string | null;
	type: "radio" | "checkbox";
};
export const QuestionnaireChoice = defineComponent({
	name: "QuestionnaireChoice",
	inheritAttrs: false,
	props: {
		value: { type: String, required: true },
		checked: { type: Boolean, default: undefined },
		defaultChecked: Boolean,
		disabled: Boolean,
		inputProps: Object as PropType<ChoiceInputProps>,
	},
	emits: { "update:checked": (_checked: boolean) => true, change: (_event: Event) => true },
	slots: Object as SlotsType<{ default: QuestionnaireChoiceState }>,
	setup(props, { attrs, slots, emit, expose }) {
		const uid = useId();
		const id = () => props.inputProps?.id ?? uid;
		const { item, element, ref, view } = useAnswer(id, () => ({
			kind: "choice",
			value: props.value,
			checked: props.checked,
			defaultChecked: props.defaultChecked,
			disabled: props.disabled,
		}));
		expose({ input: element });
		return () => {
			const state = view();
			const type = item.props.multiple ? "checkbox" : "radio";
			const data = {
				"data-checked": present(state.selected),
				"data-unchecked": present(!state.selected),
				"data-invalid": present(state.invalid),
				"data-disabled": present(state.disabled),
				"data-shortcut": state.shortcut,
				"data-type": type,
			};
			return h(
				"label",
				{
					...attrs,
					...data,
					for: id(),
					"data-slot": "questionnaire-choice",
					class: cn(
						"cn-questionnaire-choice group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start text-start outline-none select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
						attrs.class
					),
				},
				[
					h("input", {
						...props.inputProps,
						...data,
						id: id(),
						ref,
						type,
						name: item.skipped ? undefined : item.props.name,
						checked: state.selected,
						value: props.value,
						disabled: state.disabled,
						"data-slot": "questionnaire-choice-input",
						"aria-invalid": state.invalid || undefined,
						"aria-describedby": joinIds(item.describedBy, props.inputProps?.["aria-describedby"]),
						"aria-keyshortcuts": state.keyShortcuts,
						class: cn(
							"absolute inset-0 z-10 size-full cursor-pointer opacity-0",
							props.inputProps?.class
						),
						onChange: (event: Event) => {
							const target = event.currentTarget as HTMLInputElement;
							const checked = target.checked;
							emit("change", event);
							if (!event.defaultPrevented) {
								emit("update:checked", checked);
								item.edit(id(), checked);
							}
							afterRender(() => {
								if (element.value !== target) return;
								for (const answer of item.controls.values())
									if (answer.props.kind === "choice")
										answer.element.checked = item.selected.has(answer.id);
							});
						},
					}),
					h(
						"span",
						{
							"aria-hidden": "true",
							"data-slot": "questionnaire-choice-indicator",
							class:
								"cn-questionnaire-choice-indicator pointer-events-none relative flex shrink-0 items-center justify-center group-data-[type=radio]/questionnaire-choice:rounded-full",
						},
						state.selected
							? [
									type === "radio"
										? h("span", {
												"data-slot": "questionnaire-choice-indicator-dot",
												class: "cn-questionnaire-choice-indicator-dot rounded-full",
											})
										: h(CheckIcon, {
												"data-slot": "questionnaire-choice-indicator-check",
												class: "cn-questionnaire-choice-indicator-check",
											}),
								]
							: []
					),
					h(
						"span",
						{
							"data-slot": "questionnaire-choice-label",
							class: "cn-questionnaire-choice-content flex min-w-0 flex-1 flex-col leading-snug",
						},
						slots.default?.({
							checked: state.selected,
							disabled: state.disabled,
							invalid: state.invalid,
							shortcut: state.shortcut ?? null,
							type,
						})
					),
					state.shortcut
						? h(
								"span",
								{
									"aria-hidden": "true",
									"data-slot": "questionnaire-choice-shortcut",
									class:
										"cn-questionnaire-shortcut pointer-events-none ms-auto inline-flex shrink-0",
								},
								state.shortcut
							)
						: null,
				]
			);
		};
	},
});

export const QuestionnaireInput = defineComponent({
	name: "QuestionnaireInput",
	inheritAttrs: false,
	props: {
		id: String,
		disabled: Boolean,
		type: { type: String as PropType<QuestionnaireInputType>, default: "text" },
		value: String,
		defaultValue: String,
	},
	emits: {
		"update:value": (_value: string) => true,
		change: (_event: Event) => true,
		input: (_event: Event) => true,
	},
	setup(props, { attrs, emit, expose }) {
		const uid = useId();
		const id = () => props.id ?? uid;
		const { item, element, ref, view } = useAnswer(id, () => ({
			kind: "input",
			value: props.value,
			disabled: props.disabled,
			defaultValue: props.defaultValue,
		}));
		expose({ element });
		return () => {
			const state = view();
			return h(
				"div",
				{
					"data-slot": "questionnaire-input-wrapper",
					class: "cn-questionnaire-input-wrapper group/questionnaire-input relative min-w-0",
				},
				[
					h("input", {
						...attrs,
						ref,
						id: id(),
						type: props.type,
						name: state.selected ? item.props.name : undefined,
						form: state.selected ? undefined : "",
						disabled: state.disabled,
						value: state.value,
						"data-slot": "questionnaire-input",
						"data-filled": present(state.filled),
						"data-empty": present(!state.filled),
						"data-disabled": present(state.disabled),
						"data-invalid": present(state.invalid),
						"aria-invalid": state.invalid || undefined,
						"aria-keyshortcuts": state.keyShortcuts,
						"aria-describedby": joinIds(item.describedBy, attrs["aria-describedby"] as string),
						class: cn(
							"cn-questionnaire-input min-h-11 w-full min-w-0 outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 sm:min-h-0",
							attrs.class
						),
						onInput: (event: Event) => {
							const target = event.currentTarget as HTMLInputElement;
							emit("input", event);
							emit("change", event);
							if (!event.defaultPrevented) {
								emit("update:value", target.value);
								item.edit(id(), target.value);
							}
							afterRender(() => {
								if (element.value === target && target.value !== view().value)
									target.value = view().value;
							});
						},
					}),
				]
			);
		};
	},
});

function actionPart(action: QuestionnaireNavigation, name: string) {
	return defineComponent({
		name,
		inheritAttrs: false,
		props: {
			disabled: Boolean,
			size: { type: String as PropType<ButtonVariants["size"]>, default: "default" },
			variant: {
				type: String as PropType<ButtonVariants["variant"]>,
				default: action === "previous" || action === "skip" ? "outline" : "default",
			},
		},
		emits: { click: (_event: MouseEvent) => true },
		slots: Object as SlotsType<{ default: QuestionnaireNavigationState }>,
		setup(props, { attrs, slots, emit }) {
			const { model, revision } = useRoot();
			return () => {
				void revision.value;
				const view = model.navigation(action, props.disabled);
				return h(
					"button",
					{
						type: action === "submit" ? "submit" : "button",
						...attrs,
						hidden: !view.visible,
						inert: !view.visible,
						disabled: view.disabled,
						tabindex: view.visible ? attrs.tabindex : -1,
						"aria-hidden": view.visible ? undefined : true,
						"aria-keyshortcuts": view.shortcut ?? undefined,
						"data-slot": `questionnaire-${action}`,
						"data-variant": props.variant,
						"data-size": props.size,
						"data-disabled": present(view.disabled),
						"data-shortcut": view.shortcut ?? undefined,
						"data-status": view.status ?? undefined,
						"data-visible": present(view.visible),
						"data-hidden": present(!view.visible),
						class: cn(
							buttonVariants(props),
							"row-start-1 min-h-11 sm:min-h-0 [&[hidden]]:hidden",
							action === "previous"
								? "col-start-1 justify-self-start"
								: action === "skip"
									? "col-start-2 justify-self-end"
									: "col-start-3 justify-self-end",
							attrs.class
						),
						onClick: (event: MouseEvent) => {
							emit("click", event);
							if (!event.defaultPrevented && view.visible && !view.disabled && action !== "submit")
								model.act(action, afterRender);
						},
					},
					slots.default?.(view)
				);
			};
		},
	});
}
export const QuestionnairePrevious = actionPart("previous", "QuestionnairePrevious");
export const QuestionnaireSkip = actionPart("skip", "QuestionnaireSkip");
export const QuestionnaireNext = actionPart("next", "QuestionnaireNext");
export const QuestionnaireSubmit = actionPart("submit", "QuestionnaireSubmit");
export const Questionnaire = QuestionnaireRoot;
export {
	QuestionnaireRoot as Root,
	QuestionnaireProgress as Progress,
	QuestionnaireItem as Item,
	QuestionnaireTitle as Title,
	QuestionnaireDescription as Description,
	QuestionnaireChoices as Choices,
	QuestionnaireChoice as Choice,
	QuestionnaireChoiceDescription as ChoiceDescription,
	QuestionnaireInput as Input,
	QuestionnaireError as Error,
	QuestionnaireActions as Actions,
	QuestionnairePrevious as Previous,
	QuestionnaireSkip as Skip,
	QuestionnaireNext as Next,
	QuestionnaireSubmit as Submit,
};
