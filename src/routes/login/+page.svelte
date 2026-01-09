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
	import * as InputGroup from '$lib/components/ui/input-group';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { Eye, EyeOff } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleLogin() {
		loading = true;
		error = '';

		try {
			const result = await authClient.signIn.email({
				email,
				password
			});

			if (result.error) {
				error = result.error.message || 'Login failed';
			} else {
				// Redirect to dashboard
				goto('/dashboard');
			}
		} catch (e) {
			error = 'An error occurred during login';
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40">
	<Card class="w-full max-w-md">
		<CardHeader>
			<CardTitle>Login</CardTitle>
			<CardDescription>Enter your credentials to access your account</CardDescription>
		</CardHeader>
		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleLogin();
			}}
		>
			<CardContent class="space-y-4">
				{#if error}
					<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				{/if}

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
					<InputGroup.Root>
						<InputGroup.Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							placeholder="••••••••"
							required
						/>
						<InputGroup.Addon align="inline-end">
							<InputGroup.Button
								size="icon-sm"
								onclick={() => (showPassword = !showPassword)}
								title={showPassword ? 'Hide password' : 'Show password'}
								class="cursor-pointer"
							>
								{#if showPassword}
									<EyeOff class="size-4" />
								{:else}
									<Eye class="size-4" />
								{/if}
							</InputGroup.Button>
						</InputGroup.Addon>
					</InputGroup.Root>
				</div>
			</CardContent>
			<CardFooter class="flex flex-col space-y-4 mt-4">
				<Button type="submit" class="w-full cursor-pointer" disabled={loading}>
					{loading ? 'Logging in...' : 'Login'}
				</Button>
				<p class="text-center text-sm text-muted-foreground">
					Don't have an account? <a href="/signup" class="text-primary hover:underline">Sign up</a>
				</p>
			</CardFooter>
		</form>
	</Card>
</div>
