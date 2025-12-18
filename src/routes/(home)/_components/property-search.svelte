<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, SlidersHorizontal } from 'lucide-svelte';

	let { searchTerm = $bindable('') } = $props<{ searchTerm: string }>();
</script>

<div class="flex w-full items-center space-x-2">
	<div class="relative flex-1">
		<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
		<Input
			type="search"
			placeholder="Search by name, location..."
			class="pl-8"
			bind:value={searchTerm}
		/>
	</div>
	<Button variant="outline" size="icon">
		<SlidersHorizontal class="h-4 w-4" />
		<span class="sr-only">Filters</span>
	</Button>
</div>
