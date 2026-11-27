import { useEventListener } from "@vueuse/core";
import { shallowRef, watch, type Ref } from "vue";

export function useFormReset<T extends HTMLTextAreaElement | HTMLSelectElement>(
	element: Readonly<Ref<T | null | undefined>>,
	reset: (control: T) => void
) {
	const document = shallowRef<Document>();
	watch(element, (control) => { document.value = control?.ownerDocument; });
	useEventListener(document, "reset", (event) => {
		const control = element.value;
		if (!control || control.form !== event.target) return;
		queueMicrotask(() => {
			if (!event.defaultPrevented && element.value === control) reset(control);
		});
	}, { capture: true });
}
