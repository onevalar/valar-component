import { SliderField } from "@valar/react-ui/slider-field";
import { useState } from "react";

export default function SliderFieldExample() {
	const [value, setValue] = useState(18);
	return (
		<section aria-label="Display settings" className="grid w-full max-w-md gap-3 p-6 text-sm">
			<SliderField
				label="Row spacing"
				name="spacing"
				min={6}
				max={54}
				step={3}
				unit="px"
				value={value}
				onValueChange={setValue}
			/>
			<p role="status">{value} pixels</p>
		</section>
	);
}
