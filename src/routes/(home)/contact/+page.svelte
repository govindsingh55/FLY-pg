<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { MapPin, Phone, Mail, Clock, MessageCircle } from '@lucide/svelte';

	let formData = $state({
		name: '',
		email: '',
		phone: '',
		message: ''
	});

	function handleSubmit(e: Event) {
		e.preventDefault();
		// TODO: Implement form submission
		console.log('Form submitted:', formData);
	}

	const contactInfo = [
		{
			icon: Phone,
			title: 'Phone',
			value: '+91 98765 43210',
			href: 'tel:+919876543210'
		},
		{
			icon: Mail,
			title: 'Email',
			value: 'support@flypg.com',
			href: 'mailto:support@flypg.com'
		},
		{
			icon: MapPin,
			title: 'Address',
			value: 'Koramangala, Bangalore, Karnataka',
			href: null
		},
		{
			icon: Clock,
			title: 'Office Hours',
			value: 'Mon - Sat: 9:00 AM - 7:00 PM',
			href: null
		}
	];
</script>

<svelte:head>
	<title>Contact Us - FLY PG</title>
	<meta name="description" content="Get in touch with FLY PG - We're here to help" />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero Section -->
	<section class="border-b bg-card py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h1
					class="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl"
				>
					Get in <span class="text-primary">Touch</span>
				</h1>
				<p class="text-xl text-muted-foreground">
					Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as
					possible.
				</p>
			</div>
		</div>
	</section>

	<!-- Contact Section -->
	<section class="py-16">
		<div class="container mx-auto px-4">
			<div class="grid gap-12 lg:grid-cols-2">
				<!-- Contact Info -->
				<div class="space-y-8">
					<div>
						<h2 class="mb-6 text-3xl font-bold text-foreground">Contact Information</h2>
						<p class="text-muted-foreground">
							Reach out to us through any of the following channels. We're here to help!
						</p>
					</div>

					<div class="space-y-6">
						{#each contactInfo as info}
							<div class="flex items-start gap-4 rounded-lg border bg-card p-4">
								<div class="rounded-full bg-primary/10 p-3">
									<info.icon class="h-6 w-6 text-primary" />
								</div>
								<div>
									<h3 class="mb-1 font-semibold text-foreground">{info.title}</h3>
									{#if info.href}
										<a
											href={info.href}
											class="text-muted-foreground hover:text-primary transition-colors"
										>
											{info.value}
										</a>
									{:else}
										<p class="text-muted-foreground">{info.value}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>

					<!-- WhatsApp CTA -->
					<div class="rounded-2xl border bg-primary/5 p-6">
						<div class="mb-4 flex items-center gap-3">
							<MessageCircle class="h-8 w-8 text-primary" />
							<h3 class="text-xl font-bold text-foreground">Quick Response on WhatsApp</h3>
						</div>
						<p class="mb-4 text-sm text-muted-foreground">
							Get instant answers to your queries. Chat with our team on WhatsApp.
						</p>
						<Button class="w-full bg-green-500 hover:bg-green-600">
							<MessageCircle class="mr-2 h-4 w-4" />
							Chat on WhatsApp
						</Button>
					</div>
				</div>

				<!-- Contact Form -->
				<div class="rounded-2xl border bg-card p-8">
					<h2 class="mb-6 text-2xl font-bold text-foreground">Send us a Message</h2>
					<form onsubmit={handleSubmit} class="space-y-6">
						<div class="space-y-2">
							<Label for="name">Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="Your name"
								bind:value={formData.name}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="your.email@example.com"
								bind:value={formData.email}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="phone">Phone</Label>
							<Input
								id="phone"
								type="tel"
								placeholder="+91 98765 43210"
								bind:value={formData.phone}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="message">Message</Label>
							<Textarea
								id="message"
								placeholder="Tell us how we can help you..."
								bind:value={formData.message}
								rows={5}
								required
							/>
						</div>

						<Button type="submit" class="w-full" size="lg">Send Message</Button>
					</form>
				</div>
			</div>
		</div>
	</section>
</div>
