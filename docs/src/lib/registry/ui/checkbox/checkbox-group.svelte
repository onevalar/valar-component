<script module lang="ts">
	export const checkboxGroupKey = Symbol("Valar.CheckboxGroup");
</script>

<script lang="ts">
	import { checkboxGroup, type CheckboxGroupOptions } from "@ui-sdk/core/checkbox";
	import { usePart, usePrimitive } from "@ui-sdk/svelte/primitive";
	import { setContext } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		id,
		value = $bindable(),
		defaultValue,
		allValues,
		name,
		form,
		disabled,
		readonly,
		required,
		onValueChange,
		children,
		...attrs
	}: Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> &
		Pick<
			CheckboxGroupOptions,
			| "value"
			| "defaultValue"
			| "allValues"
			| "name"
			| "form"
			| "disabled"
			| "required"
			| "onValueChange"
		> & {
			readonly?: boolean;
		} = $props();

	const uid = $props.id();
	const group = usePrimitive<typeof checkboxGroup>(checkboxGroup, () => ({
		id: id ?? uid,
		value,
		defaultValue,
		allValues,
		name,
		form,
		disabled,
		readOnly: readonly,
		required,
		onValueChange(next, details) {
			onValueChange?.(next, details);
			if (!details.canceled) value = next;
		}
	}));
	setContext(checkboxGroupKey, () => group.api);
	const root = usePart<typeof checkboxGroup, "group">(group, "group");
	const input = usePart<typeof checkboxGroup, "group-input">(group, "group-input");
</script>

<div {...root.slot(attrs)} data-slot="checkbox-group">
	{@render children?.()}
</div>
<input {...input.slot()} />
