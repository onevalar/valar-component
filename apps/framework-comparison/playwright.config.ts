import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: false,
	workers: 1,
	timeout: 30000,
	outputDir: "../../.amp/in/framework-test-results",
	reporter: [
		["list"],
		["json", { outputFile: "../../.amp/in/artifacts/first-batch-browser.json" }],
	],
	use: {
		browserName: "chromium",
		launchOptions: { executablePath: process.env.VALAR_TEST_BROWSER },
		locale: "zh-CN",
		timezoneId: "Asia/Shanghai",
		reducedMotion: "reduce",
		trace: "retain-on-failure",
	},
});
