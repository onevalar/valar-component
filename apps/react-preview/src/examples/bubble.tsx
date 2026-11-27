import { useState } from "react";
import { Button } from "@valar/react-ui/button";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@valar/react-ui/bubble";

export default function BubbleExample() {
	const [liked, setLiked] = useState(false);
	return (
		<BubbleGroup className="min-w-0 items-end pb-7">
			<Bubble variant="muted" align="end">
				<BubbleContent>Can we review the revised release notes?</BubbleContent>
			</Bubble>
			<Bubble variant="tinted" align="end">
				<BubbleContent>The new checklist is ready.</BubbleContent>
				<BubbleReactions side="bottom" align="end"><Button size="xs" variant="outline" aria-pressed={liked} onClick={() => setLiked(!liked)}>Like {liked ? 1 : 0}</Button></BubbleReactions>
			</Bubble>
		</BubbleGroup>
	);
}
