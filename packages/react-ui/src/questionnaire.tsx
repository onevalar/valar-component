"use client";

import * as React from "react";
import { cn } from "cn";
import { Check } from "lucide-react";
import { buttonVariants, type ButtonProps } from "./button.tsx";
import {
	QuestionnaireModel,
	QuestionnaireItemModel,
	answerView,
	joinIds,
	present,
	type AnswerOptions,
	type QuestionnaireInputType,
	type QuestionnaireItemStatus,
	type QuestionnaireNavigation,
	type QuestionnaireNavigationState,
	type QuestionnaireOptions,
	type QuestionnaireItemState,
	type QuestionnaireRootState,
} from "./questionnaire-state.ts";

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
} from "./questionnaire-state.ts";

const RootContext = React.createContext<QuestionnaireModel | null>(null);
const ItemContext = React.createContext<QuestionnaireItemModel | null>(null);
function useRevision(model: QuestionnaireModel) {
	return React.useSyncExternalStore(model.subscribe, model.snapshot, () => 0);
}
function useRoot() {
	const model = React.useContext(RootContext);
	if (!model) throw new Error("Questionnaire parts require QuestionnaireRoot.");
	useRevision(model);
	return model;
}
function useItem() {
	const item = React.useContext(ItemContext);
	if (!item) throw new Error("Questionnaire answer parts require QuestionnaireItem.");
	useRevision(item.root);
	return item;
}

type WithRender<T, P> = Omit<T, "children"> & {
	children?: React.ReactNode | ((state: P) => React.ReactNode);
};
function render<P>(
	children: React.ReactNode | ((state: P) => React.ReactNode),
	view: P,
	fallback?: React.ReactNode
) {
	return typeof children === "function" ? children(view) : (children ?? fallback);
}

function useElement<T>(ref?: React.Ref<T>) {
	const element = React.useRef<T | null>(null);
	const bind = React.useCallback(
		(node: T | null) => {
			element.current = node;
			if (typeof ref === "function") {
				const clean = ref(node);
				if (typeof clean === "function")
					return () => {
						element.current = null;
						clean();
					};
			} else if (ref) ref.current = node;
		},
		[ref]
	);
	return [element, bind] as const;
}
const afterRender = (callback: () => void) => queueMicrotask(callback);

export type QuestionnaireRootProps = WithRender<
	React.ComponentProps<"form">,
	QuestionnaireRootState
> &
	QuestionnaireOptions;
export function QuestionnaireRoot({
	item,
	items,
	defaultItem,
	onItemChange,
	shortcuts,
	messages,
	noValidate = true,
	children,
	className,
	onSubmit,
	onReset,
	onKeyDown,
	onInvalidCapture,
	ref,
	...props
}: QuestionnaireRootProps) {
	const options = { item, items, defaultItem, onItemChange, shortcuts, messages, noValidate };
	const [model] = React.useState(() => new QuestionnaireModel(options));
	const [element, bind] = useElement(ref);
	useRevision(model);
	React.useLayoutEffect(() => {
		model.element = element.current;
		model.setOptions(options);
		model.settle();
	});
	React.useLayoutEffect(() => {
		if (!element.current || typeof MutationObserver === "undefined") return;
		const observer = new MutationObserver(model.changed);
		observer.observe(element.current, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			model.element = null;
		};
	}, [model, element]);
	const view = model.view;
	return (
		<RootContext.Provider value={model}>
			<form
				{...props}
				ref={bind}
				noValidate={noValidate}
				data-slot="questionnaire"
				{...progressData(view)}
				data-shortcuts={shortcuts}
				className={cn("cn-questionnaire flex w-full min-w-0 flex-col", className)}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (!event.defaultPrevented) model.keyDown(event.nativeEvent, afterRender);
				}}
				onInvalidCapture={(event) => {
					onInvalidCapture?.(event);
					if (!event.defaultPrevented) model.nativeInvalid(event.target);
				}}
				onReset={(event) => {
					onReset?.(event);
					if (!event.defaultPrevented) model.reset();
				}}
				onSubmit={(event) => {
					if (event.target !== event.currentTarget) return;
					if (!model.validateSubmit()) event.preventDefault();
					else onSubmit?.(event);
				}}
			>
				{render(children, view)}
			</form>
		</RootContext.Provider>
	);
}

function progressData(view: QuestionnaireRootState) {
	return {
		"data-current": view.current || undefined,
		"data-total": view.total || undefined,
		"data-first": present(view.first),
		"data-last": present(view.last),
	};
}
export type QuestionnaireProgressProps = WithRender<
	React.ComponentProps<"div">,
	QuestionnaireRootState
>;
export function QuestionnaireProgress({
	children,
	className,
	...props
}: QuestionnaireProgressProps) {
	const root = useRoot();
	const view = root.view;
	const label = view.total ? root.messages.progress(view.current, view.total) : undefined;
	return (
		<div
			role="progressbar"
			aria-live="polite"
			aria-label={root.messages.progressLabel}
			{...props}
			data-slot="questionnaire-progress"
			{...progressData(view)}
			aria-valuemin={view.total ? 1 : undefined}
			aria-valuenow={view.current || undefined}
			aria-valuemax={view.total || undefined}
			aria-valuetext={label}
			className={cn(
				"cn-questionnaire-progress min-h-[1lh] w-fit min-w-[14ch] font-medium text-muted-foreground tabular-nums",
				className
			)}
		>
			{render(children, view, label)}
		</div>
	);
}

export type QuestionnaireItemProps = WithRender<
	React.ComponentProps<"fieldset">,
	QuestionnaireItemState
> & {
	name: string;
	multiple?: boolean;
	required?: boolean;
	invalid?: boolean;
	onStatusChange?: (status: QuestionnaireItemStatus) => void;
};
export function QuestionnaireItem({
	name,
	disabled,
	required,
	invalid,
	multiple,
	onStatusChange,
	ref,
	children,
	className,
	"aria-describedby": describedBy,
	"aria-keyshortcuts": keyShortcuts,
	...props
}: QuestionnaireItemProps) {
	const root = useRoot();
	const options = { name, disabled, required, invalid, multiple };
	const [item] = React.useState(() => new QuestionnaireItemModel(root, options));
	const [element, bind] = useElement(ref);
	const status = React.useRef<QuestionnaireItemStatus | undefined>(undefined);
	React.useLayoutEffect(() => {
		item.setProps(options);
	});
	React.useLayoutEffect(() => {
		item.element = element.current;
		const dispose = root.register(item);
		return () => {
			item.element = null;
			dispose();
			status.current = undefined;
		};
	}, [item, root, element]);
	React.useLayoutEffect(() => {
		const next = item.status;
		if (status.current !== undefined && status.current !== next) onStatusChange?.(next);
		status.current = next;
	});
	const view = item.view;
	return (
		<ItemContext.Provider value={item}>
			<fieldset
				{...props}
				ref={bind}
				name={name}
				tabIndex={-1}
				disabled={view.disabled}
				hidden={!view.active}
				inert={!view.active}
				data-slot="questionnaire-item"
				data-active={present(view.active)}
				data-disabled={present(view.disabled)}
				data-invalid={present(view.invalid)}
				data-multiple={present(view.multiple)}
				data-required={present(view.required)}
				data-status={view.status}
				aria-invalid={view.invalid || undefined}
				aria-describedby={joinIds(item.describedBy, describedBy)}
				aria-keyshortcuts={joinIds(keyShortcuts, item.keyShortcuts)}
				className={cn(
					"cn-questionnaire-item min-w-0 rounded-lg border-0 p-0 outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring [&[hidden]]:hidden",
					className
				)}
			>
				{render(children, view)}
			</fieldset>
		</ItemContext.Provider>
	);
}

export function QuestionnaireTitle({ className, ...props }: React.ComponentProps<"legend">) {
	return (
		<legend
			{...props}
			data-slot="questionnaire-title"
			className={cn("cn-questionnaire-title font-heading text-pretty", className)}
		/>
	);
}
function useDescriptionId(kind: "description" | "error", id?: string) {
	const item = useItem();
	const generated = React.useId();
	const resolved = id ?? generated;
	React.useLayoutEffect(() => item.associate(kind, resolved), [item, kind, resolved]);
	return { item, id: resolved };
}
export function QuestionnaireDescription({ id, className, ...props }: React.ComponentProps<"p">) {
	const association = useDescriptionId("description", id);
	return (
		<p
			{...props}
			id={association.id}
			data-slot="questionnaire-description"
			className={cn("cn-questionnaire-description text-pretty text-muted-foreground", className)}
		/>
	);
}
export function QuestionnaireError({
	id,
	children,
	className,
	...props
}: WithRender<React.ComponentProps<"p">, { invalid: boolean }>) {
	const association = useDescriptionId("error", id);
	const { item } = association;
	return (
		<p
			{...props}
			id={association.id}
			data-slot="questionnaire-error"
			data-invalid={present(item.invalid)}
			hidden={!item.invalid}
			role={item.invalid ? "alert" : undefined}
			className={cn("cn-questionnaire-error text-destructive", className)}
		>
			{render(
				children,
				{ invalid: item.invalid },
				item.required ? item.root.messages.requiredError : item.root.messages.optionalError
			)}
		</p>
	);
}
export function QuestionnaireChoices({
	className,
	children,
	...props
}: WithRender<
	React.ComponentProps<"div">,
	{ shortcuts: QuestionnaireOptions["shortcuts"] | null }
>) {
	const { root } = useItem();
	return (
		<div
			{...props}
			data-slot="questionnaire-choices"
			className={cn("cn-questionnaire-choices group/questionnaire-choices grid min-w-0", className)}
		>
			{render(children, { shortcuts: root.options.shortcuts ?? null })}
		</div>
	);
}

function useAnswer(id: string, options: AnswerOptions, ref?: React.Ref<HTMLInputElement>) {
	const item = useItem();
	const [element, bind] = useElement(ref);
	React.useLayoutEffect(() => {
		if (element.current) return item.register(id, element.current, options);
	}, [item, id, element]);
	React.useLayoutEffect(() => {
		item.update(id, options);
	});
	return { item, bind, view: answerView(item, id, options) };
}

export type QuestionnaireChoiceState = {
	checked: boolean;
	disabled: boolean;
	invalid: boolean;
	shortcut: string | null;
	type: "radio" | "checkbox";
};
export type QuestionnaireChoiceProps = WithRender<
	Omit<React.ComponentProps<"label">, "onChange" | "htmlFor">,
	QuestionnaireChoiceState
> & {
	value: string;
	checked?: boolean;
	defaultChecked?: boolean;
	disabled?: boolean;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	inputProps?: Omit<
		React.ComponentProps<"input">,
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
};
export function QuestionnaireChoice({
	value,
	checked,
	defaultChecked,
	disabled,
	onChange,
	inputProps,
	className,
	children,
	...props
}: QuestionnaireChoiceProps) {
	const uid = React.useId();
	const id = inputProps?.id ?? uid;
	const { item, view, bind } = useAnswer(
		id,
		{ kind: "choice", value, checked, defaultChecked, disabled },
		inputProps?.ref
	);
	const type = item.props.multiple ? "checkbox" : "radio";
	const data = {
		"data-checked": present(view.selected),
		"data-unchecked": present(!view.selected),
		"data-invalid": present(view.invalid),
		"data-disabled": present(view.disabled),
		"data-shortcut": view.shortcut,
		"data-type": type,
	};
	return (
		<label
			{...props}
			{...data}
			data-slot="questionnaire-choice"
			htmlFor={id}
			className={cn(
				"cn-questionnaire-choice group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start text-start outline-none select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
				className
			)}
		>
			<input
				{...inputProps}
				{...data}
				ref={bind}
				id={id}
				data-slot="questionnaire-choice-input"
				type={type}
				name={item.skipped ? undefined : item.props.name}
				checked={view.selected}
				value={value}
				disabled={view.disabled}
				aria-invalid={view.invalid || undefined}
				aria-describedby={joinIds(item.describedBy, inputProps?.["aria-describedby"])}
				aria-keyshortcuts={view.keyShortcuts}
				className={cn(
					"absolute inset-0 z-10 size-full cursor-pointer opacity-0",
					inputProps?.className
				)}
				onChange={(event) => {
					onChange?.(event);
					if (!event.defaultPrevented) item.edit(id, event.currentTarget.checked);
				}}
			/>
			<span
				aria-hidden="true"
				data-slot="questionnaire-choice-indicator"
				className="cn-questionnaire-choice-indicator pointer-events-none relative flex shrink-0 items-center justify-center group-data-[type=radio]/questionnaire-choice:rounded-full"
			>
				{view.selected &&
					(type === "radio" ? (
						<span
							data-slot="questionnaire-choice-indicator-dot"
							className="cn-questionnaire-choice-indicator-dot rounded-full"
						/>
					) : (
						<Check
							data-slot="questionnaire-choice-indicator-check"
							className="cn-questionnaire-choice-indicator-check"
						/>
					))}
			</span>
			<span
				data-slot="questionnaire-choice-label"
				className="cn-questionnaire-choice-content flex min-w-0 flex-1 flex-col leading-snug"
			>
				{render(children, {
					checked: view.selected,
					disabled: view.disabled,
					invalid: view.invalid,
					shortcut: view.shortcut ?? null,
					type,
				})}
			</span>
			{view.shortcut && (
				<span
					aria-hidden="true"
					data-slot="questionnaire-choice-shortcut"
					className="cn-questionnaire-shortcut pointer-events-none ms-auto inline-flex shrink-0"
				>
					{view.shortcut}
				</span>
			)}
		</label>
	);
}
export function QuestionnaireChoiceDescription({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			{...props}
			data-slot="questionnaire-choice-description"
			className={cn("cn-questionnaire-choice-description", className)}
		/>
	);
}

export type QuestionnaireInputProps = Omit<
	React.ComponentProps<"input">,
	"form" | "name" | "value" | "defaultValue" | "type"
> & { type?: QuestionnaireInputType; value?: string; defaultValue?: string };
export function QuestionnaireInput({
	id: supplied,
	ref,
	className,
	value,
	defaultValue,
	disabled,
	type = "text",
	onChange,
	"aria-describedby": describedBy,
	...props
}: QuestionnaireInputProps) {
	const uid = React.useId();
	const id = supplied ?? uid;
	const { item, view, bind } = useAnswer(id, { kind: "input", value, defaultValue, disabled }, ref);
	return (
		<div
			data-slot="questionnaire-input-wrapper"
			className="cn-questionnaire-input-wrapper group/questionnaire-input relative min-w-0"
		>
			<input
				{...props}
				ref={bind}
				id={id}
				type={type}
				name={view.selected ? item.props.name : undefined}
				form={view.selected ? undefined : ""}
				value={view.value}
				disabled={view.disabled}
				aria-describedby={joinIds(item.describedBy, describedBy)}
				aria-invalid={view.invalid || undefined}
				aria-keyshortcuts={view.keyShortcuts}
				data-slot="questionnaire-input"
				data-filled={present(view.filled)}
				data-empty={present(!view.filled)}
				data-invalid={present(view.invalid)}
				data-disabled={present(view.disabled)}
				className={cn(
					"cn-questionnaire-input min-h-11 w-full min-w-0 outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 sm:min-h-0",
					className
				)}
				onChange={(event) => {
					onChange?.(event);
					if (!event.defaultPrevented) item.edit(id, event.currentTarget.value);
				}}
			/>
		</div>
	);
}

export function QuestionnaireActions({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			{...props}
			data-slot="questionnaire-actions"
			className={cn(
				"cn-questionnaire-actions grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center",
				className
			)}
		/>
	);
}
export type QuestionnaireActionProps = WithRender<
	React.ComponentProps<"button">,
	QuestionnaireNavigationState
> &
	Pick<ButtonProps, "size" | "variant">;
function Action({
	action,
	className,
	children,
	onClick,
	disabled,
	type = action === "submit" ? "submit" : "button",
	tabIndex,
	size = "default",
	variant = action === "previous" || action === "skip" ? "outline" : "default",
	...props
}: QuestionnaireActionProps & { action: QuestionnaireNavigation }) {
	const root = useRoot();
	const view = root.navigation(action, disabled);
	return (
		<button
			{...props}
			type={type}
			data-slot={`questionnaire-${action}`}
			data-variant={variant}
			data-size={size}
			hidden={!view.visible}
			inert={!view.visible}
			disabled={view.disabled}
			tabIndex={view.visible ? tabIndex : -1}
			aria-keyshortcuts={view.shortcut ?? undefined}
			aria-hidden={view.visible ? undefined : true}
			data-shortcut={view.shortcut ?? undefined}
			data-status={view.status ?? undefined}
			data-disabled={present(view.disabled)}
			data-hidden={present(!view.visible)}
			data-visible={present(view.visible)}
			className={cn(
				buttonVariants({ variant, size }),
				"row-start-1 min-h-11 sm:min-h-0 [&[hidden]]:hidden",
				action === "previous"
					? "col-start-1 justify-self-start"
					: action === "skip"
						? "col-start-2 justify-self-end"
						: "col-start-3 justify-self-end",
				className
			)}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented || !view.visible || view.disabled) return;
				if (action !== "submit") root.act(action, afterRender);
			}}
		>
			{render(children, view)}
		</button>
	);
}
export function QuestionnairePrevious(props: QuestionnaireActionProps) {
	return <Action {...props} action="previous" />;
}
export function QuestionnaireSkip(props: QuestionnaireActionProps) {
	return <Action {...props} action="skip" />;
}
export function QuestionnaireNext(props: QuestionnaireActionProps) {
	return <Action {...props} action="next" />;
}
export function QuestionnaireSubmit(props: QuestionnaireActionProps) {
	return <Action {...props} action="submit" />;
}

export const Questionnaire = Object.assign(QuestionnaireRoot, {
	Root: QuestionnaireRoot,
	Progress: QuestionnaireProgress,
	Item: QuestionnaireItem,
	Title: QuestionnaireTitle,
	Description: QuestionnaireDescription,
	Choices: QuestionnaireChoices,
	Choice: QuestionnaireChoice,
	ChoiceDescription: QuestionnaireChoiceDescription,
	Input: QuestionnaireInput,
	Error: QuestionnaireError,
	Actions: QuestionnaireActions,
	Previous: QuestionnairePrevious,
	Skip: QuestionnaireSkip,
	Next: QuestionnaireNext,
	Submit: QuestionnaireSubmit,
});
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
