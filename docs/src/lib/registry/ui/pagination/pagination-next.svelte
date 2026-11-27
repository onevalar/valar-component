<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import NextButton from "./pagination-next-button.svelte";

	let {
		ref = $bindable(null),
		label = "下一页",
		children: _children,
		...restProps
	}: PaginationPrimitive.NextButtonProps & {
		/** Visible button text. */
		label?: string;
	} = $props();
</script>

<NextButton bind:ref {label} {...restProps}>
	<span class="cn-pagination-next-text hidden sm:block">{label}</span>
	<IconPlaceholder
		lucide="ChevronRightIcon"
		tabler="IconChevronRight"
		hugeicons="ArrowRight01Icon"
		phosphor="CaretRightIcon"
		remixicon="RiArrowRightSLine"
		data-icon="inline-end"
		class="cn-rtl-flip"
	/>
</NextButton>
