import { AspectRatio } from "@valar/react-ui/aspect-ratio";

export default function AspectRatioExample() {
	return (
		<section
			aria-label="Aspect Ratio examples"
			className="grid w-full max-w-lg grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] items-start gap-3 p-6 text-sm"
		>
			<figure className="grid min-w-0 gap-2">
				<AspectRatio ratio={16 / 9} className="grid place-items-center bg-muted">
					<span aria-hidden="true" className="font-medium text-muted-foreground tabular-nums">
						16:9
					</span>
				</AspectRatio>
				<figcaption>Project cover · 16:9</figcaption>
			</figure>
			<figure className="grid min-w-0 gap-2">
				<AspectRatio ratio={1} className="grid place-items-center bg-accent">
					<span aria-hidden="true" className="font-medium text-accent-foreground tabular-nums">
						1:1
					</span>
				</AspectRatio>
				<figcaption>Thumbnail · 1:1</figcaption>
			</figure>
		</section>
	);
}
