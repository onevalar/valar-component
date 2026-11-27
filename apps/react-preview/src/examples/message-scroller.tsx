import { useState } from "react";
import { Button } from "@valar/react-ui/button";
import { MessageScroller } from "@valar/react-ui/message-scroller";

const history = Array.from({ length: 7 }, (_, index) => `Earlier message ${index + 1}`);

export default function MessageScrollerExample() {
	const [chunks, setChunks] = useState(0);
	return (
		<div className="grid min-w-0 gap-2">
			<Button className="w-fit" variant="outline" onClick={() => setChunks((count) => count + 1)}>Append reply</Button>
			<MessageScroller.Provider autoScroll>
				<MessageScroller.Root className="h-56 rounded-lg border">
					<MessageScroller.Viewport tabIndex={0} role="region" aria-label="Transcript">
						<MessageScroller.Content className="p-3">
							{history.map((text) => <MessageScroller.Item key={text} messageId={text} className="rounded-md bg-muted p-2">{text}</MessageScroller.Item>)}
							{chunks > 0 && <MessageScroller.Item messageId="question" scrollAnchor className="rounded-md bg-muted p-2">What changed this week?</MessageScroller.Item>}
							{chunks > 0 && <MessageScroller.Item messageId="reply">{Array.from({ length: chunks }, (_, index) => <p key={index} className="mb-2">Reply part {index + 1}: a validated change in the release notes.</p>)}</MessageScroller.Item>}
						</MessageScroller.Content>
					</MessageScroller.Viewport>
					<MessageScroller.Button label="Jump to latest" />
				</MessageScroller.Root>
			</MessageScroller.Provider>
		</div>
	);
}
