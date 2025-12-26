<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ShieldCheck, Wifi, Users, Wallet, Star, Sparkles, ArrowRight } from 'lucide-svelte';

	const values = [
		{
			icon: Sparkles,
			title: 'Premium Living',
			description: 'Move-in ready spaces with modern furniture, appliances, and amenities'
		},
		{
			icon: ShieldCheck,
			title: 'Safety First',
			description: '24/7 security and CCTV surveillance for complete peace of mind'
		},
		{
			icon: Star,
			title: 'Full Service',
			description: 'Weekly housekeeping, laundry, and onsite property managers'
		},
		{
			icon: Wifi,
			title: 'Smart Living',
			description: 'High-speed WiFi and smart access controls in every room'
		},
		{
			icon: Users,
			title: 'Community',
			description: 'Join a vibrant community of students and young professionals'
		},
		{
			icon: Wallet,
			title: 'Affordable',
			description: 'Flexible plans and low deposits for premium living'
		}
	];
</script>

<svelte:head>
	<title>About Us - FLY PG</title>
	<meta
		name="description"
		content="Learn about FLY PG - Premium managed homes for students and professionals"
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero Section -->
	<section class="border-b bg-card py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h1
					class="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
				>
					About <span class="text-primary">FLY PG</span>
				</h1>
				<p class="text-xl text-muted-foreground leading-relaxed">
					Redefining urban living with premium managed homes designed for the modern generation
				</p>
			</div>
		</div>
	</section>

	<!-- Mission Section -->
	<section class="py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-4xl">
				<h2 class="mb-8 text-center text-3xl font-bold text-foreground">Our Mission</h2>
				<div class="space-y-6 text-lg text-muted-foreground leading-relaxed">
					<p>
						At FLY PG, we believe that finding the perfect home shouldn't be a hassle. We're on a
						mission to provide premium, fully-managed living spaces that combine comfort,
						convenience, and community.
					</p>
					<p>
						Whether you're a student starting your academic journey or a young professional building
						your career, we offer thoughtfully designed spaces that feel like home from day one. No
						brokerage, no hidden costs, just transparent pricing and exceptional service.
					</p>
					<p>
						Our properties are strategically located in prime urban areas, giving you easy access to
						educational institutions, workplaces, and entertainment hubs. With amenities that rival
						5-star hotels and a vibrant community of like-minded individuals, FLY PG is more than
						just accommodation—it's a lifestyle.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Values Section -->
	<section class="border-t bg-muted/30 py-16">
		<div class="container mx-auto px-4">
			<h2 class="mb-12 text-center text-3xl font-bold text-foreground">
				What Makes Us <span class="text-primary">Different</span>
			</h2>
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each values as value}
					<div
						class="rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-lg"
					>
						<div
							class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
						>
							<value.icon class="h-8 w-8 text-primary" />
						</div>
						<h3 class="mb-3 text-xl font-bold text-foreground">{value.title}</h3>
						<p class="text-sm text-muted-foreground">{value.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl rounded-2xl border bg-card p-12 text-center shadow-lg">
				<h2 class="mb-4 text-3xl font-bold text-foreground">Ready to Find Your Home?</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					Explore our premium properties and discover the perfect space for you
				</p>
				<Button size="lg" href="/properties" class="gap-2">
					View Properties
					<ArrowRight class="h-5 w-5" />
				</Button>
			</div>
		</div>
	</section>
</div>
