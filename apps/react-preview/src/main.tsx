import * as React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist/index.css";
import "./style.css";
import { App } from "./App.tsx";

const params = new URLSearchParams(window.location.search);
document.documentElement.classList.toggle("dark", params.get("theme") === "dark");

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App disabled={params.get("disabled") === "1"} />
	</React.StrictMode>
);
