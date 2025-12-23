<script lang="ts">
	import PropertyHero from './_components/property-hero.svelte';
	import PropertyCard from './_components/property-card.svelte';
	import RoomCard from './_components/room-card.svelte';
	import AmenitiesGrid from './_components/amenities-grid.svelte';
	import FoodMenuSection from './_components/food-menu-section.svelte';
	import PropertySearch from './_components/property-search.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	let searchTerm = $state('');

	// Derived filtered properties for multiple view
	const filteredProperties = $derived(
		data.mode === 'multiple'
			? data.properties.filter(
					(p: any) =>
						p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
						p.city?.toLowerCase().includes(searchTerm.toLowerCase())
				)
			: []
	);
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-1">
		{#if data.mode === 'single'}
			<!-- Single Property Showcase -->
			{@const property = data.property}

			<PropertyHero {property} />

			<div class="container mx-auto py-12">
				<div class="grid gap-12 lg:grid-cols-[1fr_300px]">
					<div class="space-y-12">
						<!-- About Section -->
						<section id="about" class="space-y-4">
							<h2 class="text-2xl font-bold tracking-tight">About this property</h2>
							<p class="leading-relaxed text-muted-foreground">
								{property.description || 'Experience comfortable living with modern amenities.'}
							</p>

							<div class="pt-4">
								<h3 class="mb-4 text-lg font-semibold">Amenities</h3>
								<AmenitiesGrid
									amenities={property.amenities
										.map((a: any) => a.amenity?.name)
										.filter((n: any) => n)}
								/>
							</div>
						</section>

						<!-- Food Menu Section -->
						{#if property.isFoodServiceAvailable}
							<section id="food" class="scroll-mt-20 border-t pt-12">
								<FoodMenuSection menuItems={property.foodMenuItems} />
							</section>
						{/if}

						<!-- Rooms Section -->
						<section id="rooms" class="scroll-mt-20 border-t pt-12">
							<h2 class="mb-6 text-2xl font-bold tracking-tight">Available Rooms</h2>
							{#if property.rooms.length === 0}
								<p class="text-muted-foreground">No rooms currently listed.</p>
							{:else}
								<div class="grid gap-6 sm:grid-cols-2">
									{#each property.rooms as room}
										<RoomCard {room} />
									{/each}
								</div>
							{/if}
						</section>
					</div>

					<!-- Sidebar / Contact (Desktop) -->
					<div class="hidden lg:block">
						<div class="sticky top-24 rounded-xl border bg-card p-6 shadow-xs">
							<h3 class="mb-4 text-lg font-semibold">Interested?</h3>
							<p class="mb-6 text-sm text-muted-foreground">
								Schedule a visit or contact us to know more about this property.
							</p>
							<div class="space-y-3">
								<Button class="w-full" href="/login">Schedule Visit</Button>
								<Button variant="outline" class="w-full">Contact Support</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<!-- Multiple Properties Listing -->
			<div class="container mx-auto py-12">
				<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 class="text-3xl font-bold tracking-tight">Our Properties</h1>
						<p class="text-muted-foreground">
							Find your perfect stay from our curated list of PGs.
						</p>
					</div>
				</div>

				<div class="mb-8 max-w-md">
					<PropertySearch bind:searchTerm />
				</div>

				{#if filteredProperties.length === 0}
					<div class="py-12 text-center">
						<p class="text-lg font-medium">No properties found.</p>
						<p class="text-muted-foreground">Try adjusting your search terms.</p>
					</div>
				{:else}
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each filteredProperties as property}
							<PropertyCard {property} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</main>
</div>
