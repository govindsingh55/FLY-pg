<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Bell } from 'lucide-svelte';

	let { data } = $props();
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center gap-2">
		<Bell class="h-6 w-6" />
		<h1 class="text-3xl font-bold tracking-tight">Notifications</h1>
	</div>

	<div class="grid gap-4">
		{#each data.notifications as notification}
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
</div>
