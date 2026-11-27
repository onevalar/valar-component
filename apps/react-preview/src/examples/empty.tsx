import { Button } from "@valar/react-ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@valar/react-ui/empty";
import { useRef, useState } from "react";

export default function EmptyExample() {
	const [filtered, setFiltered] = useState(true);
	const filterButton = useRef<HTMLButtonElement>(null);

	return (
		<section aria-label="Empty examples" className="grid w-full max-w-md gap-4 p-6 text-sm">
			<Empty className="border border-border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M4 7h5l2 2h9v10H4z" strokeLinejoin="round" />
						</svg>
					</EmptyMedia>
					<EmptyTitle>No project files</EmptyTitle>
					<EmptyDescription>Files attached to this project will appear here.</EmptyDescription>
				</EmptyHeader>
			</Empty>
			<div className="grid gap-4">
				<Button
					ref={filterButton}
					variant="outline"
					size="sm"
					className="justify-self-start"
					aria-pressed={filtered}
					onClick={() => setFiltered(!filtered)}
				>
					Urgent only
				</Button>
				<Empty appearance={filtered ? "filtered-list" : "issue-list"}>
					<EmptyHeader aria-live="polite">
						<EmptyTitle>{filtered ? "No matching issues" : "No assigned issues"}</EmptyTitle>
						<EmptyDescription>
							{filtered
								? "No assigned issues match the urgent filter."
								: "Issues assigned to you will appear here."}
						</EmptyDescription>
					</EmptyHeader>
					{filtered && (
						<EmptyContent>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setFiltered(false);
									filterButton.current?.focus();
								}}
							>
								Clear filters
							</Button>
						</EmptyContent>
					)}
				</Empty>
			</div>
		</section>
	);
}
