<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@valar/vue-ui/card";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselAPI,
} from "@valar/vue-ui/carousel";
import { ref } from "vue";

const slides = [
	{ title: "Overview", description: "Review milestones and open issues." },
	{ title: "Activity", description: "Catch up on changes in the workspace." },
	{ title: "Reports", description: "See how much work shipped this cycle." },
];
const currentSlide = ref(1);

function trackSlide(api: CarouselAPI) {
	const sync = () => (currentSlide.value = api.selectedScrollSnap() + 1);
	api.on("select", sync).on("reInit", sync);
	sync();
}
</script>

<template>
	<section aria-label="Carousel examples" class="grid w-full max-w-lg gap-3 px-12 py-6 text-sm">
		<Carousel
			aria-label="Project views"
			aria-roledescription="carousel"
			tabindex="0"
			class="focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
			@init-api="trackSlide"
		>
			<CarouselContent>
				<CarouselItem
					v-for="(slide, index) in slides"
					:key="slide.title"
					:aria-label="slide.title"
					aria-roledescription="slide"
				>
					<Card size="sm" class="mx-px my-1 h-32">
						<CardHeader>
							<CardTitle
								><h2>{{ slide.title }}</h2></CardTitle
							>
							<CardDescription>{{ slide.description }}</CardDescription>
						</CardHeader>
						<CardContent aria-hidden="true" class="text-xl text-muted-foreground tabular-nums">
							{{ String(index + 1).padStart(2, "0") }}
						</CardContent>
					</Card>
				</CarouselItem>
			</CarouselContent>
			<CarouselPrevious label="Previous slide" />
			<CarouselNext label="Next slide" />
		</Carousel>
		<output class="text-center text-xs text-muted-foreground tabular-nums">
			{{ currentSlide }} / {{ slides.length }}
		</output>
	</section>
</template>
