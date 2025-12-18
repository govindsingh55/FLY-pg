<script lang="ts">
	import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-svelte';

	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t bg-muted/40">
	<div class="container mx-auto py-12 md:py-16">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Brand -->
			<div class="space-y-4">
				<div class="flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold"
					>
						F
					</div>
					<span class="text-xl font-bold tracking-tight">FLY PG</span>
				</div>
				<p class="text-sm text-muted-foreground max-w-xs">
					Providing comfortable and affordable PG accommodations with modern amenities for students
					and professionals.
				</p>
			</div>

			<!-- Quick Links -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Quick Links</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/" class="hover:text-primary transition-colors">Home</a></li>
					<li><a href="#about" class="hover:text-primary transition-colors">About Us</a></li>
					<li><a href="#properties" class="hover:text-primary transition-colors">Properties</a></li>
					<li><a href="/login" class="hover:text-primary transition-colors">Login</a></li>
				</ul>
			</div>

			<!-- Contact -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Contact Us</h3>
				<ul class="space-y-3 text-sm text-muted-foreground">
					<li class="flex items-start gap-2">
						<MapPin class="h-4 w-4 mt-0.5 shrink-0" />
						<span>123 PG Street, Tech Park Area,<br />Bangalore, KA 560001</span>
					</li>
					<li class="flex items-center gap-2">
						<Phone class="h-4 w-4 shrink-0" />
						<span>+91 98765 43210</span>
					</li>
					<li class="flex items-center gap-2">
						<Mail class="h-4 w-4 shrink-0" />
						<span>support@flypg.com</span>
					</li>
				</ul>
			</div>

			<!-- Social -->
			<div class="space-y-4">
				<h3 class="text-lg font-semibold">Follow Us</h3>
				<div class="flex gap-4">
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-primary hover:shadow-md"
					>
						<Facebook class="h-4 w-4" />
						<span class="sr-only">Facebook</span>
					</a>
					<a
						href="https://twitter.com"
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-primary hover:shadow-md"
					>
						<Twitter class="h-4 w-4" />
						<span class="sr-only">Twitter</span>
					</a>
					<a
						href="https://instagram.com"
						target="_blank"
						rel="noreferrer"
						class="rounded-full bg-background p-2 text-muted-foreground transition-colors hover:text-primary hover:shadow-md"
					>
						<Instagram class="h-4 w-4" />
						<span class="sr-only">Instagram</span>
					</a>
				</div>
			</div>
		</div>

		<div class="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
			<p>&copy; {currentYear} FLY PG. All rights reserved.</p>
		</div>
	</div>
</footer>
