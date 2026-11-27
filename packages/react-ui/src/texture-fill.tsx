"use client";

import { cn } from "cn";
import React, { type ComponentProps, useEffect, useEffectEvent, useRef } from "react";
import { createTextureFill, type FillTexture } from "./texture-fill-canvas.ts";

export { textures, type FillTexture, type Texture } from "./texture-fill-canvas.ts";

export type TextureFillProps = Omit<ComponentProps<"span">, "children"> & {
	/** Finite percentage. The canvas is decorative; provide an accessible reading separately. */
	value: number;
	texture: FillTexture;
	intro?: boolean;
};

export function TextureFill({
	value,
	texture,
	intro = false,
	className,
	...props
}: TextureFillProps) {
	const canvas = useRef<HTMLCanvasElement>(null);
	const renderer = useRef<ReturnType<typeof createTextureFill> | undefined>(undefined);
	const initialize = useEffectEvent((pattern: FillTexture) => {
		const element = canvas.current;
		return element?.parentElement
			? createTextureFill(element.parentElement, element, pattern, value, intro)
			: undefined;
	});
	useEffect(() => {
		const instance = initialize(texture);
		renderer.current = instance;
		return () => {
			instance?.destroy();
			renderer.current = undefined;
		};
	}, [texture]);
	useEffect(() => {
		renderer.current?.update(value);
	}, [value]);

	return (
		<span
			{...props}
			data-slot="texture-fill"
			aria-hidden="true"
			className={cn("block size-full overflow-hidden text-primary", className)}
		>
			<canvas ref={canvas} className="block size-full" />
		</span>
	);
}
