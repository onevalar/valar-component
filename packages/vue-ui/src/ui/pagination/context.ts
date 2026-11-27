import { createContext } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes, Ref } from "vue";

export type PaginationControlProps = PrimitiveProps & {
	class?: HTMLAttributes["class"];
	disabled?: boolean;
	label?: string;
};

export type PaginationPage = { type: "page"; value: number };
export type PaginationPageItem = (PaginationPage | { type: "ellipsis" }) & { key: string };

export const [usePagination, providePagination] = createContext<{
	page: Readonly<Ref<number>>;
	pageCount: Readonly<Ref<number>>;
	disabled: Readonly<Ref<boolean>>;
	setPage: (page: number) => void;
}>("Pagination");

export function pageItems(page: number, pageCount: number, siblings: number): PaginationPageItem[] {
	// Use a contiguous window near either end, and preserve both edge pages.
	const edge = 3 + siblings;
	const showAll = pageCount < 2 * edge - 1;
	const start =
		showAll || page < edge
			? 1
			: page > pageCount - edge + 1
				? pageCount - edge + 1
				: page - siblings;
	const end =
		showAll || page > pageCount - edge + 1 ? pageCount : page < edge ? edge : page + siblings;
	const item = (value: number): PaginationPage & { key: string } => ({
		type: "page",
		value,
		key: `page-${value}`,
	});
	const pages: PaginationPageItem[] = [];
	if (start > 1) {
		pages.push(item(1));
		if (start > 2) pages.push({ type: "ellipsis", key: "ellipsis-start" });
	}
	for (let i = start; i <= end; i++) pages.push(item(i));
	if (end < pageCount) {
		if (end < pageCount - 1) pages.push({ type: "ellipsis", key: "ellipsis-end" });
		pages.push(item(pageCount));
	}
	return pages;
}
