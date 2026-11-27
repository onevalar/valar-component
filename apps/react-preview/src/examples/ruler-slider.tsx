import { RulerSlider } from "@valar/react-ui/ruler-slider";
import { useState } from "react";

export default function RulerSliderExample() {
	const [distance, setDistance] = useState(3.25);
	const [committed, setCommitted] = useState<number>();
	return (
		<section aria-label="Route estimate" className="grid w-full max-w-md gap-3 p-6 text-sm">
			<RulerSlider
				label="Distance"
				name="distance"
				value={distance}
				onValueChange={setDistance}
				onValueCommit={setCommitted}
				min={1.25}
				max={11.25}
				step={0.5}
				majorEvery={4}
				unit="km"
			/>
			<p role="status">
				{committed === undefined ? "Adjust the distance" : `Committed: ${committed} km`}
			</p>
		</section>
	);
}
