<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup() {
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password
			});

			if (result.error) {
				error = result.error.message || 'Signup failed';
			} else {
				// Redirect to login or dashboard
				goto('/login');
			}
		} catch (e) {
			error = 'An error occurred during signup';
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Sign Up</CardTitle>
			<CardDescription>Create a new account to get started</CardDescription>
		</CardHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSignup();
			}}
		>
			<CardContent class="space-y-4">
				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="name">Full Name</Label>
					<Input id="name" type="text" bind:value={name} placeholder="John Doe" required />
				</div>

				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input
						id="email"
						type="email"
						bind:value={email}
						placeholder="you@example.com"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<Input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						placeholder="••••••••"
						required
					/>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4">
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Creating account...' : 'Sign Up'}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					Already have an account? <a href="/login" class="text-primary hover:underline">Login</a>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
