<script lang="ts">
	import RichTextDisplay from '$lib/components/editor/rich-text-display.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { type RoomSchema } from '$lib/schemas/room';
	import { Home, MapPin, Phone, Star, Users } from 'lucide-svelte';
	import AmenitiesGrid from '../../_components/amenities-grid.svelte';
	import FoodMenuSection from '../../_components/food-menu-section.svelte';
	import PropertyHero from '../../_components/property-hero.svelte';
	import RoomCardWithBooking from '../../_components/room-card-with-booking.svelte';
	import VisitBookingDialog from '../../_components/visit-booking-dialog.svelte';

	let { data } = $props();

	// Property is guaranteed here
	const property = $derived(data.property);

	// Scroll to section
	function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<svelte:head>
	<title>{property.name} - Property Details</title>
	<meta name="description" content={property.description || `View details for ${property.name}`} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Hero Section -->
	<PropertyHero {property} />

	<!-- Navigation Tabs (Sticky) -->
	<div
		class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
	>
		<div class="container mx-auto">
			<nav class="flex gap-6 overflow-x-auto py-3">
				<button
					onclick={() => scrollToSection('overview')}
					class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
				>
					Overview
				</button>
				{#if property.amenities.length > 0}
					<button
						onclick={() => scrollToSection('amenities')}
						class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
					>
						Amenities
					</button>
				{/if}
				{#if property.isFoodServiceAvailable}
					<button
						onclick={() => scrollToSection('food')}
						class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
					>
						Food Menu
					</button>
				{/if}
				<button
					onclick={() => scrollToSection('rooms')}
					class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
				>
					Available Rooms
				</button>
				<button
					onclick={() => scrollToSection('location')}
					class="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary"
				>
					Location
				</button>
			</nav>
		</div>
	</div>

	<main class="flex-1">
		<div class="container mx-auto px-4 py-8">
			<div class="grid gap-8 lg:grid-cols-[1fr_380px]">
				<!-- Main Content -->
				<div class="space-y-8">
					<!-- Overview Section -->
					<section id="overview" class="scroll-mt-20">
						<div class="space-y-6">
							<!-- Property Title & Quick Info -->
							<div>
								<div class="flex flex-wrap items-center gap-3 mb-3">
									<Badge variant="secondary" class="text-sm">
										<Home class="mr-1 h-3 w-3" />
										{property.status === 'published' ? 'Available' : 'Draft'}
									</Badge>
									{#if property.rooms.length > 0}
										<Badge variant="outline" class="text-sm">
											<Users class="mr-1 h-3 w-3" />
											{property.rooms.length} Rooms Available
										</Badge>
									{/if}
								</div>
								<h1 class="text-3xl font-bold tracking-tight mb-2">{property.name}</h1>
								{#if property.address}
									<div class="flex items-start gap-2 text-muted-foreground">
										<MapPin class="h-4 w-4 mt-1 shrink-0" />
										<p class="text-sm">
											{property.address}, {property.city}, {property.state} - {property.zip}
										</p>
									</div>
								{/if}
							</div>

							<Separator />

							<!-- About -->
							<div>
								<h2 class="text-xl font-semibold mb-3">About This Property</h2>
								<RichTextDisplay
									content={property.description}
									fallback="Experience comfortable living with modern amenities."
								/>
							</div>
						</div>
					</section>

					<!-- Amenities Section -->
					{#if property.amenities.length > 0}
						<section id="amenities" class="scroll-mt-20">
							<div class="rounded-lg border bg-card p-6">
								<h2 class="text-xl font-semibold mb-4">Amenities & Features</h2>
								<AmenitiesGrid amenities={property.amenities.map((a) => a.amenity.name)} />
							</div>
						</section>
					{/if}

					<!-- Food Menu Section -->
					{#if property.isFoodServiceAvailable}
						<section id="food" class="scroll-mt-20">
							<div class="rounded-lg border bg-card p-6">
								<FoodMenuSection menuItems={property.foodMenuItems} />
							</div>
						</section>
					{/if}

					<!-- Available Rooms Section -->
					<section id="rooms" class="scroll-mt-20">
						<div class="space-y-6">
							<div class="flex items-center justify-between">
								<div>
									<h2 class="text-2xl font-bold">Available Rooms</h2>
									<p class="text-sm text-muted-foreground mt-1">
										Choose from our comfortable accommodations
									</p>
								</div>
							</div>

							{#if property.rooms.length === 0}
								<div
									class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center"
								>
									<Home class="h-12 w-12 text-muted-foreground mb-4" />
									<h3 class="text-lg font-medium mb-2">No Rooms Available</h3>
									<p class="text-sm text-muted-foreground mb-4">
										All rooms are currently occupied. Please check back later or schedule a visit.
									</p>
									<VisitBookingDialog propertyId={property.id} propertyName={property.name} />
								</div>
							{:else}
								<div class="grid gap-6 md:grid-cols-2">
									{#each property.rooms as room}
										<RoomCardWithBooking
											room={room as RoomSchema & { id: string }}
											propertyId={property.id}
										/>
									{/each}
								</div>
							{/if}
						</div>
					</section>

					<!-- Location Section -->
					<section id="location" class="scroll-mt-20">
						<div class="rounded-lg border bg-card p-6">
							<h2 class="text-xl font-semibold mb-4">Location & Contact</h2>
							<div class="space-y-4">
								{#if property.address}
									<div class="flex gap-3">
										<MapPin class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
										<div>
											<p class="font-medium">Address</p>
											<p class="text-sm text-muted-foreground">
												{property.address}<br />
												{property.city}, {property.state} - {property.zip}
											</p>
										</div>
									</div>
								{/if}

								{#if property.contactPhone}
									<div class="flex gap-3">
										<Phone class="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
										<div>
											<p class="font-medium">Contact Number</p>
											<a
												href="tel:{property.contactPhone}"
												class="text-sm text-primary hover:underline"
											>
												{property.contactPhone}
											</a>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</section>
				</div>

				<!-- Sidebar -->
				<aside class="space-y-4 lg:sticky lg:top-24 lg:self-start max-w-full">
					<!-- CTA Card -->
					<div class="rounded-lg border bg-card p-6 shadow-sm">
						<h3 class="font-semibold mb-2">Interested in This Property?</h3>
						<p class="text-sm text-muted-foreground mb-6">
							Schedule a visit to see the property or contact us for more information.
						</p>
						<div class="space-y-3">
							<VisitBookingDialog propertyId={property.id} propertyName={property.name} />
							{#if property.contactPhone}
								<Button variant="outline" class="w-full" href="tel:{property.contactPhone}">
									<Phone class="mr-2 h-4 w-4" />
									Call Now
								</Button>
							{/if}
						</div>
					</div>

					<!-- Booking Information -->
					{#if property.bookingCharge && property.bookingCharge > 0}
						<div class="rounded-lg border bg-muted/30 p-6">
							<h4 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
								Booking Information
							</h4>
							<div class="space-y-3">
								<div class="flex justify-between items-center">
									<span class="text-sm text-muted-foreground">Booking Charge</span>
									<span class="text-lg font-bold">
										₹{new Intl.NumberFormat('en-IN').format(property.bookingCharge)}
									</span>
								</div>
								<p class="text-xs text-muted-foreground pt-2 border-t">
									One-time non-refundable booking fee applied when you reserve a room.
								</p>
							</div>
						</div>
					{/if}

					<!-- Property Highlights -->
					<div class="rounded-lg border bg-card p-6">
						<h4 class="font-semibold mb-4">Property Highlights</h4>
						<div class="space-y-3">
							<div class="flex items-start gap-3">
								<div class="rounded-full bg-primary/10 p-2">
									<Home class="h-4 w-4 text-primary" />
								</div>
								<div>
									<p class="text-sm font-medium">Available Rooms</p>
									<p class="text-xs text-muted-foreground">
										{property.rooms.length} room{property.rooms.length !== 1 ? 's' : ''} to choose from
									</p>
								</div>
							</div>

							{#if property.isFoodServiceAvailable}
								<div class="flex items-start gap-3">
									<div class="rounded-full bg-primary/10 p-2">
										<Star class="h-4 w-4 text-primary" />
									</div>
									<div>
										<p class="text-sm font-medium">Food Service</p>
										<p class="text-xs text-muted-foreground">Delicious meals available</p>
									</div>
								</div>
							{/if}

							{#if property.amenities.length > 0}
								<div class="flex items-start gap-3">
									<div class="rounded-full bg-primary/10 p-2">
										<Star class="h-4 w-4 text-primary" />
									</div>
									<div>
										<p class="text-sm font-medium">Amenities</p>
										<p class="text-xs text-muted-foreground">
											{property.amenities.length} modern amenities
										</p>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</aside>
			</div>
		</div>
	</main>

	<!-- Mobile Bottom Bar -->
	<div class="fixed bottom-0 left-0 right-0 lg:hidden border-t bg-background p-4 shadow-lg z-50">
		<div class="container mx-auto flex gap-3">
			<VisitBookingDialog propertyId={property.id} propertyName={property.name} />
			{#if property.contactPhone}
				<Button size="lg" variant="outline" class="flex-1" href="tel:{property.contactPhone}">
					<Phone class="mr-2 h-4 w-4" />
					Call
				</Button>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Add some bottom padding for mobile to avoid content being hidden by bottom bar */
	@media (max-width: 1024px) {
		main {
			padding-bottom: 5rem;
		}
	}
</style>
