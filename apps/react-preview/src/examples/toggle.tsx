import { Toggle } from "@valar/react-ui/toggle";
import { useState } from "react";

export default function ToggleExample() {
	const [bold, setBold] = useState(false);
	const [italic, setItalic] = useState(false);

	return (
		<section aria-label="Toggle examples" className="grid max-w-sm gap-4 p-6 text-sm">
			<div className="flex flex-wrap items-center gap-2">
				<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
					<span aria-hidden="true" className="font-bold">
						B
					</span>
				</Toggle>
				<Toggle
					variant="outline"
					size="sm"
					aria-label="Italic"
					pressed={italic}
					onPressedChange={setItalic}
				>
					<span aria-hidden="true" className="italic">
						I
					</span>
				</Toggle>
			</div>
			<p className={`${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}>
				Draft a project update.
			</p>
		</section>
	);
}
