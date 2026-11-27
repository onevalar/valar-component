import { useState } from "react";
import { Button } from "@valar/react-ui/button";
import { Marker, MarkerContent, MarkerIcon } from "@valar/react-ui/marker";

export default function MarkerExample() {
	const [ready, setReady] = useState(false);
	return (
		<div className="grid gap-3">
			<Marker variant="separator"><MarkerContent>November 27</MarkerContent></Marker>
			<Marker variant="border" role="status"><MarkerIcon aria-hidden="true">{ready ? "✓" : "◌"}</MarkerIcon><MarkerContent>{ready ? "Files checked" : "Checking files"}</MarkerContent></Marker>
			<Button className="w-fit" variant="outline" size="sm" onClick={() => setReady(!ready)}>Toggle result</Button>
		</div>
	);
}
