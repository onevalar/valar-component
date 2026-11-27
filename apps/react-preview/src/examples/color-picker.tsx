import { ColorPicker } from "@valar/react-ui/color-picker";
import { useState } from "react";

export default function ColorPickerExample() {
	const [color, setColor] = useState("#2563eb");
	return (
		<form aria-label="Appearance settings" className="grid w-full max-w-xs gap-3 p-6 text-sm">
			<ColorPicker
				label="工作区强调色"
				name="accent"
				value={color}
				onValueChange={setColor}
				presets={["#2563eb", "#0f766e", "#b45309", "#be123c"]}
			/>
			<p role="status">{color}</p>
		</form>
	);
}
