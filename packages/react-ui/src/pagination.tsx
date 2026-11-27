"use client";

import { cn } from "cn";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import { Slot } from "radix-ui";
import React, {
	createContext,
	useContext,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react";
import { Button, type ButtonProps } from "./button.tsx";

export type PaginationPage = { type: "page"; value: number };
export type PaginationPageItem = (PaginationPage | { type: "ellipsis" }) & { key: string };
export type PaginationState = {
	pages: PaginationPageItem[];
	range: { start: number; end: number };
	currentPage: number;
};
export type PaginationProps = Omit<ComponentProps<"nav">, "children"> & {
	count?: number;
	perPage?: number;
	siblingCount?: number;
	page?: number;
	defaultPage?: number;
	onPageChange?: (page: number) => void;
	loop?: boolean;
	orientation?: "horizontal" | "vertical";
	asChild?: boolean;
	children?: ReactNode | ((state: PaginationState) => ReactNode);
};

const PaginationContext = createContext<{
	currentPage: number;
	totalPages: number;
	selectPage: (page: number) => void;
} | null>(null);

function usePaginationContext() {
	const context = useContext(PaginationContext);
	if (!context) throw new Error("Pagination controls must be rendered inside Pagination.");
	return context;
}

function normalizeInteger(value: number, fallback: number, min: number) {
	return Number.isFinite(value)
		? Math.min(Number.MAX_SAFE_INTEGER, Math.max(min, Math.trunc(value)))
		: fallback;
}

function getPageItems(
	currentPage: number,
	totalPages: number,
	siblings: number
): PaginationPageItem[] {
	const firstCentered = siblings + 3;
	const lastCentered = totalPages - siblings - 2;
	const pages: PaginationPageItem[] = [{ type: "page", value: 1, key: "page-1" }];
	if (totalPages === 1) return pages;

	// The first and last pages stay visible. Near an edge, use the extra space
	// from the missing ellipsis to show another page at that edge.
	let start = 2;
	let end = totalPages - 1;
	if (firstCentered <= lastCentered) {
		if (currentPage < firstCentered) end = firstCentered;
		else if (currentPage > lastCentered) start = lastCentered;
		else {
			start = currentPage - siblings;
			end = currentPage + siblings;
		}
	}
	if (start > 2) pages.push({ type: "ellipsis", key: "ellipsis-start" });
	for (let value = start; value <= end; value++)
		pages.push({ type: "page", value, key: `page-${value}` });
	if (end < totalPages - 1) pages.push({ type: "ellipsis", key: "ellipsis-end" });
	pages.push({ type: "page", value: totalPages, key: `page-${totalPages}` });
	return pages;
}

const controlSelector = "button[data-pagination-control]:not(:disabled)";

export function Pagination({
	count = 0,
	perPage = 10,
	siblingCount = 1,
	page,
	defaultPage = 1,
	onPageChange,
	orientation = "horizontal",
	loop = false,
	asChild,
	children,
	className,
	onKeyDown,
	...props
}: PaginationProps) {
	const [localPage, setLocalPage] = useState(defaultPage);
	const itemCount = normalizeInteger(count, 0, 0);
	const pageSize = normalizeInteger(perPage, 10, 1);
	const totalPages = Math.max(1, Math.ceil(itemCount / pageSize));
	const currentPage = Math.min(totalPages, normalizeInteger(page ?? localPage, 1, 1));
	const selectPage = (nextPage: number) => {
		if (
			!Number.isInteger(nextPage) ||
			nextPage < 1 ||
			nextPage > totalPages ||
			nextPage === currentPage
		)
			return;
		if (page === undefined) setLocalPage(nextPage);
		onPageChange?.(nextPage);
	};
	const Comp = asChild ? Slot.Root : "nav";
	return (
		<PaginationContext.Provider value={{ currentPage, totalPages, selectPage }}>
			<Comp
				data-slot="pagination"
				data-pagination-root=""
				data-orientation={orientation}
				role="navigation"
				aria-label="分页"
				className={cn("cn-pagination mx-auto flex w-full justify-center", className)}
				{...props}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (
						event.defaultPrevented ||
						event.altKey ||
						event.ctrlKey ||
						event.metaKey ||
						!(event.target instanceof Element)
					)
						return;
					const root = event.currentTarget;
					const control = event.target.closest(controlSelector);
					if (control?.closest("[data-pagination-root]") !== root) return;
					const rtl = getComputedStyle(root).direction === "rtl";
					const forward =
						orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
					const backward =
						orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
					const { key } = event;
					if (key !== "Home" && key !== "End" && key !== forward && key !== backward) return;
					event.preventDefault();
					const controls = Array.from(
						root.querySelectorAll<HTMLButtonElement>(controlSelector)
					).filter(
						(node) =>
							node.closest("[data-pagination-root]") === root &&
							node.tabIndex >= 0 &&
							node.getClientRects().length > 0 &&
							getComputedStyle(node).visibility === "visible"
					);
					const index = controls.findIndex((node) => node === control);
					if (index < 0) return;
					const next =
						key === "Home"
							? 0
							: key === "End"
								? controls.length - 1
								: index + (key === forward ? 1 : -1);
					controls[loop ? (next + controls.length) % controls.length : next]?.focus();
				}}
			>
				{typeof children === "function"
					? children({
							pages: getPageItems(currentPage, totalPages, normalizeInteger(siblingCount, 1, 0)),
							range: {
								start: (currentPage - 1) * pageSize + 1,
								end: Math.min(currentPage * pageSize, itemCount),
							},
							currentPage,
						})
					: children}
			</Comp>
		</PaginationContext.Provider>
	);
}

export function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn("cn-pagination-content flex items-center", className)}
			{...props}
		/>
	);
}

export function PaginationItem(props: ComponentProps<"li">) {
	return <li data-slot="pagination-item" {...props} />;
}

type PaginationControlProps = ComponentProps<"button"> & Pick<ButtonProps, "asChild">;
export type PaginationLinkProps = PaginationControlProps & {
	page: PaginationPage | number;
	isActive?: boolean;
	size?: NonNullable<ButtonProps["size"]>;
};

export function PaginationLink({
	page,
	isActive,
	size = "icon",
	className,
	children,
	disabled,
	onClick,
	...props
}: PaginationLinkProps) {
	const { currentPage, totalPages, selectPage } = usePaginationContext();
	const value = typeof page === "number" ? page : page.value;
	const active = isActive ?? value === currentPage;
	return (
		<Button
			data-slot="pagination-link"
			data-pagination-control=""
			data-active={active}
			data-value={value}
			data-selected={value === currentPage ? "" : undefined}
			aria-label={`Page ${value}`}
			aria-current={active ? "page" : undefined}
			size={size}
			variant={active ? "outline" : "ghost"}
			className={cn("cn-pagination-link tabular-nums", className)}
			{...props}
			disabled={disabled || !Number.isInteger(value) || value < 1 || value > totalPages}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) selectPage(value);
			}}
		>
			{children ?? value}
		</Button>
	);
}

export type PaginationStepProps = PaginationControlProps & { label?: string };

function PaginationStep({
	direction,
	legacy = false,
	label,
	children,
	className,
	disabled,
	onClick,
	...props
}: PaginationStepProps & {
	direction: "previous" | "next";
	legacy?: boolean;
}) {
	const { currentPage, totalPages, selectPage } = usePaginationContext();
	const previous = direction === "previous";
	const text = label ?? (previous ? "上一页" : "下一页");
	const Icon = previous ? ChevronLeft : ChevronRight;
	const labelElement = <span className={legacy ? undefined : "hidden sm:block"}>{text}</span>;
	return (
		<Button
			data-slot={previous ? "pagination-previous" : "pagination-next"}
			data-pagination-control=""
			aria-label={text}
			variant="ghost"
			className={cn(previous ? "cn-pagination-previous" : "cn-pagination-next", className)}
			{...props}
			disabled={disabled || (previous ? currentPage <= 1 : currentPage >= totalPages)}
			onClick={(event) => {
				onClick?.(event);
				if (!event.defaultPrevented) selectPage(currentPage + (previous ? -1 : 1));
			}}
		>
			{children ?? (
				<>
					{!previous && labelElement}
					<Icon
						aria-hidden="true"
						data-icon={previous ? "inline-start" : "inline-end"}
						className="rtl:rotate-180"
					/>
					{previous && labelElement}
				</>
			)}
		</Button>
	);
}

export function PaginationPrevious(props: PaginationStepProps) {
	return <PaginationStep {...props} direction="previous" />;
}

export function PaginationNext(props: PaginationStepProps) {
	return <PaginationStep {...props} direction="next" />;
}

export function PaginationPrevButton(props: PaginationStepProps) {
	return <PaginationStep {...props} direction="previous" legacy />;
}

export function PaginationNextButton(props: PaginationStepProps) {
	return <PaginationStep {...props} direction="next" legacy />;
}

export function PaginationEllipsis({
	className,
	label = "更多页",
	...props
}: Omit<ComponentProps<"span">, "children"> & { label?: string }) {
	return (
		<span
			data-slot="pagination-ellipsis"
			className={cn("cn-pagination-ellipsis flex items-center justify-center", className)}
			{...props}
		>
			<Ellipsis aria-hidden="true" />
			<span className="sr-only">{label}</span>
		</span>
	);
}
