<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Bell } from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { getNotifications } from './notifications.remote';

	let dataPromise = $state(getNotifications());
</script>

<div class="space-y-6 p-6">
	<svelte:boundary>
		{#await dataPromise}
			<div class="flex items-center gap-2">
				<Bell class="h-6 w-6" />
				<h1 class="text-3xl font-bold tracking-tight">Notifications</h1>
			</div>

			<div class="grid gap-4">
				{#each { length: 3 } as _}
					<div class="space-y-3 border rounded-xl p-6">
						<Skeleton class="h-6 w-1/3" />
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-2/3" />
					</div>
				{/each}
			</div>
		{:then { notifications }}
			<div class="flex items-center gap-2">
				<Bell class="h-6 w-6" />
				<h1 class="text-3xl font-bold tracking-tight">Notifications</h1>
			</div>

			<div class="grid gap-4">
				{#each notifications as notification}
					<Card class={notification.isRead ? 'opacity-70' : ''}>
						<CardHeader class="pb-2">
							<div class="flex justify-between items-start">
								<CardTitle class="text-lg font-medium"
									>{notification.title ?? 'System Notification'}</CardTitle
								>
								<span class="text-xs text-muted-foreground"
									>{notification.createdAt
										? new Date(notification.createdAt).toLocaleDateString()
										: ''}</span
								>
							</div>
							<!-- Badge for type -->
							<div class="pt-1">
								<Badge
									variant={notification.type === 'error'
										? 'destructive'
										: notification.type === 'warning'
											? 'default'
											: 'secondary'}
								>
									{notification.type}
								</Badge>
								{#if !notification.isRead}
									<Badge variant="outline" class="ml-2">New</Badge>
								{/if}
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-sm text-muted-foreground">{notification.message}</p>
						</CardContent>
					</Card>
				{:else}
					<div class="text-center text-muted-foreground py-10">You have no notifications.</div>
				{/each}
			</div>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading notifications</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getNotifications())}>Retry</Button>
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
