import config from "./playwright.config.js";

// Exercise the existing documentation site without starting any comparison/playground server.
export default {
	...config,
	testMatch: "framework-usage.spec.ts",
	use: { ...config.use, baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:5186" },
	webServer: [],
};
