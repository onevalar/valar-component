import { cn } from "cn";
import {
	defineComponent,
	h,
	type HTMLAttributes,
	type ThHTMLAttributes,
	type TdHTMLAttributes,
} from "vue";

export { default as Table } from "./Table.vue";

function tablePart<Props extends HTMLAttributes = HTMLAttributes>(
	tag: "caption" | "td" | "th" | "thead" | "tbody" | "tfoot" | "tr",
	slot: string,
	classes: string
) {
	return defineComponent(
		(_props: Props, { attrs, slots }) =>
			() =>
				h(
					tag,
					{
						"data-slot": slot,
						...attrs,
						class: cn(classes, attrs.class as HTMLAttributes["class"]),
					},
					slots.default?.()
				),
		{ inheritAttrs: false }
	);
}

export const TableHeader = tablePart("thead", "table-header", "cn-table-header");
export const TableBody = tablePart("tbody", "table-body", "cn-table-body");
export const TableFooter = tablePart("tfoot", "table-footer", "cn-table-footer");
export const TableRow = tablePart("tr", "table-row", "cn-table-row has-aria-expanded:bg-muted/50");
export const TableHead = tablePart<ThHTMLAttributes>("th", "table-head", "cn-table-head");
export const TableCell = tablePart<TdHTMLAttributes>("td", "table-cell", "cn-table-cell");
export const TableCaption = tablePart("caption", "table-caption", "cn-table-caption");
