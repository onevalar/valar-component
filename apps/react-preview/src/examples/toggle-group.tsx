import { ToggleGroup, ToggleGroupItem } from "@valar/react-ui/toggle-group";
import { useState } from "react";

export default function ToggleGroupExample() {
	const [formats, setFormats] = useState<string[]>([]);

	return (
		<section aria-label="Toggle Group examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<ToggleGroup
				type="multiple"
				appearance="toolbar"
				aria-label="Text formatting"
				value={formats}
				onValueChange={setFormats}
				className="p-1"
			>
				<ToggleGroupItem value="bold" aria-label="Bold">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M6 12h9a4 4 0 0 1 0 8H6zm0-8h8a4 4 0 0 1 0 8H6z" />
					</svg>
				</ToggleGroupItem>
				<ToggleGroupItem value="italic" aria-label="Italic">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
					>
						<path d="M19 4h-9m4 16H5M15 4 9 20" />
					</svg>
				</ToggleGroupItem>
			</ToggleGroup>
			<p
				className={`${formats.includes("bold") ? "font-bold" : ""} ${formats.includes("italic") ? "italic" : ""}`}
			>
				Draft a project update.
			</p>
		</section>
	);
}
