import { Combobox } from "@valar/react-ui/combobox";
import { useState } from "react";

const projects = [
	{ id: "launch", label: "Launch plan", group: "Active projects", keywords: ["release", "发布"] },
	{ id: "design", label: "Design systems", group: "Active projects" },
	{ id: "docs", label: "Documentation", group: "Other projects" },
];

export default function ComboboxExample() {
	const [primary, setPrimary] = useState<readonly string[]>([]);
	const [related, setRelated] = useState<readonly string[]>(["launch"]);
	return (
		<section
			aria-label="Combobox examples"
			className="grid max-w-md justify-items-start gap-4 p-6 text-sm"
		>
			<Combobox
				label="Primary project"
				placeholder="Search projects…"
				options={projects}
				value={primary}
				onValueChange={setPrimary}
				clearLabel="Clear primary project"
				empty="No matching projects"
			/>
			<Combobox
				label="Related projects"
				placeholder="Search projects…"
				options={projects}
				value={related}
				onValueChange={setRelated}
				multiple
				clearLabel="Clear related projects"
				empty="No matching projects"
			/>
			<p role="status">{related.length} related projects selected</p>
		</section>
	);
}
