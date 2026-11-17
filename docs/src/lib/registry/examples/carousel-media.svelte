<script lang="ts">
	import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
	import { Button } from "$lib/registry/ui/button/index.js";
	import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
	import * as Carousel from "$lib/registry/ui/carousel/index.js";
	import type { CarouselAPI } from "$lib/registry/ui/carousel/context.js";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";

	const images = [
		{
			name: "Wide image",
			width: 160,
			height: 90,
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABaCAIAAACwpMoFAAAAyklEQVR42u3bQQ0AIAwEwRrCBl7wigV88KwLmpRJVgHzuibEmEuNC08AWIAFWIAFWIAFGLAAC7AAC7AACzBgAdYHwPtcFQYYMGDAgAELsAALsAADdslyyRJgARZgARZg2cEvViZgwIABAwYMGDBgwIABC7AAC7AAC7DMpObzDDBgwIAFWIABAwYMGDBgwIABC7AACzBgwIABAwYMGDBgARZgwIABAwYMGDBgwOoFLH+TBFiABViAAXsCwAIswAIswAIswIAFWIBVXwJuR2OzGSJZ1gAAAABJRU5ErkJggg==",
		},
		{
			name: "Square image",
			width: 80,
			height: 80,
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAIAAAABc2X6AAAAx0lEQVR42u3bURHCQAxF0ZhCCCLQiwI0YKEWOt22JLwzEwPnc5O79Xg9o6aAgYGBgYGBgYGBgYGBfwR+fz97Zjx4p/NmebWi3sCuhtRL2dVZe4W5OlOvYNcI7YnmmqI9y1yDtKeYgXtr1801TrtoBp6gXTEDD9EeNgMDt9UeMwMDAwMDAwMDAwMDAwMD3wH2PAT+P7AlXgDYIj4AHHdbci7NAMcVAImNR2LFk9hphZZ4ia1laE0b2kv7AgAMDAwMDAwMDAwMDAzcdjZUBcB+jwsqAAAAAABJRU5ErkJggg==",
		},
	];
	let activeIndex = $state(0);
	let zoomed = $state(false);

	function handleApi(api: CarouselAPI | undefined) {
		if (!api) return;
		activeIndex = api.selectedScrollSnap();
		zoomed = false;

		function updateImage(carousel: CarouselAPI) {
			const selectedIndex = carousel.selectedScrollSnap();
			if (selectedIndex === activeIndex) return;
			activeIndex = selectedIndex;
			zoomed = false;
		}

		api.on("select", updateImage).on("reInit", updateImage);
	}
</script>

<div class="grid w-full max-w-64 grid-cols-2 gap-2">
	{#each images as image, startIndex (image.name)}
		<Dialog.Root>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props} aria-label={"Open " + image.name.toLowerCase()} variant="outline" class="h-20 overflow-hidden rounded-lg p-0">
						<img src={image.src} alt="" class="block size-full object-cover" />
					</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content
				showCloseButton={false}
				class="h-dvh w-dvw max-h-none max-w-none grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden rounded-none border-0 bg-[lch(97.94%_0.5_282)] p-0 shadow-none data-closed:animate-none data-open:animate-none sm:max-w-none dark:bg-[lch(5.52%_0.4_272)]"
			>
				<Dialog.Title class="sr-only">Image viewer</Dialog.Title>
				<Dialog.Description class="sr-only">Use the arrow keys to change images. Press Escape to close.</Dialog.Description>
				<Carousel.Root
					appearance="media"
					opts={{ startIndex }}
					setApi={handleApi}
					aria-label="Issue images"
					class="grid h-full min-h-0 min-w-0 grid-rows-[44px_minmax(0,1fr)_44px]"
				>
					<Carousel.Toolbar aria-label="Image controls">
						<Button
							variant="outline"
							size="sm"
							shape="pill"
							class="me-auto h-7 min-w-[50px] px-2.5 tabular-nums"
							aria-label="Zoom image"
							aria-pressed={zoomed}
							onclick={() => (zoomed = !zoomed)}
						>
							{zoomed ? "200%" : "100%"}
						</Button>
						<ButtonGroup.Root variant="pill" aria-label="Change image">
							<Carousel.Next label="Next image" />
							<ButtonGroup.Separator />
							<Carousel.Previous label="Previous image" />
						</ButtonGroup.Root>
						<Dialog.Close>
							{#snippet child({ props })}
								<Button {...props} variant="ghost" size="icon-sm" shape="pill" class="size-7" aria-label="Close image viewer">
									<IconPlaceholder lucide="XIcon" tabler="IconX" hugeicons="Cancel01Icon" phosphor="XIcon" remixicon="RiCloseLine" class="size-3.5" />
								</Button>
							{/snippet}
						</Dialog.Close>
					</Carousel.Toolbar>
					<Carousel.Content>
						{#each images as slide, index (slide.name)}
							<Carousel.Item {index}>
								<img
									src={slide.src}
									alt={slide.name}
									width={slide.width}
									height={slide.height}
									style:width={`min(100%, ${zoomed ? slide.width * 2 : slide.width}px)`}
									class="block h-auto min-h-0 max-h-full max-w-full object-contain"
								/>
							</Carousel.Item>
						{/each}
					</Carousel.Content>
					<div class="sr-only" role="status">Image {activeIndex + 1} of {images.length}</div>
				</Carousel.Root>
			</Dialog.Content>
		</Dialog.Root>
	{/each}
</div>
