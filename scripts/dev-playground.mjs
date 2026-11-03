import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import concurrently from "concurrently";

// Existing dist files do not prove that either watcher's initial build is done.
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "valar-playground-"));
const readyFile = path.join(temporary, "ready");
const { commands, result } = concurrently(
	[
		{ name: "primitives", command: "pnpm --filter @valar/svelte-primitives dev" },
		{ name: "ui", command: "pnpm --filter @valar/svelte-ui dev" },
		{
			name: "app",
			command: `wait-on ${JSON.stringify(readyFile)} && pnpm --filter @valar/svelte-playground dev --host 0.0.0.0 --port 5188 --strictPort`,
		},
	],
	{ killOthersOn: ["success", "failure"] }
);
const ready = [false, false];
const output = ["", ""];
for (const [index, message] of ["Watching src/lib for changes", "outputs changed"].entries()) {
	commands[index].stdout.subscribe((chunk) => {
		if (ready[index]) return;
		output[index] += chunk;
		if (!output[index].includes(message)) return;
		ready[index] = true;
		if (ready.every(Boolean)) fs.writeFileSync(readyFile, "ready\n");
	});
}
try {
	await result;
} catch {
	process.exitCode = 1;
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}
