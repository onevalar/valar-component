/**
 * Makes scrollbars that ask for it hide while nothing is scrolling and return when the reader
 * scrolls. Call it once in the root layout. Which scrollbars hide is decided in the markup:
 * `data-scrollbar="autohide"` (or the `scrollbar-autohide` class) on the element, or on <html>
 * for the page. Nothing hides unless asked, and without this hook nothing hides at all.
 *
 * It only sets two attributes; the colours and the fade live in the library's stylesheet.
 */
export function useScrollbarAutohide(delay = 1000) {
	$effect(() => {
		const root = document.documentElement;
		const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();
		root.setAttribute("data-scrollbar-ready", "");

		// `scroll` does not bubble, but a capturing listener on the document hears every region.
		function onScroll(event: Event) {
			const target = event.target === document ? root : event.target;
			if (!(target instanceof Element)) return;
			target.setAttribute("data-scrolling", "");
			clearTimeout(timers.get(target));
			timers.set(
				target,
				setTimeout(() => target.removeAttribute("data-scrolling"), delay)
			);
		}

		document.addEventListener("scroll", onScroll, { capture: true, passive: true });
		return () => {
			document.removeEventListener("scroll", onScroll, { capture: true });
			root.removeAttribute("data-scrollbar-ready");
		};
	});
}
