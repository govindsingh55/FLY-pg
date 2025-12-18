<script lang="ts">
	import PropertyHero from '../../_components/property-hero.svelte';
	import RoomCard from '../../_components/room-card.svelte';
	import AmenitiesGrid from '../../_components/amenities-grid.svelte';
	import FoodMenuSection from '../../_components/food-menu-section.svelte';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	// Property is guaranteed here
	const property = $derived(data.property);
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-1">
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
							<AmenitiesGrid amenities={property.amenities as string[]} />
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
	</main>
</div>
