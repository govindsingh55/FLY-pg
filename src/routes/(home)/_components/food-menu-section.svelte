<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Utensils } from '@lucide/svelte';

	interface FoodMenuItem {
		id: string;
		category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
		name: string;
		description: string | null;
		isVegetarian: boolean | null;
		price: number | null;
	}

	let { menuItems = [] } = $props<{ menuItems: FoodMenuItem[] | null }>();

	const safeMenuItems = $derived(menuItems || []);

	const categories = ['breakfast', 'lunch', 'dinner', 'snacks'];
</script>

<div class="space-y-6">
	<div class="flex items-center gap-2">
		<Utensils class="h-6 w-6 text-primary" />
		<h2 class="text-2xl font-bold tracking-tight">Food Menu</h2>
	</div>

	{#if safeMenuItems.length === 0}
		<p class="text-muted-foreground">Food service details unavailable.</p>
	{:else}
		<Tabs.Root value="breakfast" class="w-full">
			<Tabs.List class="grid w-full grid-cols-4">
				<Tabs.Trigger value="breakfast">Breakfast</Tabs.Trigger>
				<Tabs.Trigger value="lunch">Lunch</Tabs.Trigger>
				<Tabs.Trigger value="dinner">Dinner</Tabs.Trigger>
				<Tabs.Trigger value="snacks">Snacks</Tabs.Trigger>
			</Tabs.List>
			{#each categories as category}
				<Tabs.Content value={category} class="mt-6">
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each safeMenuItems.filter((i: FoodMenuItem) => i.category === category) as item}
							<Card>
								<CardHeader class="pb-2">
									<div class="flex items-start justify-between">
										<CardTitle class="text-base">{item.name}</CardTitle>
										{#if item.isVegetarian}
											<Badge variant="outline" class="border-green-500 text-green-500">Veg</Badge>
										{:else}
											<Badge variant="outline" class="border-red-500 text-red-500">Non-Veg</Badge>
										{/if}
									</div>
									{#if item.description}
										<CardDescription>{item.description}</CardDescription>
									{/if}
								</CardHeader>
								{#if item.price}
									<CardContent>
										<p class="font-medium text-primary">₹{item.price}</p>
									</CardContent>
								{/if}
							</Card>
						{/each}
						{#if safeMenuItems.filter((i: FoodMenuItem) => i.category === category).length === 0}
							<p class="col-span-full py-8 text-center text-muted-foreground">
								No items listed for {category}.
							</p>
						{/if}
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{/if}
</div>
