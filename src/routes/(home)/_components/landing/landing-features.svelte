<script lang="ts">
	import { ShieldCheck, Wifi, Users, Wallet, Star, Sparkles } from 'lucide-svelte';

	const features = [
		{
			id: 'style',
			title: '#Style',
			desc: 'Move-in ready tech-enabled spaces with chic, tasteful furniture, appliances, utilities & amenities.',
			icon: Sparkles
		},
		{
			id: 'safety',
			title: '#Safety',
			desc: 'Tired of living in fear & loathing about the horrors of living alone? Our 24x7 Security has got your back!',
			icon: ShieldCheck
		},
		{
			id: 'service',
			title: '#Service',
			desc: 'Weekly housekeeping, laundry, tasty food & onsite managers so you can plug, play & live.',
			icon: Star
		},
		{
			id: 'smart',
			title: '#Smart',
			desc: 'Stop worrying about internet when you move in. High-speed WiFi & smart access controls in your room.',
			icon: Wifi
		},
		{
			id: 'social',
			title: '#Social',
			desc: '15,000+ residents agree that the best part is the friendships they form within the community.',
			icon: Users
		},
		{
			id: 'savings',
			title: '#Savings',
			desc: 'Imagine living everyday in a 5-Star hotel room! Flexible plans & low deposits to stay in luxury.',
			icon: Wallet
		}
	];
</script>

<section class="bg-background py-20">
	<div class="container mx-auto px-4">
		<!-- Title -->
		<div class="mb-16 text-center">
			<h2 class="text-3xl font-extrabold text-foreground sm:text-4xl">
				What makes FLY PG <span class="text-primary">6-Star</span>?
			</h2>
			<p class="mt-4 text-muted-foreground max-w-2xl mx-auto">
				We offer fully managed homes for young professionals & millennials, with 24x7 Security •
				Housekeeping • Laundry • Healthy Meals • High-Speed WiFi
			</p>
		</div>

		<!-- Grid -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature}
				<div
					class="group relative overflow-hidden rounded-2xl border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg"
				>
					<!-- Icon -->
					<div
						class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors"
					>
						<feature.icon class="h-8 w-8 text-primary" />
					</div>

					<!-- Content -->
					<h3 class="mb-3 text-xl font-bold text-primary">{feature.title}</h3>
					<p
						class="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors"
					>
						{feature.desc}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
