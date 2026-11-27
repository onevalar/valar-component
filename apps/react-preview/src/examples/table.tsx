import { Checkbox } from "@valar/react-ui/checkbox";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@valar/react-ui/table";
import { useState } from "react";

const labels = [
	{ id: "bug", name: "Bug", description: "Problems that need fixing", issues: 12 },
	{ id: "design", name: "Design", description: "Workspace design updates", issues: 3 },
];

export default function TableExample() {
	const [selected, setSelected] = useState<string[]>([]);
	return (
		<section aria-label="Table examples" className="grid max-w-2xl min-w-0 gap-4 p-6 text-sm">
			<h2 className="font-semibold">Issue labels</h2>
			<Table appearance="settings" scrollLabel="Scroll issue labels" className="min-w-[420px]">
				<TableCaption className="sr-only">Workspace issue labels</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead scope="col" className="w-10">
							<span className="sr-only">Selection</span>
						</TableHead>
						<TableHead scope="col">Name</TableHead>
						<TableHead scope="col">Description</TableHead>
						<TableHead scope="col" className="text-end">
							Issues
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{labels.map(({ id, name, description, issues }) => (
						<TableRow key={id} data-state={selected.includes(id) ? "selected" : undefined}>
							<TableCell>
								<Checkbox
									aria-label={`Select ${name}`}
									checked={selected.includes(id)}
									onCheckedChange={(checked) =>
										setSelected((ids) =>
											checked === true ? [...ids, id] : ids.filter((value) => value !== id)
										)
									}
								/>
							</TableCell>
							<TableCell>{name}</TableCell>
							<TableCell>{description}</TableCell>
							<TableCell className="text-end tabular-nums">{issues}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<p role="status">{`${selected.length} of ${labels.length} labels selected`}</p>
		</section>
	);
}
