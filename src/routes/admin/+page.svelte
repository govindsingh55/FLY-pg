<script lang="ts">
	import { getDashboardStats, getPropertyManagerDashboard } from './admin.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import AdminDashboard from './_components/admin-dashboard.svelte';
	import PropertyManagerDashboard from './_components/property-manager-dashboard.svelte';
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();

	const isPropertyManager = $derived(data.user.role === 'property_manager');

	let dataPromise = $derived(
		isPropertyManager ? getPropertyManagerDashboard() : getDashboardStats()
	);
</script>

<div class="p-6 space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">
			{#if isPropertyManager}
				Overview of your assigned properties
			{:else}
				Overview of your property management system
			{/if}
		</p>
	</div>

	<svelte:boundary>
		{#await dataPromise}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each { length: 4 } as _}
					<div class="rounded-lg border bg-card p-6">
						<Skeleton class="h-4 w-24 mb-4" />
						<Skeleton class="h-8 w-16 mb-2" />
						<Skeleton class="h-3 w-32" />
					</div>
				{/each}
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				{#each { length: 2 } as _}
					<div class="rounded-lg border bg-card p-6">
						<Skeleton class="h-6 w-32 mb-4" />
						<div class="space-y-4">
							{#each { length: 5 } as _}
								<div class="flex items-center justify-between">
									<div class="space-y-2">
										<Skeleton class="h-4 w-32" />
										<Skeleton class="h-3 w-48" />
									</div>
									<Skeleton class="h-4 w-16" />
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:then dashboardData}
			{#if isPropertyManager}
				<PropertyManagerDashboard {dashboardData} />
			{:else}
				<AdminDashboard {dashboardData} />
			{/if}
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading dashboard</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button
					variant="outline"
					onclick={() =>
						(dataPromise = isPropertyManager ? getPropertyManagerDashboard() : getDashboardStats())}
				>
					Retry
				</Button>
			</div>
		{/await}
		{#snippet failed(error: any, reset)}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Something went wrong</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={reset}>Try again</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
