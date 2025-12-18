<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import {
		getAssignmentsData,
		assignManager,
		unassignManager,
		assignStaff,
		unassignStaff
	} from './assignments.remote';
	import { toast } from 'svelte-sonner';

	let assignmentsPromise = $derived(getAssignmentsData());

	// Helper to clear forms if needed, but not strictly required with standard form submission
</script>

<div class="space-y-8 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Assignments</h2>

	<svelte:boundary>
		{#await assignmentsPromise}
			<div class="space-y-8">
				<Skeleton class="h-[300px] w-full" />
				<Skeleton class="h-[300px] w-full" />
			</div>
		{:then data}
			<!-- Property Managers Section -->
			<Card>
				<CardHeader>
					<CardTitle>Property Manager Assignments</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-6">
						<!-- Assign Form -->
						<form
							class="flex items-end gap-4 p-4 border rounded-lg bg-muted/50"
							{...assignManager.enhance(async ({ submit }) => {
								try {
									await submit();
									toast.success('Manager assigned');
								} catch (e: any) {
									toast.error(e.message || 'Failed to assign');
								}
							})}
						>
							<div class="grid gap-2 w-1/3">
								<Label>Property Manager</Label>
								<select
									name="userId"
									required
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								>
									<option value="">Select Manager...</option>
									{#each data.managers as m}
										<option value={m.id}>{m.name} ({m.email})</option>
									{/each}
								</select>
							</div>
							<div class="grid gap-2 w-1/3">
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
							<Button type="submit" disabled={!!assignManager.pending}>
								{assignManager.pending ? 'Assigning...' : 'Assign'}
							</Button>
						</form>

						<!-- List -->
						<div class="space-y-4">
							{#each data.managers as m}
								<div class="border rounded p-4">
									<h3 class="font-semibold">{m.name}</h3>
									<div class="mt-2 flex flex-wrap gap-2">
										{#if m.assignments.length === 0}
											<span class="text-sm text-muted-foreground">No property assigned</span>
										{:else}
											{#each m.assignments as assign}
												<div
													class="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
												>
													{assign.propertyName || 'Unknown'}
													<form
														class="inline"
														{...unassignManager.enhance(async ({ submit }) => {
															try {
																await submit();
																toast.success('Unassigned');
															} catch (e: any) {
																toast.error('Failed to unassign');
															}
														})}
													>
														<input type="hidden" name="assignmentId" value={assign.id} />
														<button
															type="submit"
															class="text-muted-foreground hover:text-destructive flex items-center justify-center w-4 h-4"
															disabled={!!unassignManager.pending}>×</button
														>
													</form>
												</div>
											{/each}
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Staff Section -->
			<Card>
				<CardHeader>
					<CardTitle>Staff Assignments</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid gap-6">
						<!-- Assign Form -->
						<form
							class="flex items-end gap-4 p-4 border rounded-lg bg-muted/50"
							{...assignStaff.enhance(async ({ submit }) => {
								try {
									await submit();
									toast.success('Staff assigned');
								} catch (e: any) {
									toast.error(e.message || 'Failed to assign');
								}
							})}
						>
							<div class="grid gap-2 w-1/3">
								<Label>Staff Member</Label>
								<select
									name="staffProfileId"
									required
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								>
									<option value="">Select Staff...</option>
									{#each data.staff as s}
										<option value={s.id}>{s.name} ({s.staffType})</option>
									{/each}
								</select>
							</div>
							<div class="grid gap-2 w-1/3">
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
							<Button type="submit" disabled={!!assignStaff.pending}>
								{assignStaff.pending ? 'Assigning...' : 'Assign'}
							</Button>
						</form>

						<!-- List -->
						<div class="space-y-4">
							{#each data.staff as s}
								<div class="border rounded p-4">
									<div class="flex items-center gap-2">
										<h3 class="font-semibold">{s.name}</h3>
										<span class="text-xs bg-muted px-2 rounded">{s.staffType}</span>
									</div>
									<div class="mt-2 flex flex-wrap gap-2">
										{#if s.assignments.length === 0}
											<span class="text-sm text-muted-foreground">No property assigned</span>
										{:else}
											{#each s.assignments as assign}
												<div
													class="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm"
												>
													{assign.propertyName || 'Unknown'}
													<form
														class="inline"
														{...unassignStaff
															.for(`unassign-${assign.id}`)
															.enhance(async ({ submit }) => {
																try {
																	await submit();
																	toast.success('Unassigned');
																} catch (e: any) {
																	toast.error('Failed to unassign');
																}
															})}
													>
														<input type="hidden" name="assignmentId" value={assign.id} />
														<button
															type="submit"
															class="text-muted-foreground hover:text-destructive flex items-center justify-center w-4 h-4"
															disabled={!!unassignStaff.pending}>×</button
														>
													</form>
												</div>
											{/each}
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</CardContent>
			</Card>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading assignments</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={() => window.location.reload()}>Retry</Button>
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
