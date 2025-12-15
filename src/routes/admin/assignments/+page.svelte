<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';

	export let data;
</script>

<div class="space-y-8">
	<h2 class="text-3xl font-bold tracking-tight">Assignments</h2>

	<!-- Property Managers Section -->
	<Card>
		<CardHeader>
			<CardTitle>Property Manager Assignments</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-6">
				<!-- Assign Form -->
				<form
					method="POST"
					action="?/assignManager"
					use:enhance
					class="flex items-end gap-4 p-4 border rounded-lg bg-muted/50"
				>
					<div class="grid gap-2 w-1/3">
						<Label>Property Manager</Label>
						<select
							name="userId"
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
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="">Select Property...</option>
							{#each data.properties as p}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</div>
					<Button type="submit">Assign</Button>
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
											{assign.propertyName}
											<form method="POST" action="?/unassignManager" use:enhance class="inline">
												<input type="hidden" name="assignmentId" value={assign.id} />
												<button type="submit" class="text-muted-foreground hover:text-destructive"
													>×</button
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
					method="POST"
					action="?/assignStaff"
					use:enhance
					class="flex items-end gap-4 p-4 border rounded-lg bg-muted/50"
				>
					<div class="grid gap-2 w-1/3">
						<Label>Staff Member</Label>
						<select
							name="staffProfileId"
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
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
						>
							<option value="">Select Property...</option>
							{#each data.properties as p}
								<option value={p.id}>{p.name}</option>
							{/each}
						</select>
					</div>
					<Button type="submit">Assign</Button>
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
											{assign.propertyName}
											<form method="POST" action="?/unassignStaff" use:enhance class="inline">
												<input type="hidden" name="assignmentId" value={assign.id} />
												<button type="submit" class="text-muted-foreground hover:text-destructive"
													>×</button
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
</div>
