<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { getSettings, updateSettings } from './settings.remote';
	import { toast } from 'svelte-sonner';
	import { Skeleton } from '$lib/components/ui/skeleton';

	let settingsPromise = $derived(getSettings());
</script>

<div class="space-y-6 p-6">
	<h2 class="text-3xl font-bold tracking-tight">System Settings</h2>

	<svelte:boundary>
		{#await settingsPromise}
			<Skeleton class="h-[200px] w-full" />
		{:then { settings }}
			<Card>
				<CardHeader>
					<CardTitle>Permissions & Security</CardTitle>
					<CardDescription>Configure global permission settings for the system.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						class="space-y-4"
						{...updateSettings.enhance(async ({ submit }) => {
							try {
								await submit();
								toast.success('Settings updated');
							} catch (e: any) {
								toast.error('Failed to update settings');
							}
						})}
					>
						<div class="flex items-center justify-between rounded-lg border p-4">
							<div class="space-y-0.5">
								<Label class="text-base">Allow Manager Delete</Label>
								<p class="text-sm text-muted-foreground">
									If enabled, users with 'Manager' role can soft-delete records.
								</p>
							</div>
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									name="allow_manager_delete"
									defaultChecked={settings.allow_manager_delete as boolean}
									class="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
								/>
							</div>
						</div>
						<div class="flex justify-end">
							<Button type="submit" disabled={!!updateSettings.pending}>
								{updateSettings.pending ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading settings</h3>
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
