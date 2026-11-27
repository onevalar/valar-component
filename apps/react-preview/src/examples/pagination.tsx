import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@valar/react-ui/pagination";

const issueCount = 95;

export default function PaginationExample() {
	return (
		<section aria-label="Pagination examples" className="w-full max-w-lg p-6 text-sm">
			<Pagination
				aria-label="Issues pages"
				count={issueCount}
				perPage={10}
				defaultPage={2}
				className="flex-col items-center gap-3"
			>
				{({ pages, range }) => (
					<>
						<PaginationContent className="flex-wrap justify-center">
							<PaginationItem>
								<PaginationPrevious label="Previous" />
							</PaginationItem>
							{pages.map((item) => (
								<PaginationItem key={item.key}>
									{item.type === "page" ? (
										<PaginationLink page={item} size="icon-sm" />
									) : (
										<PaginationEllipsis label="More pages" className="size-7" />
									)}
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationNext label="Next" />
							</PaginationItem>
						</PaginationContent>
						<output className="text-xs text-muted-foreground tabular-nums">
							Issues {range.start}–{range.end} of {issueCount}
						</output>
					</>
				)}
			</Pagination>
		</section>
	);
}
