<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { MapPin, Phone } from 'lucide-svelte';

	interface Property {
		name: string;
		description: string | null;
		address: string;
		city: string | null;
		state: string | null;
		zip: string | null;
		contactPhone: string | null;
		media: { url: string; type: string }[] | null;
		isFoodServiceAvailable: boolean | null;
		id: string;
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
		images.length > 0 ? images[0] : `https://picsum.photos/id/${imageId}/1200/400`
	);
</script>

<div class="relative w-full">
	<!-- Immersive Hero Image -->
	<div class="relative h-[50vh] min-h-[400px] w-full overflow-hidden lg:h-[60vh]">
		<img src={coverImage} alt={property.name} class="h-full w-full object-cover" />
		<div
			class="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent lg:via-background/40"
		></div>

		<div class="container mx-auto absolute bottom-0 left-0 right-0 z-10 pb-12 lg:pb-16">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div class="space-y-4">
					<div>
						<h1
							class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground drop-shadow-sm"
						>
							{property.name}
						</h1>
						<div
							class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg text-muted-foreground/90 font-medium"
						>
							<div class="flex items-center">
								<MapPin class="mr-2 h-5 w-5 text-primary" />
								<span>
									{property.address}, {property.city}
									{#if property.zip}, {property.zip}{/if}
								</span>
							</div>
							{#if property.contactPhone}
								<div class="flex items-center">
									<Phone class="mr-2 h-5 w-5 text-primary" />
									<span>{property.contactPhone}</span>
								</div>
							{/if}
						</div>
					</div>

					<div class="flex flex-wrap gap-3">
						{#if property.isFoodServiceAvailable}
							<Badge
								variant="secondary"
								class="px-3 py-1 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
							>
								Food Service Available
							</Badge>
						{/if}
						<Badge variant="outline" class="px-3 py-1 text-sm">Premium Amenities</Badge>
					</div>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row lg:min-w-[280px]">
					<Button
						size="lg"
						class="w-full text-base font-semibold shadow-lg shadow-primary/20"
						href="#rooms"
					>
						View Available Rooms
					</Button>
					<Button
						size="lg"
						variant="secondary"
						class="w-full text-base font-semibold bg-background/80 backdrop-blur hover:bg-background/90"
						href="/login"
					>
						Schedule Visit
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Description Section -->
	{#if property.description}
		<div class="container mx-auto space-y-4 py-8 border-b">
			<p class="max-w-4xl text-lg leading-relaxed text-muted-foreground">
				{property.description}
			</p>
		</div>
	{/if}
</div>
