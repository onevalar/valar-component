import { DatePicker, type Timeframe } from "@valar/react-ui/date-picker";
import { useState } from "react";

export default function DatePickerExample() {
	const [target, setTarget] = useState<Timeframe | undefined>({ date: "2027-05-20", grain: "day" });
	return (
		<section aria-label="Project schedule" className="grid justify-items-start gap-3 p-6 text-sm">
			<DatePicker
				label="Target date"
				placeholder="Set target date"
				value={target}
				onValueChange={setTarget}
				min={{ date: "2027-05-12", grain: "day" }}
				max={{ date: "2027-10-15", grain: "day" }}
			/>
			<p role="status">{target ? `${target.date} · ${target.grain}` : "No target date"}</p>
		</section>
	);
}
