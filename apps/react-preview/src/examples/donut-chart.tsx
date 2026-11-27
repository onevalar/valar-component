import { StaticDonut } from "@valar/react-ui/donut-chart";
import { useState } from "react";

const usage = [
	{ key: "Compute", value: 47, color: "var(--chart-1)" },
	{ key: "Storage", value: 22, color: "var(--chart-2)" },
];

export default function DonutChartExample() {
	const [showStorage, setShowStorage] = useState(true);
	return (
		<figure aria-label="Usage by service" className="grid justify-items-start gap-3 p-6 text-sm">
			<StaticDonut
				parts={showStorage ? usage : usage.slice(0, 1)}
				total={100}
				className="size-28"
			/>
			<figcaption>Compute 47 units · Storage 22 units · Capacity 100 units</figcaption>
			<label className="flex items-center gap-2">
				<input
					type="checkbox"
					checked={showStorage}
					onChange={(event) => setShowStorage(event.currentTarget.checked)}
				/>
				Show storage in the chart
			</label>
		</figure>
	);
}
