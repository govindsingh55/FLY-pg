<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Check } from '@lucide/svelte';

	let { amenities = [] } = $props<{ amenities?: string[] }>();
</script>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
	{#each amenities as amenity}
		<div class="flex items-center gap-2 rounded-lg border p-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
				<Check class="h-4 w-4 text-primary" />
			</div>
			<span class="text-sm font-medium">{amenity}</span>
		</div>
	{/each}
</div>
