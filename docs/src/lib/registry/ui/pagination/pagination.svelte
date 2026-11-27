<script lang="ts">
	import { Pagination as SdkPagination } from "@ui-sdk/svelte/pagination";
	import { styleToString } from "svelte-toolbelt";
	import { createAttachmentKey } from "svelte/attachments";
	import { cn } from "$lib/utils.js";
	import type { Pagination as PaginationPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		count = 0,
		perPage = 10,
		page = $bindable(1),
		siblingCount = 1,
		loop = false,
		orientation = "horizontal",
		onPageChange,
		onkeydown,
		children,
		child,
		style,
		...restProps
	}: PaginationPrimitive.RootProps = $props();
	const refProps = {
		[createAttachmentKey()]: (element: HTMLElement) => {
			ref = element;
			return () => {
				if (ref === element) ref = null;
			};
		},
	};

	function keydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		onkeydown?.(event);
		if (
			event.defaultPrevented ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			!(event.target instanceof Element)
		)
			return;
		const root = event.currentTarget;
		const target = event.target.closest("[data-pagination-control]");
		if (target?.closest("[data-pagination-root]") !== root) return;
		const rtl = getComputedStyle(root).direction === "rtl";
		const forward = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
		const backward = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
		const controls = Array.from(
			root.querySelectorAll<HTMLButtonElement>("[data-pagination-control]:not(:disabled)")
		).filter((control) => control.closest("[data-pagination-root]") === root);
		const index = controls.indexOf(target as HTMLButtonElement);
		if (index === -1) return;
		const last = controls.length - 1;
		const next =
			event.key === "Home"
				? 0
				: event.key === "End"
					? last
					: event.key === forward
						? index + 1
						: event.key === backward
							? index - 1
							: undefined;
		if (next === undefined) return;
		event.preventDefault();
		controls[loop ? (next + controls.length) % controls.length : next]?.focus();
	}
</script>

<SdkPagination
	role="navigation"
	aria-label="分页"
	data-slot="pagination"
	data-pagination-root=""
	data-orientation={orientation}
	{page}
	total={count}
	pageSize={perPage}
	siblings={siblingCount}
	onPageChange={(next) => {
		page = next;
		onPageChange?.(next);
	}}
	class={cn("cn-pagination mx-auto flex w-full justify-center", className)}
	style={style && typeof style === "object" ? styleToString(style) : style}
	{...restProps as Record<string, unknown>}
>
	{#snippet render({ props, state })}
		{@const pages = state.items.map((item) =>
			typeof item === "number"
				? { type: "page" as const, value: item, key: `page-${item}` }
				: { type: "ellipsis" as const, key: item }
		)}
		{@const range = {
			start: (state.page - 1) * perPage + 1,
			end: Math.min(state.page * perPage, count),
		}}
		{#if child}
			{@render child({
				props: { ...props, ...refProps, onkeydown: keydown },
				pages,
				range,
				currentPage: state.page,
			})}
		{:else}
			<div {...props} {...refProps} onkeydown={keydown}>
				{@render children?.({ pages, range, currentPage: state.page })}
			</div>
		{/if}
	{/snippet}
</SdkPagination>
