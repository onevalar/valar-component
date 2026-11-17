<script lang="ts" module>
	export type VideoPlayback = {
		time: number;
		rate: number;
		volume: number;
		muted: boolean;
		playing: boolean;
	};
</script>

<script lang="ts">
	import ArrowDownToLine from "@lucide/svelte/icons/arrow-down-to-line";
	import Maximize2 from "@lucide/svelte/icons/maximize-2";
	import Pause from "@lucide/svelte/icons/pause";
	import PictureInPicture2 from "@lucide/svelte/icons/picture-in-picture-2";
	import Play from "@lucide/svelte/icons/play";
	import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
	import Volume2 from "@lucide/svelte/icons/volume-2";
	import VolumeX from "@lucide/svelte/icons/volume-x";
	import { Button } from "$lib/registry/ui/button/index.js";
	import { Slider } from "$lib/registry/ui/slider/index.js";

	let {
		src,
		name,
		chinese = false,
		onReady,
		onError,
		onFullScreen
	}: {
		src: string;
		name: string;
		chinese?: boolean;
		onReady?: () => void;
		onError?: () => void;
		onFullScreen?: () => void;
	} = $props();

	const text = (zh: string, en: string) => (chinese ? zh : en);
	const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
	const button =
		"h-7 w-7 rounded-full border-0 bg-transparent p-0 text-white hover:bg-white/10 hover:text-white focus-visible:outline-white focus-visible:-outline-offset-1";
	const lineSlider =
		"h-7 min-w-0 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/30 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:h-2.5 [&_[data-slot=slider-thumb]]:w-1 [&_[data-slot=slider-thumb]]:rounded-full [&_[data-slot=slider-thumb]]:border-0 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]:focus-visible]:outline-white [&_[data-slot=slider-thumb]:focus-visible]:-outline-offset-1";
	let player: HTMLElement;
	let video = $state<HTMLVideoElement>();
	let duration = $state(0);
	let currentTime = $state(0);
	let paused = $state(true);
	let ended = $state(false);
	let muted = $state(false);
	let volume = $state(100);
	let rate = $state(1);
	let pip = $state(false);
	let feedback = $state("");
	const playingLabel = $derived(
		ended
			? text("重播（快捷键 K）", "Replay (keyboard shortcut k)")
			: paused
				? text("播放（快捷键 K）", "Play (keyboard shortcut k)")
				: text("暂停（快捷键 K）", "Pause (keyboard shortcut k)")
	);
	const muteLabel = $derived(
		muted
			? text("取消静音（快捷键 M）", "Unmute (keyboard shortcut m)")
			: text("静音（快捷键 M）", "Mute (keyboard shortcut m)")
	);

	function formatTime(value: number) {
		const seconds = Math.floor(value);
		const clock = [Math.floor(seconds / 60) % 60, seconds % 60]
			.map((part) => part.toString().padStart(2, "0"))
			.join(":");
		return seconds >= 3600 ? `${Math.floor(seconds / 3600)}:${clock}` : clock;
	}

	function metadata(event: Event & { currentTarget: HTMLVideoElement }) {
		duration = Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0;
		currentTime = event.currentTarget.currentTime;
		pip = document.pictureInPictureEnabled;
		onReady?.();
	}

	export function suspendPlayback(): VideoPlayback | undefined {
		if (!video || video.readyState < 1) return;
		const playback = {
			time: video.currentTime,
			rate: video.playbackRate,
			volume: video.volume,
			muted: video.muted,
			playing: !video.paused && !video.ended
		};
		video.pause();
		return playback;
	}

	export function restorePlayback(playback: VideoPlayback) {
		if (!video || video.readyState < 1) return;
		setTime(playback.time);
		setRate(playback.rate);
		video.volume = playback.volume;
		video.muted = playback.muted;
		if (playback.playing) {
			void video.play().catch(() => {
				feedback = text("无法自动继续播放。", "Unable to resume playback.");
			});
		}
	}

	async function togglePlayback() {
		if (!video) return;
		feedback = "";
		if (!video.paused) {
			video.pause();
			return;
		}
		try {
			if (video.ended) video.currentTime = 0;
			await video.play();
		} catch {
			feedback = text("无法播放视频。", "Unable to play video.");
		}
	}

	function setTime(value: number) {
		if (video && duration) video.currentTime = Math.max(0, Math.min(duration, value));
	}

	function toggleMute() {
		if (!video) return;
		video.muted = !video.muted;
		if (!video.muted && volume === 0) video.volume = 1;
	}

	function setVolume(value: number) {
		if (!video) return;
		video.volume = value / 100;
		video.muted = value === 0;
	}

	function setRate(value: number) {
		if (video && rates.includes(value)) video.playbackRate = value;
	}

	async function togglePictureInPicture() {
		if (!video || !pip) return;
		feedback = "";
		try {
			if (document.pictureInPictureElement === video) await document.exitPictureInPicture();
			else await video.requestPictureInPicture();
		} catch {
			feedback = text("无法打开画中画。", "Unable to open picture-in-picture.");
		}
	}

	function shortcuts(event: KeyboardEvent) {
		if (
			!player?.contains(document.activeElement) ||
			event.defaultPrevented ||
			event.metaKey ||
			event.ctrlKey ||
			event.altKey ||
			event.repeat ||
			event.target instanceof HTMLSelectElement
		)
			return;
		const key = event.key.toLowerCase();
		if (key === "k") void togglePlayback();
		else if (key === "m") toggleMute();
		else if (key === "f" && onFullScreen) onFullScreen();
		else if (key === "p" && pip) void togglePictureInPicture();
		else if (key === ">" || key === "<") {
			const index = rates.indexOf(rate) + (key === ">" ? 1 : -1);
			setRate(rates[Math.max(0, Math.min(rates.length - 1, index))]);
		} else return;
		event.preventDefault();
	}
</script>

<svelte:window onkeydown={shortcuts} />

<section
	bind:this={player}
	aria-label={text("媒体播放器", "Media player")}
	data-slot="issue-video-player"
	class="relative isolate w-full min-w-0 overflow-hidden rounded-[6px] border border-border bg-black @container/player"
>
	<!-- svelte-ignore a11y_media_has_caption (The user-supplied video may contain embedded captions.) -->
	<video
		bind:this={video}
		{src}
		aria-label={name}
		class="block h-auto w-full max-h-[75svh] object-contain"
		preload="metadata"
		playsinline
		onloadedmetadata={metadata}
		ondurationchange={(event) => {
			if (Number.isFinite(event.currentTarget.duration)) duration = event.currentTarget.duration;
		}}
		onplay={() => {
			paused = false;
			ended = false;
		}}
		onpause={() => (paused = true)}
		onended={() => {
			paused = true;
			ended = true;
		}}
		ontimeupdate={(event) => (currentTime = event.currentTarget.currentTime)}
		onvolumechange={(event) => {
			muted = event.currentTarget.muted;
			volume = event.currentTarget.volume * 100;
		}}
		onratechange={(event) => (rate = event.currentTarget.playbackRate)}
		onerror={onError}
	></video>
	<div
		data-slot="issue-video-controls"
		class="absolute inset-x-2 bottom-2 grid min-h-9 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded-[18px] bg-black/45 px-1 py-1 text-white @min-[28rem]/player:inset-x-3 @min-[28rem]/player:bottom-3"
	>
		<div class="flex items-center gap-0.5">
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				class={button}
				aria-label={playingLabel}
				title={playingLabel}
				disabled={!duration}
				onclick={togglePlayback}
			>
				{#if ended}<RotateCcw aria-hidden="true" />{:else if paused}<Play
						aria-hidden="true"
					/>{:else}<Pause aria-hidden="true" />{/if}
			</Button>
			<div class="group/volume relative">
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					class={button}
					aria-label={muteLabel}
					title={muteLabel}
					onclick={toggleMute}
				>
					{#if muted || volume === 0}<VolumeX aria-hidden="true" />{:else}<Volume2
							aria-hidden="true"
						/>{/if}
				</Button>
				<div
					class="invisible absolute bottom-full left-0 z-10 w-22 rounded-[14px] bg-black/85 px-2 group-hover/volume:visible group-focus-within/volume:visible"
				>
					<Slider
						type="single"
						min={0}
						max={100}
						step={5}
						value={muted ? 0 : volume}
						onValueChange={setVolume}
						aria-label={text("音量", "Volume")}
						class={lineSlider}
					/>
				</div>
			</div>
		</div>
		<div
			class="col-span-3 col-start-1 row-start-1 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-1 text-xs tabular-nums @min-[28rem]/player:col-span-1 @min-[28rem]/player:col-start-2 @min-[28rem]/player:px-0"
		>
			<time role="timer" aria-label={text("已播放", "Elapsed")}>{formatTime(currentTime)}</time>
			<Slider
				type="single"
				min={0}
				max={duration || 1}
				step={0.01}
				largeStep={5}
				value={currentTime}
				onValueChange={setTime}
				aria-label={text("播放进度", "Seek slider")}
				aria-valuetext={formatTime(currentTime)}
				disabled={!duration}
				class={lineSlider}
			/>
			<time aria-label={text("总时长", "Duration")}>{formatTime(duration)}</time>
		</div>
		<div
			class="col-start-2 col-end-4 row-start-2 flex justify-end gap-0.5 @min-[28rem]/player:col-start-3 @min-[28rem]/player:row-start-1"
		>
			<select
				aria-label={text("播放速度", "Change playback rate")}
				value={rate}
				onchange={(event) => setRate(Number(event.currentTarget.value))}
				class="h-7 max-w-12 appearance-none rounded-full bg-transparent px-1 text-center text-xs text-white outline-none hover:bg-white/10 focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-white [&>option]:bg-popover [&>option]:text-popover-foreground"
			>
				{#each rates as speed (speed)}<option value={speed}>{speed}×</option>{/each}
			</select>
			<a
				href={src}
				download={name}
				aria-label={text("下载", "Download")}
				title={text("下载", "Download")}
				class={button +
					" inline-grid shrink-0 place-items-center outline-none focus-visible:outline-1"}
				><ArrowDownToLine class="size-4" aria-hidden="true" /></a
			>
			{#if pip}<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					class={button}
					aria-label={text("画中画", "Picture-in-picture")}
					title={text("画中画", "Picture-in-picture")}
					onclick={togglePictureInPicture}><PictureInPicture2 aria-hidden="true" /></Button
				>{/if}
			{#if onFullScreen}<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					class={button}
					aria-label={text("全屏", "Full window")}
					title={text("全屏", "Full window")}
					onclick={onFullScreen}><Maximize2 aria-hidden="true" /></Button
				>{/if}
		</div>
	</div>
	{#if feedback}<p
			role="status"
			class="absolute top-2 left-2 rounded-full bg-black/80 px-2 py-1 text-xs text-white"
		>
			{feedback}
		</p>{/if}
</section>
