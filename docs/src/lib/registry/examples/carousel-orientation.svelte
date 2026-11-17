<script lang="ts">
	import * as Card from "$lib/registry/ui/card/index.js";
	import * as Carousel from "$lib/registry/ui/carousel/index.js";
</script>

<Carousel.Root
	opts={{
		align: "start",
	}}
	orientation="vertical"
	aria-label="Vertical cards"
	class="w-full max-w-xs py-9"
>
	<Carousel.Content class="-mt-1 h-[270px]">
		{#each Array(5) as _, i (i)}
			<Carousel.Item class="basis-1/2 pt-1">
				<div class="p-1">
					<Card.Root>
						<Card.Content class="flex items-center justify-center p-6">
							<span class="text-3xl font-semibold">{i + 1}</span>
						</Card.Content>
					</Card.Root>
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>
	<Carousel.Previous class="top-0" />
	<Carousel.Next class="bottom-0" />
</Carousel.Root>
