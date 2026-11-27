import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import type { CarouselController } from "@ui-sdk/core/carousel";
import { inject, type InjectionKey, type Ref } from "vue";

export type CarouselAPI = EmblaCarouselType;
export type CarouselOptions = EmblaOptionsType;
export type CarouselPlugins = EmblaPluginType[];
export type CarouselOrientation = "horizontal" | "vertical";

export interface CarouselProps {
	/** Use Embla when you need to inspect its API from a component ref. */
	engine?: "sdk" | "embla";
	opts?: CarouselOptions;
	plugins?: CarouselPlugins;
	setApi?: (api: CarouselAPI | undefined) => void;
	orientation?: CarouselOrientation;
	dir?: "ltr" | "rtl";
}

interface CarouselState {
	sdk: Readonly<Ref<boolean>>;
	controller: CarouselController;
	orientation: Readonly<Ref<CarouselOrientation>>;
	direction: Readonly<Ref<"ltr" | "rtl" | undefined>>;
	opts: Readonly<Ref<CarouselOptions | undefined>>;
	plugins: Readonly<Ref<CarouselPlugins | undefined>>;
	canScrollPrev: Readonly<Ref<boolean>>;
	canScrollNext: Readonly<Ref<boolean>>;
	setApi: (api: CarouselAPI | undefined) => void;
	scroll: (direction: "previous" | "next") => void;
}

export const carouselContext: InjectionKey<CarouselState> = Symbol("ValarCarousel");

export function useCarousel(part: string) {
	const context = inject(carouselContext);
	if (!context) throw new Error(`${part} must be used inside Carousel.`);
	return context;
}
