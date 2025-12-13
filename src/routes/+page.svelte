<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, Building, House, Key, ShieldCheck } from 'lucide-svelte';
</script>

<div class="flex flex-col min-h-screen">
	<!-- Hero Section -->
	<section class="w-full py-24 lg:py-32 xl:py-48 bg-muted/40">
		<div class="container px-4 md:px-6">
			<div class="flex flex-col items-center space-y-4 text-center">
				<div class="space-y-2">
					<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
						Manage Your Property with Ease
					</h1>
					<p class="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
						Simplify tenant management, bookings, and payments. The all-in-one solution for modern
						landlords and PGs.
					</p>
				</div>
				<div class="space-x-4">
					<Button size="lg" href="/login">
						Get Started
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
					<Button size="lg" variant="outline" href="#features">Learn More</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="w-full py-12 md:py-24 lg:py-32 bg-background">
		<div class="container px-4 md:px-6">
			<div class="flex flex-col items-center justify-center space-y-4 text-center">
				<div class="space-y-2">
					<div class="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
					<h2 class="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
					<p
						class="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
					>
						From listing properties to managing maintenance tickets, we've got you covered.
					</p>
				</div>
			</div>
			<div class="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
				<div class="flex flex-col justify-center space-y-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary"
					>
						<Building class="h-6 w-6" />
					</div>
					<h3 class="text-xl font-bold">Property Management</h3>
					<p class="text-muted-foreground">
						Add and manage multiple properties and rooms with detailed specifics.
					</p>
				</div>
				<div class="flex flex-col justify-center space-y-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary"
					>
						<Key class="h-6 w-6" />
					</div>
					<h3 class="text-xl font-bold">Booking System</h3>
					<p class="text-muted-foreground">
						Streamlined booking flow with room availability checks and customer profiles.
					</p>
				</div>
				<div class="flex flex-col justify-center space-y-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary"
					>
						<ShieldCheck class="h-6 w-6" />
					</div>
					<h3 class="text-xl font-bold">Maintenance Tickets</h3>
					<p class="text-muted-foreground">
						Tenants can raise issues directly, and you can track them to resolution.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer
		class="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t"
	>
		<p class="text-xs text-muted-foreground">&copy; 2024 FLY PMS. All rights reserved.</p>
		<nav class="sm:ml-auto flex gap-4 sm:gap-6">
			<a class="text-xs hover:underline underline-offset-4" href="#terms">Terms of Service</a>
			<a class="text-xs hover:underline underline-offset-4" href="#privacy">Privacy</a>
		</nav>
	</footer>
</div>
