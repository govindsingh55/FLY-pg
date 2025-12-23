<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Bed, Users } from 'lucide-svelte';

	interface Room {
		id: string;
		number: string;
		type: 'single' | 'double' | 'triple' | 'dorm';
		priceMonthly: number;
		depositAmount: number | null;
		capacity: number | null;
		features: unknown | null;
		media: { url: string; type: string }[] | null;
	}

	let { room } = $props<{ room: Room }>();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Helper to extract features from JSON or array
	const features = $derived(Array.isArray(room.features) ? room.features : []);
	const images = $derived(
		Array.isArray(room.media) ? room.media.map((m: { url: string }) => m.url) : []
	);

	const imageId = $derived(
		Math.abs(
			room.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 200
		) + 1
	);
	const coverImage = $derived(
		images.length > 0 ? images[0] : `https://picsum.photos/id/${imageId}/400/300`
	);
</script>

<Card class="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
	{#if coverImage}
		<div class="relative h-56 w-full overflow-hidden">
			<img
				src={coverImage}
				alt="Room {room.number}"
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			/>
			<div class="absolute top-3 right-3">
				<Badge
					variant={room.status === 'available' ? 'default' : 'secondary'}
					class="uppercase tracking-wider font-semibold shadow-sm"
				>
					{room.status}
				</Badge>
			</div>
		</div>
	{/if}

	<CardHeader class="pb-3">
		<div class="flex items-center justify-between">
			<Badge variant="outline" class="capitalize px-3 py-1">{room.type} Room</Badge>
			<div
				class="flex items-center text-sm font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"
			>
				<Users class="mr-1.5 h-4 w-4" />
				<span>{room.capacity || 1} Person(s)</span>
			</div>
		</div>
		<CardTitle class="text-2xl pt-2">Room {room.number}</CardTitle>
	</CardHeader>

	<CardContent class="pb-4">
		<div class="mb-6 flex items-baseline gap-1">
			<span class="text-3xl font-bold text-primary">{formatCurrency(room.priceMonthly)}</span>
			<span class="text-muted-foreground font-medium">/month</span>
		</div>

		{#if room.depositAmount}
			<div class="mb-4 flex items-center justify-between text-sm border-b pb-3 border-border/50">
				<span class="text-muted-foreground">Security Deposit</span>
				<span class="font-semibold">{formatCurrency(room.depositAmount)}</span>
			</div>
		{/if}

		{#if features.length > 0}
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Included Features
				</p>
				<ul class="grid grid-cols-2 gap-2">
					{#each features as feature}
						<li class="flex items-center gap-2 text-sm">
							<div
								class="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round"
									class="h-3 w-3"
								>
									<polyline points="20 6 9 17 4 12" />
								</svg>
							</div>
							<span class="text-muted-foreground">{feature}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</CardContent>

	<CardFooter class="pt-0">
		<Button class="w-full font-semibold shadow-sm" href="/login" size="lg">Book Now</Button>
	</CardFooter>
</Card>
