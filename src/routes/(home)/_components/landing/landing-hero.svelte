<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let {
		videoUrl = 'https://videos.pexels.com/video-files/7578552/7578552-uhd_2560_1440_30fps.mp4'
	} = $props<{
		videoUrl?: string;
	}>();

	let searchQuery = $state('');

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			goto('/properties');
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSearch();
		}
	}
</script>

<div class="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-background font-sans">
	<!-- Background Video -->
	<video
		src={videoUrl}
		autoplay
		loop
		muted
		playsinline
		class="absolute inset-0 h-full w-full object-cover opacity-60"
	></video>

	<!-- Subtle Overlay - Just enough for text visibility -->
	<div
		class="absolute inset-0 bg-linear-to-t from-background/20 via-background/5 to-transparent"
	></div>

	<!-- Content - Centered -->
	<div
		class="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center"
	>
		<!-- Brand / Logo Vibe -->
		<div class="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
			Redefining Urban Living
		</div>

		<h1
			class="mb-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl"
		>
			6-Star Living
			<br />
			<span class="text-primary">Unbelievable Prices</span>
		</h1>

		<p class="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
			Fully managed homes for students and professionals with premium amenities and community.
		</p>

		<!-- Search Bar -->
		<div class="relative mb-8 w-full max-w-lg">
			<div
				class="relative flex items-center overflow-hidden rounded-full border border-input bg-background/40 backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:bg-background/60 focus-within:ring-2 focus-within:ring-ring"
			>
				<Search class="ml-4 h-5 w-5 text-muted-foreground" />
				<input
					type="text"
					bind:value={searchQuery}
					onkeypress={handleKeyPress}
					placeholder="Enter location (e.g. Koramangala, Indiranagar)"
					class="w-full bg-transparent px-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none"
				/>
				<Button size="lg" class="m-1 rounded-full font-bold" onclick={handleSearch}>Search</Button>
			</div>
		</div>

		<!-- Quick Stats or trust badges -->
		<div class="mt-8 flex flex-wrap justify-center gap-8 text-muted-foreground">
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-primary"></span>
				<span>Zero Brokerage</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-primary"></span>
				<span>Fully Furnished</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-primary"></span>
				<span>Daily Housekeeping</span>
			</div>
		</div>
	</div>
</div>
