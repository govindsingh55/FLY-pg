<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Separator } from '$lib/components/ui/separator';
	import { Users, IndianRupee, Shield, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { createBooking } from '../properties/bookings.remote';
	import { toast } from 'svelte-sonner';
	import type { RoomSchema } from '$lib/schemas/room';

	// interface Room {
	// 	id: string;
	// 	number: string;
	// 	type: 'single' | 'double' | 'triple' | 'dorm';
	// 	priceMonthly: number;
	// 	depositAmount: number | null;
	// 	capacity: number | null;
	// 	features: unknown | null;
	// 	status?: string;
	// 	media: { url: string; type: string }[] | null;
	// }

	interface Props {
		room: RoomSchema & { id: string };
		propertyId: string;
	}

	let { room, propertyId }: Props = $props();

	let open = $state(false);
	let currentImageIndex = $state(0);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR',
			maximumFractionDigits: 0
		}).format(amount);
	}

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

	const allImages = $derived(
		images.length > 0 ? images : [`https://picsum.photos/id/${imageId}/800/600`]
	);

	function nextImage() {
		currentImageIndex = (currentImageIndex + 1) % allImages.length;
	}

	function prevImage() {
		currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
	}
</script>

<div
	class="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter') open = true;
	}}
	onclick={() => (open = true)}
>
	{#if coverImage}
		<div class="relative h-56 w-full overflow-hidden">
			<img
				src={coverImage}
				alt="Room {room.number}"
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
			/>
			<div class="absolute top-3 right-3">
				<Badge variant="default" class="uppercase tracking-wider font-semibold shadow-sm">
					Available
				</Badge>
			</div>
		</div>
	{/if}

	<div class="p-6">
		<div class="flex items-center justify-between mb-2">
			<Badge variant="outline" class="capitalize px-3 py-1">{room.type} Room</Badge>
			<div class="flex items-center text-sm font-medium text-muted-foreground">
				<Users class="mr-1.5 h-4 w-4" />
				<span>{room.capacity || 1} Person(s)</span>
			</div>
		</div>

		<h3 class="text-2xl font-bold mb-4">Room {room.number}</h3>

		<div class="flex items-baseline gap-1 mb-4">
			<span class="text-3xl font-bold text-primary">{formatCurrency(room.priceMonthly)}</span>
			<span class="text-muted-foreground font-medium">/month</span>
		</div>

		<Button class="w-full font-semibold shadow-sm" size="lg">View Details & Book</Button>
	</div>
</div>

<Dialog bind:open>
	<DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle class="text-3xl">Room {room.number}</DialogTitle>
			<DialogDescription>
				{room.type.charAt(0).toUpperCase() + room.type.slice(1)} room •
				{room.capacity || 1} person(s)
			</DialogDescription>
		</DialogHeader>

		<div class="grid gap-6">
			<!-- Image Gallery -->
			<div class="relative aspect-video overflow-hidden rounded-lg bg-muted">
				<img
					src={allImages[currentImageIndex]}
					alt="Room {room.number} - Image {currentImageIndex + 1}"
					class="h-full w-full object-cover"
				/>

				{#if allImages.length > 1}
					<div class="absolute inset-0 flex items-center justify-between p-4">
						<Button
							size="icon"
							variant="secondary"
							class="rounded-full bg-background/80 backdrop-blur-sm"
							onclick={prevImage}
						>
							<ChevronLeft class="h-4 w-4" />
						</Button>
						<Button
							size="icon"
							variant="secondary"
							class="rounded-full bg-background/80 backdrop-blur-sm"
							onclick={nextImage}
						>
							<ChevronRight class="h-4 w-4" />
						</Button>
					</div>

					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
						{#each allImages as _, i}
							<button
								class="h-2 w-2 rounded-full transition-all {i === currentImageIndex
									? 'bg-white w-8'
									: 'bg-white/50'}"
								onclick={() => (currentImageIndex = i)}
								aria-label="Go to image {i + 1}"
							></button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Pricing Details -->
			<div class="grid gap-4 rounded-lg border p-4 bg-muted/20">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<IndianRupee class="h-5 w-5 text-muted-foreground" />
						<span class="font-medium">Monthly Rent</span>
					</div>
					<span class="text-2xl font-bold text-primary">{formatCurrency(room.priceMonthly)}</span>
				</div>

				{#if room.depositAmount}
					<Separator />
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<Shield class="h-5 w-5 text-muted-foreground" />
							<span class="font-medium">Security Deposit</span>
						</div>
						<span class="text-xl font-semibold">{formatCurrency(room.depositAmount)}</span>
					</div>
				{/if}
			</div>

			<!-- Features -->
			{#if features.length > 0}
				<div class="space-y-3">
					<h4 class="font-semibold text-lg">Room Features</h4>
					<ul class="grid grid-cols-2 gap-3">
						{#each features as feature}
							<li class="flex items-center gap-2 text-sm">
								<div
									class="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-3.5 w-3.5"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
								<span>{feature}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>

		<DialogFooter class="flex-col sm:flex-row gap-2 sm:gap-0">
			<Button type="button" variant="outline" onclick={() => (open = false)}>Close</Button>
			<form
				{...createBooking.enhance(async ({ submit, form }) => {
					try {
						await submit();
						toast.success('Booking request submitted!');
						form.reset();
						open = false;
					} catch (error: any) {
						if (error.status === 401) {
							toast.error('Please login to book a room');
							window.location.href = '/login';
						} else {
							toast.error(error.message || 'Failed to submit booking');
						}
					}
				})}
				class="w-full sm:w-auto"
			>
				<input type="hidden" name="roomId" value={room.id} />
				<input type="hidden" name="propertyId" value={propertyId} />
				<Button class="w-full sm:w-auto" {...createBooking.buttonProps}>
					{createBooking.pending ? 'Processing...' : 'Book This Room'}
				</Button>
			</form>
		</DialogFooter>
	</DialogContent>
</Dialog>
