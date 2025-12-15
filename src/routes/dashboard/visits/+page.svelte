<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';

	export let data;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">My Visits</h2>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button>Schedule Visit</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Schedule a Property Visit</Dialog.Title>
					<Dialog.Description>Pick a date and time to visit a property.</Dialog.Description>
				</Dialog.Header>
				<form method="POST" action="?/request" use:enhance class="space-y-4">
					<div class="grid gap-2">
						<Label>Property</Label>
						<select
							name="propertyId"
							required
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="">Select Property...</option>
							{#each data.properties as p}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</div>
					<!-- Room selection could be here if dynamic -->
					<div class="grid grid-cols-2 gap-4">
						<div class="grid gap-2">
							<Label>Date</Label>
							<Input
								type="date"
								name="visitDate"
								required
								min={new Date().toISOString().split('T')[0]}
							/>
						</div>
						<div class="grid gap-2">
							<Label>Time</Label>
							<Input type="time" name="visitTime" required />
						</div>
					</div>
					<Dialog.Footer>
						<Button type="submit">Request Visit</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each data.visits as visit}
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
						<form method="POST" action="?/cancel" use:enhance>
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
		{#if data.visits.length === 0}
			<div
				class="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground"
			>
				No visits scheduled.
			</div>
		{/if}
	</div>
</div>
