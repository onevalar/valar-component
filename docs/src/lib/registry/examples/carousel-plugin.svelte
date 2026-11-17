<script lang="ts">
	import Autoplay from "embla-carousel-autoplay";
	import { MediaQuery } from "svelte/reactivity";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Carousel from "$lib/registry/ui/carousel/index.js";
	import type { CarouselAPI } from "$lib/registry/ui/carousel/context.js";

	const id = $props.id();
	const reducedMotion = new MediaQuery("(prefers-reduced-motion: reduce)");
	const plugin = Autoplay({
		delay: 2000,
		playOnInit: false,
		stopOnInteraction: true,
		stopOnFocusIn: false
	});

	let api = $state<CarouselAPI>();
	let userChoice = $state<boolean | undefined>();
	let hovering = $state(false);
	const requested = $derived(userChoice ?? !reducedMotion.current);

	function pause() {
		userChoice = false;
	}

	$effect(() => {
		if (!api) return;
		const current = api;
		const playing = requested && !hovering;
		const sync = () => {
			if (playing) plugin.play();
			else plugin.stop();
		};

		sync();
		current.on("reInit", sync);
		current.on("pointerDown", pause);
		return () => {
			current.off("reInit", sync);
			current.off("pointerDown", pause);
		};
	});
</script>

<div class="grid w-full max-w-[10rem] min-w-0 grid-cols-1 justify-items-center gap-3 sm:max-w-xs" data-slot="carousel-autoplay-demo">
	<Button
		type="button"
		variant="outline"
		size="sm"
		aria-controls={id}
		onclick={() => (userChoice = !requested)}
	>
		{requested ? "Pause autoplay" : "Play autoplay"}
	</Button>
	<Carousel.Root
		{id}
		aria-label="Autoplay example slides"
		plugins={[plugin]}
		class="w-full min-w-0"
		setApi={(instance) => (api = instance)}
		onmouseenter={() => (hovering = true)}
		onmouseleave={() => (hovering = false)}
		onfocusin={pause}
	>
		<Carousel.Content>
			{#each Array(5) as _, i (i)}
				<Carousel.Item>
					<div class="p-1">
						<Card.Root>
							<Card.Content class="flex aspect-square items-center justify-center p-6">
								<span class="text-4xl font-semibold">{i + 1}</span>
							</Card.Content>
						</Card.Root>
					</div>
				</Carousel.Item>
			{/each}
		</Carousel.Content>
		<Carousel.Previous />
		<Carousel.Next />
	</Carousel.Root>
</div>
