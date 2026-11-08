// Native adaptation of free MIT Arc RulerSlider, copyright (c) 2026 Elia Kuratli.
// See LICENSE.md. Component-local tape physics; no React/Motion dependency.
export const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));
export const decimalsOf = (value: number) => (String(value).split(".")[1] ?? "").length;
export function snap(value: number, min: number, max: number, step: number) {
	return clamp(
		Number(
			(min + Math.round((value - min) / step) * step).toFixed(
				Math.max(decimalsOf(min), decimalsOf(step))
			)
		),
		min,
		max
	);
}
type Settings = {
	min: number;
	max: number;
	step: number;
	spacing: number;
	largeStep: number;
	disabled: boolean;
	reduced: boolean;
};
type Sample = { t: number; v: number };
type Drag = { pointer: number; x: number; from: number; moved: boolean; samples: Sample[] };
type Options = {
	get: () => Settings;
	position: (value: number) => void;
	dragging: (value: boolean) => void;
	change: (value: number) => void;
	commit: (value: number) => void;
};

export function createRulerMotion(node: HTMLDivElement, initial: number, options: Options) {
	let position = initial,
		latest = initial,
		speed = 0,
		updated = -Infinity;
	let frame = 0,
		coasting = false,
		destroyed = false;
	let wheelTimer: ReturnType<typeof setTimeout> | undefined;
	let drag: Drag | undefined;
	const snapped = (value: number) => {
		const { min, max, step } = options.get();
		return snap(value, min, max, step);
	};
	function emit(value: number) {
		if (value === latest || destroyed) return;
		latest = value;
		options.change(value);
	}
	function place(value: number, velocity = 0) {
		position = value;
		speed = velocity;
		updated = performance.now();
		options.position(value);
		if (coasting && !drag) emit(snapped(value));
	}
	function stop() {
		cancelAnimationFrame(frame);
		frame = 0;
		coasting = false;
	}
	function done() {
		frame = 0;
		coasting = false;
		emit(snapped(position));
		options.commit(snapped(position));
	}
	// Analytical damped oscillator, sampled by RAF (units/second, not frame-dependent Euler steps).
	function spring(
		target: number,
		velocity: number,
		duration = 0.26,
		bounce = 0.12,
		precise = true,
		complete?: () => void
	) {
		const from = position,
			offset = from - target;
		const root = (2 * Math.PI) / (duration * 1.2),
			decay = (1 - bounce) * root;
		const frequency = Math.sqrt(root * root - decay * decay);
		const sine = (velocity + decay * offset) / frequency;
		const { step } = options.get();
		const granular = Math.abs(offset) < 5;
		const delta = precise ? step / 200 : granular ? 0.005 : 0.5;
		const restSpeed = precise ? step / 20 : granular ? 0.01 : 2;
		const start = performance.now();
		const advance = (now: number) => {
			if (destroyed) return;
			const t = Math.max(0, now - start) / 1000,
				envelope = Math.exp(-decay * t);
			const cos = Math.cos(frequency * t),
				sin = Math.sin(frequency * t);
			const displacement = envelope * (offset * cos + sine * sin);
			const velocity =
				envelope *
				((sine * frequency - decay * offset) * cos - (offset * frequency + decay * sine) * sin);
			const resting = Math.abs(displacement) <= delta && Math.abs(velocity) <= restSpeed;
			place(resting ? target : target + displacement, resting ? 0 : velocity);
			if (resting) {
				frame = 0;
				complete?.();
			} else frame = requestAnimationFrame(advance);
		};
		frame = requestAnimationFrame(advance);
	}
	function glide(target: number, commit = true, external = false) {
		const velocity = performance.now() - updated <= 30 ? speed : 0;
		stop();
		if (!external) emit(target);
		if (options.get().reduced) place(target);
		else spring(target, external ? 0 : velocity, 0.26, 0.12, !external);
		// Actual source commits a key/tap target immediately, not after its visual spring.
		if (commit) options.commit(target);
	}
	function inertia(velocity: number) {
		const from = position,
			target = snapped(from + 0.42 * velocity);
		const amplitude = target - from,
			start = performance.now();
		const delta = options.get().step / 200;
		if (!amplitude) {
			place(target);
			done();
			return;
		}
		const advance = (now: number) => {
			if (destroyed) return;
			const remaining = amplitude * Math.exp(-(now - start) / 260);
			const resting = Math.abs(remaining) <= delta;
			place(resting ? target : target - remaining, resting ? 0 : remaining / 0.26);
			if (resting) done();
			else frame = requestAnimationFrame(advance);
		};
		frame = requestAnimationFrame(advance);
	}
	function pointerDown(event: PointerEvent) {
		if (options.get().disabled || event.button !== 0 || !event.isPrimary) return;
		node.setPointerCapture?.(event.pointerId);
		node.focus({ preventScroll: true });
		stop();
		drag = {
			pointer: event.pointerId,
			x: event.clientX,
			from: position,
			moved: false,
			samples: [{ t: event.timeStamp, v: position }],
		};
	}
	function pointerMove(event: PointerEvent) {
		if (!drag || drag.pointer !== event.pointerId) return;
		const dx = event.clientX - drag.x;
		if (!drag.moved) {
			if (Math.abs(dx) < 4) return;
			drag.moved = true;
			options.dragging(true);
		}
		const { min, max, step, spacing, reduced } = options.get(),
			perUnit = spacing / step;
		const raw = drag.from - dx / perUnit,
			edge = clamp(raw, min, max);
		const distance = (raw - edge) * perUnit;
		const elastic = Math.sign(distance) * (1 - 1 / ((Math.abs(distance) * 0.55) / 44 + 1)) * 44;
		place(reduced ? edge : edge + elastic / perUnit);
		drag.samples.push({ t: event.timeStamp, v: position });
		if (drag.samples.length > 6) drag.samples.shift();
		emit(snapped(edge));
	}
	function pointerEnd(event: PointerEvent) {
		if (!drag || drag.pointer !== event.pointerId) return;
		const state = drag;
		drag = undefined;
		options.dragging(false);
		const { min, max, step, spacing, reduced } = options.get();
		if (!state.moved) {
			if (event.type !== "pointerup") return;
			const rect = node.getBoundingClientRect();
			glide(snapped(position + (event.clientX - rect.left - rect.width / 2) / (spacing / step)));
			return;
		}
		const first = state.samples[0],
			last = state.samples[state.samples.length - 1];
		const elapsed = (last.t - first.t) / 1000;
		const velocity =
			event.type === "pointerup" && elapsed > 0.008 && event.timeStamp - last.t < 60
				? (last.v - first.v) / elapsed
				: 0;
		if (reduced) {
			place(snapped(position));
			emit(snapped(position));
			options.commit(snapped(position));
			return;
		}
		coasting = true;
		if (position < min || position > max)
			spring(clamp(position, min, max), velocity, 0.5, 0.1, false, done);
		else inertia(velocity);
	}
	function wheel(event: WheelEvent) {
		const { disabled, step, spacing, min, max } = options.get();
		if (disabled || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
		event.preventDefault();
		stop();
		place(clamp(position + event.deltaX / (spacing / step), min, max));
		emit(snapped(position));
		clearTimeout(wheelTimer);
		wheelTimer = setTimeout(() => glide(snapped(position)), 120);
	}
	function key(event: KeyboardEvent) {
		const { disabled, step, largeStep, min, max } = options.get();
		if (disabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
			return;
		const moves: Record<string, number> = {
			ArrowRight: step,
			ArrowUp: step,
			ArrowLeft: -step,
			ArrowDown: -step,
			PageUp: largeStep,
			PageDown: -largeStep,
		};
		let wanted: number;
		if (event.key === "Home") wanted = min;
		else if (event.key === "End") wanted = max;
		else if (event.key in moves)
			wanted =
				latest +
				(event.shiftKey && event.key.startsWith("Arrow")
					? Math.sign(moves[event.key]) * largeStep
					: moves[event.key]);
		else return;
		event.preventDefault();
		const next = snapped(wanted);
		if (next !== latest) glide(next);
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
	return {
		sync(next: number, disabled = false) {
			if (disabled) {
				stop();
				clearTimeout(wheelTimer);
				drag = undefined;
				options.dragging(false);
			}
			if (next === latest) return;
			latest = next;
			glide(next, false, true);
		},
		preferenceChanged() {
			if (!options.get().reduced) return;
			const commit = coasting;
			stop();
			place(snapped(position));
			if (commit) {
				emit(snapped(position));
				options.commit(snapped(position));
			}
		},
		destroy() {
			destroyed = true;
			stop();
			clearTimeout(wheelTimer);
			for (const [type, listener] of Object.entries(listeners))
				node.removeEventListener(type, listener as EventListener);
		},
	};
}
