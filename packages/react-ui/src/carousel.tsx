"use client";

import * as React from "react";
import {
	Carousel as SdkCarousel,
	CarouselContent as SdkContent,
	CarouselItem as SdkItem,
	CarouselNext as SdkNext,
	CarouselPrevious as SdkPrevious,
	CarouselViewport as SdkViewport,
	createCarouselController,
} from "@ui-sdk/react/carousel";
import { cn } from "cn";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Direction } from "radix-ui";
import { Button, type ButtonProps } from "./button.tsx";

export type CarouselAPI = NonNullable<UseEmblaCarouselType[1]>;
export type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;
export type CarouselPlugins = NonNullable<Parameters<typeof useEmblaCarousel>[1]>;
export type CarouselProps = Omit<React.ComponentProps<"div">, "dir"> & {
	dir?: "ltr" | "rtl";
	orientation?: "horizontal" | "vertical";
	opts?: CarouselOptions;
	plugins?: CarouselPlugins;
	setApi?: (api: CarouselAPI | undefined) => void;
};

type CarouselContextValue = {
	orientation: NonNullable<CarouselProps["orientation"]>;
	direction: NonNullable<CarouselProps["dir"]>;
	viewportRef: UseEmblaCarouselType[0];
	api: CarouselAPI | undefined;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	sdk?: ReturnType<typeof createCarouselController>;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);
	if (!context) throw new Error("Carousel parts must be used within <Carousel>.");
	return context;
}

export function Carousel(props: CarouselProps) {
	return props.opts || props.plugins || props.setApi ? <EmblaCarousel {...props} /> : <SdkRoot {...props} />;
}

function SdkRoot({ className, dir, orientation = "horizontal", ...props }: CarouselProps) {
	const direction = Direction.useDirection(dir);
	const [sdk] = React.useState(createCarouselController);
	return (
		<CarouselContext.Provider value={{ orientation, direction, sdk, api: undefined, viewportRef: () => {}, canScrollPrev: false, canScrollNext: false }}>
			<SdkCarousel controller={sdk} orientation={orientation} data-slot="carousel" dir={direction}
				aria-roledescription="轮播" className={cn("relative", className)} {...props} />
		</CarouselContext.Provider>
	);
}

function EmblaCarousel({
	className,
	dir,
	orientation = "horizontal",
	opts,
	plugins,
	setApi,
	...props
}: CarouselProps) {
	const direction = Direction.useDirection(dir ?? opts?.direction);
	const [viewportRef, api] = useEmblaCarousel(
		{
			container: ":scope > [data-embla-container]",
			slides: ":scope > [data-embla-slide]",
			...opts,
			direction,
			axis: orientation === "horizontal" ? "x" : "y",
			breakpoints: {
				...opts?.breakpoints,
				"(prefers-reduced-motion: reduce)": {
					duration: 0,
					...opts?.breakpoints?.["(prefers-reduced-motion: reduce)"],
				},
			},
		},
		plugins
	);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);
	const reportApi = React.useEffectEvent((value: CarouselAPI | undefined) => setApi?.(value));

	React.useEffect(() => {
		const syncButtons = () => {
			setCanScrollPrev(api?.canScrollPrev() ?? false);
			setCanScrollNext(api?.canScrollNext() ?? false);
		};
		syncButtons();
		if (!api) return;
		api.on("select", syncButtons).on("reInit", syncButtons);
		reportApi(api);
		return () => {
			api.off("select", syncButtons).off("reInit", syncButtons);
			reportApi(undefined);
		};
	}, [api]);

	return (
		<CarouselContext.Provider
			value={{ orientation, direction, viewportRef, api, canScrollPrev, canScrollNext }}
		>
			<div
				data-slot="carousel"
				data-orientation={orientation}
				role="region"
				aria-roledescription="轮播"
				dir={direction}
				className={cn("relative", className)}
				{...props}
			/>
		</CarouselContext.Provider>
	);
}

export type CarouselContentProps = React.ComponentProps<"div">;

export function CarouselContent({ className, children, ...props }: CarouselContentProps) {
	const { viewportRef, orientation, sdk } = useCarousel();
	if (sdk) return (
		<SdkViewport tabIndex={0} className="scrollbar-none focus-visible:-outline-offset-1 focus-visible:outline-ring data-[orientation=vertical]:h-full"
			render={(part) => <div {...part} data-slot="carousel-content" />}>
			<SdkContent className={cn("gap-4", orientation === "vertical" && "h-full", className)} {...props}
				render={(part) => <div {...part} data-slot="carousel-container" />}>{children}</SdkContent>
		</SdkViewport>
	);
	return (
		<div data-slot="carousel-content" className="overflow-hidden" ref={viewportRef}>
			<div
				data-slot="carousel-container"
				data-orientation={orientation}
				data-embla-container=""
				className={cn(
					"flex",
					orientation === "horizontal"
						? "cn-carousel-content-horizontal -ms-4 [touch-action:pan-y_pinch-zoom]"
						: "cn-carousel-content-vertical -mt-4 [touch-action:pan-x_pinch-zoom] flex-col",
					className
				)}
				{...props}
			>{children}</div>
		</div>
	);
}

export type CarouselItemProps = React.ComponentProps<"div">;

export function CarouselItem({ className, ...props }: CarouselItemProps) {
	const { orientation, sdk } = useCarousel();
	const Component = sdk ? SdkItem : "div";
	return (
		<Component
			data-slot="carousel-item"
			data-orientation={orientation}
			data-embla-slide=""
			role="group"
			aria-roledescription="幻灯片"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				!sdk && (orientation === "horizontal"
					? "cn-carousel-item-horizontal ps-4"
					: "cn-carousel-item-vertical pt-4"),
				className
			)}
			{...props}
		/>
	);
}

export type CarouselControlProps = Omit<React.ComponentProps<"button">, "children"> &
	Pick<ButtonProps, "variant" | "size" | "shape"> & { label?: string };

function CarouselControl({
	step,
	label,
	className,
	variant = "outline",
	size = "icon-sm",
	shape,
	disabled,
	onClick,
	onKeyDown,
	type = "button",
	...props
}: CarouselControlProps & { step: "previous" | "next" }) {
	const { orientation, direction, api, canScrollPrev, canScrollNext, sdk } = useCarousel();
	const previous = step === "previous";
	const blocked = disabled || !(previous ? canScrollPrev : canScrollNext);
	const Icon = previous ? ChevronLeft : ChevronRight;
	const classes = cn("absolute touch-manipulation", previous ? "cn-carousel-previous" : "cn-carousel-next",
		orientation === "horizontal" ? previous ? "inset-y-0 -start-12 my-auto" : "inset-y-0 -end-12 my-auto"
			: cn("left-1/2 -translate-x-1/2 rotate-90", previous ? "-top-12" : "-bottom-12"), className);
	const slot = previous ? "carousel-previous" : "carousel-next";
	const icon = <><Icon aria-hidden="true" className={orientation === "horizontal" ? "rtl:rotate-180" : undefined} />
		<span className="sr-only">{label ?? (previous ? "上一张" : "下一张")}</span></>;
	if (sdk) {
		const Control = previous ? SdkPrevious : SdkNext;
		return <Button asChild variant={variant} size={size} shape={shape} className={classes}>
			<Control {...props} data-slot={slot} type={type} disabled={disabled} onClick={onClick}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (event.defaultPrevented || disabled || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
					const back = orientation === "vertical" ? "ArrowUp" : direction === "rtl" ? "ArrowRight" : "ArrowLeft";
					const forward = orientation === "vertical" ? "ArrowDown" : direction === "rtl" ? "ArrowLeft" : "ArrowRight";
					if (event.key !== back && event.key !== forward) return;
					event.preventDefault();
					if (event.key === back) sdk.previous({ reason: "list-navigation", event: event.nativeEvent });
					else sdk.next({ reason: "list-navigation", event: event.nativeEvent });
				}}>{icon}</Control>
		</Button>;
	}
	return (
		<Button
			asChild
			variant={variant}
			size={size}
			shape={shape}
			disabled={blocked}
			className={classes}
		>
			<button
				{...props}
				data-slot={slot}
				aria-disabled={blocked}
				type={type}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented || blocked) return;
					if (previous) api?.scrollPrev();
					else api?.scrollNext();
				}}
				onKeyDown={(event) => {
					onKeyDown?.(event);
					if (event.defaultPrevented || blocked) return;
					const back =
						orientation === "vertical"
							? "ArrowUp"
							: direction === "rtl"
								? "ArrowRight"
								: "ArrowLeft";
					const forward =
						orientation === "vertical"
							? "ArrowDown"
							: direction === "rtl"
								? "ArrowLeft"
								: "ArrowRight";
					if (event.key !== back && event.key !== forward) return;
					event.preventDefault();
					if (event.key === back) api?.scrollPrev();
					else api?.scrollNext();
				}}
			>
				{icon}
			</button>
		</Button>
	);
}

export function CarouselPrevious(props: CarouselControlProps) {
	return <CarouselControl {...props} step="previous" />;
}

export function CarouselNext(props: CarouselControlProps) {
	return <CarouselControl {...props} step="next" />;
}
