/** Only the local comparison shell may receive this no-data readiness notice. */
export function reportReady(framework: "svelte" | "react" | "vue") {
	if (window.parent === window) return;
	const parentOrigin = new URL(window.location.href);
	parentOrigin.port = "5212";
	window.parent.postMessage({ protocol: "valar-frameworks-v1", framework, status: "ready" }, parentOrigin.origin);
}
