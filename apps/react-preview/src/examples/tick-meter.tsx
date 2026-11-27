import { TickMeter } from "@valar/react-ui/tick-meter";

export default function TickMeterExample() {
	return (
		<section aria-label="Quota by workspace" className="flex flex-wrap gap-4 p-6 text-sm">
			<figure className="grid w-24 gap-2 text-center">
				<TickMeter value={37} label="Design quota" valueText="37 percent used" />
				<figcaption>Design</figcaption>
			</figure>
			<figure className="grid w-24 gap-2 text-center">
				<TickMeter
					value={132}
					label="Operations quota"
					valueText="132 percent, over quota"
					tone="danger"
				/>
				<figcaption>Operations</figcaption>
			</figure>
		</section>
	);
}
