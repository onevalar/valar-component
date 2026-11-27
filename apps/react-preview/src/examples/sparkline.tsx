import { StaticSparkline } from "@valar/react-ui/sparkline";

export default function SparklineExample() {
	return (
		<figure className="grid justify-items-start gap-2 p-6 text-sm">
			<StaticSparkline values={[0, 4, null, 7, 2, 0]} width={108} height={60} />
			<figcaption>Daily jobs: 0, 4, unavailable, 7, 2, 0.</figcaption>
		</figure>
	);
}
