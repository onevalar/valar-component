<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import PrevButton from "./pagination-prev-button.svelte";

	let {
		ref = $bindable(null),
		label = "上一页",
		children: _children,
		...restProps
	}: PaginationPrimitive.PrevButtonProps & {
		/** Visible button text. */
		label?: string;
	} = $props();
</script>

<PrevButton bind:ref {label} {...restProps}>
	<IconPlaceholder
		lucide="ChevronLeftIcon"
		tabler="IconChevronLeft"
		hugeicons="ArrowLeft01Icon"
		phosphor="CaretLeftIcon"
		remixicon="RiArrowLeftSLine"
		data-icon="inline-start"
		class="cn-rtl-flip"
	/>
	<span class="cn-pagination-previous-text hidden sm:block">{label}</span>
</PrevButton>
