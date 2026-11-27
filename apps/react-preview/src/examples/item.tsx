import { Badge } from "@valar/react-ui/badge";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemSeparator,
	ItemTitle,
} from "@valar/react-ui/item";
import { useId } from "react";

export default function ItemExample() {
	const detailId = useId();

	return (
		<section
			aria-label="Item examples"
			className="grid w-full max-w-lg grid-cols-1 gap-3 p-6 text-sm"
		>
			<ItemGroup aria-label="Project issues" className="gap-0">
				<div role="listitem">
					<Item appearance="issue-row" asChild>
						<a href={`#${detailId}`}>
							<ItemContent>
								<ItemDescription>VLR-42</ItemDescription>
								<ItemTitle>Preserve filters after refreshing the issue list</ItemTitle>
							</ItemContent>
							<ItemActions>
								<time dateTime="2026-11-27">Nov 27</time>
							</ItemActions>
						</a>
					</Item>
				</div>
				<ItemSeparator decorative />
				<div role="listitem">
					<Item appearance="issue-row" aria-disabled="true">
						<ItemContent>
							<ItemDescription>VLR-39</ItemDescription>
							<ItemTitle>Remove legacy filters</ItemTitle>
						</ItemContent>
						<ItemActions>Archived</ItemActions>
					</Item>
				</div>
			</ItemGroup>
			<Item id={detailId} variant="outline" size="sm" role="group" aria-label="Issue details">
				<ItemContent>
					<ItemTitle>Issue VLR-42</ItemTitle>
					<ItemDescription>
						Restore the last used filters when the issue list loads.
					</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Badge variant="secondary">In progress</Badge>
				</ItemActions>
			</Item>
		</section>
	);
}
