<script lang="ts">
	import * as Item from "$lib/registry/ui/item/index.js";
	import { Spinner } from "$lib/registry/ui/spinner/index.js";
</script>

<div class="flex w-full max-w-xs flex-col gap-3">
	<Item.Root variant="outline" size="sm">
		<Item.Media>
			<Spinner />
		</Item.Media>
		<Item.Content>
			<Item.Title class="line-clamp-1">Processing payment...</Item.Title>
		</Item.Content>
		<Item.Content class="flex-none justify-end">
			<span class="text-[13px] font-medium tabular-nums">$100.00</span>
		</Item.Content>
	</Item.Root>
</div>
