<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { MapPin, Zap } from '@lucide/svelte';
	import { getMediaType } from '$lib/utils';

	interface Property {
		id: string;
		name: string;
		address: string;
		city: string | null;
		media: { url: string; type: string }[] | null;
		isFoodServiceAvailable: boolean | null;
		rooms: any[];
	}

	let { property } = $props<{ property: Property }>();

	const mediaItems = $derived(property.media ?? []);
	const coverMedia = $derived(mediaItems[0]); // Order 0 is featured

	// Price
	const startingPrice = $derived(
		property.rooms?.length > 0 ? Math.min(...property.rooms.map((r: any) => r.priceMonthly)) : null
	);
</script>

<Card
	class="group relative flex flex-col overflow-hidden rounded-2xl border shadow-lg transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl"
>
	<!-- Media Section -->
	<div class="relative aspect-4/3 w-full overflow-hidden bg-muted">
		{#if coverMedia}
			{#if getMediaType(coverMedia.url) === 'video' || coverMedia.type === 'video'}
				<video
					src={coverMedia.url}
					class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					muted
					loop
					playsinline
					autoplay
				></video>
			{:else}
				<img
					src={coverMedia.url}
					alt={property.name}
					class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
				/>
			{/if}
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
				No Image
			</div>
		{/if}

		<!-- Overlay Badge -->
		{#if property.isFoodServiceAvailable}
			<div class="absolute right-3 top-3">
				<Badge
					variant="secondary"
					class="bg-background/60 text-primary backdrop-blur-md border border-primary/20"
				>
					<Zap class="mr-1 h-3 w-3" />
					Fast Filling
				</Badge>
			</div>
		{/if}

		<!-- Gradient Overlay - Stronger for light mode -->
		<div
			class="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent"
		></div>

		<!-- Overlay Info (Bottom) -->
		<div class="absolute bottom-0 left-0 right-0 p-4 pt-12">
			<h3
				class="line-clamp-1 text-xl font-bold text-foreground group-hover:text-primary transition-colors"
			>
				{property.name}
			</h3>
			<div class="mt-1 flex items-center text-sm text-muted-foreground">
				<MapPin class="mr-1 h-3.5 w-3.5" />
				<span class="truncate">{property.address}, {property.city}</span>
			</div>
		</div>
	</div>

	<!-- Content / Action Section -->
	<div class="flex items-center justify-between p-4 border-t bg-card">
		<div class="flex flex-col">
			<span class="text-xs uppercase tracking-wider text-muted-foreground">Starting from</span>
			{#if startingPrice}
				<div class="flex items-baseline gap-1">
					<span class="text-lg font-bold text-primary"
						>₹{startingPrice.toLocaleString('en-IN')}</span
					>
					<span class="text-xs text-muted-foreground">/mo</span>
				</div>
			{:else}
				<span class="text-sm font-medium text-muted-foreground">Contact Us</span>
			{/if}
		</div>

		<Button size="sm" class="rounded-full font-bold" href={`/properties/${property.id}`}>
			Book Now
		</Button>
	</div>
</Card>
