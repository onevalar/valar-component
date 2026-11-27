import { Gauge, GaugeArc } from "@valar/react-ui/gauge";

export default function GaugeExample() {
	return (
		<section aria-label="Quota usage" className="flex flex-wrap items-start gap-5 p-6 text-sm">
			<figure className="grid w-24 gap-2 text-center">
				<Gauge
					value={132}
					label="Compute quota"
					valueText="132 percent, over quota"
					tone="danger"
				/>
				<figcaption>Compute</figcaption>
			</figure>
			<figure className="grid w-24 gap-2 text-center">
				<svg viewBox="0 0 100 90" aria-hidden="true">
					<GaugeArc value={null} />
				</svg>
				<figcaption>Storage unavailable</figcaption>
			</figure>
		</section>
	);
}
