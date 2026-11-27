import { WaffleChart } from "@valar/react-ui/waffle-chart";
import { useState } from "react";

const issues = [
	{ key: "Design", value: 5, color: "var(--chart-1)" },
	{ key: "Bug", value: 2, color: "var(--chart-2)" },
	{ key: "Docs", value: 2, color: "var(--chart-3)" },
];

export default function WaffleChartExample() {
	const [showEmpty, setShowEmpty] = useState(false);
	return (
		<figure className="grid justify-items-start gap-3 p-6 text-sm">
			<WaffleChart data={showEmpty ? [] : issues} label="Issues by type" className="w-32" />
			<figcaption>
				{showEmpty ? "No issues in this period" : "Design 5 · Bug 2 · Docs 2"}
			</figcaption>
			<label className="flex items-center gap-2">
				<input
					type="checkbox"
					checked={showEmpty}
					onChange={(event) => setShowEmpty(event.currentTarget.checked)}
				/>
				Show empty period
			</label>
		</figure>
	);
}
