import { ColorPicker } from "@valar/react-ui/color-picker";
import { useState } from "react";

const PRESETS = [
	"#2563eb",
	"#0f766e",
	"#b45309",
	"#be123c",
	"#7c3aed",
	"#0284c7",
	"#16a34a",
	"#18181b",
];

export default function ColorPickerExample() {
	const [color, setColor] = useState("#2563eb");
	return (
		<form aria-label="Appearance settings" className="grid w-full max-w-xs gap-3 p-6 text-sm">
			<ColorPicker
				label="工作区强调色"
				name="accent"
				value={color}
				onValueChange={setColor}
				presets={PRESETS}
			/>
			<p role="status" className="font-mono text-xs tabular-nums text-muted-foreground">
				{color}
			</p>
		</form>
	);
}
