<script lang="ts">
	import { Typography } from "$lib/registry/ui/typography/index.js";
</script>

<Typography aria-labelledby="release-notes-heading" class="w-full max-w-xl">
	<h1 id="release-notes-heading">Release notes</h1>
	<p>
		The offline queue keeps unsent edits on this device. When the connection
		comes back, it retries the changes in order.
	</p>
	<h2 id="verify-the-update">Verify the update</h2>
	<p>
		Use <code>pnpm test</code> to run the checks, then
		<a href="#release-review">review the rollout</a>.
	</p>
	<blockquote>
		<p>Leave the tab open until queued edits finish syncing.</p>
	</blockquote>
	<ul>
		<li>Disconnect briefly and edit the description.</li>
		<li>
			Reconnect and check the queued changes.
			<ol>
				<li>Confirm the edit appears after reconnecting.</li>
				<li>Open the issue from a second tab.</li>
			</ol>
		</li>
	</ul>
	<h3>Confirm keyboard access</h3>
	<p>Open the issue and use Tab to move to the next link.</p>
	<h4>Check long content</h4>
	<p>
		Ensure long commands wrap, including <code
			>sync:resolve-workspace-offline-queue-conflicts</code
		>.
	</p>
	<hr />
	<h2 id="release-review">Review the rollout</h2>
	<p>Once the checks pass, confirm the update in the release issue.</p>
</Typography>
