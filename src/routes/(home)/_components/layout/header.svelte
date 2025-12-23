<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { cn } from '$lib/utils';
	import { Menu, Home, Info, Phone, LogIn } from 'lucide-svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	let isOpen = $state(false);

	const navItems = [
		{ label: 'Home', href: '/', icon: Home },
		{ label: 'About', href: '#about', icon: Info },
		{ label: 'Contact', href: '#contact', icon: Phone }
	];
</script>

<header
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60"
>
	<div class="container mx-auto flex h-16 items-center justify-between">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold"
			>
				F
			</div>
			<span class="text-xl font-bold tracking-tight">FLY PG</span>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex md:items-center md:gap-6">
			{#each navItems as item}
				<a href={item.href} class="text-sm font-medium transition-colors hover:text-primary">
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Desktop Auth -->
		<div class="hidden md:flex md:items-center md:gap-4">
			<ThemeToggle />
			<Button variant="ghost" size="sm" href="/login">Login</Button>
			<Button size="sm" href="/register">Sign Up</Button>
		</div>

		<!-- Mobile Menu -->
		<div class="flex items-center gap-2 md:hidden">
			<ThemeToggle />
			<Sheet bind:open={isOpen}>
				<SheetTrigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" class="h-9 w-9" {...props}>
							<Menu class="h-5 w-5" />
							<span class="sr-only">Toggle menu</span>
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="right" class="w-[300px] sm:w-[400px]">
					<div class="flex flex-col gap-6 pt-10">
						<nav class="flex flex-col gap-4">
							{#each navItems as item}
								<a
									href={item.href}
									class="flex items-center gap-2 text-lg font-medium hover:text-primary"
									onclick={() => (isOpen = false)}
								>
									<item.icon class="h-5 w-5" />
									{item.label}
								</a>
							{/each}
						</nav>
						<div class="flex flex-col gap-3 pt-4 border-t">
							<Button class="w-full justify-start gap-2" href="/login">
								<LogIn class="h-5 w-5" />
								Login
							</Button>
							<Button variant="outline" class="w-full justify-start" href="/register">
								Sign Up
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	</div>
</header>
