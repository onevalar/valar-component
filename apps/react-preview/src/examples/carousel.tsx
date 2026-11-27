import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@valar/react-ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselAPI,
} from "@valar/react-ui/carousel";
import { useEffect, useState } from "react";

const slides = [
	{ title: "Overview", description: "Track milestones and check project health." },
	{ title: "Activity", description: "Review the latest changes to your issues." },
	{ title: "Reports", description: "See delivery trends and completed work." },
];

export default function CarouselExample() {
	const [api, setApi] = useState<CarouselAPI>();
	const [activeSlide, setActiveSlide] = useState(0);

	useEffect(() => {
		if (!api) return;
		const sync = () => setActiveSlide(api.selectedScrollSnap());
		sync();
		api.on("select", sync).on("reInit", sync);
		return () => {
			api.off("select", sync).off("reInit", sync);
		};
	}, [api]);

	return (
		<section
			aria-label="Carousel examples"
			className="grid w-full max-w-lg gap-3 px-12 py-6 text-sm"
		>
			<Carousel aria-label="Project highlights" aria-roledescription="carousel" setApi={setApi}>
				<CarouselContent>
					{slides.map(({ title, description }, index) => (
						<CarouselItem key={title} aria-label={title} aria-roledescription="slide">
							<div className="p-1">
								<Card size="sm" className="h-full min-h-32">
									<CardHeader>
										<CardTitle>
											<h2>{title}</h2>
										</CardTitle>
										<CardDescription>{description}</CardDescription>
									</CardHeader>
									<CardContent
										aria-hidden="true"
										className="text-xl text-muted-foreground tabular-nums"
									>
										{String(index + 1).padStart(2, "0")}
									</CardContent>
								</Card>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious label="Previous slide" />
				<CarouselNext label="Next slide" />
			</Carousel>
			<output className="text-center text-xs text-muted-foreground tabular-nums">
				<span className="sr-only">{slides[activeSlide].title}: </span>
				{activeSlide + 1} / {slides.length}
			</output>
		</section>
	);
}
