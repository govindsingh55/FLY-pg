<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { cancelVisit, getVisits } from './visits.remote';
	import VisitRequestForm from './_components/visit-request-form.svelte';

	import { Skeleton } from '$lib/components/ui/skeleton';

	let isDialogOpen = $state(false);
	// Initial data fetch
	let dataPromise = $state(getVisits());
</script>

<div class="space-y-6 p-6">
	<svelte:boundary>
		{#await dataPromise}
			<div class="flex items-center justify-between">
				<Skeleton class="h-9 w-32" />
				<!-- Title skeleton -->
				<Skeleton class="h-10 w-32" />
				<!-- Button skeleton -->
			</div>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
				{#each { length: 6 } as _}
					<div class="flex flex-col space-y-3">
						<Skeleton class="h-[125px] w-full rounded-xl" />
						<div class="space-y-2">
							<Skeleton class="h-4 w-[250px]" />
							<Skeleton class="h-4 w-[200px]" />
						</div>
					</div>
				{/each}
			</div>
		{:then { visits, properties }}
			<div class="flex items-center justify-between">
				<h2 class="text-3xl font-bold tracking-tight">My Visits</h2>
				<Button onclick={() => (isDialogOpen = true)}>Schedule Visit</Button>

				<svelte:boundary>
					<VisitRequestForm bind:open={isDialogOpen} {properties} />
					{#snippet failed(error: any, reset)}
						<p class="text-xs text-destructive">Form unavailable: {error.message}</p>
					{/snippet}
				</svelte:boundary>
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each visits as visit}
					<Card>
						<CardHeader>
							<div class="flex justify-between items-start">
								<div>
									<CardTitle>{visit.property?.name}</CardTitle>
									<CardDescription>
										{new Date(visit.visitDate).toLocaleDateString()} at {new Date(
											visit.visitTime
										).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</CardDescription>
								</div>
								<Badge
									variant={visit.status === 'accepted'
										? 'default'
										: visit.status === 'pending'
											? 'secondary'
											: 'destructive'}
								>
									{visit.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-sm text-muted-foreground mb-4">
								Status: {visit.status}
							</p>
							{#if visit.status === 'pending'}
								<form class="w-full" {...cancelVisit.for(`cancelVisit-${visit.id}`)}>
									<input type="hidden" name="visitId" value={visit.id} />
									<Button
										variant="outline"
										size="sm"
										type="submit"
										class="w-full text-destructive hover:bg-destructive/10">Cancel Request</Button
									>
								</form>
							{/if}
							{#if visit.status === 'cancelled'}
								<p class="text-xs text-muted-foreground">
									Reason: {visit.cancelReason || 'No reason provided'}
								</p>
							{/if}
						</CardContent>
					</Card>
				{/each}
				{#if visits.length === 0}
					<div
						class="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground"
					>
						No visits scheduled.
					</div>
				{/if}
			</div>
		{:catch error}
			<div class="p-8 text-center text-destructive">
				<p>Error loading visits. Please try again later.</p>
				<p class="text-sm opacity-70">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getVisits())}>Retry</Button>
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
