<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';

	export let data;
</script>

<div class="space-y-6">
	<h2 class="text-3xl font-bold tracking-tight">System Settings</h2>

	<Card>
		<CardHeader>
			<CardTitle>Permissions & Security</CardTitle>
			<CardDescription>Configure global permission settings for the system.</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/update" use:enhance class="space-y-4">
				<div class="flex items-center justify-between rounded-lg border p-4">
					<div class="space-y-0.5">
						<Label class="text-base">Allow Manager Delete</Label>
						<p class="text-sm text-muted-foreground">
							If enabled, users with 'Manager' role can soft-delete records.
						</p>
					</div>
					<!-- Switch component might need different binding, using checkbox for basic HTML compat if Issue -->
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							name="allow_manager_delete"
							checked={data.settings.allow_manager_delete as boolean}
							class="h-4 w-4"
						/>
					</div>
				</div>
				<div class="flex justify-end">
					<Button type="submit">Save Changes</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
