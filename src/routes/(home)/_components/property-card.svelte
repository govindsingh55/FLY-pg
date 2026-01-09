<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { MapPin, Utensils } from '@lucide/svelte';

	interface Property {
		id: string;
		name: string;
		address: string;
		city: string | null;
		media: { url: string; type: string }[] | null;
		isFoodServiceAvailable: boolean | null;
		rooms: any[]; // Using any[] for now as we just need length/min price
	}

	let { property } = $props<{ property: Property }>();

	const images = $derived(
		Array.isArray(property.media) ? property.media.map((m: { url: string }) => m.url) : []
	);

	const imageId = $derived(
		Math.abs(
			property.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 200
		) + 1
	);
	const coverImage = $derived(
		images.length > 0 ? images[0] : `https://picsum.photos/id/${imageId}/600/400`
	);

	// Calculate starting price
	const startingPrice = $derived(
		property.rooms?.length > 0 ? Math.min(...property.rooms.map((r: any) => r.priceMonthly)) : null
	);
</script>

<Card
	class="group flex h-full flex-col overflow-hidden border-transparent bg-card transition-all hover:border-border hover:shadow-lg"
>
	<div class="relative aspect-video w-full overflow-hidden bg-muted">
		<img
			src={coverImage}
			alt={property.name}
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
		/>
		<div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-60"></div>

		{#if property.isFoodServiceAvailable}
			<div class="absolute right-3 top-3">
				<Badge
					variant="secondary"
					class="bg-white/90 font-medium text-black backdrop-blur-md hover:bg-white"
				>
					<Utensils class="mr-1 h-3 w-3" />
					Food
				</Badge>
			</div>
		{/if}

		<div class="absolute bottom-3 left-3 right-3 text-white">
			<h3 class="line-clamp-1 text-lg font-bold leading-tight tracking-tight">
				{property.name}
			</h3>
			<div class="mt-1 flex items-center text-sm font-medium text-white/90">
				<MapPin class="mr-1 h-3.5 w-3.5" />
				<span class="truncate">{property.city}</span>
			</div>
		</div>
	</div>

	<CardContent class="flex-1 p-5">
		<div class="space-y-4">
			<div class="flex items-start justify-between">
				<div class="space-y-1">
					<p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Starting from
					</p>
					{#if startingPrice}
						<div class="flex items-baseline gap-1">
							<span class="text-2xl font-bold text-primary"
								>₹{startingPrice.toLocaleString('en-IN')}</span
							>
							<span class="text-sm font-medium text-muted-foreground">/mo</span>
						</div>
					{:else}
						<span class="text-lg font-semibold text-muted-foreground">Contact for Price</span>
					{/if}
				</div>
			</div>

			<div class="text-sm text-muted-foreground line-clamp-2">
				{property.address}
			</div>
		</div>
	</CardContent>

	<CardFooter class="p-5 pt-0">
		<Button class="w-full font-semibold" href={`/properties/${property.id}`}>View Details</Button>
	</CardFooter>
</Card>
