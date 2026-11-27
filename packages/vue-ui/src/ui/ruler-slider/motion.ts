/*
 * Adapted from Valar's native Svelte ruler-slider/motion.ts, based on free MIT Arc RulerSlider.
 * Mirrored in the Vue SDK so each package is self-contained; keep the two implementations in sync.
 *
 * MIT License
 * Copyright (c) 2026 Elia Kuratli
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { rubberBand, solveSpring } from "@ui-sdk/core/gesture";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function decimalsOf(value: number) {
	const [coefficient, exponent = "0"] = String(value).split("e");
	return Math.max(0, (coefficient.split(".")[1]?.length ?? 0) - Number(exponent));
}

function precision(min: number, step: number) {
	return Math.min(100, Math.max(decimalsOf(min), decimalsOf(step)));
}

export function snapRulerValue(value: number, min: number, max: number, step: number) {
	// Exact min/max are selectable even when the final interval is shorter than one step.
	if (value <= min || value >= max) return clamp(value, min, max);
	return clamp(
		Number((min + Math.round((value - min) / step) * step).toFixed(precision(min, step))),
		min,
		max
	);
}

export function formatRulerValue(value: number, min: number, step: number) {
	const decimals = precision(min, step);
	return value.toLocaleString("en-US", {
		minimumFractionDigits: decimals,
		// Do not hide any extra precision when the selected value is an off-grid bound.
		maximumFractionDigits: Math.min(100, Math.max(decimals, decimalsOf(value))),
	});
}

export function rulerMarks(min: number, max: number, step: number, majorEvery: number) {
	const major = step * majorEvery;
	const decimals = precision(min, step);
	const format = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: decimalsOf(Number(major.toFixed(decimals))),
	});
	return Array.from({ length: Math.floor((max - min) / major + 1e-9) + 1 }, (_, index) => {
		const value = Number((min + index * major).toFixed(decimals));
		return { value, text: format.format(value) };
	});
}

type Settings = {
	min: number;
	max: number;
	step: number;
	spacing: number;
	largeStep: number;
	disabled: boolean;
};

type Sample = { t: number; v: number };
type Drag = {
	pointer: number;
	x: number;
	y: number;
	from: number;
	moved: boolean;
	samples: Sample[];
};

type Options = {
	get: () => Settings;
	position: (value: number) => void;
	dragging: (active: boolean) => void;
	change: (value: number) => void;
	commit: (value: number) => void;
};

export function createRulerMotion(node: HTMLDivElement, initial: number, options: Options) {
	const view = node.ownerDocument.defaultView!;
	const preference = view.matchMedia("(prefers-reduced-motion: reduce)");
	let settings = options.get();
	let position = initial;
	let latest = initial;
	let speed = 0;
	let updated = -Infinity;
	let frame = 0;
	let generation = 0;
	let coasting = false;
	let destroyed = false;
	let wheelTimer: number | undefined;
	let drag: Drag | undefined;
	const snapped = (value: number) => {
		const { min, max, step } = options.get();
		return snapRulerValue(value, min, max, step);
	};

	function emit(value: number) {
		if (destroyed || value === latest) return;
		latest = value;
		options.change(value);
	}
	function commit(value: number) {
		if (!destroyed && !options.get().disabled) options.commit(value);
	}
	function place(value: number, velocity = 0) {
		position = value;
		speed = velocity;
		updated = view.performance.now();
		options.position(value);
		if (coasting) emit(snapped(value));
	}
	function stop() {
		view.cancelAnimationFrame(frame);
		frame = 0;
		coasting = false;
		generation++;
	}
	function clearWheel() {
		view.clearTimeout(wheelTimer);
		wheelTimer = undefined;
	}
	function endDrag(notify = true) {
		const previous = drag;
		drag = undefined;
		if (previous) {
			if (previous.moved && notify) options.dragging(false);
			if (node.hasPointerCapture(previous.pointer)) node.releasePointerCapture(previous.pointer);
		}
	}
	function done() {
		frame = 0;
		coasting = false;
		const target = snapped(position);
		emit(target);
		commit(target);
	}

	// UI SDK measures time in milliseconds; ruler speed is in units/second.
	function spring(
		target: number,
		velocity: number,
		duration = 0.26,
		bounce = 0.12,
		precise = true,
		complete?: () => void
	) {
		const offset = position - target;
		const solver = solveSpring(duration * 1.2, 1 - bounce, offset, velocity / 1000);
		const { step } = options.get();
		const granular = Math.abs(offset) < 5;
		const delta = precise ? step / 200 : granular ? 0.005 : 0.5;
		const restSpeed = precise ? step / 20 : granular ? 0.01 : 2;
		const start = view.performance.now();
		const id = generation;
		const advance = (now: number) => {
			const t = Math.max(0, now - start);
			const displacement = solver.position(t);
			const velocity = solver.velocity(t) * 1000;
			const resting = Math.abs(displacement) <= delta && Math.abs(velocity) <= restSpeed;
			place(resting ? target : target + displacement, resting ? 0 : velocity);
			if (id !== generation) return;
			if (resting) {
				frame = 0;
				complete?.();
			} else frame = view.requestAnimationFrame(advance);
		};
		frame = view.requestAnimationFrame(advance);
	}
	function glide(target: number, user = true) {
		const velocity = view.performance.now() - updated <= 30 ? speed : 0;
		stop();
		const id = generation;
		if (user) emit(target);
		if (id !== generation) return;
		if (preference.matches) place(target);
		else spring(target, user ? velocity : 0, 0.26, 0.12, user);
		// A tap/key's value is committed before its purely visual spring finishes.
		if (user) commit(target);
	}
	function inertia(velocity: number) {
		const from = position;
		const target = snapped(from + 0.42 * velocity);
		const amplitude = target - from;
		const start = view.performance.now();
		const delta = options.get().step / 200;
		const id = generation;
		if (!amplitude) {
			place(target);
			if (id === generation) done();
			return;
		}
		const advance = (now: number) => {
			const remaining = amplitude * Math.exp(-Math.max(0, now - start) / 260);
			const resting = Math.abs(remaining) <= delta;
			place(resting ? target : target - remaining, resting ? 0 : remaining / 0.26);
			if (id !== generation) return;
			if (resting) done();
			else frame = view.requestAnimationFrame(advance);
		};
		frame = view.requestAnimationFrame(advance);
	}

	function pointerDown(event: PointerEvent) {
		if (
			options.get().disabled ||
			drag ||
			event.defaultPrevented ||
			event.button !== 0 ||
			!event.isPrimary
		)
			return;
		if (event.isTrusted) node.setPointerCapture(event.pointerId);
		stop();
		clearWheel();
		drag = {
			pointer: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			from: position,
			moved: false,
			samples: [{ t: event.timeStamp, v: position }],
		};
		node.focus({ preventScroll: true });
	}
	function pointerMove(event: PointerEvent) {
		if (!drag || drag.pointer !== event.pointerId) return;
		const dx = event.clientX - drag.x;
		if (!drag.moved) {
			const dy = event.clientY - drag.y;
			if (event.pointerType === "touch" && Math.abs(dy) >= 4 && Math.abs(dy) >= Math.abs(dx)) {
				endDrag();
				glide(latest, false);
				return;
			}
			if (Math.abs(dx) < 4) return;
			drag.moved = true;
			options.dragging(true);
		}
		const { min, max, step, spacing } = options.get();
		const perUnit = spacing / step;
		const raw = drag.from - dx / perUnit;
		const edge = clamp(raw, min, max);
		const distance = (raw - edge) * perUnit;
		const elastic = Math.sign(distance) * rubberBand(Math.abs(distance), 44);
		place(preference.matches ? edge : edge + elastic / perUnit);
		drag.samples.push({ t: event.timeStamp, v: position });
		if (drag.samples.length > 6) drag.samples.shift();
		emit(snapped(edge));
	}
	function pointerEnd(event: PointerEvent) {
		if (!drag || drag.pointer !== event.pointerId) return;
		const state = drag;
		endDrag();
		const { min, max, step, spacing } = options.get();
		if (!state.moved) {
			if (event.type !== "pointerup") {
				glide(latest, false);
				return;
			}
			const rect = node.getBoundingClientRect();
			glide(snapped(position + (event.clientX - rect.left - rect.width / 2) / (spacing / step)));
			return;
		}
		const first = state.samples[0];
		const last = state.samples[state.samples.length - 1];
		const elapsed = (last.t - first.t) / 1000;
		const velocity =
			event.type === "pointerup" && elapsed > 0.008 && event.timeStamp - last.t < 60
				? (last.v - first.v) / elapsed
				: 0;
		if (preference.matches) {
			place(snapped(position));
			done();
			return;
		}
		coasting = true;
		if (position < min || position > max)
			spring(clamp(position, min, max), velocity, 0.5, 0.1, false, done);
		else inertia(velocity);
	}
	function wheel(event: WheelEvent) {
		const { disabled, step, spacing, min, max } = options.get();
		if (
			disabled ||
			drag ||
			event.defaultPrevented ||
			Math.abs(event.deltaX) <= Math.abs(event.deltaY)
		)
			return;
		event.preventDefault();
		stop();
		const id = generation;
		place(clamp(position + event.deltaX / (spacing / step), min, max));
		emit(snapped(position));
		if (id !== generation) return;
		clearWheel();
		wheelTimer = view.setTimeout(() => {
			wheelTimer = undefined;
			glide(snapped(position));
		}, 120);
	}
	function key(event: KeyboardEvent) {
		const { disabled, step, largeStep, min, max } = options.get();
		if (disabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
			return;
		const increment = event.shiftKey ? largeStep : step;
		const moves = {
			ArrowRight: increment,
			ArrowUp: increment,
			ArrowLeft: -increment,
			ArrowDown: -increment,
			PageUp: largeStep,
			PageDown: -largeStep,
		};
		let wanted: number;
		if (event.key === "Home") wanted = min;
		else if (event.key === "End") wanted = max;
		else if (Object.hasOwn(moves, event.key))
			wanted = latest + moves[event.key as keyof typeof moves];
		else return;
		event.preventDefault();
		const target = snapped(wanted);
		if (target !== latest) {
			endDrag();
			clearWheel();
			glide(target);
		}
	}
	function preferenceChanged() {
		if (!preference.matches) return;
		const settling = coasting;
		const target = settling || drag || wheelTimer !== undefined ? snapped(position) : latest;
		stop();
		place(target);
		if (settling) done();
	}

	const listeners = {
		pointerdown: pointerDown,
		pointermove: pointerMove,
		pointerup: pointerEnd,
		pointercancel: pointerEnd,
		lostpointercapture: pointerEnd,
		keydown: key,
		wheel,
	};
	for (const [type, listener] of Object.entries(listeners))
		node.addEventListener(type, listener as EventListener, { passive: false });
	preference.addEventListener("change", preferenceChanged);
	return {
		sync(next: number) {
			const current = options.get();
			const geometryChanged =
				current.min !== settings.min ||
				current.max !== settings.max ||
				current.step !== settings.step ||
				current.spacing !== settings.spacing;
			settings = current;
			if (!current.disabled && !geometryChanged && next === latest) return;
			latest = next;
			endDrag();
			clearWheel();
			if (current.disabled || geometryChanged) {
				stop();
				place(next);
			} else glide(next, false);
		},
		destroy() {
			destroyed = true;
			stop();
			clearWheel();
			preference.removeEventListener("change", preferenceChanged);
			for (const [type, listener] of Object.entries(listeners))
				node.removeEventListener(type, listener as EventListener);
			endDrag(false);
		},
	};
}
