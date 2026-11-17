<script lang="ts" module>
	export type PaginationResultRange = {
		start: number;
		end: number;
		total: number;
	};
</script>

<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import { tick } from "svelte";
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { cn } from "$lib/utils.js";
	import Root from "./pagination.svelte";

	let {
		ref = $bindable(null),
		class: className,
		count = 0,
		perPage = 10,
		page = $bindable(1),
		previousLabel = "上一页",
		nextLabel = "下一页",
		formatResults = ({ start, end, total }) =>
			start <= 1 && end === total
				? `共 ${total} 个结果`
				: `${start}–${end} / 共 ${total} 个结果`,
		...restProps
	}: Omit<
		PaginationPrimitive.RootProps,
		"children" | "child" | "siblingCount"
	> & {
		previousLabel?: string;
		nextLabel?: string;
		formatResults?: (range: PaginationResultRange) => string;
	} = $props();

	let previous = $state<HTMLButtonElement | null>(null);
	let next = $state<HTMLButtonElement | null>(null);
	const lastPage = $derived(Math.max(1, Math.ceil(count / perPage)));

	$effect.pre(() => {
		const current = Math.min(lastPage, Math.max(1, page));
		if (page !== current) page = current;

		const doc = ref?.ownerDocument;
		const active = doc?.activeElement;
		const outgoing =
			current === 1 && active === previous ? previous
			: current === lastPage && active === next ? next
			: null;
		if (!outgoing || !doc) return;

		void tick().then(() => {
			if (!outgoing.isConnected || !outgoing.disabled) return;
			if (doc.activeElement !== doc.body && doc.activeElement !== outgoing) return;
			const opposite = outgoing === previous ? next : previous;
			const target = opposite && !opposite.disabled ? opposite : ref;
			target?.focus({ preventScroll: true });
		});
	});

	const controlClass =
		"inline-flex size-6 shrink-0 items-center justify-center rounded-full border-[0.5px] border-transparent bg-transparent px-0.5 text-xs font-medium text-[color:lch(19.588%_1.25_282)] outline-none enabled:hover:bg-accent enabled:active:bg-accent/80 focus-visible:outline-solid focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring disabled:opacity-60 motion-safe:transition-colors motion-safe:duration-150 dark:text-[color:lch(90.451%_1.2_272)]";
</script>

<Root
	bind:ref
	bind:page
	{count}
	{perPage}
	data-appearance="results"
	tabindex={-1}
	class={cn(
		"mx-0 w-fit min-w-0 max-w-full flex-wrap items-center justify-start gap-x-2 gap-y-1 rounded-md focus-visible:-outline-offset-1",
		className,
	)}
	{...restProps}
>
	{#snippet children({ range })}
		<div
			class="flex shrink-0 items-center gap-0.5"
			data-slot="pagination-results-actions"
		>
			<PaginationPrimitive.PrevButton
				bind:ref={previous}
				aria-label={previousLabel}
				class={controlClass}
			>
				<IconPlaceholder
					lucide="ChevronLeftIcon"
					tabler="IconChevronLeft"
					hugeicons="ArrowLeft01Icon"
					phosphor="CaretLeftIcon"
					remixicon="RiArrowLeftSLine"
					aria-hidden="true"
					class="size-3.5 rtl:rotate-180"
				/>
			</PaginationPrimitive.PrevButton>
			<PaginationPrimitive.NextButton
				bind:ref={next}
				aria-label={nextLabel}
				class={controlClass}
			>
				<IconPlaceholder
					lucide="ChevronRightIcon"
					tabler="IconChevronRight"
					hugeicons="ArrowRight01Icon"
					phosphor="CaretRightIcon"
					remixicon="RiArrowRightSLine"
					aria-hidden="true"
					class="size-3.5 rtl:rotate-180"
				/>
			</PaginationPrimitive.NextButton>
		</div>
		<span
			data-slot="pagination-results-count"
			role="status"
			class="min-w-0 text-xs/[14.5px] font-[450] wrap-anywhere text-[color:lch(39.176%_1.25_282)] tabular-nums dark:text-[color:lch(61.803%_1.2_272)]"
		>
			{formatResults({
				start: count === 0 ? 0 : range.start,
				end: range.end,
				total: count,
			})}
		</span>
	{/snippet}
</Root>
