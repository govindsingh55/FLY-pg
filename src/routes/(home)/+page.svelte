<script lang="ts">
	import LandingHero from './_components/landing/landing-hero.svelte';
	import LandingPropertyCard from './_components/landing/landing-property-card.svelte';
	import LandingFeatures from './_components/landing/landing-features.svelte';
	import { Button } from '$lib/components/ui/button';
	import { MessageCircle } from '@lucide/svelte';
	import { getMediaType } from '$lib/utils'; // Ensure we have this for logic if needed

	let { data } = $props();

	// Determine video for hero from first featured property if available
	const heroVideo = $derived.by(() => {
		// Try to find a property with a video
		const props = data.properties || (data.property ? [data.property] : []);
		for (const p of props) {
			const video = p.media?.find((m) => getMediaType(m.url) === 'video');
			if (video) return video.url;
		}
		// Fallback
		return undefined;
	});

	// Use properties from either single or multiple mode
	const allProperties = $derived(data.mode === 'single' ? [data.property] : data.properties);

	let location = $state('');
	const whatsappUrl = $derived(
		`https://wa.me/917678688964?text=${encodeURIComponent(
			location
				? `Hi, I'm interested in properties in ${location}.`
				: "Hi, I'm interested in your properties."
		)}`
	);
</script>

<div class="flex min-h-screen flex-col bg-background font-sans">
	<main class="flex-1">
		<!-- Hero Section -->
		<!-- Pass videoUrl if we found one from properties, else default will fallback in component -->
		<LandingHero videoUrl={heroVideo} />

		<!-- Property Grid Section -->
		<section id="properties" class="bg-background py-20">
			<div class="container mx-auto px-4">
				<div class="mb-12 flex items-center justify-between">
					<div>
						<h2 class="text-3xl font-extrabold sm:text-4xl text-foreground">
							Our <span class="text-primary">Properties</span>
						</h2>
						<p class="mt-2 text-muted-foreground">Thoughtfully designed for urban indians</p>
					</div>
					<Button variant="outline" class="hidden sm:flex" href="/properties">View All</Button>
				</div>

				{#if allProperties.length === 0}
					<div class="py-12 text-center">
						<p class="text-lg font-medium text-muted-foreground">No properties found.</p>
					</div>
				{:else}
					<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{#each allProperties as property}
							<LandingPropertyCard {property} />
						{/each}
					</div>
				{/if}
			</div>
		</section>

		<!-- Features Section -->
		<LandingFeatures />

		<!-- Connect Section -->
		<section class="bg-background py-20 pt-0">
			<div class="container mx-auto px-4 text-center">
				<h2 class="mb-6 text-3xl font-bold text-foreground">
					Connect on <span class="text-primary">WhatsApp</span>
				</h2>
				<p class="mb-8 text-muted-foreground max-w-lg mx-auto">
					Speak to a relationship manager, see photos of homes in your preferred location & get
					guided move-in directions.
				</p>

				<div class="inline-flex items-center rounded-2xl bg-card border p-2 pl-4">
					<input
						type="text"
						placeholder="Sector 122, Noida"
						bind:value={location}
						class="w-64 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
					/>
					<Button
						href={whatsappUrl}
						target="_blank"
						class="rounded-xl bg-green-500 font-bold text-white hover:bg-green-600"
					>
						<MessageCircle class="mr-2 h-4 w-4" />
						Start Chat
					</Button>
				</div>
			</div>
		</section>
	</main>
</div>
