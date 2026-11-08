const params = new URLSearchParams(location.search);
export const scenario = params.get("scenario") ?? "normal";
export const seed = params.has("seed")
	? Number(params.get("seed"))
	: scenario === "zero"
		? 0
		: scenario === "overflow"
			? 125
			: 65;
export const ruler = {
	min: Number(params.get("min") ?? 0),
	max: Number(params.get("max") ?? 100),
	step: Number(params.get("step") ?? 1),
	spacing: Number(params.get("spacing") ?? 2),
	majorEvery: Number(params.get("majorEvery") ?? 10),
};
export const missing = scenario === "missing";
export const disabled = scenario === "disabled";
export const failure = scenario === "failure";
export const fullWidth = params.get("compact") !== "1";
export const parts = [
	{ key: "a", value: 65, color: "#4f6bea" },
	{ key: "b", value: 35, color: "#a169d6" },
];
export const values = missing ? [0, null, 3, null, 7] : [0, 2, 3, null, 7];
export const options = [
	{ value: "tokens", label: "Tokens" },
	{ value: "cost", label: "Cost" },
];
export const copy = {
	confirmMode: params.get("confirmMode") === "hold" ? ("hold" as const) : ("press" as const),
	holdDuration: 500,
	label: "Remove",
	prompt: "Remove?",
	confirmLabel: "Yes",
	cancelLabel: "Cancel",
	pendingLabel: "Removing…",
	doneLabel: "Removed",
	errorLabel: "Failed",
	retryLabel: "Retry",
	undoLabel: "Undo",
	undoingLabel: "Restoring…",
};
const manual = params.get("manual") === "1";
function pending(operation: "confirm" | "undo") {
	log("operation", operation);
	return new Promise<void>((resolve, reject) =>
		window.addEventListener(
			`${operation}-finish`,
			(event) => {
				const ok = (event as CustomEvent<{ ok: boolean }>).detail.ok;
				if (ok) resolve();
				else reject(new Error("Fixture failure"));
			},
			{ once: true }
		)
	);
}
export async function confirm() {
	if (manual) return pending("confirm");
	await new Promise((resolve) => setTimeout(resolve, 400));
	if (failure) throw new Error("Fixture failure");
}
export function undo() {
	if (manual) return pending("undo");
}
export const log = (name: string, value: unknown) => {
	const output = document.querySelector("#events");
	if (output) output.textContent += `${name}: ${JSON.stringify(value)}\n`;
};
document.documentElement.dir = params.get("direction") === "rtl" ? "rtl" : "ltr";
document.documentElement.classList.toggle("dark", params.get("theme") === "dark");
document.documentElement.dataset.theme = params.get("theme") ?? "light";
