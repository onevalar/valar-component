<script lang="ts">
	import X from "@lucide/svelte/icons/x";
	import * as Dialog from "$lib/registry/ui/dialog/index.js";
	import * as ScrollArea from "$lib/registry/ui/scroll-area/index.js";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { fullImageCrop, type IssueImageCrop } from "./media-crop.js";

	let {
		open = $bindable(false),
		name,
		source,
		initial,
		chinese = false,
		portal,
		onSave,
		returnFocus,
	}: {
		open?: boolean;
		name: string;
		source: string;
		initial?: IssueImageCrop;
		chinese?: boolean;
		portal?: { to: string };
		onSave: (crop: IssueImageCrop) => void;
		returnFocus?: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const handles = [
		{ x: -1, y: -1, label: ["左上角", "top left"] },
		{ x: 0, y: -1, label: ["上边", "top"] },
		{ x: 1, y: -1, label: ["右上角", "top right"] },
		{ x: 1, y: 0, label: ["右边", "right"] },
		{ x: 1, y: 1, label: ["右下角", "bottom right"] },
		{ x: 0, y: 1, label: ["下边", "bottom"] },
		{ x: -1, y: 1, label: ["左下角", "bottom left"] },
		{ x: -1, y: 0, label: ["左边", "left"] },
	] as const;
	type Handle = (typeof handles)[number];
	let draft = $state<IssueImageCrop>({ ...fullImageCrop });
	let picture = $state<HTMLImageElement>();
	let cancel = $state<HTMLButtonElement | null>(null);
	let drag: { pointerId: number; x: number; y: number; start: IssueImageCrop } | undefined;
	const original = $derived(initial ?? fullImageCrop);
	const changed = $derived(
		draft.left !== original.left ||
			draft.top !== original.top ||
			draft.right !== original.right ||
			draft.bottom !== original.bottom
	);
	const rect = $derived(
		`left:${draft.left * 100}%;top:${draft.top * 100}%;width:${(draft.right - draft.left) * 100}%;height:${(draft.bottom - draft.top) * 100}%`
	);

	function adjust(handle: Handle, dx: number, dy: number, start: IssueImageCrop) {
		const displayed = picture?.getBoundingClientRect();
		if (
			!picture ||
			!displayed?.width ||
			!displayed.height ||
			!picture.naturalWidth ||
			!picture.naturalHeight
		)
			return;
		const minWidth = 1 / picture.naturalWidth;
		const minHeight = 1 / picture.naturalHeight;
		draft = {
			left:
				handle.x === -1
					? clamp(start.left + dx / displayed.width, 0, start.right - minWidth)
					: start.left,
			top:
				handle.y === -1
					? clamp(start.top + dy / displayed.height, 0, start.bottom - minHeight)
					: start.top,
			right:
				handle.x === 1
					? clamp(start.right + dx / displayed.width, start.left + minWidth, 1)
					: start.right,
			bottom:
				handle.y === 1
					? clamp(start.bottom + dy / displayed.height, start.top + minHeight, 1)
					: start.bottom,
		};
	}

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	function nudge(event: KeyboardEvent, handle: Handle) {
		const x = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
		const y = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
		if (!x && !y) return;
		event.preventDefault();
		const step = event.shiftKey ? 10 : 1;
		adjust(handle, x * step, y * step, draft);
	}

	function startDrag(event: PointerEvent & { currentTarget: HTMLButtonElement }) {
		if (event.button !== 0 || !event.isPrimary) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, start: { ...draft } };
	}

	function moveDrag(event: PointerEvent, handle: Handle) {
		if (drag?.pointerId !== event.pointerId) return;
		adjust(handle, event.clientX - drag.x, event.clientY - drag.y, drag.start);
	}

	function save() {
		if (!changed) return;
		onSave({ ...draft });
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content
		portalProps={portal}
		showCloseButton={false}
		class="inset-0! flex h-[100svh] w-screen max-w-none translate-x-0! translate-y-0! flex-col gap-0 rounded-none! border-0! bg-[color:var(--composer-surface,var(--background))] p-0! shadow-none! sm:max-w-none"
		onOpenAutoFocus={(event) => {
			event.preventDefault();
			draft = { ...original };
			cancel?.focus({ preventScroll: true });
		}}
		onCloseAutoFocus={(event) => {
			event.preventDefault();
			returnFocus?.();
		}}
	>
		<Dialog.Title class="sr-only">{text("裁剪图片", "Crop image")}</Dialog.Title>
		<Dialog.Description class="sr-only">{name}</Dialog.Description>
		<div class="flex min-h-11 shrink-0 items-center justify-end gap-1 p-2">
			<Button
				bind:ref={cancel}
				variant="outline"
				shape="pill"
				size="xs"
				class="h-6"
				onclick={() => (open = false)}>{text("取消", "Cancel")}</Button
			>
			<Button shape="pill" size="xs" class="h-6" disabled={!changed} onclick={save}
				>{text("保存", "Save")}</Button
			>
			<Button
				size="icon-xs"
				variant="ghost"
				class="ms-1 size-7 rounded-full"
				aria-label={text("关闭", "Close")}
				onclick={() => (open = false)}><X size={14} aria-hidden="true" /></Button
			>
		</div>
		<ScrollArea.Root
			type="hover"
			orientation="both"
			viewportLabel={text("图片裁剪区", "Image crop area")}
			class="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]>[data-scroll-area-content]]:min-h-full"
		>
			<div class="grid min-h-[calc(100svh-44px)] min-w-full place-items-center p-8">
				<div class="relative w-fit max-w-full select-none" data-slot="issue-crop-stage">
					<img
						bind:this={picture}
						src={source}
						alt={name}
						draggable="false"
						class="block h-auto max-h-[calc(100svh-120px)] w-auto max-w-[calc(100vw-64px)]"
					/>
					<div aria-hidden="true" class="pointer-events-none absolute inset-0 overflow-clip">
						<div
							style={rect}
							class="absolute border border-foreground/70 shadow-[0_0_0_9999px_rgb(0_0_0/.45)]"
							data-slot="issue-crop-bounds"
						>
							<span class="absolute inset-y-0 start-1/3 border-s border-foreground/25"></span>
							<span class="absolute inset-y-0 start-2/3 border-s border-foreground/25"></span>
							<span class="absolute inset-x-0 top-1/3 border-t border-foreground/25"></span>
							<span class="absolute inset-x-0 top-2/3 border-t border-foreground/25"></span>
						</div>
					</div>
					{#each handles as handle (handle.label[1])}
						{@const x =
							handle.x === -1
								? draft.left
								: handle.x === 1
									? draft.right
									: (draft.left + draft.right) / 2}
						{@const y =
							handle.y === -1
								? draft.top
								: handle.y === 1
									? draft.bottom
									: (draft.top + draft.bottom) / 2}
						{@const cursor =
							handle.x === 0 ? "ns-resize"
								: handle.y === 0 ? "ew-resize"
									: handle.x === handle.y ? "nwse-resize" : "nesw-resize"}
						<button
							type="button"
							aria-label={text(`从${handle.label[0]}调整`, `Resize from ${handle.label[1]}`)}
							data-slot="issue-crop-handle"
							style={`left:${x * 100}%;top:${y * 100}%;cursor:${cursor}`}
							class="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 touch-none place-items-center rounded-full focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ring"
							onkeydown={(event) => nudge(event, handle)}
							onpointerdown={startDrag}
							onpointermove={(event) => moveDrag(event, handle)}
							onlostpointercapture={() => (drag = undefined)}
						>
							<span
								aria-hidden="true"
								class="size-2.5 rounded-full bg-foreground"
							></span>
						</button>
					{/each}
				</div>
			</div>
		</ScrollArea.Root>
	</Dialog.Content>
</Dialog.Root>
