import { Progress } from "@valar/react-ui/progress";
import { Slider } from "@valar/react-ui/slider";
import { useState } from "react";

const minimum = 10;
const maximum = 60;
const locale = "fr-FR";
const percent = new Intl.NumberFormat(locale, { style: "percent" });

export default function ProgressExample() {
	const [value, setValue] = useState(35);
	const readout = percent.format((value - minimum) / (maximum - minimum));

	return (
		<section aria-label="Progress examples" className="grid w-full max-w-sm gap-6 p-6 text-sm">
			<div className="grid gap-2">
				<div className="flex items-center justify-between gap-2">
					<span>Import progress</span>
					<span aria-hidden="true" lang={locale} className="text-muted-foreground tabular-nums">
						{readout}
					</span>
				</div>
				<Progress
					aria-label="Import progress"
					aria-valuetext={readout}
					min={minimum}
					max={maximum}
					value={value}
				/>
				<Slider
					type="single"
					aria-label="Adjust import progress"
					min={minimum}
					max={maximum}
					value={value}
					onValueChange={setValue}
				/>
			</div>
			<div className="flex items-center justify-between gap-2">
				<span>Project completion</span>
				<Progress appearance="project" aria-label="Project completion" value={72} />
			</div>
			<div className="grid gap-2">
				<span className="text-muted-foreground">Checking for duplicates…</span>
				<Progress aria-label="Duplicate check" value={null} />
			</div>
		</section>
	);
}
