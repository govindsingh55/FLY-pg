<script lang="ts">
	import LandingPropertyCard from '../_components/landing/landing-property-card.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Search } from '@lucide/svelte';
	import { page } from '$app/stores';

	let { data } = $props();

	// Initialize search from URL query param
	let searchTerm = $state($page.url.searchParams.get('search') || '');

	// Filter properties based on search
	const filteredProperties = $derived(
		data.properties.filter(
			(p: any) =>
				p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
				p.city?.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Properties - FLY PG</title>
	<meta name="description" content="Browse all available properties" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Header Section -->
	<section class="border-b bg-card py-12">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h1 class="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
					Our <span class="text-primary">Properties</span>
				</h1>
				<p class="mb-8 text-lg text-muted-foreground">
					Discover premium living spaces designed for students and professionals
				</p>

				<!-- Search Bar -->
				<div class="relative">
					<Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search by name, location, or city..."
						bind:value={searchTerm}
						class="h-12 pl-12 text-base"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- Properties Grid -->
	<section class="py-12">
		<div class="container mx-auto px-4">
			{#if filteredProperties.length === 0}
				<div class="py-20 text-center">
					<p class="text-xl font-medium text-muted-foreground">
						{searchTerm ? 'No properties match your search.' : 'No properties available.'}
					</p>
					{#if searchTerm}
						<button onclick={() => (searchTerm = '')} class="mt-4 text-primary hover:underline">
							Clear search
						</button>
					{/if}
				</div>
			{:else}
				<div class="mb-6 text-sm text-muted-foreground">
					Showing {filteredProperties.length}
					{filteredProperties.length === 1 ? 'property' : 'properties'}
				</div>
				<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredProperties as property}
						<LandingPropertyCard {property} />
					{/each}
				</div>
			{/if}
		</div>
	</section>
</div>
