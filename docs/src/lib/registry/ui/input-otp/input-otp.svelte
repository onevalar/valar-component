<script lang="ts">
	import { PinInput as InputOTPPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		inputRef = $bindable(null),
		class: className,
		value = $bindable(""),
		readonly,
		onpaste,
		...restProps
	}: InputOTPPrimitive.RootProps = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:inputRef
	bind:value
	data-slot="input-otp"
	{readonly}
	onpaste={(event) => {
		onpaste?.(event);
		if (readonly) event.preventDefault();
	}}
	spellcheck={false}
	class={cn(
		"cn-input-otp flex max-w-full min-w-0 items-center has-disabled:opacity-50",
		"cn-input-otp-input disabled:cursor-not-allowed",
		className
	)}
	{...restProps}
/>
